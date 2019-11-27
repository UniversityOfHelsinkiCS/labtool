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

  const coursePage = {
    role: 'teacher',
    data: [
      {
        id: 10012,
        github: 'http://github.com/tiralabra2',
        projectName: 'Tiran toinen labraprojekti',
        dropped: false,
        createdAt: '2018-03-26T00:00:00.000Z',
        updatedAt: '2018-03-26T00:00:00.000Z',
        courseInstanceId: 10011,
        userId: 10012,
        teacherInstanceId: 10011,
        weeks: [],
        codeReviews: [],
        validRegistration: false,
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
            color: 'red',
            courseInstanceId: null
          }
        ]
      },
      {
        id: 10031,
        github: 'http://github.com/superprojekti',
        projectName: 'Tira super projekti',
        dropped: true,
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
            id: 20008,
            name: 'DROPPED',
            color: 'grey',
            courseInstanceId: null
          },
          {
            id: 20002,
            name: 'HTML',
            color: 'yellow',
            courseInstanceId: null
          }
        ]
      },
      {
        id: 10011,
        github: 'http://github.com/tiralabra1',
        projectName: 'Tiran labraprojekti',
        dropped: false,
        createdAt: '2018-03-26T00:00:00.000Z',
        updatedAt: '2018-03-26T00:00:00.000Z',
        courseInstanceId: 10011,
        userId: 10011,
        teacherInstanceId: 10011,
        weeks: [],
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
      },
      {
        id: 20008,
        name: 'DROPPED',
        color: 'grey',
        createdAt: '2018-06-13T00:00:00.000Z',
        updatedAt: '2018-06-13T00:00:00.000Z',
        courseInstanceId: null
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

  const loading = {
    loading: false,
    loadingHooks: [],
    redirect: false,
    redirectHooks: [],
    redirectFailure: false
  }

  let mockFn = jest.fn()

  let mockUpdateStudentProjectInfo
  let mockDownloadFile

  //Mock window.confirm to return true in all cases
  window.confirm = jest.fn(() => true)

  beforeEach(() => {
    mockUpdateStudentProjectInfo = jest.fn()
    mockDownloadFile = jest.fn()

    wrapper = shallow(
      <CoursePage
        courseData={coursePage}
        getOneCI={mockFn}
        coursePageInformation={mockFn}
        associateTeacherToStudent={mockFn}
        selectedInstance={selectedInstance}
        coursePageLogic={coursePageLogic}
        updateStudentProjectInfo={mockUpdateStudentProjectInfo}
        getAllTags={mockFn}
        courseReset={mockFn}
        tags={tags}
        loading={loading}
        resetLoading={mockFn}
        courseId={''}
        user={{}}
        createOneComment={mockFn}
        addLinkToCodeReview={mockFn}
        coursePageReset={mockFn}
        prepareForCourse={mockFn}
        toggleCodeReview={mockFn}
        tagStudent={mockFn}
        sendEmail={mockFn}
        updateActiveIndex={mockFn}
        unTagStudent={mockFn}
        selectTag={mockFn}
        selectTeacher={mockFn}
        changeCourseField={mockFn}
        modifyOneCI={mockFn}
        courseInstance={{}}
        downloadFile={mockDownloadFile}
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

    it('renders teachers top view', () => {
      expect(
        wrapper
          .find('CoursePageTeacherHeader')
          .dive()
          .find('.TeachersTopView').length
      ).toEqual(1)
    })

    it('renders teachers bottom view for all students', () => {
      expect(
        wrapper
          .find('CoursePageTeacherMain')
          .dive()
          .find('.TeachersBottomView').length
      ).toEqual(1)
    })

    it('doesnt render students top view when role is teacher', () => {
      expect(wrapper.find('CoursePageStudentInfo').length).toEqual(0)
    })

    it('renders bulk editing form', () => {
      expect(wrapper.find('CoursePageTeacherBulkForm').length).toEqual(1)
    })

    it('can export students as CSV', () => {
      wrapper
        .find('CoursePageTeacherBulkForm')
        .dive()
        .find({ children: 'Export CSV of all students' })
        .simulate('click')

      expect(mockDownloadFile).toBeCalledWith(
        expect.anything(),
        expect.anything(),
        expect.stringMatching(/^Maarit Mirja,Opiskelija,014578343,maarit\.opiskelija@helsinki\.invalid,Tiran labraprojekti,http:\/\/github\.com\/tiralabra1[0-9,-]+,[0-9]+,Ossi Ohjaaja Mutikainen$/m)
      )
    })

    /*
    no longer possible with shallow testing since StudentTable became
    its own component

    it('shows active students in a separate list', () => {
      expect(wrapper.find('.TableRowForActiveStudents').length).toEqual(2)
    })

    it('shows dropped out students in a separate list', () => {
      expect(wrapper.find('.TableRowForDroppedOutStudents').length).toEqual(1)
    })
    */

    // it('assistant dropdown menu is not shown when page loads', () => {
    //   expect(wrapper.find('.AssistantDropdown').length).toEqual(0)
    // })
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

  let mockFn = jest.fn()
  let mockRemoveStudent

  beforeEach(() => {
    mockRemoveStudent = jest.fn()
    wrapper = shallow(
      <CoursePage
        courseData={coursePage}
        getOneCI={mockFn}
        changeCourseField={mockFn}
        coursePageInformation={mockFn}
        associateTeacherToStudent={mockFn}
        selectedInstance={coursePage}
        coursePageLogic={coursePageLogic}
        filterByTag={mockFn}
        getAllTags={mockFn}
        courseReset={mockFn}
        tags={tags}
        loading={loading}
        resetLoading={mockFn}
        courseId={''}
        user={{}}
        createOneComment={mockFn}
        addLinkToCodeReview={mockFn}
        coursePageReset={mockFn}
        prepareForCourse={mockFn}
        toggleCodeReview={mockFn}
        tagStudent={mockFn}
        sendEmail={mockFn}
        updateActiveIndex={mockFn}
        unTagStudent={mockFn}
        updateStudentProjectInfo={mockFn}
        selectTag={mockFn}
        selectTeacher={mockFn}
        modifyOneCI={mockFn}
        removeStudent={mockRemoveStudent}
        addRedirectHook={mockFn}
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

    it('doesnt render teachers top view when role is student', () => {
      expect(wrapper.find('CoursePageTeacherHeader').length).toEqual(0)
    })

    it('doesnt render teachers bottom view when role is student', () => {
      expect(wrapper.find('CoursePageTeacherMain').length).toEqual(0)
    })

    describe('when registration has been marked as mistaken', () => {
      const coursePageWithMistakenRegistration = {
        ...coursePage,
        data: {
          ...coursePage.data,
          validRegistration: false
        }
      }
      beforeEach(() => {
        wrapper.setProps({ courseData: coursePageWithMistakenRegistration })
        wrapper = wrapper.find('CoursePageStudentInfo').dive()
      })

      it('render the message of the mistaken registration', () => {
        expect(wrapper.find('.mistakenRegistration').exists()).toEqual(true)
      })

      it('can remove the mistaken registration', () => {
        shallow(
          wrapper
            .find('.mistakenRegistration')
            .find('Popup')
            .prop('trigger')
        )
          .dive()
          .find('#buttonRemoveRegistration')
          .simulate('click')
        expect(mockRemoveStudent).toBeCalledWith(expect.objectContaining({ id: 10011 }))
      })
    })

    // it('renders collapsed code review points only if not null', () => {
    //   expect(wrapper.find('.codeReviewPoints').length).toEqual(courseData.data.codeReviews.filter(cr => cr.points !== null).length)
    // })
  })
})
