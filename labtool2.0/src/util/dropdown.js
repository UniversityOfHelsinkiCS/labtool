
export const createDropdownTeachers = (teachers, array) => {
  if (teachers !== undefined) {
    teachers.map(m =>
      array.push({
        key: m.id,
        text: m.firsts + ' ' + m.lastname,
        value: m.id
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
        value: tag.id
      })
    )
    return array
  }
  return []
}
