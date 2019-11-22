let finnish_collator = null
const finnish_localeCompare = (a, b) => {
  return a.localeCompare(b, 'fi-FI')
}

if (Intl && Intl.Collator) {
  const collator = new Intl.Collator('fi-u-co-trad')
  finnish_collator = collator ? collator.compare : null
}

export const finnishLocaleCompare = finnish_collator || finnish_localeCompare

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
      return finnishLocaleCompare(a.name, b.name)
    })
}

export const sortTags = tags => {
  return tags.sort((a, b) => {
    return finnishLocaleCompare(a.name.toLowerCase(), b.name.toLowerCase())
  })
}

export const sortStudentsAlphabeticallyByDroppedValue = students =>
  students.sort(
    (a, b) =>
      !Number(a.validRegistration) - !Number(b.validRegistration) ||
      Number(a.dropped) - Number(b.dropped) ||
      finnishLocaleCompare(a.User.lastname, b.User.lastname) ||
      finnishLocaleCompare(a.User.firsts, b.User.firsts) ||
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
    } else {
      return finnishLocaleCompare(a.lastname, b.lastname)
        || finnishLocaleCompare(a.firsts, b.firsts)
    }
  })
}

export const sortUsersBySysopLastname = users => {
  return users.sort((a, b) => {
    if (a.sysop && !b.sysop) {
      return -1
    } else if (!a.sysop && b.sysop) {
      return 1
    } else {
      return finnishLocaleCompare(a.lastname, b.lastname)
        || finnishLocaleCompare(a.firsts, b.firsts)
    }
  })
}

export const sortStudentsByLastname = students => {
  return students.sort((a, b) => {
    return finnishLocaleCompare(a.User.lastname, b.User.lastname)
      || finnishLocaleCompare(a.User.firsts, b.User.firsts)
  })
}

export default sortCourses
