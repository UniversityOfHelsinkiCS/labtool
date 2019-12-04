import '../util/arrayFlatPolyfill'

describe('Array.prototype.flat should work', () => {
  it('when flattening array of arrays', () => {
    expect([[1, 2, 3], [4, 5]].flat()).toEqual([1, 2, 3, 4, 5])
  })
  it('when flattening mixed array', () => {
    expect([[1, 2], 3, [4, 5]].flat()).toEqual([1, 2, 3, 4, 5])
  })
  it('when flattening with depth > 1', () => {
    expect([[[1, 2], [3]], [4, 5]].flat(2)).toEqual([1, 2, 3, 4, 5])
  })
})
