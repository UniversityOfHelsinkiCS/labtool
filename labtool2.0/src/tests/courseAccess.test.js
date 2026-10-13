import { noStaffAccessByRole, noStaffAccessByCourse } from '../util/courseAccess'

const student = { id: 2, sysop: false }
const teacher = { id: 1, sysop: false }
const sysop = { id: 3, sysop: true }

describe('noStaffAccessByRole', () => {
  const coursePage = role => ({ ohid: 'TKT1', role })

  it('refuses a student and an unregistered user', () => {
    expect(noStaffAccessByRole(coursePage('student'), 'TKT1', student)).toBe(true)
    expect(noStaffAccessByRole(coursePage('Unregistered'), 'TKT1', student)).toBe(true)
  })

  it('lets the course staff and sysops in', () => {
    expect(noStaffAccessByRole(coursePage('teacher'), 'TKT1', teacher)).toBe(false)
    expect(noStaffAccessByRole(coursePage('student'), 'TKT1', sysop)).toBe(false)
  })

  it('does not decide before the data of this course has arrived', () => {
    expect(noStaffAccessByRole({}, 'TKT1', student)).toBe(false)
    expect(noStaffAccessByRole(undefined, 'TKT1', student)).toBe(false)
    // the role on the previously opened course
    expect(noStaffAccessByRole({ ohid: 'OTHER', role: 'student' }, 'TKT1', teacher)).toBe(false)
  })
})

describe('noStaffAccessByCourse', () => {
  // the backend sends the teacher instances only to the course staff
  const course = teacherInstances => ({ ohid: 'TKT1', teacherInstances })

  it('refuses a user who is not on the course staff', () => {
    expect(noStaffAccessByCourse(course([]), 'TKT1', student)).toBe(true)
  })

  it('lets the course staff and sysops in', () => {
    expect(noStaffAccessByCourse(course([{ userId: 1 }]), 'TKT1', teacher)).toBe(false)
    expect(noStaffAccessByCourse(course([]), 'TKT1', sysop)).toBe(false)
  })

  it('does not decide before the data of this course has arrived', () => {
    expect(noStaffAccessByCourse({}, 'TKT1', student)).toBe(false)
    expect(noStaffAccessByCourse({ ohid: 'OTHER', teacherInstances: [] }, 'TKT1', student)).toBe(false)
  })
})
