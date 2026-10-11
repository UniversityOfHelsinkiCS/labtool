import selectedInstanceReducer, {
  setFinalReviewVisible,
  courseSettings,
  hasUnsavedSettings
} from '../reducers/selectedInstanceReducer'
import deepFreeze from 'deep-freeze'
import { vi } from 'vitest'

describe('selectedInstanceRedurer', () => {
  let state
  let action

  beforeEach(() => {
    state = {
      teacherInstances: [
        {
          id: 1004,
          instructor: 'false',
          createdAt: '2018-01-16T21:00:00.000Z',
          updatedAt: '2018-01-16T21:00:00.000Z',
          userId: 10011,
          courseInstanceId: 10013
        }
      ]
    }
    action = {
      type: 'TEACHER_CREATE_SUCCESS',
      response: {
        id: 1003,
        instructor: 'false',
        createdAt: '2018-01-16T21:00:00.000Z',
        updatedAt: '2018-01-16T21:00:00.000Z',
        userId: 10010,
        courseInstanceId: 10013
      }
    }
  })

  it('new teacherinstance is added to teacherInstances when TEACHER_CREATE_SUCCESS is called', () => {
    deepFreeze(state)
    const newState = selectedInstanceReducer(state, action)
    expect(newState.teacherInstances.length).toBe(2)
  })

  it('correct teacher is added to teacherInstances  when TEACHER_CREATE_SUCCESS is called', () => {
    deepFreeze(state)
    const newState = selectedInstanceReducer(state, action)
    expect(newState.teacherInstances[1].id).toEqual(1003)
  })

  it('setFinalReviewVisible sets whether students see the final review', async () => {
    const dispatch = vi.fn()
    await setFinalReviewVisible(true)(dispatch)
    const [[setAction]] = dispatch.mock.calls
    const before = { finalReview: true, finalReviewVisible: false }
    deepFreeze(before)
    expect(selectedInstanceReducer(before, setAction)).toEqual({
      finalReview: true,
      finalReviewVisible: true
    })
  })

  describe('saved settings', () => {
    const course = {
      ohid: 'TKT1',
      weekAmount: 7,
      weekMaxPoints: 3,
      currentWeek: 2,
      active: true,
      finalReview: true,
      finalReviewHasPoints: false,
      finalReviewVisible: false,
      coursesPage: null,
      courseMaterial: 'https://material',
      currentCodeReview: [2, 1]
    }

    it('are recorded when the course is loaded and when it is saved', () => {
      const loaded = selectedInstanceReducer({}, { type: 'CI_GET_ONE_SUCCESS', response: course })
      expect(loaded.savedSettings).toEqual(courseSettings(course))
      deepFreeze(loaded)
      const edited = selectedInstanceReducer(loaded, { type: 'SET_FINAL_REVIEW_VISIBLE', value: true })
      expect(hasUnsavedSettings(edited, [1, 2])).toBe(true)
      const saved = selectedInstanceReducer(edited, {
        type: 'CI_MODIFY_ONE_SUCCESS',
        response: { ...course, finalReviewVisible: true }
      })
      expect(hasUnsavedSettings(saved, [1, 2])).toBe(false)
    })

    it('ignore differences that are not changes', () => {
      const loaded = selectedInstanceReducer({}, { type: 'CI_GET_ONE_SUCCESS', response: course })
      const sameAsText = {
        ...loaded,
        weekAmount: '7',
        currentWeek: '2',
        coursesPage: '',
        courseMaterial: ' https://material '
      }
      expect(hasUnsavedSettings(sameAsText, [2, 1])).toBe(false)
      expect(hasUnsavedSettings(sameAsText, [1])).toBe(true)
    })

    it('mean no unsaved changes before the course has been loaded', () => {
      expect(hasUnsavedSettings({ weekAmount: 3 }, [])).toBe(false)
    })
  })
})
