import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Provider } from 'react-redux'
import { createStore } from 'redux'
import { MemoryRouter } from 'react-router-dom'
import { vi } from 'vitest'
import { CoursePage } from '../components/pages/CoursePage'

const selectedInstance = {
  id: 10011,
  name: 'Aineopintojen harjoitustyö: Tietorakenteet ja algoritmit',
  start: '2018-03-11T21:00:00.000Z',
  end: '2018-04-29T21:00:00.000Z',
  active: true,
  weekAmount: 2,
  weekMaxPoints: 3,
  amountOfCodeReviews: 0,
  currentCodeReview: [],
  currentWeek: 1,
  finalReview: false,
  ohid: 'TKT20010.2018.K.A.1',
  checklists: [],
  teacherInstances: [
    {
      id: 10001,
      instructor: false,
      userId: 10010,
      courseInstanceId: 10011,
      firsts: 'Pää',
      lastname: 'Opettaja'
    },
    {
      id: 10011,
      instructor: true,
      userId: 10015,
      courseInstanceId: 10011,
      firsts: 'Ossi Ohjaaja',
      lastname: 'Mutikainen'
    }
  ]
}

const createStudent = ({
  id,
  firsts,
  lastname,
  studentNumber,
  email,
  projectName,
  github,
  dropped = false,
  validRegistration = true,
  tags = []
}) => ({
  id,
  github,
  projectName,
  dropped,
  courseInstanceId: selectedInstance.id,
  userId: id,
  teacherInstanceId: 10011,
  weeks: [],
  codeReviews: [],
  validRegistration,
  User: {
    id,
    username: `student${id}`,
    email,
    firsts,
    lastname,
    studentNumber,
    teacher: false,
    sysop: false
  },
  Tags: tags
})

const javascriptTag = { id: 20001, name: 'Javascript', color: 'red', courseInstanceId: null }
const htmlTag = { id: 20002, name: 'HTML', color: 'yellow', courseInstanceId: null }
const droppedTag = { id: 20008, name: 'DROPPED', color: 'grey', courseInstanceId: null }

const mistakenStudent = createStudent({
  id: 10012,
  firsts: 'Johan Wilhelm',
  lastname: 'Studerande',
  studentNumber: '014553242',
  email: 'johan.studerande@helsinki.invalid',
  projectName: 'Tiran toinen labraprojekti',
  github: 'http://github.com/tiralabra2',
  validRegistration: false,
  tags: [javascriptTag]
})

const droppedStudent = createStudent({
  id: 10031,
  firsts: 'Teräs',
  lastname: 'Henkilö',
  studentNumber: '014666666',
  email: 'teras.henkilo@helsinki.invalid',
  projectName: 'Tira super projekti',
  github: 'http://github.com/superprojekti',
  dropped: true,
  tags: [droppedTag, htmlTag]
})

const activeStudent = createStudent({
  id: 10011,
  firsts: 'Maarit Mirja',
  lastname: 'Opiskelija',
  studentNumber: '014578343',
  email: 'maarit.opiskelija@helsinki.invalid',
  projectName: 'Tiran labraprojekti',
  github: 'http://github.com/tiralabra1'
})

const teacherCourseData = {
  role: 'teacher',
  data: [mistakenStudent, droppedStudent, activeStudent]
}

const studentCourseData = {
  role: 'student',
  name: 'course',
  data: activeStudent
}

const tags = { tags: [javascriptTag, htmlTag, droppedTag] }
const coursePageLogic = {
  showDropdown: '',
  selectedTeacher: '',
  filterByAssistant: 0,
  filterByTag: [],
  selectedStudents: { 10011: true }
}
const loading = {
  loading: false,
  loadingHooks: [],
  redirect: false,
  redirectHooks: [],
  redirectFailure: false
}

const renderCoursePage = (overrides = {}) => {
  const defaultProps = {
    courseData: teacherCourseData,
    selectedInstance,
    coursePageLogic,
    tags,
    loading,
    courseId: selectedInstance.ohid,
    user: { user: {} },
    location: { state: {} },
    getOneCI: vi.fn(),
    coursePageInformation: vi.fn(),
    associateTeacherToStudent: vi.fn(),
    updateStudentProjectInfo: vi.fn(),
    getAllTags: vi.fn(),
    resetLoading: vi.fn(),
    coursePageReset: vi.fn(),
    prepareForCourse: vi.fn(),
    tagStudent: vi.fn(),
    unTagStudent: vi.fn(),
    selectTag: vi.fn(),
    selectTeacher: vi.fn(),
    changeCourseField: vi.fn(),
    modifyOneCI: vi.fn(),
    removeStudent: vi.fn(),
    addRedirectHook: vi.fn(),
    downloadFile: vi.fn()
  }
  const props = { ...defaultProps, ...overrides }
  const store = createStore(() => ({
    user: props.user,
    selectedInstance: props.selectedInstance,
    coursePage: props.courseData,
    coursePageLogic: props.coursePageLogic,
    loading: props.loading
  }))

  const view = render(
    <Provider store={store}>
      <MemoryRouter>
        <CoursePage {...props} />
      </MemoryRouter>
    </Provider>
  )

  return { ...view, props }
}

