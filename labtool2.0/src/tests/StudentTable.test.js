import React from 'react'
import { StudentTable } from '../components/StudentTable'
import { StudentTableRow } from '../components/StudentTable/StudentTableRow'
import { shallow } from 'enzyme'

describe('<StudentTable />', () => {
  let wrapper

  const coursePage = {
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
    selectedStudents: {}
  }

  const loading = {
    loading: false,
    loadingHooks: [],
    redirect: false,
    redirectHooks: [],
    redirectFailure: false
  }

  let mockFn = jest.fn()

  beforeEach(() => {
    wrapper = shallow(
      <StudentTable
        columns={['instructor']}
        studentInstances={coursePage.data}
        selectedInstance={coursePage}
        coursePageLogic={coursePageLogic}
        associateTeacherToStudent={mockFn}
        getAllTags={mockFn}
        tags={tags}
        loading={loading}
        resetLoading={mockFn}
        showAssistantDropdown={mockFn}
        showTagDropdown={mockFn}
        selectTeacher={mockFn}
        selectTag={mockFn}
        filterByAssistant={mockFn}
        filterByTag={mockFn}
        tagStudent={mockFn}
        unTagStudent={mockFn}
        selectStudent={mockFn}
        unselectStudent={mockFn}
        selectAllStudents={mockFn}
        unselectAllStudents={mockFn}
        updateStudentProjectInfo={mockFn}
        courseData={{}}
        loggedInUser={{}}
      />
    )
  })

  describe('StudentTable Component', () => {
    it('is ok', () => {
      true
    })

    it('should render correctly', () => {
      expect(wrapper).toMatchSnapshot()
    })
  })
})

describe('<StudentTableRow />', () => {
  let wrapper

  const coursePage = {
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

  const dropDownTeachers = [{ key: '-', text: '(unassigned)', value: '-' }, { key: 10001, text: 'Pää Opettaja', value: 10001 }, { key: 1, text: 'Ossi Ohjaaja Mutikainen', value: 1 }]

  const dropDownTags = [
    { key: 20008, text: 'C++', value: 20008 },
    { key: 20011, text: 'DROPPED', value: 20011 },
    { key: 20007, text: 'FORTRAN', value: 20007 },
    { key: 20003, text: 'game', value: 20003 },
    { key: 20002, text: 'HTML', value: 20002 },
    { key: 20006, text: 'Java', value: 20006 },
    { key: 20001, text: 'Javascript', value: 20001 },
    { key: 20005, text: 'Node.js', value: 20005 },
    { key: 20009, text: 'Python', value: 20009 },
    { key: 20004, text: 'React', value: 20004 },
    { key: 20010, text: 'Unity', value: 20010 }
  ]

  const coursePageLogic = {
    showDropdown: '',
    selectedTeacher: '',
    filterByAssistant: 0,
    filterByTag: [],
    selectedStudents: {}
  }

  const loading = {
    loading: false,
    loadingHooks: [],
    redirect: false,
    redirectHooks: [],
    redirectFailure: false
  }

  let mockFn = jest.fn()

  beforeEach(() => {
    wrapper = shallow(
      <StudentTableRow
        data={coursePage.data[0]}
        showColumn={c => c === 'select'}
        extraColumns={[]}
        dropDownTags={dropDownTags}
        dropDownTeachers={dropDownTeachers}
        shouldHideInstructor={() => false}
        addFilterTag={mockFn}
        studentInstances={coursePage.data}
        selectedInstance={coursePage}
        coursePageLogic={coursePageLogic}
        associateTeacherToStudent={mockFn}
        getAllTags={mockFn}
        tags={tags}
        loading={loading}
        resetLoading={mockFn}
        showAssistantDropdown={mockFn}
        showTagDropdown={mockFn}
        selectTeacher={mockFn}
        selectTag={mockFn}
        filterByAssistant={mockFn}
        filterByTag={mockFn}
        tagStudent={mockFn}
        unTagStudent={mockFn}
        selectStudent={mockFn}
        unselectStudent={mockFn}
        selectAllStudents={mockFn}
        unselectAllStudents={mockFn}
        updateStudentProjectInfo={mockFn}
      />
    )
  })

  describe('StudentTableRow Component', () => {
    it('is ok', () => {
      true
    })

    it('should render correctly', () => {
      expect(wrapper).toMatchSnapshot()
    })

    it('displays warning if repo is not accessible', () => {
      wrapper.setProps({ data: { ...coursePage.data[1], repoExists: false } })
      expect(wrapper.find('RepoAccessWarning').length).toEqual(1)
    })
  })
})
