import React from 'react'
import { ModifyCourseInstanceReview, userHelper } from '../components/pages/ModifyCourseInstanceCodeReviews'
import RevieweeDropdown from '../components/RevieweeDropdown'
import { shallow } from 'enzyme'
import configureMockStore from 'redux-mock-store'

describe('<ModifyCourseInstanceCodeReviews />', () => {
  const store = configureMockStore()({}) // eslint-disable-line no-unused-vars
  let wrapper

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
            color: 'red'
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
            color: 'red'
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
            color: 'red'
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
            color: 'red'
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
    showCodeReviews: []
  }

  const loading = {
    loading: false,
    loadingHooks: [],
    redirect: false,
    redirectHooks: [],
    redirectFailure: false
  }

  let mockFn = jest.fn()
  let mockModifyOneCI

  beforeEach(() => {
    mockModifyOneCI = jest.fn()

    wrapper = shallow(
      <ModifyCourseInstanceReview
        courseId={'TKT20010.2018.K.A.1'}
        courseData={courseData}
        selectedInstance={coursePage}
        codeReviewLogic={codeReviewLogic}
        coursePageLogic={coursePageLogic}
        loading={loading}
        dropdownUsers={userHelper(courseData.data)}
        clearNotifications={mockFn}
        getOneCI={mockFn}
        coursePageInformation={mockFn}
        initOneReview={mockFn}
        initOrRemoveRandom={mockFn}
        initCheckbox={mockFn}
        initAllCheckboxes={mockFn}
        bulkinsertCodeReviews={mockFn}
        randomAssign={mockFn}
        codeReviewReset={mockFn}
        statesCreated={true}
        filterByTag={mockFn}
        resetLoading={mockFn}
        dropdownCodeReviews={[{ value: 1, text: 'Codereview 1' }, { value: 2, text: 'Codereview 2' }]}
        selectDropdown={mockFn}
        toggleCreate={mockFn}
        createStates={mockFn}
        filterStatesByTags={mockFn}
        filterByReview={mockFn}
        showNotification={mockFn}
        removeOneCodeReview={mockFn}
        restoreData={mockFn}
        getAllTags={mockFn}
        tags={tags}
        modifyOneCI={mockModifyOneCI}
      />
    )
  })

  describe('Code review component', () => {
    it('renders without error', () => {
      expect(wrapper.find('.ModifyCourseInstanceCodeReviews').exists()).toEqual(true)
    })
    /*

    doesn't work because of <StudentTable /> now. we cannot dive into that thing
    because it uses a Redux store, and no way to provide it seems to work.
    * wrapper cannot dive if we use <Provider>
    * if we supply the store manually in the context, it still complains
      about not being able to find the store in the context
    
    alternatively we could use mount(), but that also takes in everything else
    and fixing all of the errors that result would be a pain.



    apparently react-redux just won't work with enzyme.
    https://github.com/airbnb/enzyme/issues/2202



    describe('toReview dropdowns', () => {
      it('renders a dropdown for each student-code review round pair.', () => {
        console.log(wrapper.debug())
        expect(wrapper.find('Connect(StudentTable)').dive({ context: { store } }).find('.toReviewDropdown').length).toEqual(courseData.data.length)
      })

      it('autofills values.', () => {
        const dropdowns = wrapper.find('Connect(StudentTable)').dive({ context: { store } }).find('.toReviewDropdown')
        const values = {
          10011: 0,
          10012: 0,
          10031: 0
        }
        dropdowns.forEach(dropdown => {
          values[dropdown.props().value]++
        })
        expect(values[10011]).toEqual(0)
        expect(values[10012]).toEqual(2)
        expect(values[10031]).toEqual(1)
      })
    })
*/
  })

  describe('Can activate the code review which is invisible to students', () => {
    const codeReviewLogicWithUnactivatedSelectedDropdown = {
      ...codeReviewLogic,
      selectedDropdown: 2
    }
    beforeEach(() => {
      wrapper.setProps({ codeReviewLogic: codeReviewLogicWithUnactivatedSelectedDropdown })
    })
    it('show reminder to activate the code review', () => {
      expect(
        wrapper
          .find('.visibilityReminder')
          .find('span')
          .text()
      ).toContain('This code review is currently not visible to students')

      wrapper
        .find('.visibilityReminder')
        .find('Button')
        .simulate('click')
      expect(mockModifyOneCI).toHaveBeenCalled()
    })
  })

  describe('<RvieweeDropdown />', () => {
    let dropdownWrapper
    const mockAddCodeReview = jest.fn()
    beforeEach(() => {
      dropdownWrapper = shallow(
        <RevieweeDropdown
          dropdownUsers={userHelper(courseData.data)}
          studentData={courseData.data[0]}
          codeReviewLogic={codeReviewLogic}
          addCodeReview={mockAddCodeReview}
          create={false}
          courseData={courseData}
        />
      )
    })

    it('dropdown options do not include options that the student reviewed previously and dropped out students', () => {
      const expectedOptions = [
        {
          text: 'select a student or add a repo link',
          value: null
        },
        {
          text: 'Teräs Henkilö',
          value: 10031
        }
      ]
      expect(dropdownWrapper.props()).toHaveProperty('options', expectedOptions)
    })

    it('Reviewee dropdown allows to add an arbitrary repository link', () => {
      expect(dropdownWrapper.props()).toHaveProperty('allowAdditions', true)
      dropdownWrapper.simulate('change', { target: { value: 'https://github.com/userName/repo' } })
      expect(mockAddCodeReview).toHaveBeenCalled()
    })
  })
})
