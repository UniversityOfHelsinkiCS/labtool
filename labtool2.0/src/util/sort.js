export const sortCourses = courses => {
  return courses
    .sort((a, b) => {
      return new Date(b.start) - new Date(a.start)
    })
    .sort((a, b) => {
      return b.active - a.active
    })
}

export const sortTags = tags => {
  return tags.sort((a, b) => {
    if (a.name.toLowerCase() < b.name.toLowerCase()) {
      return -1
    } else if (a.name.toLowerCase() > b.name.toLowerCase()) {
      return 1
    } else {
      return 0
    }
  })
}

export const sortUsers = users => {
  return users.sort((a, b) => {
    if (a.admin === b.admin) {
      return a.firsts < b.firsts ? -1 : 1
    } else {
      return b.admin - a.admin
    }
  })
}

export default sortCourses
