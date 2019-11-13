// generating dropdowns for StudentTable etc.

export const createDropdownTeachers = (teachers, array) => {
  if (teachers !== undefined) {
    array.push({
      key: '-',
      text: '(unassigned)',
      value: '-',
      selected: false
    })
    teachers.map(m =>
      array.push({
        key: m.id,
        text: m.firsts + ' ' + m.lastname,
        value: m.id,
        selected: false
      })
    )
    return array
  }
  return []
}

export const createDropdownTags = (tags, array) => {
  if (tags !== undefined) {
    tags.map(tag =>
      array.push({
        key: tag.id,
        text: tag.name,
        value: tag.id,
        selected: false
      })
    )
    return array
  }
  return []
}
