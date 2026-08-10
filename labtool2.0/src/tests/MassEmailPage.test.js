import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Provider } from 'react-redux'
import { createStore } from 'redux'
import { MemoryRouter } from 'react-router-dom'
import { vi } from 'vitest'
import { MassEmailPage } from '../components/pages/MassEmailPage'

vi.stubGlobal(
  'matchMedia',
  vi.fn().mockReturnValue({
    matches: true,
    addListener: vi.fn(),
    removeListener: vi.fn()
  })
)

describe('<MassEmailPage />', () => {
  const coursePage = {
    role: 'teacher',
    data: [
      {
        id: 10012,
        github: 'http://github.com/tiralabra2',
        projectName: 'Tiran toinen labraprojekti',
        dropped: false,
        validRegistration: false,
        createdAt: '2018-03-26T00:00:00.000Z',
        updatedAt: '2018-03-26T00:00:00.000Z',
        courseInstanceId: 10011,
        userId: 10012,
        teacherInstanceId: 10011,
        weeks: [],
        codeReviews: [],
        User: {
          id: 10012,
          username: 'tiraopiskelija2',
          email: 'johan.studerande@helsinki.invalid',
          firsts: 'Johan Wilhelm',
          lastname: 'Studerande',
          studentNumber: '014553242',
          teacher: false,
          sysop: false,
          createdAt: '2018-03-26T00:00:00.000Z',
          updatedAt: '2018-03-26T00:00:00.000Z'
        },
        Tags: [
          {
            id: 20001,
            name: 'Javascript',
            color: 'red'
          }
        ]
      },
      {
        id: 10031,
        github: 'http://github.com/superprojekti',
        projectName: 'Tira super projekti',
        dropped: true,
        validRegistration: true,
        createdAt: '2018-03-26T00:00:00.000Z',
        updatedAt: '2018-06-05T07:12:28.603Z',
        courseInstanceId: 10011,
        userId: 10031,
        teacherInstanceId: 10011,
        weeks: [],
        codeReviews: [],
        User: {
          id: 10031,
          username: 'superopiskelija',
          email: 'teras.henkilo@helsinki.invalid',
          firsts: 'Teräs',
          lastname: 'Henkilö',
          studentNumber: '014666666',
          teacher: false,
          sysop: false,
          createdAt: '2018-03-26T00:00:00.000Z',
          updatedAt: '2018-03-26T00:00:00.000Z'
        },
        Tags: [
          {
            id: 20008,
            name: 'DROPPED',
            color: 'grey'
          },
          {
            id: 20002,
            name: 'HTML',
            color: 'yellow'
          }
        ]
      },
      {
        id: 10011,
        github: 'http://github.com/tiralabra1',
        projectName: 'Tiran labraprojekti',
        dropped: false,
        validRegistration: true,
        createdAt: '2018-03-26T00:00:00.000Z',
        updatedAt: '2018-03-26T00:00:00.000Z',
        courseInstanceId: 10011,
        userId: 10011,
        teacherInstanceId: 10011,
        weeks: [],
        codeReviews: [],
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
    ]
  }

  const tags = {
    tags: [
      {
        id: 20001,
        name: 'Javascript',
        color: 'red',
        createdAt: '2018-06-13T00:00:00.000Z',
        updatedAt: '2018-06-13T00:00:00.000Z'
      },
      {
        id: 20002,
        name: 'HTML',
        color: 'yellow',
        createdAt: '2018-06-13T00:00:00.000Z',
        updatedAt: '2018-06-13T00:00:00.000Z'
      },
      {
        id: 20003,
        name: 'game',
        color: 'black',
        createdAt: '2018-06-13T00:00:00.000Z',
        updatedAt: '2018-06-13T00:00:00.000Z'
      },
      {
        id: 20004,
        name: 'React',
        color: 'green',
        createdAt: '2018-06-13T00:00:00.000Z',
        updatedAt: '2018-06-13T00:00:00.000Z'
      },
      {
        id: 20005,
        name: 'Node.js',
        color: 'blue',
        createdAt: '2018-06-13T00:00:00.000Z',
        updatedAt: '2018-06-13T00:00:00.000Z'
      },
      {
        id: 20006,
        name: 'Java',
        color: 'orange',
        createdAt: '2018-06-13T00:00:00.000Z',
        updatedAt: '2018-06-13T00:00:00.000Z'
      },
      {
        id: 20007,
        name: 'FORTRAN',
        color: 'pink',
        createdAt: '2018-06-13T00:00:00.000Z',
        updatedAt: '2018-06-13T00:00:00.000Z'
      },
      {
        id: 20008,
        name: 'DROPPED',
        color: 'grey',
        createdAt: '2018-06-13T00:00:00.000Z',
        updatedAt: '2018-06-13T00:00:00.000Z'
      }
    ]
  }

  const coursePageLogic = {
    showDropdown: '',
    selectedTeacher: '',
    filterByAssistant: 0,
    filterByTag: [],
    selectedStudents: { 10011: true }
  }

  const selectedInstance = {
    id: 10011,
    ohid: 'TKT20010.2018.K.A.1',
    weekAmount: 7,
    amountOfCodeReviews: 0,
    currentCodeReview: [],
    finalReview: false,
    teacherInstances: [
      {
        id: 10011,
        firsts: 'Ossi Ohjaaja',
        lastname: 'Mutikainen'
      }
    ]
  }

  const loading = {
    loading: false,
    loadingHooks: [],
    redirect: false,
    redirectHooks: [],
    redirectFailure: false
  }

  const renderMassEmailPage = (overrides = {}) => {
    const defaultProps = {
      courseData: coursePage,
      getOneCI: vi.fn(),
      coursePageInformation: vi.fn(),
      associateTeacherToStudent: vi.fn(),
      selectedInstance,
      coursePageLogic,
      getAllTags: vi.fn(),
      courseReset: vi.fn(),
      tags,
      loading,
      resetLoading: vi.fn(),
      courseId: selectedInstance.ohid,
      user: {},
      studentInstance: {},
      teacherInstance: {},
      courseInstance: {},
      coursePageReset: vi.fn(),
      sendMassEmail: vi.fn(),
      addRedirectHook: vi.fn(),
      restoreStudentSelection: vi.fn()
    }
    const props = { ...defaultProps, ...overrides }
    const store = createStore(() => ({
      coursePageLogic: props.coursePageLogic
    }))
    const view = render(
      <Provider store={store}>
        <MemoryRouter>
          <MassEmailPage {...props} />
        </MemoryRouter>
      </Provider>
    )

    return { ...view, props }
  }

  beforeEach(() => {
    window.localStorage.clear()
  })

  const getInstructorCopyCheckbox = () =>
    screen.getAllByRole('checkbox').find(checkbox => checkbox.name === 'sendToInstructors')

  describe('MassEmailPage Component', () => {
    it('should render correctly', () => {
      const { asFragment } = renderMassEmailPage()

      expect(asFragment()).toMatchSnapshot()
    })

    it('renders the mass email form for eligible students', () => {
      renderMassEmailPage()

      expect(screen.getByRole('heading', { name: /send email to students/i })).toBeInTheDocument()
      expect(screen.getByRole('row', { name: /maarit mirja opiskelija/i })).toBeInTheDocument()
      expect(screen.getByRole('row', { name: /teräs henkilö/i })).toBeInTheDocument()
      expect(screen.queryByRole('row', { name: /johan wilhelm studerande/i })).not.toBeInTheDocument()
      expect(screen.getByRole('textbox')).toHaveAttribute('placeholder', 'Type email here...')
      expect(screen.getByText(/send a copy to all instructors/i)).toBeInTheDocument()
      expect(getInstructorCopyCheckbox()).toBeChecked()
      expect(screen.getByRole('button', { name: /^send$/i })).toBeInTheDocument()
    })

    it('lets the sender exclude instructors from the email', async () => {
      renderMassEmailPage()
      const instructorCopyCheckbox = getInstructorCopyCheckbox()

      await userEvent.click(instructorCopyCheckbox)

      expect(instructorCopyCheckbox).not.toBeChecked()
    })

    it('sends the composed message to selected students', async () => {
      const sendMassEmail = vi.fn().mockResolvedValue(undefined)
      const addRedirectHook = vi.fn()
      renderMassEmailPage({ sendMassEmail, addRedirectHook })

      const messageInput = screen.getByRole('textbox')
      const instructorCopyCheckbox = getInstructorCopyCheckbox()
      const form = messageInput.closest('form')

      await userEvent.type(messageInput, 'Remember the deadline.')
      Object.defineProperties(form, {
        content: { configurable: true, value: messageInput },
        sendToInstructors: { configurable: true, value: instructorCopyCheckbox }
      })
      await userEvent.click(screen.getByRole('button', { name: /^send$/i }))

      expect(addRedirectHook).toHaveBeenCalledWith({ hook: 'MASS_EMAIL_SEND' })
      await waitFor(() =>
        expect(sendMassEmail).toHaveBeenCalledWith(
          {
            students: [{ id: 10011 }],
            content: 'Remember the deadline.',
            sendToInstructors: true
          },
          selectedInstance.ohid
        )
      )
    })
  })
})
