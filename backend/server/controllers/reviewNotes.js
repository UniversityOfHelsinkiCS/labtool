const { ReviewNote, StudentInstance, CourseInstance, TeacherInstance, User, Week } = require('../models')
const helper = require('../helpers/applicationHelper')
const { isFinalReviewWeek } = require('../helpers/finalReview')
const logger = require('../utils/logger')

// the shape sent to the frontend
const toJson = (note, user) => ({
  id: note.id,
  studentInstanceId: note.studentInstanceId,
  weekNumber: note.weekNumber,
  text: note.text,
  createdAt: note.createdAt,
  by: user ? `${user.firsts} ${user.lastname}` : null
})

module.exports = {
  toJson,

  /**
   * Add a review note to a student's final review. Only the assigned instructor edits the review notes
   * of the final review; the rest of the course staff add notes with this. Never shown to students.
   *   permissions: must be a teacher or an assistant of the course
   */
  async create(req, res) {
    if (!helper.controllerBeforeAuthCheckAction(req, res)) {
      return
    }
    try {
      const { studentInstanceId, weekNumber } = req.body
      const text = typeof req.body.text === 'string' ? req.body.text.trim() : ''
      if (!text) {
        return res.status(400).send('The note cannot be empty.')
      }
      const studentInstance = await StudentInstance.findByPk(studentInstanceId)
      if (!studentInstance) {
        return res.status(404).send('Student not found.')
      }
      const staff = await TeacherInstance.findOne({
        attributes: ['id'],
        where: { userId: req.decoded.id, courseInstanceId: studentInstance.courseInstanceId }
      })
      if (!staff) {
        return res.status(403).send('You must be a teacher of the course to perform this action.')
      }
      const course = await CourseInstance.findByPk(studentInstance.courseInstanceId)
      if (!isFinalReviewWeek(course, Number(weekNumber))) {
        return res.status(400).send('Additional review notes are only for the final review.')
      }
      // additional notes add to the review notes of the instructor, so those must be there first
      const week = await Week.findOne({ where: { studentInstanceId: studentInstance.id, weekNumber: Number(weekNumber) } })
      if (!week || !(week.instructorNotes || '').trim()) {
        return res.status(400).send('Notes can be added once the review notes of the final review have been written.')
      }
      const note = await ReviewNote.create({
        studentInstanceId: studentInstance.id,
        weekNumber: Number(weekNumber),
        userId: req.decoded.id,
        text
      })
      const user = await User.findByPk(req.decoded.id)
      return res.status(200).send(toJson(note, user))
    } catch (e) {
      logger.error('Review note error.', { error: e.message })
      return res.status(500).send('Internal server error')
    }
  }
}