vi.stubGlobal(
  'matchMedia',
  vi.fn().mockReturnValue({
    matches: true,
    addListener: vi.fn(),
    removeListener: vi.fn()
  })
)

describe('<CoursePage />', () => {
  beforeEach(() => {
    vi.spyOn(window, 'confirm').mockReturnValue(true)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('as teacher', () => {
    it('matches the rendered snapshot', () => {
      const { asFragment } = renderCoursePage()

      expect(asFragment()).toMatchSnapshot()
    })

    it('shows the teacher course overview and bulk editing controls', () => {
      renderCoursePage()

      expect(screen.getByRole('heading', { name: /aineopintojen harjoitustyö/i })).toBeInTheDocument()
      expect(screen.getByRole('heading', { name: /^students$/i })).toBeInTheDocument()
      expect(screen.getByText('1 active student, 1 dropped (2 in total)')).toBeInTheDocument()
      expect(screen.getByText(/modify selected students/i)).toBeInTheDocument()
      expect(screen.queryByText(/your registration has been marked as mistaken/i)).not.toBeInTheDocument()
    })

    it('exports valid students as CSV', async () => {
      const user = userEvent.setup()
      const downloadFile = vi.fn()
      renderCoursePage({ downloadFile })

      await user.click(screen.getByRole('button', { name: /export csv of all students/i }))

      expect(downloadFile).toHaveBeenCalledOnce()
      expect(downloadFile).toHaveBeenCalledWith(
        expect.stringMatching(/^TKT20010\.2018\.K\.A\.1_\d{4}-\d{2}-\d{2}_\d{2}-\d{2}-\d{2}\.csv$/),
        'text/csv;charset=utf-8',
        expect.stringContaining(
          'First Name,Last Name,StudentNo,Email,ProjectName,ProjectURL,Week1,Week2,Sum,Instructor'
        )
      )

      const csv = downloadFile.mock.calls[0][2]
      expect(csv).toMatch(
        /^Maarit Mirja,Opiskelija,014578343,maarit\.opiskelija@helsinki\.invalid,Tiran labraprojekti,http:\/\/github\.com\/tiralabra1,-,-,0,Ossi Ohjaaja Mutikainen$/m
      )
      expect(csv).not.toContain('Johan Wilhelm')
    })
  })

  describe('as student', () => {
    const renderStudentCoursePage = (overrides = {}) =>
      renderCoursePage({
        courseData: studentCourseData,
        ...overrides
      })

    it('matches the rendered snapshot', () => {
      const { asFragment } = renderStudentCoursePage()

      expect(asFragment()).toMatchSnapshot()
    })

    it('shows the student course information', () => {
      renderStudentCoursePage()

      expect(screen.getByRole('heading', { name: /aineopintojen harjoitustyö/i })).toBeInTheDocument()
      expect(screen.getByRole('heading', { name: /maarit mirja opiskelija/i })).toBeInTheDocument()
      expect(screen.getByRole('heading', { name: /tiran labraprojekti/i })).toBeInTheDocument()
      expect(screen.queryByRole('heading', { name: /^students$/i })).not.toBeInTheDocument()
    })

    it('removes a registration marked as mistaken', async () => {
      const user = userEvent.setup()
      const removeStudent = vi.fn()
      const addRedirectHook = vi.fn()
      renderStudentCoursePage({
        courseData: {
          ...studentCourseData,
          data: { ...activeStudent, validRegistration: false }
        },
        removeStudent,
        addRedirectHook
      })

      expect(screen.getByText(/your registration has been marked as mistaken/i)).toBeInTheDocument()

      await user.click(screen.getByRole('button', { name: /remove yourself from the course/i }))

      expect(window.confirm).toHaveBeenCalledWith('Are you sure you want to remove yourself from the course?')
      expect(removeStudent).toHaveBeenCalledWith({ id: activeStudent.id })
      expect(addRedirectHook).toHaveBeenCalledWith({ hook: 'STUDENT_REMOVE_' })
    })
  })
})
