import React from 'react'
import { StudentTable } from '../components/StudentTable'
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
          admin: false,
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
          admin: false,
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
