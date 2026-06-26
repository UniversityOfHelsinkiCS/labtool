if (!Array.prototype.flat) {
  // polyfill; implement function if it is not found yet by injecting it into the prototype
  const actualFlat = arr => {
    let res = []
    for (let i = 0; i < arr.length; ++i) {
      const item = arr[i]
      if (Array.isArray(item)) {
        res = res.concat(item)
      } else {
        res.push(item)
      }
    }
    return res
  }

  Object.defineProperty(Array.prototype, 'flat', {
    value: function(depth) {
      if (depth === undefined || depth === 1) {
        return actualFlat(Object(this))
      } else if (depth > 1) {
        return actualFlat(Object(this)).flat(depth - 1)
      } else {
        return [...Object(this)]
      }
    }
  })
}
