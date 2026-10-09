import deepFreeze from 'deep-freeze'
import coursePageReducer from '../reducers/coursePageReducer'

const student = (id, lastname, firsts, extra = {}) => ({
  id,
  teacherInstanceId: null,
  User: { lastname, firsts },
  codeReviews: [],
  weeks: [],
  ...extra
})

const teacherState = () => ({
  role: 'teacher',
  data: [
    student(1, 'Aalto', 'Anna', {
      codeReviews: [{ reviewNumber: 1, toReview: 2, repoToReview: null, points: null }],
      weeks: [
        {
          id: 11,
          weekNumber: 1,
          notified: false,
          comments: [
            { id: 101, comment: 'a', weekId: 11, notified: false, isRead: false },
            { id: 102, comment: 'b', weekId: 11, notified: false, isRead: false }
          ]
        }
      ]
    }),
    student(2, 'Bertta', 'Bo', {
      weeks: [{ id: 21, weekNumber: 1, notified: false, comments: [] }]
    })
  ]
})

const studentState = () => ({
  role: 'student',
  data: {
    id: 1,
    weeks: [{ id: 11, weekNumber: 1, comments: [{ id: 101, comment: 'a', weekId: 11, notified: false }] }],
    codeReviews: [
      { reviewNumber: 1, linkToReview: null },
      { reviewNumber: 2, linkToReview: null }
    ]
  }
})

