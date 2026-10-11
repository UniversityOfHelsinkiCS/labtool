import React from 'react'
import { WeekReviews } from '../components/WeekReviews'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { vi } from 'vitest'

describe('<WeekReviews /> as student', () => {
  const coursePage = {
    role: 'student',
    data: {
      id: 10011,
      github: 'http://github.com/tiralabra1',
      projectName: 'Tiran labraprojekti',
      createdAt: '2018-03-26T00:00:00.000Z',
      updatedAt: '2018-03-26T00:00:00.000Z',
      courseInstanceId: 10011,
      userId: 10011,
      teacherInstanceId: 10011,
      weeks: [],
      codeReviews: [
        {
          toReview: {
            github: 'http://github.com/tiralabra2',
            projectName: 'Tiran toinen labraprojekti'
          },
          repoToReview: null,
          reviewNumber: 1,
          points: 2.0
        },
        {
          toReview: {
            github: 'http://github.com/superprojekti',
            projectName: 'Tira super projekti'
          },
          repoToReview: null,
          reviewNumber: 2,
          points: 1.0
        },
        {
          toReview: {
            github: null,
            projectName: null
          },
          repoToReview: 'https://github.com/userName/arbitraryRepo',
          reviewNumber: 3,
          points: null
        }
      ],
      User: {
        id: 10011,
        username: 'tiraopiskelija1',
        email: 'maarit.opiskelija@helsinki.invalid',
        firsts: 'Maarit Mirja',
        lastname: 'Opiskelija',
        studentNumber: '014578343',
        teacher: false,
        sysop: false,
        createdAt: '2018-03-26T00:00:00.000Z',
        updatedAt: '2018-03-26T00:00:00.000Z'
      },
      Tags: []
    }
  }

  const coursePageLogic = {
    showDropdown: '',
    selectedTeacher: '',
    filterByAssistant: 0,
    filterByTag: [],
    showCodeReviews: [2]
  }

  const loading = {
    loading: false,
    loadingHooks: [],
    redirect: false,
    redirectHooks: [],
    redirectFailure: false
  }

  const selectedInstance = {
    currentWeek: 1,
    weekAmount: 0,
    weekMaxPoints: 3,
    checklists: [],
    finalReview: false
  }

  const renderWeekReviews = (overrides = {}) => {
    const props = {
      student: coursePage.data,
      getOneCI: vi.fn(),
      courseData: coursePage,
      coursePageInformation: vi.fn(),
      associateTeacherToStudent: vi.fn(),
      selectedInstance,
      coursePageLogic,
      loading,
      resetLoading: vi.fn(),
      courseId: '',
      user: { user: coursePage.data.User },
      createOneComment: vi.fn(),
      addLinkToCodeReview: vi.fn(),
      coursePageReset: vi.fn(),
      toggleCodeReview: vi.fn(),
      sendEmail: vi.fn(),
      selectTag: vi.fn(),
      selectTeacher: vi.fn(),
      studentInstance: '',
      gradeCodeReview: vi.fn(),
      updateActiveIndex: vi.fn(),
      markCommentsAsRead: vi.fn(),
      ...overrides
    }
    return render(
      <MemoryRouter>
        <WeekReviews {...props} />
      </MemoryRouter>
    )
  }

  describe('WeekReviews Component', () => {
    it('matches the rendered snapshot', () => {
      const { asFragment } = renderWeekReviews()

      expect(asFragment()).toMatchSnapshot()
    })

    it('renders a card for every code review', () => {
      renderWeekReviews()

      expect(screen.getAllByText(/^Code Review \d/)).toHaveLength(coursePage.data.codeReviews.length)
      coursePage.data.codeReviews.forEach(review => {
        const repository = review.toReview.github || review.repoToReview

        expect(screen.getByRole('link', { name: repository })).toHaveAttribute('href', repository)
      })
    })
  })

  describe('a final review hidden from students', () => {
    const withFinalReview = finalReviewVisible => ({
      ...selectedInstance,
      finalReview: true,
      finalReviewVisible
    })

    it('tells the student that the results are not shown yet', () => {
      const { container } = renderWeekReviews({ selectedInstance: withFinalReview(false) })
      expect(container.querySelector('.finalReviewNotShown')).toHaveTextContent(
        'Final review results are not shown yet.'
      )
      expect(container.querySelector('.finalReviewHidden')).toBeNull()
    })

    it('says nothing of the kind once the final review is shown', () => {
      const { container } = renderWeekReviews({ selectedInstance: withFinalReview(true) })
      expect(container.querySelector('.finalReviewNotShown')).toBeNull()
    })

    it('is labelled hidden for the course staff', () => {
      const student = { ...coursePage.data, codeReviews: [] }
      const teacherPage = { ...coursePage, role: 'teacher', data: [student] }
      const { container } = renderWeekReviews({
        selectedInstance: withFinalReview(false),
        courseData: teacherPage,
        student
      })
      expect(container.querySelector('.finalReviewHidden')).toHaveTextContent('Hidden from students')
      expect(container.querySelector('.finalReviewNotShown')).toBeNull()
    })
  })

  describe('additional review notes of the final review', () => {
    it('are listed for the course staff under the final review', () => {
      const student = {
        ...coursePage.data,
        codeReviews: [],
        weeks: [
          {
            id: 5,
            weekNumber: 1,
            points: null,
            grade: 4,
            feedback: 'Final',
            instructorNotes: 'Notes',
            comments: []
          }
        ],
        reviewNotes: [
          {
            id: 1,
            studentInstanceId: 10011,
            weekNumber: 1,
            text: 'Agree',
            by: 'Pää Opettaja',
            createdAt: '2026-10-11T10:00:00.000Z'
          }
        ]
      }
      const teacherPage = { ...coursePage, role: 'teacher', data: [student] }
      const { container } = renderWeekReviews({
        selectedInstance: { ...selectedInstance, finalReview: true, finalReviewVisible: true },
        courseData: teacherPage,
        student,
        studentInstance: '10011'
      })
      const notes = container.querySelector('.additionalReviewNotes')
      expect(notes).toHaveTextContent('Additional review notes')
      expect(notes).toHaveTextContent('Pää Opettaja')
      expect(notes).toHaveTextContent('Agree')
    })
  })
})
