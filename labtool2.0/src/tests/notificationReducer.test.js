import deepFreeze from 'deep-freeze'
import { vi } from 'vitest'
import reducer, { showNotification, clearNotifications } from '../reducers/notificationReducer'

// shape of the error object the api middleware puts into *_FAILURE actions
const httpError = data => ({ message: 'Request failed', response: { status: 400, data } })

const run = (action, state = {}) => {
  deepFreeze(state)
  deepFreeze(action)
  return reducer(state, action)
}

describe('notificationReducer', () => {
  it('starts empty', () => {
    expect(reducer(undefined, { type: '@@INIT' })).toEqual({})
  })

  it('showNotification / NOTIFICATION_SHOW', async () => {
    const dispatch = vi.fn()
    await showNotification({ message: 'Hello', error: false })(dispatch)
    expect(run(dispatch.mock.calls[0][0])).toEqual({ message: 'Hello', error: false })
  })

  it('clearNotifications / NOTIFICATION_CLEAR keeps the last message', async () => {
    const dispatch = vi.fn()
    await clearNotifications()(dispatch)
    expect(run(dispatch.mock.calls[0][0], { message: 'Hello', error: true })).toEqual({
      lastMessage: 'Hello',
      error: true
    })
  })

  it.each([
    ['USER_UPDATE_SUCCESS', 'Your email address has been updated', false],
    ['USER_UPDATE_ADMIN_SUCCESS', 'User updated', false],
    ['USER_UPDATE_ADMIN_FAILURE', 'Could not update user', true],
    ['STUDENT_COURSE_CREATE_ONE_SUCCESS', 'Course registration successful!', false],
    ['CI_MODIFY_ONE_SUCCESS', 'Course instance updated successfully!', false],
    ['CI_COPY_INFO_SUCCESS', 'Course details copied successfully!', false],
    ['CI_COPY_INFO_FAILURE', 'Course details could not be copied.', true],
    ['WEEKS_CREATE_ONESUCCESS', 'Week reviewed successfully!', false],
    ['WEEKS_CREATE_ONEFAILURE', 'Invalid inputs.', true],
    ['WEEKDRAFTS_CREATE_ONESUCCESS', 'Week draft saved successfully!', false],
    ['WEEKDRAFTS_CREATE_ONEFAILURE', 'Invalid inputs.', true],
    ['COMMENT_CREATE_ONE_SUCCESS', 'Comment created successfully!', false],
    ['COMMENT_CREATE_ONE_FAILURE', 'Creating comment failed!', true],
    ['TEACHER_CREATE_SUCCESS', 'Added a new assistant successfully!', false],
    ['TEACHER_REMOVE_SUCCESS', 'Removed an assistant successfully!', false],
    ['TEACHER_REMOVE_FAILURE', 'Removing assistant failed', true],
    ['CODE_REVIEW_BULKINSERT_SUCCESS', 'Code reviews saved successfully', false],
    ['CODE_REVIEW_GRADE_SUCCESS', 'Code review graded successfully', false],
    ['CODE_REVIEW_ADD_LINK_SUCCESS', 'Review link submitted successfully', false],
    ['TAG_STUDENT_SUCCESS', 'Student tagged successfully', false],
    ['UNTAG_STUDENT_SUCCESS', 'Student tag removed successfully', false],
    ['TAG_CREATE_SUCCESS', 'Tag saved successfully', false],
    ['TAG_REMOVE_SUCCESS', 'Tag removed successfully', false],
    ['CODE_REVIEW_RANDOMIZE', 'Code reviews randomized, changes need to be saved', false],
    ['STUDENT_PROJECT_INFO_UPDATE_SUCCESS', 'Project info updated successfully!', false],
    ['CODE_REVIEW_REMOVE_ONE_SUCCESS', 'Code review removed successfully!', false],
    ['COURSE_IMPORT_DO_IMPORT_SUCCESS', 'Courses imported successfully', false],
    ['COURSE_IMPORT_DO_IMPORT_FAILURE', 'Could not import courses', true],
    ['STUDENT_REMOVE_SUCCESS', 'You have removed yourself from the course', false],
    ['STUDENT_REMOVE_FAILURE', 'You cannot remove yourself from the course', true]
  ])('%s -> "%s"', (type, message, error) => {
    expect(run({ type, response: {} })).toEqual({ message, error })
  })

  it.each([
    ['USER_UPDATE_FAILURE', { error: 'Invalid email' }, 'Invalid email'],
    ['STUDENT_COURSE_CREATE_ONE_FAILURE', { message: 'Already registered' }, 'Already registered'],
    ['SEND_EMAIL_FAILURE', { message: 'No email address' }, 'No email address'],
    ['STUDENT_PROJECT_INFO_UPDATE_FAILURE', { message: 'Bad github' }, 'Bad github'],
    ['MASS_EMAIL_SENDFAILURE', { message: 'smtp down' }, 'Could not send e-mail; smtp down']
  ])('%s shows the message from the response body', (type, data, message) => {
    expect(run({ type, response: httpError(data) })).toEqual({ message, error: true })
  })

  it.each([
    ['TEACHER_CREATE_FAILURE', 'Not allowed', 'Not allowed'],
    ['ASSOCIATE_TEACHER_AND_STUDENT_FAILURE', 'Not allowed', 'Not allowed'],
    ['CODE_REVIEW_BULKINSERT_FAILURE', 'Invalid', 'Invalid'],
    ['CODE_REVIEW_GRADE_FAILURE', 'Invalid', 'Invalid'],
    ['CODE_REVIEW_ADD_LINK_FAILURE', 'Invalid', 'Review link could not be submitted: Invalid'],
    ['TAG_CREATE_FAILURE', 'Duplicate', 'Duplicate'],
    ['CHECKLIST_CREATE_FAILURE', 'Invalid', 'Invalid']
  ])('%s shows the response body', (type, data, message) => {
    expect(run({ type, response: httpError(data) })).toEqual({ message, error: true })
  })

  it.each([
    ['CHECKLIST_CREATE_SUCCESS', 'Checklist saved'],
    ['SEND_EMAIL_SUCCESS', 'Email sent'],
    ['MASS_EMAIL_SENDSUCCESS', 'Emails sent']
  ])('%s shows the message from the response', (type, message) => {
    expect(run({ type, response: { message } })).toEqual({ message, error: false })
  })

  it('MASS_EMAIL_SENDSUCCESS is shown as an error when some recipients did not get the email (#1141)', () => {
    const message = 'Email sent to 1 of 2 recipients. Not delivered to: Pekka Palautuva (no email address).'
    const notDelivered = [{ name: 'Pekka Palautuva', email: null, reason: 'no email address' }]
    expect(run({ type: 'MASS_EMAIL_SENDSUCCESS', response: { message, notDelivered } })).toEqual({
      message,
      error: true
    })
    expect(
      run({
        type: 'MASS_EMAIL_SENDSUCCESS',
        response: { message: 'Email sent successfully.', notDelivered: [] }
      })
    ).toEqual({
      message: 'Email sent successfully.',
      error: false
    })
  })

  it('STUDENT_PROJECT_INFO_UPDATE_FAILURE without a response uses a default message', () => {
    expect(run({ type: 'STUDENT_PROJECT_INFO_UPDATE_FAILURE', response: new Error('x') })).toEqual({
      message: 'Error updating project info',
      error: true
    })
  })

  it('MASS_EMAIL_SENDFAILURE without a response says no students were selected', () => {
    expect(run({ type: 'MASS_EMAIL_SENDFAILURE' })).toEqual({
      message: 'Could not send e-mail; no students selected',
      error: true
    })
  })

  it('CHECKLIST_GET_ONE_FAILURE shows the message only when copying', () => {
    const state = { message: 'previous', error: false }
    expect(
      run(
        {
          type: 'CHECKLIST_GET_ONE_FAILURE',
          response: httpError({ message: 'No checklist', data: { copying: true } })
        },
        state
      )
    ).toEqual({ message: 'No checklist', error: true })
    expect(
      run(
        { type: 'CHECKLIST_GET_ONE_FAILURE', response: httpError({ message: 'No checklist', data: {} }) },
        state
      )
    ).toBe(state)
  })

  it('ignores other actions', () => {
    const state = { message: 'previous', error: false }
    expect(run({ type: 'LOGIN_SUCCESS', response: {} }, state)).toBe(state)
  })
})
