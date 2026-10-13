const assert = require('assert')
const { URL } = require('url')
const nock = require('nock')
const { as, anonymous } = require('./helpers/api')
const f = require('./helpers/factories')
const { CourseInstance, TeacherInstance, User } = require('../server/models')
const applicationHelper = require('../server/helpers/applicationHelper')
const config = require('../server/config/config').test

const kurki = new URL(config.kurki_url)
const kurkiOrigin = kurki.origin
const kurkiPath = kurki.pathname.replace(/\/$/, '')

// Kurki terms: K = Jan-May, V = Jun-Aug, S = Sep-Dec
const termsNow = () => {
  const now = new Date()
  const month = now.getMonth() + 1
  const year = now.getFullYear()
  let current = 'S'
  if (month <= 5) current = 'K'
  else if (month <= 8) current = 'V'
  const next = { K: 'V', V: 'S', S: 'K' }[current]
  return {
    current: { year: String(year), term: current },
    next: { year: String(current === 'S' ? year + 1 : year), term: next }
  }
}

const kurkiCourses = {
  current: [
    {
      id: 'TKT20002.2026.S.A.1',
      name: 'Ohjelmistotekniikka',
      starts: '2026-09-01T00:00:00.000Z',
      ends: '2026-12-15T00:00:00.000Z'
    },
    {
      id: 'ALREADY.IMPORTED',
      name: 'Already imported',
      starts: '2026-09-01T00:00:00.000Z',
      ends: '2026-12-15T00:00:00.000Z'
    }
  ],
  next: [
    {
      id: 'TKT20011.2027.K.A.1',
      name: 'Tietokantasovellus',
      starts: '2027-01-10T00:00:00.000Z',
      ends: '2027-03-01T00:00:00.000Z'
    }
  ]
}

const kurkiTeachers = {
  'TKT20002.2026.S.A.1': ['kurkiope', 'teacher'],
  'TKT20011.2027.K.A.1': ['toinenope']
}

/**
 * Mocks the Kurki importer API. Returns the list of request descriptions it received.
 */
const mockKurki = ({ failing = false, failingCourse = false } = {}) => {
  const requests = []
  const { current, next } = termsNow()
  nock(kurkiOrigin)
    .persist()
    .get(`${kurkiPath}/labtool/courses`)
    .query(true)
    .reply(function (uri) {
      const params = new URL(uri, kurkiOrigin).searchParams
      requests.push({
        path: 'courses',
        authorization: this.req.headers.authorization,
        token: params.get('token'),
        year: params.get('year'),
        term: params.get('term')
      })
      if (failing) return [500, 'Kurki is down']
      if (params.get('year') === current.year && params.get('term') === current.term) return [200, kurkiCourses.current]
      if (params.get('year') === next.year && params.get('term') === next.term) return [200, kurkiCourses.next]
      return [200, []]
    })
  nock(kurkiOrigin)
    .persist()
    .get(new RegExp(`^${kurkiPath}/labtool/courses/[^/?]+`))
    .query(true)
    .reply(function (uri) {
      const url = new URL(uri, kurkiOrigin)
      const hid = decodeURIComponent(url.pathname.split('/').pop())
      requests.push({
        path: `courses/${hid}`,
        authorization: this.req.headers.authorization,
        token: url.searchParams.get('token')
      })
      if (failing || failingCourse) return [500, 'Kurki is down']
      return [200, { id: hid, teachers: kurkiTeachers[hid] || [], students: ['014000001'] }]
    })
  return requests
}

