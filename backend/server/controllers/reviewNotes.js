const { ReviewNote, StudentInstance, CourseInstance, User, Week } = require('../models')
const { requireCourseStaff } = require('../helpers/auth')
const { isFinalReviewWeek } = require('../helpers/finalReview')
const { badRequest, notFound } = require('../utils/httpError')

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
    const { studentInstanceId, weekNumber } = req.body
    const text = typeof req.body.text === 'string' ? req.body.text.trim() : ''
    if (!text) {
      throw badRequest('The note cannot be empty.')
    }
    const id = Number(studentInstanceId)
    const studentInstance = Number.isInteger(id) ? await StudentInstance.findByPk(id) : null
    if (!studentInstance) {
      throw notFound('Student not found.')
    }
    await requireCourseStaff(req, studentInstance.courseInstanceId)
    const course = await CourseInstance.findByPk(studentInstance.courseInstanceId)
    if (!isFinalReviewWeek(course, Number(weekNumber))) {
      throw badRequest('Additional review notes are only for the final review.')
    }
    // additional notes add to the review notes of the instructor, so those must be there first
    const week = await Week.findOne({ where: { studentInstanceId: studentInstance.id, weekNumber: Number(weekNumber) } })
    if (!week || !(week.instructorNotes || '').trim()) {
      throw badRequest('Notes can be added once the review notes of the final review have been written.')
    }
    const note = await ReviewNote.create({
      studentInstanceId: studentInstance.id,
      weekNumber: Number(weekNumber),
      userId: req.decoded.id,
      text
    })
    const user = await User.findByPk(req.decoded.id)
    return res.status(200).send(toJson(note, user))
  }
}
