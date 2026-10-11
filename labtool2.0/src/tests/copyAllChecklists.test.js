import notificationReducer from '../reducers/notificationReducer'
import copyableChecklistReducer from '../reducers/copyableChecklistReducer'

// copying all checklists of another course onto a course that has none
describe('copying all checklists', () => {
  const response = {
    copied: ['week 1', 'week 2', 'code review'],
    skipped: ['week 8'],
    checklists: [
      { courseInstanceId: 5, week: 1, forCodeReview: false },
      { courseInstanceId: 5, week: 2, forCodeReview: false },
      { courseInstanceId: 5, week: null, forCodeReview: true }
    ]
  }

  it('tells what was copied and what was not', () => {
    expect(notificationReducer({}, { type: 'CHECKLIST_COPY_ALL_SUCCESS', response })).toEqual({
      message: 'Copied 3 checklists: week 1, week 2, code review. Not copied, as this course has no week 8.',
      error: false
    })
    expect(
      notificationReducer(
        {},
        { type: 'CHECKLIST_COPY_ALL_SUCCESS', response: { copied: ['week 1'], skipped: [] } }
      ).message
    ).toBe('Copied 1 checklist: week 1.')
  })

  it('shows the reason given by the server when it fails', () => {
    const failure = { response: { data: 'The course already has checklists.' } }
    expect(notificationReducer({}, { type: 'CHECKLIST_COPY_ALL_FAILURE', response: failure })).toEqual({
      message: 'The course already has checklists.',
      error: true
    })
    expect(notificationReducer({}, { type: 'CHECKLIST_COPY_ALL_FAILURE', response: {} }).message).toBe(
      'The checklists could not be copied.'
    )
  })

  it('adds the new checklists to the copyable ones', () => {
    const before = [{ courseInstanceId: 9, week: 1, forCodeReview: false }]
    expect(copyableChecklistReducer(before, { type: 'CHECKLIST_COPY_ALL_SUCCESS', response })).toEqual([
      ...before,
      ...response.checklists
    ])
  })
})
