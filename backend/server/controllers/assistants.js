const { User, StudentInstance, TeacherInstance } = require('../models')
const { getTeacherId, requireCourseStaff } = require('../helpers/auth')
const { badRequest, forbidden } = require('../utils/httpError')

const isId = value => Number.isInteger(Number(value)) && value !== null && value !== ''

module.exports = {
  /**
   * Associate instructor with student
   *   permissions: must be a teacher or an assistant on the course
   *
   * @param {*} req
   * @param {*} res
   */
  async create(req, res) {
    const { teacherInstanceId, studentInstanceId } = req.body

    const studentInstance = isId(studentInstanceId) ? await StudentInstance.findOne({
      where: {
        id: studentInstanceId
      }
    }) : null
    if (!studentInstance) {
      throw badRequest('Specified student instance could not be found.')
    }

    if (!(await getTeacherId(req.decoded.id, studentInstance.courseInstanceId))) {
      throw forbidden('You have to be an assistant or teacher in the '
        + 'same course as the student you are assigning a teacher to.')
    }

    if (!teacherInstanceId) {
      await studentInstance.update({
        teacherInstanceId: null
      })
      res.status(200).send(studentInstance)
      return
    }

    const givenTeachersTeacherInstance = isId(teacherInstanceId) ? await TeacherInstance.findOne({
      where: {
        id: teacherInstanceId
      }
    }) : null
    if (!givenTeachersTeacherInstance) {
      throw badRequest('There is no teacher with the given teacher instance ID.')
    }
    if (givenTeachersTeacherInstance.courseInstanceId !== studentInstance.courseInstanceId) {
      throw badRequest('You have to be an assistant or teacher in the same course as the teacher you are adding.')
    }
    await studentInstance.update({
      teacherInstanceId
    })
    res.status(200).send(studentInstance)
  },

  /**
   * Get assistant for student instance
   *   permissions: must be a teacher or an assistant on the course
   * currently not used by frontend, but has a call (getStudentsAssistant)
   *
   * @param {*} req
   * @param {*} res
   */
  async findAssistantByStudentInstance(req, res) {
    const returnedAssistantInfo = {
      status: undefined,
      data: undefined
    }

    const studentInstance = isId(req.params.id) ? await StudentInstance.findOne({
      where: {
        id: req.params.id
      }
    }) : null

    if (!studentInstance) {
      returnedAssistantInfo.status = 'No assistant assigned to student.'
      res.status(200).send(returnedAssistantInfo)
      return
    }

    await requireCourseStaff(req, studentInstance.courseInstanceId, 'You must be an instructor on the course.')

    const assistantAsTeacher = await TeacherInstance.findOne({
      where: {
        id: studentInstance.teacherInstanceId
      },
      include: [{ model: User, attributes: ['firsts', 'lastname'] }]
    })
    if (!assistantAsTeacher) {
      returnedAssistantInfo.status = 'No assistant assigned to student.'
      res.status(200).send(returnedAssistantInfo)
      return
    }
    returnedAssistantInfo.data = {
      firsts: assistantAsTeacher.User.firsts,
      lastname: assistantAsTeacher.User.lastname
    }
    returnedAssistantInfo.status = 'Student already has an assigned assistant.'

    res.status(200).send(returnedAssistantInfo)
  }
}
