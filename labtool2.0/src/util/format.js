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
