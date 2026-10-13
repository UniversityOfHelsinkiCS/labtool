const Sequelize = require('sequelize')
const db = require('../models')
const helper = require('../helpers/courseInstanceHelper')
const { isCourseStaff, requireCourseStaff } = require('../helpers/auth')
const { badRequest, forbidden, notFound } = require('../utils/httpError')
const { isHttpUrl } = require('../helpers/links')
const { hiddenFromStudents } = require('../helpers/finalReview')
const { canSeeCourse, canMarkInvalid } = require('../helpers/invalidCourse')
const { copyChecklists } = require('../helpers/copyChecklists')
const { addValueChange, logChange, pointsChangesByOthers } = require('../helpers/changeLog')
const logger = require('../utils/logger')

// repository link changes are kept in the change history (#1132)
const logRepositoryChange = (studentInstance, userId, from, to, initial = false) => {
  const changes = {}
  addValueChange(changes, 'github', from, to)
  return logChange({
    courseInstanceId: studentInstance.courseInstanceId,
    studentInstanceId: studentInstance.id,
    userId,
    kind: 'repository',
    changes,
    initial
  })
}

const { Op } = Sequelize
const { User, CourseInstance, StudentInstance, TeacherInstance, Week, ReviewCheck, CodeReview, Comment, Tag, Checklist, ChecklistItem, WeekDraft, ReviewNote } = db
const { toJson: reviewNoteJson } = require('./reviewNotes')

const invalidProjectNameErrorMessage = {
  projectName: 'Project name contains illegal characters.\n Characters allowed '
    + ' in the project name are letters from a-ö, numbers, apostrophe, - and '
    + ' whitespace (not multiple in a row or at first/last character).'
}

const invalidGithubLinkMessage = 'GitHub link must be a web address starting with http:// or https://.'

// fields of a student instance that only the course staff may change
const staffOnlyStudentFields = ['dropped', 'validRegistration', 'issuesDisabled']

const isId = value => value !== null && value !== '' && typeof value !== 'boolean' && Number.isInteger(Number(value))

/**
 * The given fields of source that are set, i.e. not undefined (or, with the isSet argument, whatever it accepts).
 * A field missing from a request body keeps its value; a field that is there is applied.
 */
const pickDefined = (source, fields, isSet = value => value !== undefined) => fields
  .filter(field => isSet(source[field]))
  .reduce((picked, field) => ({ ...picked, [field]: source[field] }), {})

/** Runs a write; a Sequelize validation error becomes a 400 with the messages of the failed validations. */
const withValidation = async (write) => {
  try {
    return await write()
  } catch (error) {
    if (error.name === 'SequelizeValidationError') {
      const messages = error.errors.map(e => invalidProjectNameErrorMessage[e.path] || e.message || 'Unknown validation error.')
      throw badRequest(messages.join('\n'))
    }
    throw error
  }
}

