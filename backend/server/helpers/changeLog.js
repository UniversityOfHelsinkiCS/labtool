const { ChangeLog, ChecklistItem } = require('../models')

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
const logChange = async ({ courseInstanceId, studentInstanceId, userId, kind, number = null, changes, initial = false }) => {
  if (!changes || Object.keys(changes).length === 0) return null
  return ChangeLog.create({ courseInstanceId, studentInstanceId, userId, kind, number, changes, initial })
}

module.exports = { addValueChange, addChecklistChanges, logChange }
