import React from 'react'
import { CoursePage } from '../components/pages/CoursePage'
import { shallow } from 'enzyme'

describe('<CoursePage /> as teacher', () => {
  let wrapper

  const selectedInstance = {
    id: 10011,
    name: 'Aineopintojen harjoitustyö: Tietorakenteet ja algoritmit',
    start: '2018-03-11T21:00:00.000Z',
    end: '2018-04-29T21:00:00.000Z',
    active: true,
    weekAmount: 7,
    weekMaxPoints: 3,
    currentWeek: 1,
    ohid: 'TKT20010.2018.K.A.1',
    teacherInstances: [
      {
        id: 10001,
        admin: true,
        userId: 10010,
        courseInstanceId: 10011,
        firsts: 'Pää',
        lastname: 'Opettaja'
      },
      {
        id: 10011,
        admin: true,
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
        codeReviews: [],
        User: {
          id: 10012,
          username: 'tiraopiskelija2',
          email: 'johan.studerande@helsinki.fi',
          firsts: 'Johan Wilhelm',
          lastname: 'Studerande',
          studentNumber: '014553242',
          admin: false,
          createdAt: '2018-03-26T00:00:00.000Z',
          updatedAt: '2018-03-26T00:00:00.000Z'
        },
        Tags: []
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
          email: 'teras.henkilo@helsinki.fi',
          firsts: 'Teräs',
          lastname: 'Henkilö',
          studentNumber: '014666666',
          admin: false,
          createdAt: '2018-03-26T00:00:00.000Z',
          updatedAt: '2018-03-26T00:00:00.000Z'
        },
        Tags: []
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
          email: 'maarit.opiskelija@helsinki.fi',
          firsts: 'Maarit Mirja',
          lastname: 'Opiskelija',
          studentNumber: '014578343',
          admin: false,
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
      }
    ]
  }

  const coursePageLogic = {
    showDropdown: '',
    selectedTeacher: '',
    filterByAssistant: 0
  }

  let mockFn = jest.fn()

  beforeEach(() => {
    wrapper = shallow(
      <CoursePage
        courseData={courseData}
        getOneCI={mockFn}
        coursePageInformation={mockFn}
        associateTeacherToStudent={mockFn}
        selectedInstance={selectedInstance}
        coursePageLogic={coursePageLogic}
        getAllTags={mockFn}
        courseReset={mockFn}
        tags={tags}
      />
    )
  })

  describe('CoursePage Component', () => {
    it('is ok', () => {
      true
    })

    // it('should render without throwing an error', () => {
    //   expect(wrapper.find('.CoursePage').exists()).toEqual(true)
    // })

    it('should render correctly', () => {
      expect(wrapper).toMatchSnapshot()
    })

    // it('renders teachers view', () => {
    //   expect(wrapper.find('.TeachersView').length).toEqual(1)
    // })

    // it('doesnt render students view when role is teacher', () => {
    //   expect(wrapper.find('.StudentsView').length).toEqual(0)
    // })

    // it('assistant dropdown menu is not shown when page loads', () => {
    //   expect(wrapper.find('.AssistantDropdown').length).toEqual(0)
    // })
  })
})

describe('<CoursePage /> as student', () => {
  let wrapper

  const courseData = {
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
      weeks: [
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
      codeReviews: [
        {
          toReview: {
            github: 'http://github.com/tiralabra2',
            projectName: 'Tiran toinen labraprojekti'
          },
          reviewer: {
            github: 'http://github.com/superprojekti',
            projectName: 'Tira super projekti'
          },
          reviewNumber: 1,
          points: 2.0
        },
        {
          toReview: {
            github: 'http://github.com/superprojekti',
            projectName: 'Tira super projekti'
          },
          reviewer: {
            github: 'http://github.com/tiralabra2',
            projectName: 'Tiran toinen labraprojekti'
          },
          reviewNumber: 2,
          points: 1.0
        },
        {
          toReview: {
            github: 'http://github.com/superprojekti',
            projectName: 'Tira super projekti'
          },
          reviewer: {
            github: 'http://github.com/tiralabra2',
            projectName: 'Tiran toinen labraprojekti'
          },
          reviewNumber: 3,
          points: null
        }
      ],
      User: {
        id: 10011,
        username: 'tiraopiskelija1',
        email: 'maarit.opiskelija@helsinki.fi',
        firsts: 'Maarit Mirja',
        lastname: 'Opiskelija',
        studentNumber: '014578343',
        admin: false,
        createdAt: '2018-03-26T00:00:00.000Z',
        updatedAt: '2018-03-26T00:00:00.000Z'
      },
      Tags: []
    }
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

  const coursePageLogic = {
    showDropdown: '',
    selectedTeacher: '',
    filterByAssistant: 0,
    showCodeReviews: [2]
  }

  let mockFn = jest.fn()

  beforeEach(() => {
    wrapper = shallow(
      <CoursePage
        courseData={courseData}
        getOneCI={mockFn}
        coursePageInformation={mockFn}
        associateTeacherToStudent={mockFn}
        selectedInstance={courseData}
        coursePageLogic={coursePageLogic}
        getAllTags={mockFn}
        courseReset={mockFn}
        tags={tags}
      />
    )
  })

  describe('CoursePage Component', () => {
    it('is ok', () => {
      true
    })

    // it('should render without throwing an error', () => {
    //   expect(wrapper.find('.CoursePage').exists()).toEqual(true)
    // })

    it('should render correctly', () => {
      expect(wrapper).toMatchSnapshot()
    })

    // it('renders students view', () => {
    //   expect(wrapper.find('.StudentsView').length).toEqual(1)
    // })

    // it('doesnt render teachers view when role is student', () => {
    //   expect(wrapper.find('.TeachersView').length).toEqual(0)
    // })

    // it('renders code review cards', () => {
    //   expect(wrapper.find('.codeReview').length).toEqual(courseData.data.codeReviews.length)
    // })

    // it('collapses code review cards that are not shown', () => {
    //   expect(wrapper.find('.codeReviewExpanded').length).toEqual(coursePageLogic.showCodeReviews.length)
    // })

    // it('renders collapsed code review points only if not null', () => {
    //   expect(wrapper.find('.codeReviewPoints').length).toEqual(courseData.data.codeReviews.filter(cr => cr.points !== null).length)
    // })
  })
})
