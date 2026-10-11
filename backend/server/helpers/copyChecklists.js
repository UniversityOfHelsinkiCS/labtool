const { Checklist, ChecklistItem } = require('../models')

/**
 * Deep copies checklists with their items onto another course. Prerequisites are mapped to the new
 * items. `copies` is a list of { checklist, week } where week is the week number on the target course
 * (ignored for code review checklists).
 */
const copyChecklists = async (copies, targetCourseId) => {
  const itemIdMap = {}
  const prerequisitesToUpdate = []

  await Promise.all(copies.map(async ({ checklist, week }) => {
    const items = await ChecklistItem.findAll({ where: { checklistId: checklist.id } })

    const newChecklist = checklist.get({ plain: true })
    delete newChecklist.id
    newChecklist.courseInstanceId = targetCourseId
    newChecklist.forCodeReview = newChecklist.forCodeReview || false
    newChecklist.week = newChecklist.forCodeReview ? null : week
    const created = await Checklist.create(newChecklist)

    await Promise.all(items.map(async (item) => {
      const newItem = item.get({ plain: true })
      const oldId = newItem.id
      const oldPrerequisite = newItem.prerequisite
      delete newItem.id
      newItem.prerequisite = null
      newItem.checklistId = created.id
      const added = await ChecklistItem.create(newItem)
      itemIdMap[oldId] = added.id
      if (oldPrerequisite) {
        prerequisitesToUpdate.push([added.id, oldPrerequisite])
      }
    }))
  }))

  await Promise.all(prerequisitesToUpdate.map(([itemId, oldPrerequisite]) => ChecklistItem.update(
    { prerequisite: itemIdMap[oldPrerequisite] },
    { where: { id: itemId } }
  )))
}

module.exports = { copyChecklists }
