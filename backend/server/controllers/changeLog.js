const { ChangeLog, StudentInstance, User } = require('../models')
const helper = require('../helpers/courseInstanceHelper')
const logger = require('../utils/logger')

module.exports = {
  /**
   * Change history of one student: grading changes (#1129) and repository link changes (#1132),
   * newest first.
   *   permissions: must be a teacher/assistant on the student's course
   */
  async listForStudent(req, res) {
    if (!helper.controllerBeforeAuthCheckAction(req, res)) {
      return
    }
    try {
      const studentInstance = await StudentInstance.findByPk(Number(req.params.studentInstanceId))
      if (!studentInstance) {
        return res.status(404).send('Student not found.')
      }
      const isTeacher = await helper.getTeacherId(req.decoded.id, studentInstance.courseInstanceId)
      if (!isTeacher) {
        return res.status(403).send('You must be a teacher of the course to see the change history.')
      }
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
    } catch (error) {
      logger.error('Change history error', { error: error.message })
      res.status(500).send('Unexpected error.')
    }
  }
}