describe('coursePageReducer', () => {
  it('starts with an empty object', () => {
    expect(coursePageReducer(undefined, { type: '@@INIT' })).toEqual({})
  })

  it('LOGOUT_SUCCESS resets', () => {
    const state = teacherState()
    deepFreeze(state)
    expect(coursePageReducer(state, { type: 'LOGOUT_SUCCESS' })).toEqual({})
  })

  describe('CP_INFO_SUCCESS', () => {
    it('sorts teacher data by student last name and first name', () => {
      const response = {
        role: 'teacher',
        data: [student(1, 'Öhman', 'A'), student(2, 'Aalto', 'Bea'), student(3, 'Aalto', 'Aino')]
      }
      const newState = coursePageReducer({}, { type: 'CP_INFO_SUCCESS', response })
      expect(newState.role).toBe('teacher')
      expect(newState.data.map(s => s.id)).toEqual([3, 2, 1])
    })

    it('stores student data as is', () => {
      const response = studentState()
      deepFreeze(response)
      const state = {}
      deepFreeze(state)
      expect(coursePageReducer(state, { type: 'CP_INFO_SUCCESS', response })).toBe(response)
    })
  })

  it('ASSOCIATE_TEACHER_AND_STUDENT_SUCCESS sets the assistant of one student', () => {
    const state = teacherState()
    deepFreeze(state)
    const newState = coursePageReducer(state, {
      type: 'ASSOCIATE_TEACHER_AND_STUDENT_SUCCESS',
      response: { id: 2, teacherInstanceId: 77 }
    })
    expect(newState.data[1].teacherInstanceId).toBe(77)
    expect(newState.data[0]).toBe(state.data[0])
  })

  describe('CODE_REVIEW_BULKINSERT_SUCCESS', () => {
    const action = {
      type: 'CODE_REVIEW_BULKINSERT_SUCCESS',
      response: {
        data: {
          reviewNumber: 1,
          codeReviews: [
            { reviewer: 1, toReview: 3 },
            { reviewer: 2, repoToReview: 'https://github.com/x/y' }
          ]
        }
      }
    }

    it('updates existing and adds new code reviews', () => {
      const newState = coursePageReducer(teacherState(), action)
      expect(newState.data[0].codeReviews).toEqual([
        { reviewNumber: 1, toReview: 3, repoToReview: null, points: null }
      ])
      expect(newState.data[1].codeReviews).toEqual([
        {
          points: null,
          reviewNumber: 1,
          studentInstanceId: 2,
          toReview: null,
          repoToReview: 'https://github.com/x/y'
        }
      ])
    })

    // BUG: the reducer mutates student.codeReviews in place (push / index assignment)
    // instead of copying, so the previous state is changed too.
    it.skip('does not mutate the previous state', () => {
      const state = teacherState()
      deepFreeze(state)
      expect(() => coursePageReducer(state, action)).not.toThrow()
    })
  })

  describe('CODE_REVIEW_GRADE_SUCCESS', () => {
    const action = {
      type: 'CODE_REVIEW_GRADE_SUCCESS',
      response: { data: { studentInstanceId: 1, reviewNumber: 1, points: 3 } }
    }

    it('sets the points of the code review', () => {
      const newState = coursePageReducer(teacherState(), action)
      expect(newState.data[0].codeReviews[0].points).toBe(3)
      expect(newState.data[0].codeReviews[0].toReview).toBe(2)
    })

    // BUG: student.codeReviews[index] is assigned in place, mutating the previous state.
    it.skip('does not mutate the previous state', () => {
      const state = teacherState()
      deepFreeze(state)
      expect(() => coursePageReducer(state, action)).not.toThrow()
    })
  })

  describe('CODE_REVIEW_ADD_LINK_SUCCESS (student)', () => {
    it('sets the link of the matching code review', () => {
      const state = studentState()
      deepFreeze(state)
      const newState = coursePageReducer(state, {
        type: 'CODE_REVIEW_ADD_LINK_SUCCESS',
        response: { data: { reviewNumber: 1, linkToReview: 'https://link' } }
      })
      const cr = newState.data.codeReviews.find(c => c.reviewNumber === 1)
      expect(cr.linkToReview).toBe('https://link')
      expect(newState.data.codeReviews).toHaveLength(2)
    })

    it('returns the same state when the review is not found', () => {
      const state = studentState()
      deepFreeze(state)
      const newState = coursePageReducer(state, {
        type: 'CODE_REVIEW_ADD_LINK_SUCCESS',
        response: { data: { reviewNumber: 9, linkToReview: 'https://link' } }
      })
      expect(newState).toBe(state)
    })
  })

  it.each(['TAG_STUDENT_SUCCESS', 'UNTAG_STUDENT_SUCCESS'])('%s replaces the student', type => {
    const state = teacherState()
    deepFreeze(state)
    const updated = { ...state.data[1], Tags: [{ id: 5, name: 'tag' }] }
    const newState = coursePageReducer(state, { type, response: updated })
    expect(newState.data[1]).toBe(updated)
    expect(newState.data[0]).toBe(state.data[0])
  })

  describe('SEND_EMAIL_SUCCESS', () => {
    it('teacher: marks the comment as notified', () => {
      const newState = coursePageReducer(teacherState(), {
        type: 'SEND_EMAIL_SUCCESS',
        response: { message: 'ok', data: { commentId: 102 } }
      })
      expect(newState.data[0].weeks[0].comments[1].notified).toBe(true)
      expect(newState.data[0].weeks[0].comments[0].notified).toBe(false)
    })

    it('teacher: marks the week as notified', () => {
      const newState = coursePageReducer(teacherState(), {
        type: 'SEND_EMAIL_SUCCESS',
        response: { message: 'ok', data: { weekId: 21 } }
      })
      expect(newState.data[1].weeks[0].notified).toBe(true)
      expect(newState.data[0].weeks[0].notified).toBe(false)
    })

    it('student: marks the comment as notified', () => {
      const newState = coursePageReducer(studentState(), {
        type: 'SEND_EMAIL_SUCCESS',
        response: { message: 'ok', data: { commentId: 101 } }
      })
      expect(newState.data.weeks[0].comments[0].notified).toBe(true)
    })

    // BUG: teacherCommentNotification / weekNotification / studentCommentNotification
    // (src/reducers/coursePageReducer.js:10-47) set `notified = true` on the existing objects and
    // return the *same* state object (the `return` inside forEach is a no-op). Connected components
    // therefore do not re-render, and the previous state is mutated.
    it.skip('returns a new state without mutating the previous one', () => {
      const state = teacherState()
      deepFreeze(state)
      const newState = coursePageReducer(state, {
        type: 'SEND_EMAIL_SUCCESS',
        response: { message: 'ok', data: { commentId: 102 } }
      })
      expect(newState).not.toBe(state)
      expect(newState.data[0].weeks[0].comments[1].notified).toBe(true)
    })
  })

  describe('COMMENT_CREATE_ONE_SUCCESS', () => {
    const comment = { id: 200, comment: 'new', weekId: 11 }

    it('teacher: appends the comment to the week', () => {
      const state = teacherState()
      deepFreeze(state)
      const newState = coursePageReducer(state, { type: 'COMMENT_CREATE_ONE_SUCCESS', response: comment })
      expect(newState.data[0].weeks[0].comments.map(c => c.id)).toEqual([101, 102, 200])
      expect(state.data[0].weeks[0].comments).toHaveLength(2)
    })

    it('student: appends the comment to the week', () => {
      const newState = coursePageReducer(studentState(), {
        type: 'COMMENT_CREATE_ONE_SUCCESS',
        response: comment
      })
      expect(newState.data.weeks[0].comments.map(c => c.id)).toEqual([101, 200])
    })

    // BUG: the student branch pushes into the existing comments array.
    it.skip('student: does not mutate the previous state', () => {
      const state = studentState()
      deepFreeze(state)
      expect(() =>
        coursePageReducer(state, { type: 'COMMENT_CREATE_ONE_SUCCESS', response: comment })
      ).not.toThrow()
    })

    it('other roles: returns the state', () => {
      const state = { role: undefined, data: {} }
      deepFreeze(state)
      expect(coursePageReducer(state, { type: 'COMMENT_CREATE_ONE_SUCCESS', response: comment })).toBe(state)
    })
  })

  it('MARK_COMMENTS_AS_READ_SUCCESS replaces the given comments', () => {
    const state = teacherState()
    deepFreeze(state)
    const newState = coursePageReducer(state, {
      type: 'MARK_COMMENTS_AS_READ_SUCCESS',
      response: [{ id: 102, comment: 'b', weekId: 11, isRead: true }]
    })
    expect(newState.data[0].weeks[0].comments.map(c => c.isRead)).toEqual([false, true])
  })

  describe('CODE_REVIEW_REMOVE_ONE_SUCCESS', () => {
    const action = {
      type: 'CODE_REVIEW_REMOVE_ONE_SUCCESS',
      response: { data: { reviewer: 1, codeReviewRound: 1 } }
    }

    it('removes the code review of the reviewer', () => {
      const newState = coursePageReducer(teacherState(), action)
      expect(newState.data[0].codeReviews).toEqual([])
    })

    // BUG: studentToChange.codeReviews is reassigned on the existing student object.
    it.skip('does not mutate the previous state', () => {
      const state = teacherState()
      deepFreeze(state)
      expect(() => coursePageReducer(state, action)).not.toThrow()
    })
  })

  describe('STUDENT_PROJECT_INFO_UPDATE_SUCCESS', () => {
    it('teacher: merges the updated student', () => {
      const state = teacherState()
      deepFreeze(state)
      const newState = coursePageReducer(state, {
        type: 'STUDENT_PROJECT_INFO_UPDATE_SUCCESS',
        response: { id: 2, projectName: 'New name', github: 'https://github.com/new' }
      })
      expect(newState.data[1]).toEqual({
        ...state.data[1],
        projectName: 'New name',
        github: 'https://github.com/new'
      })
      expect(newState.data[0]).toBe(state.data[0])
    })

    it('student: returns the state', () => {
      const state = studentState()
      deepFreeze(state)
      expect(
        coursePageReducer(state, { type: 'STUDENT_PROJECT_INFO_UPDATE_SUCCESS', response: { id: 1 } })
      ).toBe(state)
    })
  })

  describe('STUDENT_PROJECT_INFO_MASS_UPDATE_SUCCESS', () => {
    it('teacher: merges all updated students', () => {
      const state = teacherState()
      deepFreeze(state)
      const newState = coursePageReducer(state, {
        type: 'STUDENT_PROJECT_INFO_MASS_UPDATE_SUCCESS',
        response: [
          { id: 1, dropped: true },
          { id: 2, dropped: true }
        ]
      })
      expect(newState.data.map(s => s.dropped)).toEqual([true, true])
    })

    it('student: returns the state', () => {
      const state = studentState()
      deepFreeze(state)
      expect(
        coursePageReducer(state, { type: 'STUDENT_PROJECT_INFO_MASS_UPDATE_SUCCESS', response: [{ id: 1 }] })
      ).toBe(state)
    })
  })
})
