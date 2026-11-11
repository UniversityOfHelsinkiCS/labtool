import React from 'react'
import { render } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { vi } from 'vitest'
import { CoursePageTeacherHeader } from '../components/pages/CoursePage/TeacherHeader'

const course = {
  id: 1,
  ohid: 'TKT1',
  name: 'Course',
  start: '2026-09-01',
  end: '2099-01-01',
  active: true,
  weekAmount: 7,
  currentWeek: 1,
  weekMaxPoints: 3
}

const renderHeader = selectedInstance =>
  render(
    <MemoryRouter>
      <CoursePageTeacherHeader
        selectedInstance={selectedInstance}
        changeCourseActive={vi.fn()}
        moveToNextWeek={vi.fn()}
      />
    </MemoryRouter>
  )

// the course page tells whether the final review results are shown to students, so that
// publishing them is not forgotten
describe('final review status on the course page', () => {
  const status = container => container.querySelector('.finalReviewStatus')

  it('says the final review is hidden from students', () => {
    const { container } = renderHeader({ ...course, finalReview: true, finalReviewVisible: false })
    expect(status(container)).toHaveTextContent('Final review hidden')
  })

  it('says the final review is published', () => {
    const { container } = renderHeader({ ...course, finalReview: true, finalReviewVisible: true })
    expect(status(container)).toHaveTextContent('Final review published')
  })

  it('shows the status also when registration is not active', () => {
    const { container } = renderHeader({
      ...course,
      active: false,
      finalReview: true,
      finalReviewVisible: false
    })
    expect(status(container)).toHaveTextContent('Final review hidden')
  })

  it('shows nothing when the course has no final review', () => {
    const { container } = renderHeader({ ...course, finalReview: false })
    expect(status(container)).toBeNull()
  })
})
