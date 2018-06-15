export const sortCourses = courses => {
  return courses
    .sort((a, b) => {
      return new Date(b.start) - new Date(a.start)
    })
    .sort((a, b) => {
      return b.active - a.active
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
