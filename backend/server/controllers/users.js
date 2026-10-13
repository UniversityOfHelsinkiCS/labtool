const { User, CourseInstance, TeacherInstance, StudentInstance } = require('../models')
const { isSysop, isCourseStaff, requireSysop } = require('../helpers/auth')
const { badRequest, forbidden } = require('../utils/httpError')

/** The course with the given ohid, or null (also for a missing ohid). */
const findCourseByOhid = ohid => (ohid ? CourseInstance.findOne({ where: { ohid } }) : null)

/** The user with the given id, or null (also for a missing id). */
const findUser = id => (id ? User.findByPk(id) : null)

/** Course staff of the course or sysop. */
const isStaffOrSysop = async (userId, courseInstanceId) => (
  (await isCourseStaff(userId, courseInstanceId)) || isSysop(userId)
)

module.exports = {
  /**
   * Update the user that is making the request, changing email for now
   *   permissions: any logged in user
   *
   * @param req
   * @param res
   */
  async updateSelf(req, res) {
    const { email } = req.body
    if (typeof email !== 'string' || email.length < 1) {
      throw badRequest('Email was too short.')
    }
    if (email.length > 127) {
      // 127 is an arbitrary limit, but there has to be some limit to avoid problems with the database.
      throw badRequest('Email was too long.')
    }
    if (!email.includes('@')) {
      // This doesn't actually check for email validity, but it's a start.
      throw badRequest('Input was not a valid email address.')
    }

    await User.update({ email }, { where: { id: req.decoded.id } })
    const user = await User.findByPk(req.decoded.id)
    res.status(201).send({
      email: user.email,
      firsts: user.firsts,
      lastname: user.lastname,
      studentNumber: user.studentNumber,
      username: user.username
    })
  },

  /**
   * Update any other user, used to assign or remove admins.
   *   permissions: must be an admin
   *
   * @param req
   * @param res
   */
  async updateAdmin(req, res) {
    await requireSysop(req, 'You must be a sysop.')
    if (!req.body.id) {
      throw badRequest('You must provide a user ID.')
    }

    const user = await User.findByPk(req.body.id)
    if (!user) {
      throw badRequest('User not found.')
    }

    const updatedUser = await user.update({
      sysop: req.body.sysop !== undefined ? req.body.sysop : user.sysop
    })
    res.status(200).send(updatedUser)
  },

  /**
   * List all users in the system
   *   permissions: must be an admin, or a teacher/an instructor on any course.
   *     Email addresses only for admins and teachers responsible for a course, not for assistants.
   *
   * @param req
   * @param res
   */
  async list(req, res) {
    const userId = req.decoded.id
    const teacherInstances = await TeacherInstance.count({ where: { userId } })
    const sysop = await isSysop(userId)
    if (!teacherInstances && !sysop) {
      throw forbidden('Unauthorized.')
    }

    const responsibleTeacherInstances = await TeacherInstance.count({
      where: { userId, instructor: false }
    })
    const exclude = ['createdAt', 'updatedAt', 'studentNumber']
    if (!sysop && !responsibleTeacherInstances) {
      exclude.push('email')
    }

    const users = await User.findAll({ attributes: { exclude } })
    res.status(200).send(users)
  },

  /**
   * Add an assistant to a course
   *   permissions: must be an admin, or a teacher/an instructor on the course
   *
   * @param {*} req
   * @param {*} res
   */
  async createTeacher(req, res) {
    const courseInstance = await findCourseByOhid(req.body.ohid)
    if (!courseInstance) {
      throw badRequest('User or course not found.')
    }
    if (!(await isStaffOrSysop(req.decoded.id, courseInstance.id))) {
      throw forbidden('You must be a teacher on the course to add assistants.')
    }

    const userToAssistant = await findUser(req.body.id)
    if (!userToAssistant) {
      throw badRequest('User or course not found.')
    }

    const alreadyExistingTeacherInstanceCount = await TeacherInstance.count({
      where: {
        userId: userToAssistant.id,
        courseInstanceId: courseInstance.id
      }
    })
    if (alreadyExistingTeacherInstanceCount > 0) {
      throw badRequest('This user is already a teacher.')
    }

    const assistant = await TeacherInstance.create({
      userId: userToAssistant.id,
      courseInstanceId: courseInstance.id,
      instructor: true
    })
    res.status(200).send(assistant)
  },

  /**
   * Remove an assistant from a course
   *   permissions: must be an admin, or a teacher/an instructor on the course
   *
   * @param {*} req
   * @param {*} res
   */
  async removeTeacher(req, res) {
    const teacherToRemoveAsUser = await findUser(req.body.id)
    const courseInstance = await findCourseByOhid(req.body.ohid)
    if (!teacherToRemoveAsUser || !courseInstance) {
      throw badRequest('User or course not found.')
    }

    if (!(await isStaffOrSysop(req.decoded.id, courseInstance.id))) {
      throw forbidden('You must teach or assist on the course to remove assistants.')
    }

    const teacherInstanceToRemove = await TeacherInstance.findOne({
      where: {
        userId: teacherToRemoveAsUser.id,
        courseInstanceId: courseInstance.id
      }
    })
    if (!teacherInstanceToRemove) {
      throw badRequest('This user is not a teacher.')
    }

    // Make sure teachers responsible for the course cannot be removed. Assistants are added with
    // instructor: true; responsible teachers (e.g. imported from Kurki) have instructor: false.
    if (teacherInstanceToRemove.instructor !== true) {
      throw badRequest('Only assistants can be removed.')
    }

    await teacherInstanceToRemove.destroy()

    res.status(200).send(teacherInstanceToRemove)
  },

  /**
   * Remove a registration whose validRegistration is false.
   *   permissions: the student himself or course staff
   *
   * @param {*} req
   * @param {*} res
   */
  async removeStudent(req, res) {
    const siToRemove = req.body.id
      ? await StudentInstance.findOne({ raw: true, where: { id: req.body.id } })
      : null
    if (!siToRemove) {
      throw badRequest('The student instance does not exist.')
    }

    if (siToRemove.userId !== req.decoded.id && !(await isCourseStaff(req.decoded.id, siToRemove.courseInstanceId))) {
      throw forbidden('You must be the student himself or the teacher of the course to remove this student instance.')
    }
    if (siToRemove.validRegistration) {
      throw badRequest('The student instance can be removed only when his validRegistration has been marked as false.')
    }

    await StudentInstance.destroy({ where: { id: siToRemove.id } })
    res.status(200).send('The student instance was deleted.')
  }
}