module.exports = {
  /**
   * Find all courses in which the requesting user is a teacher
   *   permissions: any user can call this endpoint
   * @param req
   * @param res
   */
  async findByUserTeacherInstance(req, res) {
    const courseInstances = await CourseInstance.findAll({
      include: [{
        model: TeacherInstance,
        required: true,
        where: { userId: req.decoded.id },
        as: 'teachercourseInstances'
      }]
    })
    res.status(200).send(courseInstances)
  },

  /**
   * Gets courses of a user who has the studentInstance with id=req.params.id
   *   permissions: must be an instructor on the course of that studentInstance
   * (any ID, supplied by requesting user)
   * @param {*} req
   * @param {*} res
   */
  async findByStudentInstanceId(req, res) {
    const studentInstance = isId(req.params.id) ? await StudentInstance.findOne({
      where: { id: req.params.id } // id is StudentInstance.id
    }) : null
    if (!studentInstance) {
      throw badRequest('student instance not found')
    }
    await requireCourseStaff(req, studentInstance.courseInstanceId, 'must be teacher on the course')

    const courseInstances = await CourseInstance.findAll({
      include: [{
        model: StudentInstance,
        required: true,
        where: { userId: studentInstance.userId },
        as: 'courseInstances'
      }]
    })
    res.status(200).send(courseInstances)
  },

  /**
   * Return course page for user
   *   permissions: any logged in user
   * @param req
   * @param res
   * @returns {Promise<void>}
   */
  async coursePage(req, res) {
    if (typeof req.body.course !== 'string') {
      throw badRequest('Missing or malformed course.')
    }

    const course = await CourseInstance.findOne({
      where: {
        ohid: req.body.course
      }
    })
    if (!course || !(await canSeeCourse(req.decoded.id, course))) {
      throw notFound('course not found')
    }

    const courseInst = course.id
    const palautus = {
      // the course the role is for, so that the frontend does not use the role of a previous course
      ohid: course.ohid,
      role: 'Unregistered',
      data: undefined
    }
    const user = req.decoded.id
    if (!(await isCourseStaff(user, courseInst))) {
      const student = await StudentInstance.findOne({
        attributes: {
          exclude: ['createdAt', 'updatedAt']
        },
        where: {
          userId: user,
          courseInstanceId: courseInst
        },
        include: [
          {
            model: Week,
            attributes: {
              exclude: ['updatedAt', 'instructorNotes']
            },
            as: 'weeks',
            include: [
              {
                model: Comment,
                attributes: {
                  exclude: ['updatedAt']
                },
                as: 'comments',
                where: {
                  hidden: false
                },
                required: false
              },
              {
                model: ReviewCheck,
                as: 'checks'
              }
            ]
          },
          {
            model: CodeReview,
            attributes: ['toReview', 'reviewNumber', 'points', 'linkToReview', 'repoToReview'],
            as: 'codeReviews',
            where: {
              [Op.or]: [
                {
                  reviewNumber: {
                    [Op.in]: course.currentCodeReview
                  }
                },
                {
                  points: {
                    [Op.ne]: null
                  }
                }
              ]
            },
            required: false,
            include: [
              {
                model: StudentInstance,
                attributes: ['github', 'projectName'],
                as: 'toReviews'
              }
            ]
          },
          {
            model: User,
            attributes: {
              exclude: ['createdAt', 'updatedAt']
            }
          }
        ]
      })

      if (student) {
        palautus.data = student.dataValues
        // Here we splice together the codeReviews field
        if (palautus.data.codeReviews) {
          palautus.data.codeReviews = palautus.data.codeReviews.map(cr => cr.dataValues)
          palautus.data.codeReviews = palautus.data.codeReviews.map(cr => ({
            toReview: {
              github: cr.toReviews ? cr.toReviews.github : null,
              projectName: cr.toReviews ? cr.toReviews.projectName : null
            },
            reviewNumber: cr.reviewNumber,
            points: cr.points,
            linkToReview: cr.linkToReview,
            repoToReview: cr.repoToReview
          })
          )
          // This was only ever included to be spliced into the codeReviews filed above.
          delete palautus.data.toReviews
        }
        palautus.data.weeks = palautus.data.weeks
          // a hidden final review is left out altogether: points, grade, feedback, checks and comments
          .filter(week => !hiddenFromStudents(course, week.weekNumber))
          .map(week => ({ ...week.dataValues,
            checks: week.checks.reduce((checksObject, reviewCheck) => ({ ...checksObject, [reviewCheck.checklistItemId]: reviewCheck.checked }), {})
          }))
      } else {
        palautus.data = null
      }

      palautus.role = 'student'
      res.status(200).send(palautus)
      return
    }

    const teacherPalautus = await StudentInstance.findAll({
      attributes: {
        exclude: ['createdAt', 'updatedAt']
      },
      where: {
        courseInstanceId: courseInst
      },
      include: [
        {
          model: Week,
          attributes: {
            // updatedAt / updatedBy let the review page detect saves made after it was opened (#1127)
            exclude: ['createdAt']
          },
          as: 'weeks',
          include: [
            {
              model: Comment,
              attributes: {
                exclude: ['updatedAt']
              },
              as: 'comments'
            },
            {
              model: ReviewCheck,
              as: 'checks'
            }
          ]
        },
        {
          model: CodeReview,
          attributes: {
            exclude: ['createdAt', 'updatedAt']
          },
          as: 'codeReviews',
          include: [
            {
              model: ReviewCheck,
              attributes: ['checklistItemId', 'checked'],
              as: 'checks'
            }
          ]
        },
        {
          model: User,
          attributes: {
            exclude: ['createdAt', 'updatedAt']
          }
        },
        {
          model: WeekDraft,
          attributes: ['weekNumber'],
          as: 'weekdrafts'
        },
        {
          // additional final review notes by staff; only in the staff's data
          model: ReviewNote,
          as: 'reviewNotes',
          separate: true,
          order: [['createdAt', 'ASC']],
          include: [{ model: User, attributes: ['firsts', 'lastname'] }]
        },
        {
          model: Tag,
          attributes: ['id', 'name', 'color']
        }
      ],
      order: [
        [
          { model: CodeReview, as: 'codeReviews' },
          'reviewNumber', 'ASC'
        ]
      ]
    })
    // points / grades changed by someone other than the assigned instructor are marked in the list
    const changedByOthers = await pointsChangesByOthers(courseInst)
    const othersChanges = (studentInstance, kind, number) => changedByOthers[`${studentInstance.id}:${kind}:${number}`] || []
    palautus.data = teacherPalautus.map(studentInstance => ({ ...studentInstance.dataValues,
      weeks: studentInstance.dataValues.weeks.map(week => ({ ...week.dataValues,
        checks: week.checks.reduce((checksObject, reviewCheck) => ({ ...checksObject, [reviewCheck.checklistItemId]: reviewCheck.checked }), {}),
        pointsChangedByOthers: othersChanges(studentInstance, 'week_review', week.weekNumber) })),
      codeReviews: studentInstance.dataValues.codeReviews.map(codeReview => ({ ...codeReview.dataValues,
        pointsChangedByOthers: othersChanges(studentInstance, 'code_review_grade', codeReview.reviewNumber) })),
      reviewNotes: (studentInstance.dataValues.reviewNotes || []).map(note => reviewNoteJson(note, note.User)) }))
    palautus.role = 'teacher'
    res.status(200).send(palautus)
  },

  /**
   * Find all courses on which the user is a student
   *   permissions: any logged in user
   *
   * @param req
   * @param res
   */
  async findByUserStudentInstance(req, res) {
    res.status(200).send(await helper.findByUserStudentInstance(req.decoded.id))
  },

  /**
   * Register as a student onto a course
   *   permissions: any logged in user
   *
   * @param req
   * @param res
   */
  async registerToCourseInstance(req, res) {
    const course = await CourseInstance.findOne({
      where: {
        ohid: req.params.ohid
      }
    })
    if (!course || course.invalid) {
      throw notFound('Course instance not found.')
    }
    if (course.active === false) {
      throw badRequest('Course is not active.')
    }
    const user = await User.findByPk(req.decoded.id)
    if (!user) {
      throw badRequest('User could not be found.')
    }
    if (req.body.github !== undefined && !isHttpUrl(req.body.github)) {
      throw badRequest(invalidGithubLinkMessage)
    }

    const student = await withValidation(() => StudentInstance.findOrCreate({
      where: {
        userId: user.id,
        courseInstanceId: course.id
      },
      defaults: {
        userId: user.id,
        courseInstanceId: course.id,
        github: req.body.github || '',
        projectName: req.body.projectName || ''
      }
    }))
    const [studentInstance, created] = student
    if (created) {
      await logRepositoryChange(studentInstance, user.id, null, studentInstance.github, true)
    }
    res.status(200).json(student)
  },

  /**
   * Update N student instances, used to changed issue disabled flag for one
   *   permissions: must be instructor on course
   *   students the caller may not update are silently skipped
   *
   * req.body: {
   *   ohid,
   *   studentInstances: [{ userId, github?, projectName?, dropped?, repoExists?, issuesDisabled? }]
   * }
   *
   * @param {*} req
   * @param {*} res
   */
  async massUpdateStudentInstance(req, res) {
    const course = await CourseInstance.findOne({
      where: { ohid: req.body.ohid }
    })
    if (!course) {
      throw notFound('Course not found.')
    }
    const { studentInstances } = req.body
    if (!Array.isArray(studentInstances)) {
      throw badRequest('studentInstances must be a list.')
    }
    if (studentInstances.some(studentInstance => studentInstance.github && !isHttpUrl(studentInstance.github))) {
      throw badRequest(invalidGithubLinkMessage)
    }

    const currentTime = new Date()
    const updateOne = async (studentInstance) => {
      const role = await helper.getRoleToViewStudentInstance(req.decoded.id, course.id, studentInstance.userId)
      if (!role || role === 'student') {
        return null
      }
      const newStudentInstance = pickDefined(studentInstance, ['dropped', 'repoExists', 'issuesDisabled'])
      if (studentInstance.github) {
        newStudentInstance.github = studentInstance.github
      }
      if (studentInstance.projectName) {
        newStudentInstance.projectName = studentInstance.projectName
      }
      if ('issuesDisabled' in newStudentInstance) {
        newStudentInstance.issuesDisabledCheckedAt = currentTime.toISOString()
      }

      const where = { userId: studentInstance.userId, courseInstanceId: course.id }
      const previous = await StudentInstance.findOne({ attributes: ['github'], where })
      const [, [updatedStudentInstance]] = await withValidation(
        () => StudentInstance.update(newStudentInstance, { returning: true, where })
      )
      if (previous && updatedStudentInstance) {
        await logRepositoryChange(
          updatedStudentInstance, req.decoded.id, previous.github, updatedStudentInstance.github
        )
      }
      return updatedStudentInstance
    }

    const updatedStudents = await Promise.all(studentInstances.map(updateOne))
    res.status(200).send(updatedStudents.filter(updatedStudent => !!updatedStudent).map(({ dataValues }) => dataValues))
  },

  /**
   * Update one student instance; perhaps to change dropped status, repo etc.
   *   permissions: must be instructor on course or the student themselves
   *   a student can change only their repository (github, repoExists) and project name
   *
   * req.body: {
   *   ohid,
   *   userId, // only required if updating student instance of other user than the currently logged in
   *   github, projectName, repoExists, dropped, validRegistration, issuesDisabled // the ones to change
   * }
   *
   * @param {*} req
   * @param {*} res
   */
  async updateStudentInstance(req, res) {
    const userId = req.body.userId || req.decoded.id

    const course = await CourseInstance.findOne({
      where: {
        ohid: req.body.ohid
      }
    })
    if (!course) {
      throw notFound('Course not found.')
    }
    const role = await helper.getRoleToViewStudentInstance(req.decoded.id, course.id, userId)
    if (!role) {
      throw forbidden(`You are not allowed to update student instance for user ${userId}.`)
    }
    if (role === 'student' && staffOnlyStudentFields.some(field => req.body[field] !== undefined)) {
      throw forbidden('You cannot modify this flag as a student.')
    }
    const targetStudent = await StudentInstance.findOne({
      where: {
        userId,
        courseInstanceId: course.id
      }
    })
    if (!targetStudent) {
      throw badRequest('Student not found.')
    }

    const changes = pickDefined(req.body, ['github', 'projectName', 'repoExists', ...staffOnlyStudentFields])
    if ('issuesDisabled' in changes) {
      changes.issuesDisabledCheckedAt = new Date().toISOString()
    }
    // links stored before links were checked may be kept as they are
    if ('github' in changes && changes.github !== targetStudent.github && !isHttpUrl(changes.github)) {
      throw badRequest(invalidGithubLinkMessage)
    }

    const previousGithub = targetStudent.github
    const updatedStudentInstance = await withValidation(() => targetStudent.update(changes))
    await logRepositoryChange(updatedStudentInstance, req.decoded.id, previousGithub, updatedStudentInstance.github)
    res.status(200).send(updatedStudentInstance)
  },

  /**
   * update course info
   *   permissions: must be teacher or assistant on the course
   *   a field missing from the request keeps its value
   *
   * @param req
   * @param res
   */
  async update(req, res) {
    const badLink = ['coursesPage', 'courseMaterial']
      .find(field => typeof req.body[field] === 'string' && req.body[field] !== '' && !isHttpUrl(req.body[field]))
    if (badLink) {
      const name = badLink === 'coursesPage' ? 'The course page link' : 'The course material link'
      throw badRequest(`${name} must be a web address starting with http:// or https://.`)
    }

    const courseInstance = await CourseInstance.findOne({
      where: {
        ohid: req.params.id
      }
    })
    if (!courseInstance) {
      throw badRequest('Course instance not found.')
    }
    await requireCourseStaff(req, courseInstance.id, 'You have to be a teacher to update course info.')

    if (req.body.weekAmount < 1) {
      throw badRequest('weekAmount must be a positive value.')
    }
    if (req.body.weekAmount > 30) {
      throw badRequest('weekAmount cannot be greater than 30.')
    }
    if (req.body.weekMaxPoints < 0) {
      throw badRequest('weekMaxPoints must be a non-negative value.')
    }

    // null and '' (an emptied input) keep the value, as before; 0 and false are applied
    const changes = pickDefined(
      req.body,
      ['name', 'start', 'end', 'active', 'weekAmount', 'weekMaxPoints', 'currentWeek',
        'finalReview', 'finalReviewHasPoints'],
      value => value !== undefined && value !== null && value !== ''
    )
    if (Array.isArray(req.body.newCr)) {
      changes.currentCodeReview = req.body.newCr
    }
    ['coursesPage', 'courseMaterial'].forEach((field) => {
      if (typeof req.body[field] === 'string') {
        changes[field] = req.body[field]
      }
    })
    if (typeof req.body.finalReviewVisible === 'boolean') {
      changes.finalReviewVisible = req.body.finalReviewVisible
    }

    const updatedCourseInstance = await courseInstance.update(changes)
    res.status(200).send(updatedCourseInstance)
  },

  /**
   * Mark a course invalid, or valid again (#905)
   *   permissions: the teacher responsible for the course (not an assistant) or a sysop
   *
   * @param req
   * @param res
   */
  async setInvalid(req, res) {
    if (typeof req.body.invalid !== 'boolean') {
      throw badRequest('"invalid" must be true or false.')
    }
    const course = await CourseInstance.findOne({ where: { ohid: req.params.ohid } })
    if (!course) {
      throw notFound('Course not found.')
    }
    if (!(await canMarkInvalid(req.decoded.id, course))) {
      throw forbidden('Only the teacher of the course or an admin can mark it invalid.')
    }
    await course.update({ invalid: req.body.invalid })
    logger.info('course marked', { ohid: course.ohid, invalid: course.invalid, userId: req.decoded.id })
    res.status(200).send({ ohid: course.ohid, invalid: course.invalid })
  },

  /**
   * List all courses in the system
   *   permissions: any logged in user
   *
   * @param req
   * @param res
   */
  async list(req, res) {
    const courses = await CourseInstance.findAll({
      attributes: {
        exclude: ['createdAt', 'updatedAt']
      }
    })
    // invalid courses (#905) only for their staff and sysops
    const visible = await Promise.all(courses.map(course => canSeeCourse(req.decoded.id, course)))
    res.status(200).send(courses.filter((_, index) => visible[index]))
  },

  /**
   * Get information for any course
   *   permissions: any logged in user
   * Not currently used by frontend, but there is a route
   *
   * @param req
   * @param res
   */
  async retrieve(req, res) {
    const courseInstance = await CourseInstance.findOne({
      attributes: {
        exclude: ['createdAt', 'updatedAt']
      },
      where: {
        ohid: req.params.ohid
      }
    })
    if (!courseInstance || !(await canSeeCourse(req.decoded.id, courseInstance))) {
      throw notFound('Course not found.')
    }
    res.status(200).send(courseInstance)
  },

  /**
   * Retrieves course info (registration status, list of instructors,
   *   course checklists, other course details)
   *   permissions: any logged in user
   *     only teacher/instructor can get list of instructors
   *
   * @param req
   * @param res
   */
  async retrieveCourseStuff(req, res) {
    const currentUser = await User.findByPk(req.decoded.id, { attributes: ['id'] })
    if (!currentUser) {
      throw badRequest('User not found')
    }

    const course = await CourseInstance.findOne({
      where: {
        ohid: req.params.ohid
      }
    })
    if (!course || !(await canSeeCourse(req.decoded.id, course))) {
      throw notFound('Course not found.')
    }

    const teachers = await isCourseStaff(req.decoded.id, course.id)
      ? await TeacherInstance.findAll({
        where: {
          courseInstanceId: course.id
        },
        include: [{ model: User, attributes: ['firsts', 'lastname'] }]
      })
      : []

    const checklists = await Checklist.findAll({
      where: {
        courseInstanceId: course.id
      }
    })
    // in the order set in the checklist editor; topics follow the order of their first item
    const checklistItems = await ChecklistItem.findAll({
      where: {
        checklistId: checklists.map(checklist => checklist.id)
      },
      order: [['order', 'ASC'], ['id', 'ASC']]
    })
    checklists.forEach((checklist) => {
      const checklistJson = {}
      checklistItems
        .filter(item => item.checklistId === checklist.id)
        .forEach(({ dataValues: checklistItem }) => {
          if (checklistJson[checklistItem.category] === undefined) {
            checklistJson[checklistItem.category] = []
          }
          const checklistItemCopy = { ...checklistItem }
          delete checklistItemCopy.category
          delete checklistItemCopy.checklistId
          checklistJson[checklistItem.category].push(checklistItemCopy)
        })
      checklist.dataValues.list = checklistJson
    })

    course.dataValues.teacherInstances = teachers.map((teacher) => {
      const { User: teacherUser, ...teacherInstance } = teacher.get({ plain: true })
      return { ...teacherInstance, firsts: teacherUser.firsts, lastname: teacherUser.lastname }
    })
    // registrations are no longer checked at WebOodi; the frontend still reads the field
    course.dataValues.registrationAtWebOodi = 'found'
    course.dataValues.checklists = checklists

    res.status(200).send(course)
  },

  /**
   * Copy course information from another course. This copies
   * the week amount, default maximum week points, checklists,
   * course tags, and links to course page and material.
   *   permissions: must be a teacher/assistant on both courses
   *
   * @param req
   * @param res
   */
  async copyCourseInformation(req, res) {
    if (!req.body.copyFrom || !req.body.copyTo) {
      throw badRequest('You must supply both a "copyFrom" and "copyTo".')
    }

    const findCourse = id => (isId(id) ? CourseInstance.findOne({ where: { id } }) : null)
    const [course, template] = await Promise.all([findCourse(req.body.copyTo), findCourse(req.body.copyFrom)])
    // an invalid course (#905) is not offered as a template
    if (!course || !template || template.invalid) {
      throw badRequest('Course not found.')
    }

    await requireCourseStaff(req, course.id, 'You must be a teacher on the course you are copying to.')
    await requireCourseStaff(req, template.id, 'You can only copy course information from your own courses.')

    // course info: week amount, final review?, maxpoints
    await course.update({
      weekAmount: template.weekAmount,
      weekMaxPoints: template.weekMaxPoints,
      finalReview: template.finalReview
    })

    // course tags
    const courseTags = await Tag.findAll({
      where: {
        courseInstanceId: template.id
      }
    })
    const existingCourseTags = await Tag.findAll({
      where: {
        courseInstanceId: course.id
      }
    })

    // do not import a tag if there would be a name clash
    await Promise.all(courseTags
      .filter(tag => !existingCourseTags.find(etag => etag.name === tag.name))
      .map(async (tag) => {
        const newTag = tag.get({ plain: true })
        delete newTag.id
        newTag.courseInstanceId = course.id
        await Tag.create(newTag)
      }))

    // checklists
    // do not replace existing checklists
    const checklists = await Checklist.findAll({
      where: {
        courseInstanceId: template.id
      }
    })
    const existingChecklists = await Checklist.findAll({
      where: {
        courseInstanceId: course.id
      }
    })

    await copyChecklists(
      checklists
        .filter(cl => !existingChecklists.find(ecl => (cl.forCodeReview ? ecl.forCodeReview : (cl.week !== null && cl.week === ecl.week))))
        .map(checklist => ({ checklist, week: checklist.week })),
      course.id
    )

    res.status(200).send(course)
  },

  /**
   * Add a comment
   *   permissions: must be a teacher/assistant on the course,
   *     or be the student that we are commenting on
   *
   * @param req
   * @param res
   */
  async addComment(req, res) {
    const userId = req.decoded.id
    const message = req.body

    const user = await User.findByPk(userId)
    if (!user) {
      throw badRequest('You are not an user in the system.')
    }
    if (!isId(message.week) || !(await helper.checkHasCommentPermission(userId, message.week))) {
      throw forbidden('You are not allowed to comment here.')
    }
    if (typeof message.comment !== 'string' || message.comment.trim().length === 0) {
      throw badRequest('Comment cannot be empty.')
    }

    const comment = await Comment.create({
      userId,
      weekId: message.week,
      hidden: message.hidden,
      comment: message.comment,
      from: `${user.firsts} ${user.lastname}`,
      notified: false,
      isRead: [userId]
    })
    res.status(200).send(comment)
  },

  /**
   * Mark comments as read
   *   permissions: must be able to see the comments (see above)
   *
   * req.body: [{ id, weekId, ... }], comments of one week review
   *
   * @param req
   * @param res
   */
  async markCommentsAsRead(req, res) {
    const userId = req.decoded.id
    const commentsToUpdate = req.body
    if (!Array.isArray(commentsToUpdate) || commentsToUpdate.length === 0) {
      throw badRequest('No comments given.')
    }
    const { weekId } = commentsToUpdate[0]
    // comments should have same weekId
    if (commentsToUpdate.some(comment => comment.weekId !== weekId)) {
      throw badRequest('the comments do not belong to the same week review')
    }
    // comments should exist, and really be comments of that week
    const comments = await Promise.all(commentsToUpdate
      .map(comment => (isId(comment.id) ? Comment.findByPk(comment.id) : null)))
    if (comments.includes(null)) {
      throw badRequest('comment not found')
    }
    if (comments.some(comment => comment.weekId !== weekId)) {
      throw badRequest('the comments do not belong to the same week review')
    }

    if (!(await helper.checkHasCommentPermission(userId, weekId))) {
      throw forbidden('you have no permission to update these comments')
    }
    // the readers are taken from the database, not from the request
    const isRead = ({ isRead: readers }) => (readers && readers.includes(userId) ? readers : [...(readers || []), userId])
    await Promise.all(comments.map(comment => comment.update({ isRead: isRead(comment) })))
    res.status(200).send(commentsToUpdate.map((comment, index) => ({ ...comment, isRead: comments[index].isRead })))
  },

  /**
   * Edit the text of a comment (#534)
   *   permissions: only the author of the comment, while they can still comment on that week.
   *   Visibility (hidden) cannot be changed. The edited comment becomes unread for everyone else.
   */
  async editComment(req, res) {
    const comment = isId(req.params.id) ? await Comment.findByPk(Number(req.params.id)) : null
    if (!comment) {
      throw notFound('Comment not found.')
    }
    if (!comment.userId || comment.userId !== req.decoded.id) {
      throw forbidden('You can only edit your own comments.')
    }
    if (!(await helper.checkHasCommentPermission(req.decoded.id, comment.weekId))) {
      throw forbidden('You are not allowed to comment here.')
    }
    const text = typeof req.body.comment === 'string' ? req.body.comment : ''
    if (text.trim().length === 0) {
      throw badRequest('Comment cannot be empty.')
    }
    await comment.update({ comment: text, editedAt: new Date(), isRead: [req.decoded.id] })
    res.status(200).send(comment)
  },

  /**
   * Get comments for week
   *   permissions: must be a teacher/assistant on the course,
   *     or be the student that we are commenting on
   *
   * @param req
   * @param res
   */
  async getCommentsForWeek(req, res) {
    const role = isId(req.body.week) ? await helper.checkHasCommentPermission(req.decoded.id, req.body.week) : false
    if (!role) {
      throw forbidden('you cannot see the comments here')
    }

    // hidden comments are for course staff only
    const where = role === 'teacher' ? { weekId: req.body.week } : { weekId: req.body.week, hidden: false }
    const comments = await Comment.findAll({
      attributes: {
        exclude: ['updatedAt']
      },
      where
    })
    res.status(200).send(comments)
  }
}
