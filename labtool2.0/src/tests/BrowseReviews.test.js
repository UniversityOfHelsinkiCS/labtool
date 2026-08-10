import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Provider } from 'react-redux'
import { createStore } from 'redux'
import { MemoryRouter } from 'react-router-dom'
import { vi } from 'vitest'
import { BrowseReviews } from '../components/pages/BrowseReviews'

const currentCourseId = 10011
const otherParticipationId = 10000

const coursePage = {
  id: currentCourseId,
  name: 'Aineopintojen harjoitustyö: Tietorakenteet ja algoritmit (periodi IV)',
  start: '2018-03-11T21:00:00.000Z',
  end: '2018-04-29T21:00:00.000Z',
  active: true,
  weekAmount: 7,
  weekMaxPoints: 3,
  currentWeek: 1,
  ohid: 'TKT20010.2018.K.A.1',
  teacherInstances: []
}

const student = {
  id: 10011,
  github: 'http://github.com/tiralabra1',
  projectName: 'Tiran labraprojekti',
  dropped: false,
  validRegistration: false,
  courseInstanceId: currentCourseId,
  userId: 10011,
  weeks: [],
  codeReviews: [],
  User: {
    id: 10011,
    username: 'tiraopiskelija1',
    email: 'maarit.opiskelija@helsinki.invalid',
    firsts: 'Maarit Mirja',
    lastname: 'Opiskelija',
    studentNumber: '014578343'
  }
}

const courseData = { role: 'teacher', data: [student] }

const loading = {
  loading: false,
  loadingHooks: [],
  redirect: false,
  redirectHooks: [],
  redirectFailure: false
}

const teacherCourses = [{ id: otherParticipationId }, { id: currentCourseId }]

const studentWithOtherParticipation = [
  {
    id: otherParticipationId,
    name: 'Aineopintojen harjoitustyö: Tietorakenteet ja algoritmit',
    start: '2017-03-11T21:00:00.000Z',
    end: '2017-04-29T21:00:00.000Z',
    active: false,
    ohid: 'TKT20010.2017.K.A.1',
    courseInstances: [{ id: 1, validRegistration: true }]
  },
  { ...coursePage, courseInstances: [{ id: currentCourseId, validRegistration: true }] }
]

const renderBrowseReviews = (props = {}) => {
  const defaultProps = {
    getOneCI: vi.fn(),
    coursePageInformation: vi.fn(),
    getCoursesByStudentId: vi.fn(),
    updateStudentProjectInfo: vi.fn(),
    courseData,
    selectedInstance: coursePage,
    studentInstanceToBeReviewed: [coursePage],
    teacherInstance: teacherCourses,
    getAllTeacherCourses: vi.fn(),
    courseId: coursePage.ohid,
    studentInstance: String(student.id),
    loading,
    resetLoading: vi.fn(),
    initialLoading: false,
    user: {},
    createOneComment: vi.fn(),
    gradeCodeReview: vi.fn(),
    sendEmail: vi.fn(),
    location: { state: {} }
  }

  const store = createStore(() => ({
    user: { user: {} },
    selectedInstance: coursePage,
    coursePage: courseData,
    coursePageLogic: {},
    loading
  }))

  return render(
    <Provider store={store}>
      <MemoryRouter>
        <BrowseReviews {...defaultProps} {...props} />
      </MemoryRouter>
    </Provider>
  )
}

describe('<BrowseReviews />', () => {
  it('matches the rendered snapshot', () => {
    const { asFragment } = renderBrowseReviews()

    expect(asFragment()).toMatchSnapshot()
  })

  it('shows the selected student and their first-time participation status', () => {
    renderBrowseReviews()

    expect(screen.getByRole('heading', { name: /maarit mirja opiskelija/i })).toBeInTheDocument()
    expect(screen.getByText(/has no other participation in this course/i)).toBeInTheDocument()
  })

  it('links to another participation when the teacher has access to it', () => {
    renderBrowseReviews({ studentInstanceToBeReviewed: studentWithOtherParticipation })

    expect(screen.getByText(/has taken this course in other periods/i)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /tkt20010 2016-2017 p\.iv/i })).toHaveAttribute(
      'href',
      '/labtool/browsereviews/TKT20010.2017.K.A.1/1'
    )
  })

  it('shows another participation without a link when the teacher lacks access', () => {
    renderBrowseReviews({
      studentInstanceToBeReviewed: studentWithOtherParticipation,
      teacherInstance: [{ id: currentCourseId }]
    })

    expect(screen.getByText(/tkt20010 2016-2017 p\.iv/i)).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: /tkt20010 2016-2017 p\.iv/i })).not.toBeInTheDocument()
  })

  it('marks the student as dropped', async () => {
    const user = userEvent.setup()
    const updateStudentProjectInfo = vi.fn()
    renderBrowseReviews({ updateStudentProjectInfo })

    await user.click(screen.getByRole('button', { name: /mark as dropped/i }))

    expect(updateStudentProjectInfo).toHaveBeenCalledWith({
      ohid: coursePage.ohid,
      userId: student.userId,
      dropped: true
    })
  })

  it('marks the registration as intended', async () => {
    const user = userEvent.setup()
    const updateStudentProjectInfo = vi.fn()
    renderBrowseReviews({ updateStudentProjectInfo })

    await user.click(screen.getByRole('button', { name: /mark registration as intended/i }))

    expect(updateStudentProjectInfo).toHaveBeenCalledWith({
      ohid: coursePage.ohid,
      userId: student.userId,
      validRegistration: true
    })
  })
})
