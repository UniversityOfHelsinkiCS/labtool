import reviewSaveReducer from '../reducers/reviewSaveReducer'

describe('reviewSaveReducer (#1127)', () => {
  const conflict = { code: 'REVIEW_CHANGED', message: 'Someone saved this review after you opened it.' }
  const failure = (type, status) => ({ type, response: { response: { status, data: conflict } } })

  it('stores why a review save was refused', () => {
    expect(reviewSaveReducer(undefined, failure('WEEKS_CREATE_ONE_FAILURE', 409))).toEqual({ conflict })
  })

  it('stores why a draft save was refused, marked as a draft', () => {
    expect(reviewSaveReducer(undefined, failure('WEEKDRAFTS_CREATE_ONE_FAILURE', 409))).toEqual({
      conflict: { ...conflict, draft: true }
    })
  })

  it('ignores other failures and clears the conflict on the next save', () => {
    expect(reviewSaveReducer(undefined, failure('WEEKDRAFTS_CREATE_ONE_FAILURE', 400))).toEqual({
      conflict: null
    })
    const refused = { conflict: { ...conflict, draft: true } }
    expect(reviewSaveReducer(refused, { type: 'WEEKDRAFTS_CREATE_ONE_ATTEMPT' })).toEqual({ conflict: null })
    expect(reviewSaveReducer(refused, { type: 'WEEKS_CREATE_ONE_ATTEMPT' })).toEqual({ conflict: null })
  })
})
