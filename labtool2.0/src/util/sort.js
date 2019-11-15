export const sortCourses = courses => {
  return courses
    .sort((a, b) => {
      return new Date(b.start) - new Date(a.start)
    })
    .sort((a, b) => {
      return b.active - a.active
    })
}

export const sortCoursesByName = courses => {
  return courses
    .sort((a, b) => {
      return new Date(b.start) - new Date(a.start)
    })
    .sort((a, b) => {
      return new Date(b.name) - new Date(a.name)
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

export const sortStudentsAlphabeticallyByDroppedValue = students =>
  students.sort(
    (a, b) =>
      !Number(a.validRegistration) - !Number(b.validRegistration) ||
      Number(a.dropped) - Number(b.dropped) ||
      a.User.lastname.localeCompare(b.User.lastname) ||
      a.User.firsts.localeCompare(b.User.firsts) ||
      a.id - b.id
  )

export const sortUsersByTeacherAssistantLastname = (users, assistants) => {
  return users.sort((a, b) => {
    const aIsAssistant = assistants.find(ass => ass.userId === a.id)
    const bIsAssistant = assistants.find(ass => ass.userId === b.id)
    if (a.teacher && !b.teacher) {
      return -1
    } else if (!a.teacher && b.teacher) {
      return 1
    } else if (aIsAssistant && !bIsAssistant) {
      return -1
    } else if (!aIsAssistant && bIsAssistant) {
      return 1
    } else if (a.lastname > b.lastname) {
      return 1
    } else if (a.lastname < b.lastname) {
      return -1
    } else if (a.firsts > b.firsts) {
      return -1
    } else {
      return 1
    }
  })
}

export const sortUsersBySysopLastname = users => {
  return users.sort((a, b) => {
    if (a.sysop && !b.sysop) {
      return -1
    } else if (!a.sysop && b.sysop) {
      return 1
    } else if (a.lastname > b.lastname) {
      return 1
    } else if (a.lastname < b.lastname) {
      return -1
    } else if (a.firsts > b.firsts) {
      return -1
    } else {
      return 1
    }
  })
}

export const sortStudentsByLastname = students => {
  return students.sort((a, b) => {
    if (a.User.lastname < b.User.lastname) {
      return -1
    } else if (a.User.lastname > b.User.lastname) {
      return 1
    } else if (a.User.firsts < b.User.firsts) {
      return -1
    } else {
      return 1
    }
  })
}

export default sortCourses
