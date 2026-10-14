const { ChangeLog, StudentInstance, User } = require('../models')
const { requireCourseStaff } = require('../helpers/auth')
const { notFound } = require('../utils/httpError')

module.exports = {
  /**
   * Change history of one student: grading changes (#1129) and repository link changes (#1132),
   * newest first.
   *   permissions: must be a teacher/assistant on the student's course
   */
  async listForStudent(req, res) {
    const id = Number(req.params.studentInstanceId)
    const studentInstance = Number.isInteger(id) ? await StudentInstance.findByPk(id) : null
    if (!studentInstance) {
      throw notFound('Student not found.')
    }
    await requireCourseStaff(
      req, studentInstance.courseInstanceId, 'You must be a teacher of the course to see the change history.'
    )
    const entries = await ChangeLog.findAll({
      where: { studentInstanceId: studentInstance.id },
      include: [{ model: User, attributes: ['firsts', 'lastname'] }],
      order: [['createdAt', 'DESC'], ['id', 'DESC']]
    })
    res.status(200).send(entries.map(entry => ({
      id: entry.id,
      kind: entry.kind,
      number: entry.number,
      changes: entry.changes,
      initial: entry.initial,
      createdAt: entry.createdAt,
      by: entry.User ? `${entry.User.firsts} ${entry.User.lastname}` : null
    })))
  }
}
