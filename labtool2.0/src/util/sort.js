const sortCourses = courses => {
  return courses
    .sort((a, b) => {
      return new Date(b.start) - new Date(a.start)
    })
    .sort((a, b) => {
      return b.active - a.active
    })
}

export default sortCourses
