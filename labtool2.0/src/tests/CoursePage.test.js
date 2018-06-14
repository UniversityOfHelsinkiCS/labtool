import React from 'react'
import { CoursePage } from '../components/pages/CoursePage'
import { shallow } from 'enzyme'

describe('<CoursePage /> as teacher', () => {
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
        }
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
        }
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
        weeks: [],
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
        }
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
      <CoursePage courseData={courseData} getOneCI={mockFn} coursePageInformation={mockFn} associateTeacherToStudent={mockFn} selectedInstance={coursePage} coursePageLogic={coursePageLogic} />
    )
  })

  describe('CoursePage Component', () => {
    it('is ok', () => {
      true
    })

    it('should render without throwing an error', () => {
      expect(wrapper.find('.CoursePage').exists()).toEqual(true)
    })

    it('should render correctly', () => {
      expect(wrapper).toMatchSnapshot()
    })

    it('renders teachers view', () => {
      expect(wrapper.find('.TeachersView').length).toEqual(1)
    })

    it('doesnt render students view when role is teacher', () => {
      expect(wrapper.find('.StudentsView').length).toEqual(0)
    })

    it('assistant dropdown menu is not shown when page loads', () => {
      expect(wrapper.find('.AssistantDropdown').length).toEqual(0)
    })
  })
})

describe('<CoursePage /> as student', () => {
  let wrapper

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
      }
    }
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
        coursePage={coursePage}
        courseData={coursePage}
        getOneCI={mockFn}
        coursePageInformation={mockFn}
        associateTeacherToStudent={mockFn}
        selectedInstance={coursePage}
        coursePageLogic={coursePageLogic}
      />
    )
  })

  describe('CoursePage Component', () => {
    it('is ok', () => {
      true
    })

    it('should render without throwing an error', () => {
      expect(wrapper.find('.CoursePage').exists()).toEqual(true)
    })

    it('should render correctly', () => {
      expect(wrapper).toMatchSnapshot()
    })

    it('renders students view', () => {
      expect(wrapper.find('.StudentsView').length).toEqual(1)
    })

    it('doesnt render teachers view when role is student', () => {
      expect(wrapper.find('.TeachersView').length).toEqual(0)
    })

    it('renders code review cards', () => {
      expect(wrapper.find('.codeReview').length).toEqual(coursePage.data.codeReviews.length)
    })

    it('collapses code review cards that are not shown', () => {
      expect(wrapper.find('.codeReviewExpanded').length).toEqual(coursePageLogic.showCodeReviews.length)
    })

    it('renders collapsed code review points only if not null', () => {
      expect(wrapper.find('.codeReviewPoints').length).toEqual(coursePage.data.codeReviews.filter(cr => cr.points !== null).length)
    })
  })
})