describe('Course import API (Kurki)', () => {
  let s

  beforeEach(async () => {
    s = await f.createScenario()
    await f.createCourse({ ohid: 'ALREADY.IMPORTED', name: 'Already imported' })
  })

  describe('GET /api/courseimport/allowed', () => {
    it('requires authentication', async () => {
      await anonymous()
        .get('/api/courseimport/allowed')
        .expect(401)
    })

    it('allows teachers and sysops, not students', async () => {
      assert.deepStrictEqual(
        (
          await as(s.users.assistant)
            .get('/api/courseimport/allowed')
            .expect(200)
        ).body,
        { allowed: true }
      )
      assert.deepStrictEqual(
        (
          await as(s.users.student)
            .get('/api/courseimport/allowed')
            .expect(200)
        ).body,
        { allowed: false }
      )
      const sysop = await f.createUser({ sysop: true })
      assert.deepStrictEqual(
        (
          await as(sysop)
            .get('/api/courseimport/allowed')
            .expect(200)
        ).body,
        { allowed: true }
      )
    })
  })

  describe('GET /api/courseimport/get', () => {
    // The importable course list is cached in memory for 10 minutes; an import request clears the cache.
    beforeEach(async () => {
      mockKurki()
      await as(s.users.teacher)
        .post('/api/courseimport/import')
        .send({ courses: [] })
        .expect(200)
      nock.cleanAll()
    })

    it('requires authentication', async () => {
      await anonymous()
        .get('/api/courseimport/get')
        .expect(401)
    })

    it('is forbidden for users who may not import', async () => {
      await as(s.users.student)
        .get('/api/courseimport/get')
        .expect(403)
    })

    it('lists Kurki courses of this and the next term that are not imported yet, with their teachers', async () => {
      const requests = mockKurki()
      const res = await as(s.users.teacher)
        .get('/api/courseimport/get')
        .expect(200)

      assert.deepStrictEqual(
        res.body.sort((a, b) => a.hid.localeCompare(b.hid)),
        [
          {
            hid: 'TKT20002.2026.S.A.1',
            cname: 'Ohjelmistotekniikka',
            starts: '2026-09-01T00:00:00.000Z',
            ends: '2026-12-15T00:00:00.000Z',
            instructor: 'kurkiope; teacher'
          },
          {
            hid: 'TKT20011.2027.K.A.1',
            cname: 'Tietokantasovellus',
            starts: '2027-01-10T00:00:00.000Z',
            ends: '2027-03-01T00:00:00.000Z',
            instructor: 'toinenope'
          }
        ]
      )

      const { current, next } = termsNow()
      const listRequests = requests.filter(r => r.path === 'courses')
      assert.deepStrictEqual(
        listRequests.map(r => `${r.year}/${r.term}`).sort(),
        [`${current.year}/${current.term}`, `${next.year}/${next.term}`].sort()
      )
      requests.forEach((r) => {
        assert.strictEqual(r.token, process.env.TOKEN)
        assert.strictEqual(r.authorization, process.env.TOKEN)
      })
      // no instructor lookup for the already imported course
      assert.ok(!requests.some(r => r.path === 'courses/ALREADY.IMPORTED'))
    })

    it('answers 400 when Kurki is unavailable', async () => {
      mockKurki({ failing: true })
      const res = await as(s.users.teacher)
        .get('/api/courseimport/get')
        .expect(400)
      assert.strictEqual(res.body.message, 'Error while listing importable courses.')
    })
  })

  describe('POST /api/courseimport/import', () => {
    const toImport = {
      hid: 'TKT20002.2026.S.A.1',
      cname: 'Ohjelmistotekniikka',
      starts: '2026-09-01T00:00:00.000Z',
      ends: '2026-12-15T00:00:00.000Z'
    }

    it('requires authentication', async () => {
      await anonymous()
        .post('/api/courseimport/import')
        .send({ courses: [toImport] })
        .expect(401)
    })

    it('is forbidden for users who may not import', async () => {
      mockKurki()
      await as(s.users.student)
        .post('/api/courseimport/import')
        .send({ courses: [toImport] })
        .expect(403)
      assert.strictEqual(await CourseInstance.count({ where: { ohid: toImport.hid } }), 0)
    })

    it('imports a course and makes its Kurki teachers teachers of the course', async () => {
      const requests = mockKurki()
      await as(s.users.teacher)
        .post('/api/courseimport/import')
        .send({ courses: [toImport] })
        .expect(200)

      const course = await CourseInstance.findOne({ where: { ohid: toImport.hid } })
      assert.ok(course)
      assert.strictEqual(course.name, 'Ohjelmistotekniikka')
      assert.strictEqual(course.start.toISOString(), toImport.starts)
      assert.strictEqual(course.end.toISOString(), toImport.ends)

      // the teachers have been added when the import answers
      const teachers = await TeacherInstance.findAll({ where: { courseInstanceId: course.id }, include: [User] })
      assert.deepStrictEqual(teachers.map(t => t.User.username).sort(), ['kurkiope', 'teacher'])
      teachers.forEach(t => assert.strictEqual(t.instructor, false))
      const newUser = await User.findOne({ where: { username: 'kurkiope' } })
      assert.strictEqual(newUser.teacher, true)
      // existing users are reused
      assert.strictEqual(await User.count({ where: { username: 'teacher' } }), 1)

      assert.ok(requests.some(r => r.path === `courses/${toImport.hid}` && r.token === process.env.TOKEN))
    })

    it('ignores courses that are not importable from Kurki', async () => {
      mockKurki()
      await as(s.users.teacher)
        .post('/api/courseimport/import')
        .send({
          courses: [
            { ...toImport, hid: 'NOT.IN.KURKI' },
            { ...toImport, hid: 'ALREADY.IMPORTED' }
          ]
        })
        .expect(200)
      assert.strictEqual(await CourseInstance.count({ where: { ohid: 'NOT.IN.KURKI' } }), 0)
      assert.strictEqual(await CourseInstance.count({ where: { ohid: 'ALREADY.IMPORTED' } }), 1)
    })

    it('answers with an error when Kurki is unavailable', async () => {
      mockKurki({ failing: true })
      const res = await as(s.users.teacher)
        .post('/api/courseimport/import')
        .send({ courses: [toImport] })
        .timeout(3000)
        .expect(400)
      assert.strictEqual(res.body.message, 'Error while importing courses.')
      assert.strictEqual(await CourseInstance.count({ where: { ohid: toImport.hid } }), 0)
    })

    // createCourse used to swallow every error, so the import answered 200 without importing anything
    it('answers with an error when Kurki cannot give the course to import', async () => {
      mockKurki({ failingCourse: true })
      const res = await as(s.users.teacher)
        .post('/api/courseimport/import')
        .send({ courses: [toImport] })
        .expect(400)
      assert.strictEqual(res.body.message, 'Error while importing courses.')
      assert.strictEqual(await CourseInstance.count({ where: { ohid: toImport.hid } }), 0)
    })

    it('answers 500 and creates no course when saving it fails', async () => {
      mockKurki()
      const original = TeacherInstance.create
      TeacherInstance.create = async () => { throw new Error('database is down') }
      try {
        const res = await as(s.users.teacher)
          .post('/api/courseimport/import')
          .send({ courses: [toImport] })
          .expect(500)
        assert.strictEqual(res.body.message, 'Unexpected error. Please try again.')
      } finally {
        TeacherInstance.create = original
      }
      // the course and its teachers are created in one transaction
      assert.strictEqual(await CourseInstance.count({ where: { ohid: toImport.hid } }), 0)
    })

    it('validates the request', async () => {
      mockKurki()
      const res = await as(s.users.teacher)
        .post('/api/courseimport/import')
        .send({})
        .expect(400)
      assert.strictEqual(res.body.message, 'Missing field "courses".')
    })
  })

  describe('applicationHelper', () => {
    // getNextTerm used to be exported as getCurrentTerm
    it('exports getNextTerm', () => {
      assert.strictEqual(applicationHelper.getNextTerm('K'), 'V')
      assert.strictEqual(applicationHelper.getNextTerm('V'), 'S')
      assert.strictEqual(applicationHelper.getNextTerm('S'), 'K')
    })

    // getActive used to return a database error as its value
    it('getActive rejects when the database fails', async () => {
      const original = CourseInstance.findAll
      CourseInstance.findAll = async () => { throw new Error('database is down') }
      try {
        await assert.rejects(applicationHelper.getActive(), /database is down/)
      } finally {
        CourseInstance.findAll = original
      }
    })
  })
})
