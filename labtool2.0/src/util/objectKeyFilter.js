export const objectKeyFilter = (object, filter) => {
  const newObject = {}

  Object.keys(object)
    .filter(filter)
    .forEach(key => (newObject[key] = object[key]))

  return newObject
}
