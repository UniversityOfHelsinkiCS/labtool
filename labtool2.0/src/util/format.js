const zeros = number => {
  const stringForm = number.toString()
  return stringForm.length === 1 ? `0${stringForm}` : stringForm
}

export const trimDate = stringForm => {
  const date = new Date(stringForm)
  if (!date) return '--.--.----, --:--:--'
  return `${zeros(date.getDate())}.${zeros(date.getMonth() + 1)}.${date.getFullYear()}, ${zeros(date.getHours())}:${zeros(date.getMinutes())}:${zeros(date.getSeconds())}`
}
