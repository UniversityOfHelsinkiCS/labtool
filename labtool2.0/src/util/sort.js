export const sortCourses = courses => {
  return courses
    .sort((a, b) => {
      return new Date(a.start) - new Date(b.start)
    })
    .reverse()
    .sort((a, b) => {
      return b.active - a.active
    })
}
