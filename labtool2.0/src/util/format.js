const zeros = number => {
  const stringForm = number.toString()
  return stringForm.length === 1 ? `0${stringForm}` : stringForm
}

export const trimDate = stringForm => {
  const date = new Date(stringForm)
  if (!date) return '--.--.----, --:--:--'
  return `${zeros(date.getDate())}.${zeros(date.getMonth() + 1)}.${date.getFullYear()}, ${zeros(date.getHours())}:${zeros(date.getMinutes())}:${zeros(date.getSeconds())}`
}

export const createEuropeanDate = date => {
  return `${date.substring(8, 10)}.${date.substring(5, 7)}.${date.substring(0, 4)}`
}

export const createShorterCourseid = ohid => {
  return `${ohid.substring(0, 8)}`
}

const getAcademicYear = startDate => {
  let year = Number(startDate.substring(2, 4))
  const month = Number(startDate.split('-')[1])
  if (1 <= month && month <= 4) {
    return year - 1 + '-' + year
  }
  if (5 <= month && month <= 8) {
    return year
  }
  if (9 <= month && month <= 12) {
    return year + '-' + (year + 1)
  }
}

const getPeriod = startDate => {
  const month = Number(startDate.split('-')[1])
  let term
  if (month === 9) {
    term = 1
  } else if (month === 10) {
    term = 2
  } else if (month === 1) {
    term = 3
  } else if (month === 3) {
    term = 4
  } else if (month === 5) {
    term = 'early Summer'
  } else {
    term = 'late Summer'
  }
  return Number.isInteger(term) ? term + '.period' : term
}

/**
 * Show courseId and the year and term of the course
 * @param {*} ohid
 * @param {*} startDate
 */
export const createCourseIdWithYearAndTerm = (ohid, startDate) => {
  return createShorterCourseid(ohid) + ' ' + getAcademicYear(startDate) + ' ' + getPeriod(startDate)
}

export const capitalize = text => {
  if (text.length < 2) {
    return text.toUpperCase()
  } else {
    return text.slice(0, 1).toUpperCase() + text.slice(1).toLowerCase()
  }
}
