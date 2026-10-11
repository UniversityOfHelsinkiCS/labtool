import React from 'react'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { vi } from 'vitest'
import deepFreeze from 'deep-freeze'
import { CourseName, MarkInvalidButton } from '../components/InvalidCourse'
import { CoursePageTeacherHeader } from '../components/pages/CoursePage/TeacherHeader'
import courseInstanceReducer from '../reducers/courseInstanceReducer'
import teacherInstanceReducer from '../reducers/teacherInstanceReducer'
import selectedInstanceReducer from '../reducers/selectedInstanceReducer'
import { invalidCoursesLast } from '../util/sort'

// a course registered or imported by mistake can be marked invalid (#905)
const course = {
  id: 1,
  ohid: 'TKT1',
  name: 'Mistake course',
  start: '2026-09-01',
  end: '2026-12-01',
  invalid: false
}

describe('<CourseName />', () => {
  it('strikes through an invalid course', () => {
    const { container } = render(
      <CourseName course={{ ...course, invalid: true }}>Mistake course</CourseName>
    )
    expect(container.querySelector('.invalidCourseName')).toHaveStyle({ textDecoration: 'line-through' })
    expect(container.querySelector('.invalidCourseLabel')).toHaveTextContent('Invalid')
  })

  it('leaves a valid course as it is', () => {
    const { container } = render(<CourseName course={course}>Mistake course</CourseName>)
    expect(container).toHaveTextContent('Mistake course')
    expect(container.querySelector('.invalidCourseName')).toBeNull()
  })
})

describe('<MarkInvalidButton />', () => {
  const confirmDialog = () => document.querySelector('.markInvalidConfirm')

  it('marks the course invalid after a confirmation', async () => {
    const user = userEvent.setup()
    const setCourseInvalid = vi.fn()
    render(<MarkInvalidButton course={course} setCourseInvalid={setCourseInvalid} />)

    await user.click(screen.getByRole('button', { name: 'Mark course as invalid' }))
    expect(confirmDialog()).toHaveTextContent('Mark the course as invalid?')
    expect(setCourseInvalid).not.toHaveBeenCalled()
    await user.click(within(confirmDialog()).getByRole('button', { name: 'Mark invalid' }))
    expect(setCourseInvalid).toHaveBeenCalledWith('TKT1', true)
  })

  it('restores an invalid course after a confirmation', async () => {
    const user = userEvent.setup()
    const setCourseInvalid = vi.fn()
    render(<MarkInvalidButton course={{ ...course, invalid: true }} setCourseInvalid={setCourseInvalid} />)

    await user.click(screen.getByRole('button', { name: 'Restore course' }))
    await user.click(within(confirmDialog()).getByRole('button', { name: 'Restore course' }))
    expect(setCourseInvalid).toHaveBeenCalledWith('TKT1', false)
  })

  it('does nothing when cancelled', async () => {
    const user = userEvent.setup()
    const setCourseInvalid = vi.fn()
    render(<MarkInvalidButton course={course} setCourseInvalid={setCourseInvalid} />)

    await user.click(screen.getByRole('button', { name: 'Mark course as invalid' }))
    await user.click(within(confirmDialog()).getByRole('button', { name: 'Cancel' }))
    expect(setCourseInvalid).not.toHaveBeenCalled()
    expect(confirmDialog()).toBeNull()
  })
})

describe('the teacher course page header', () => {
  const renderHeader = selectedInstance =>
    render(
      <MemoryRouter>
        <CoursePageTeacherHeader
          selectedInstance={{ ...selectedInstance, weekAmount: 7, currentWeek: 1, end: '2099-01-01' }}
          changeCourseActive={vi.fn()}
          moveToNextWeek={vi.fn()}
        />
      </MemoryRouter>
    )

  it('says the course is invalid and links to the course settings', () => {
    const { container } = renderHeader({ ...course, invalid: true, active: false })
    const banner = container.querySelector('.invalidCourseBanner')
    expect(banner).toHaveTextContent('This course is marked invalid')
    expect(within(banner).getByRole('link', { name: 'course settings' })).toHaveAttribute(
      'href',
      '/labtool/ModifyCourseInstancePage/TKT1'
    )
    // no suggestion to activate the registration of an invalid course
    expect(screen.queryByRole('button', { name: 'Activate now' })).toBeNull()
  })

  it('says nothing for a valid course', () => {
    const { container } = renderHeader(course)
    expect(container.querySelector('.invalidCourseBanner')).toBeNull()
  })
})

describe('invalid courses in the store', () => {
  const courses = [
    { ...course, id: 1, ohid: 'A', start: '2026-01-01', active: true },
    { ...course, id: 2, ohid: 'B', start: '2026-02-01', active: true, invalid: true },
    { ...course, id: 3, ohid: 'C', start: '2025-01-01', active: false }
  ]
  const marked = invalid => ({ type: 'CI_SET_INVALID_SUCCESS', response: { ohid: 'A', invalid } })

  it('go to the bottom of course lists', () => {
    expect(invalidCoursesLast([...courses]).map(c => c.ohid)).toEqual(['A', 'C', 'B'])
    const all = courseInstanceReducer({}, { type: 'CI_GET_ALL_SUCCESS', response: [...courses] })
    expect(all.map(c => c.ohid)).toEqual(['A', 'C', 'B'])
  })

  it('are updated in the course lists when a course is marked', () => {
    const all = courseInstanceReducer({}, { type: 'CI_GET_ALL_SUCCESS', response: [...courses] })
    deepFreeze(all)
    expect(courseInstanceReducer(all, marked(true)).map(c => [c.ohid, c.invalid])).toEqual([
      ['C', false],
      ['A', true],
      ['B', true]
    ])
    const teacherCourses = teacherInstanceReducer([], {
      type: 'TEACHER_COURSE_GET_ALL_SUCCESS',
      response: [...courses]
    })
    deepFreeze(teacherCourses)
    expect(teacherInstanceReducer(teacherCourses, marked(true)).find(c => c.ohid === 'A').invalid).toBe(true)
  })

  it('are updated in the selected course when it is the one marked', () => {
    const selected = { ...courses[0] }
    deepFreeze(selected)
    expect(selectedInstanceReducer(selected, marked(true)).invalid).toBe(true)
    expect(selectedInstanceReducer({ ohid: 'other' }, marked(true))).toEqual({ ohid: 'other' })
  })
})
