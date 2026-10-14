const { ChangeLog, ChecklistItem, TeacherInstance, StudentInstance, User } = require('../models')

/**
 * Change history (#1129, #1132). Every save that changes a student's grading or repository link writes
 * one ChangeLog row describing what changed: { field: { from, to } } for values (full texts included)
 * and checklist: [{ id, name, from, to }] for checklist checks.
 */

const isEmpty = value => value === null || value === undefined || value === ''

// records field: { from, to } when the value changed; empty values count as the same
const addValueChange = (changes, field, from, to, { numeric = false } = {}) => {
  const normalize = value => {
    if (isEmpty(value)) return null
    return numeric ? Number(value) : String(value)
  }
  if (normalize(from) !== normalize(to)) {
    changes[field] = { from: normalize(from), to: normalize(to) }
  }
}

// records checklist: [{ id, name, from, to }] for checks whose state changed
const addChecklistChanges = async (changes, before, after) => {
  const changedIds = Object.keys(after).filter(id => Boolean(after[id]) !== Boolean(before[id]))
  if (changedIds.length === 0) return
  const items = await ChecklistItem.findAll({ attributes: ['id', 'name'], where: { id: changedIds.map(Number) } })
  const names = Object.fromEntries(items.map(item => [item.id, item.name]))
  changes.checklist = changedIds.map(id => ({
    id: Number(id),
    name: names[id] || `#${id}`,
    from: Boolean(before[id]),
    to: Boolean(after[id])
  }))
}

// initial: the first version (a new review, the first grading, the repository at registration)
// options are passed to create, e.g. { transaction }
const logChange = async (
  { courseInstanceId, studentInstanceId, userId, kind, number = null, changes, initial = false },
  options = {}
) => {
  if (!changes || Object.keys(changes).length === 0) return null
  return ChangeLog.create({ courseInstanceId, studentInstanceId, userId, kind, number, changes, initial }, options)
}

/**
 * Points and grade changes made by someone other than the student's assigned instructor, for marking
 * them in the course page's student list. Returns { 'studentInstanceId:kind:number': [change, ...] },
 * oldest first; students without an assigned instructor are not included.
 */
const pointsChangesByOthers = async (courseInstanceId) => {
  const teachers = await TeacherInstance.findAll({ attributes: ['id', 'userId'], where: { courseInstanceId } })
  const userOfTeacher = Object.fromEntries(teachers.map(teacher => [teacher.id, teacher.userId]))
  const students = await StudentInstance.findAll({ attributes: ['id', 'teacherInstanceId'], where: { courseInstanceId } })
  const assignedUser = Object.fromEntries(students.map(student => [student.id, userOfTeacher[student.teacherInstanceId]]))

  const entries = await ChangeLog.findAll({
    where: { courseInstanceId, kind: ['week_review', 'code_review_grade'] },
    include: [{ model: User, attributes: ['firsts', 'lastname'] }],
    order: [['createdAt', 'ASC'], ['id', 'ASC']]
  })
  const result = {}
  entries.forEach((entry) => {
    const assigned = assignedUser[entry.studentInstanceId]
    const { points, grade } = entry.changes
    if (!assigned || entry.userId === assigned || (!points && !grade)) return
    const key = `${entry.studentInstanceId}:${entry.kind}:${entry.number}`
    result[key] = result[key] || []
    result[key].push({
      by: entry.User ? `${entry.User.firsts} ${entry.User.lastname}` : null,
      at: entry.createdAt,
      initial: entry.initial,
      points: points || null,
      grade: grade || null
    })
  })
  return result
}

module.exports = { addValueChange, addChecklistChanges, logChange, pointsChangesByOthers }
