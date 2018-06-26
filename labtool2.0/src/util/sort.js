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

export const sortUsersByAdminAssistantLastname = (users, assistants) => {
  return users.sort((a, b) => {
    const aIsAssistant = assistants.find(ass => ass.userId === a.id)
    const bIsAssistant = assistants.find(ass => ass.userId === b.id)
    if (a.admin && !b.admin) {
      return -1
    } else if (!a.admin && b.admin) {
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

export const sortStudentsByLastname = students => {
  return students.sort((a, b) => {
    if (a.User.lastname < b.User.lastname) {
      return -1
    } else if (a.User.lastname > b.User.lastname) {
      return 1
    } else if (a.firsts < b.firsts) {
      return -1
    } else {
      return 1
    }
  })
}

export default sortCourses
