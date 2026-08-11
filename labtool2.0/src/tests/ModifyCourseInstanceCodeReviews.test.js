import React from 'react'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Provider } from 'react-redux'
import { createStore } from 'redux'
import { MemoryRouter } from 'react-router-dom'
import PropTypes from 'prop-types'
import { vi } from 'vitest'
import { ModifyCourseInstanceReview, userHelper } from '../components/pages/ModifyCourseInstanceCodeReviews'
import RevieweeDropdown from '../components/RevieweeDropdown'

describe('<ModifyCourseInstanceCodeReviews />', () => {
  const coursePage = {
    id: 10011,
    name: 'Aineopintojen harjoitustyö: Tietorakenteet ja algoritmit',
    start: '2018-03-11T21:00:00.000Z',
    end: '2018-04-29T21:00:00.000Z',
    active: true,
    weekAmount: 7,
    weekMaxPoints: 3,
    currentWeek: 1,
    currentCodeReview: [1],
    amountOfCodeReviews: 2,
    ohid: 'TKT20010.2018.K.A.1',
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

  const courseData = {
    role: 'teacher',
    data: [
      {
        id: 10012,
        github: 'http://github.com/tiralabra2',
        projectName: 'Tiran toinen labraprojekti',
        createdAt: '2018-03-26T00:00:00.000Z',
        updatedAt: '2018-03-26T00:00:00.000Z',
        courseInstanceId: 10011,
        userId: 10012,
        teacherInstanceId: 10011,
        weeks: [],
        codeReviews: [
          {
            id: 4,
            points: 2,
            reviewNumber: 1,
            linkToReview: null,
            studentInstanceId: 10012,
            toReview: 10011
          }
        ],
        validRegistration: true,
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
            id: 30001,
            name: 'Javascript',
            color: 'red',
            courseInstanceId: null
          }
        ]
      },
      {
        id: 10015,
        github: 'http://github.com/tiralabra5',
        projectName: 'Tiran viides labraprojekti',
        createdAt: '2018-03-26T00:00:00.000Z',
        updatedAt: '2018-03-26T00:00:00.000Z',
        courseInstanceId: 10011,
        userId: 10015,
        teacherInstanceId: 10011,
        weeks: [],
        codeReviews: [],
        dropped: true,
        validRegistration: true,
        User: {
          id: 10015,
          username: 'tiraopiskelija5',
          email: 'tom.student@helsinki.invalid',
          firsts: 'Tom Thomas',
          lastname: 'Student',
          studentNumber: '014553245',
          admin: false,
          createdAt: '2018-03-26T00:00:00.000Z',
          updatedAt: '2018-03-26T00:00:00.000Z'
        },
        Tags: [
          {
            id: 30001,
            name: 'Javascript',
            color: 'red',
            courseInstanceId: null
          }
        ]
      },
      {
        id: 10016,
        github: 'http://github.com/tiralabra6',
        projectName: 'Tiran kuudes labraprojekti',
        createdAt: '2018-03-26T00:00:00.000Z',
        updatedAt: '2018-03-26T00:00:00.000Z',
        courseInstanceId: 10011,
        userId: 10016,
        teacherInstanceId: 10011,
        weeks: [],
        codeReviews: [],
        validRegistration: false,
        User: {
          id: 10016,
          username: 'tiraopiskelija6',
          email: 'tarja.student@helsinki.invalid',
          firsts: 'Tarja',
          lastname: 'Student',
          studentNumber: '014689455',
          admin: false,
          createdAt: '2018-03-26T00:00:00.000Z',
          updatedAt: '2018-03-26T00:00:00.000Z'
        },
        Tags: [
          {
            id: 30001,
            name: 'Javascript',
            color: 'red',
            courseInstanceId: null
          }
        ]
      },
      {
        id: 10031,
        github: 'http://github.com/superprojekti',
        projectName: 'Tira super projekti',
        createdAt: '2018-03-26T00:00:00.000Z',
        updatedAt: '2018-06-05T07:12:28.603Z',
        courseInstanceId: 10011,
        userId: 10031,
        teacherInstanceId: 10011,
        weeks: [],
        codeReviews: [],
        validRegistration: true,
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
            id: 30001,
            name: 'Javascript',
            color: 'red',
            courseInstanceId: null
          }
        ]
      },
      {
        id: 10011,
        github: 'http://github.com/tiralabra1',
        projectName: 'Tiran labraprojekti',
        createdAt: '2018-03-26T00:00:00.000Z',
        updatedAt: '2018-03-26T00:00:00.000Z',
        courseInstanceId: 10011,
        userId: 10011,
        teacherInstanceId: 10011,
        weeks: [
          {
            id: 10002,
            points: 2,
            weekNumber: 2,
            feedback: 'Melko hienoa työtä!',
            createdAt: '2018-03-26T00:00:00.000Z',
            updatedAt: '2018-03-26T00:00:00.000Z',
            studentInstanceId: 10011,
            comments: []
          },
          {
            id: 10001,
            points: 3,
            weekNumber: 1,
            feedback: 'Hienoa työtä!',
            createdAt: '2018-03-26T00:00:00.000Z',
            updatedAt: '2018-03-26T00:00:00.000Z',
            studentInstanceId: 10011,
            comments: []
          },
          {
            id: 10003,
            points: 3,
            weekNumber: 3,
            feedback: 'Erittäin hienoa työtä!',
            createdAt: '2018-03-26T00:00:00.000Z',
            updatedAt: '2018-03-26T00:00:00.000Z',
            studentInstanceId: 10011,
            comments: []
          },
          {
            id: 10004,
            points: 3,
            weekNumber: 4,
            feedback: 'Hyvin menee!',
            createdAt: '2018-03-26T00:00:00.000Z',
            updatedAt: '2018-03-26T00:00:00.000Z',
            studentInstanceId: 10011,
            comments: []
          }
        ],
        codeReviews: [],
        validRegistration: true,
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
        Tags: [
          {
            id: 30001,
            name: 'Javascript',
            color: 'red',
            courseInstanceId: null
          }
        ]
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
        updatedAt: '2018-06-13T00:00:00.000Z',
        courseInstanceId: null
      },
      {
        id: 20002,
        name: 'HTML',
        color: 'yellow',
        createdAt: '2018-06-13T00:00:00.000Z',
        updatedAt: '2018-06-13T00:00:00.000Z',
        courseInstanceId: null
      },
      {
        id: 20003,
        name: 'game',
        color: 'black',
        createdAt: '2018-06-13T00:00:00.000Z',
        updatedAt: '2018-06-13T00:00:00.000Z',
        courseInstanceId: null
      },
      {
        id: 20004,
        name: 'React',
        color: 'green',
        createdAt: '2018-06-13T00:00:00.000Z',
        updatedAt: '2018-06-13T00:00:00.000Z',
        courseInstanceId: null
      },
      {
        id: 20005,
        name: 'Node.js',
        color: 'blue',
        createdAt: '2018-06-13T00:00:00.000Z',
        updatedAt: '2018-06-13T00:00:00.000Z',
        courseInstanceId: null
      },
      {
        id: 20006,
        name: 'Java',
        color: 'orange',
        createdAt: '2018-06-13T00:00:00.000Z',
        updatedAt: '2018-06-13T00:00:00.000Z',
        courseInstanceId: null
      },
      {
        id: 20007,
        name: 'FORTRAN',
        color: 'pink',
        createdAt: '2018-06-13T00:00:00.000Z',
        updatedAt: '2018-06-13T00:00:00.000Z',
        courseInstanceId: null
      }
    ]
  }

  const codeReviewLogic = {
    randomizedCodeReview: [],
    selectedDropdown: 2,
    codeReviewStates: { 1: [], 2: [] },
    currentSelections: {
      1: {
        10011: 10012,
        10012: 10031,
        10031: 10012
      },
      2: {}
    },
    checkBoxStates: {},
    initialized: false
  }

  const coursePageLogic = {
    showDropdown: '',
    selectedTeacher: '',
    filterByAssistant: 0,
    filterByTag: [],
    showCodeReviews: [],
    selectedStudents: {}
  }

  const loading = {
    loading: false,
    loadingHooks: [],
    redirect: false,
    redirectHooks: [],
    redirectFailure: false
  }

  const renderPage = (props = {}) => {
    const defaultProps = {
      courseId: 'TKT20010.2018.K.A.1',
      courseData,
      selectedInstance: coursePage,
      codeReviewLogic,
      coursePageLogic,
      loading,
      dropdownUsers: userHelper(courseData.data),
      clearNotifications: vi.fn(),
      getOneCI: vi.fn(),
      coursePageInformation: vi.fn(),
      initOneReview: vi.fn(),
      bulkinsertCodeReviews: vi.fn(),
      randomAssign: vi.fn(),
      codeReviewReset: vi.fn(),
      resetLoading: vi.fn(),
      dropdownCodeReviews: [
        { value: 1, text: 'Code review 1' },
        { value: 2, text: 'Code review 2' }
      ],
      selectDropdown: vi.fn(),
      createStates: vi.fn(),
      filterByReview: vi.fn(),
      showNotification: vi.fn(),
      removeOneCodeReview: vi.fn(),
      restoreData: vi.fn(),
      getAllTags: vi.fn(),
      updateStudentProjectInfo: vi.fn(),
      massUpdateStudentProjectInfo: vi.fn(),
      tags,
      modifyOneCI: vi.fn()
    }
    const componentProps = { ...defaultProps, ...props }
    const store = createStore(() => ({ selectedInstance: componentProps.selectedInstance }))
    const view = render(
      <Provider store={store}>
        <MemoryRouter>
          <ModifyCourseInstanceReview {...componentProps} />
        </MemoryRouter>
      </Provider>
    )

    return { ...view, props: componentProps }
  }

  const RevieweeDropdownHarness = ({ onChange }) => {
    const [logic, setLogic] = React.useState(codeReviewLogic)
    const addCodeReview = (reviewRound, reviewer) => (event, { value }) => {
      const selection = Number.isInteger(value)
        ? { reviewer, toReview: value }
        : { reviewer, repoToReview: value }

      setLogic(current => ({
        ...current,
        codeReviewStates: {
          ...current.codeReviewStates,
          [reviewRound]: [
            ...current.codeReviewStates[reviewRound].filter(review => review.reviewer !== reviewer),
            selection
          ]
        },
        currentSelections: {
          ...current.currentSelections,
          [reviewRound]: {
            ...current.currentSelections[reviewRound],
            [reviewer]: value
          }
        }
      }))
      onChange(value)
    }

    return (
      <RevieweeDropdown
        dropdownUsers={userHelper(courseData.data)}
        studentData={courseData.data[0]}
        codeReviewLogic={logic}
        addCodeReview={addCodeReview}
        create={false}
        courseData={courseData}
        amountOfCodeReviews={coursePage.amountOfCodeReviews}
      />
    )
  }

  RevieweeDropdownHarness.propTypes = {
    onChange: PropTypes.func.isRequired
  }

  beforeEach(() => {
    window.localStorage.clear()
    window.matchMedia = vi.fn().mockReturnValue({ matches: true })
  })

  it('renders the code review management table', () => {
    renderPage()

    expect(screen.getByRole('heading', { name: coursePage.name })).toBeInTheDocument()
    expect(screen.getByRole('table')).toBeInTheDocument()
    expect(screen.getByText('Show unassigned students')).toBeInTheDocument()
  })

  it('activates a code review that is not visible to students', async () => {
    const user = userEvent.setup()
    const { props } = renderPage()

    expect(screen.getByText('This code review is currently not visible to students.')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Activate the code review' }))

    expect(props.modifyOneCI).toHaveBeenCalledWith({ ...coursePage, newCr: [1, 2] }, coursePage.ohid)
  })

  it('offers eligible reviewees and warns about a repeated assignment', async () => {
    const user = userEvent.setup()
    render(<RevieweeDropdownHarness onChange={vi.fn()} />)
    const dropdown = screen.getByRole('listbox')

    await user.click(dropdown)

    expect(within(dropdown).getByRole('option', { name: 'Teräs Henkilö' })).toBeInTheDocument()
    expect(within(dropdown).getByRole('option', { name: 'Maarit Mirja Opiskelija' })).toBeInTheDocument()
    expect(within(dropdown).queryByRole('option', { name: 'Tom Thomas Student' })).not.toBeInTheDocument()
    expect(within(dropdown).queryByRole('option', { name: 'Tarja Student' })).not.toBeInTheDocument()

    await user.click(within(dropdown).getByRole('option', { name: 'Maarit Mirja Opiskelija' }))

    expect(
      await screen.findByText('This student has already reviewed this project in an earlier code review')
    ).toBeInTheDocument()
  })

  it('allows an arbitrary repository link as the reviewee', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<RevieweeDropdownHarness onChange={onChange} />)
    const dropdown = screen.getByRole('listbox')
    const repositoryUrl = 'https://github.com/userName/repo'

    await user.click(dropdown)
    await user.type(screen.getByRole('textbox'), repositoryUrl)
    await user.click(await within(dropdown).findByRole('option', { name: new RegExp(repositoryUrl) }))

    expect(onChange).toHaveBeenCalledWith(repositoryUrl)
  })
})
