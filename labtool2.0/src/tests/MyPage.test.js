import React from 'react'
import { MyPage } from '../components/pages/MyPage'
import { shallow } from 'enzyme'

describe('<MyPage />', () => {
  let wrapper

  const props = {
    courseInstance: [],
    user: {
      user: {
        id: 10011,
        email: 'maarit.opiskelija@helsinki.fi',
        firsts: 'Maarit Mirja',
        lastname: 'Opiskelija',
        studentNumber: '014578343',
        username: 'tiraopiskelija1'
      },
      token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InRpcmFvcGlza2VsaWphMSIsImlkIjoxMDAxMSwiaWF0IjoxNTI4MjA1ODkxfQ.5XJuUcATdFylTxnEISTCM8h2uwTnMDXrcBZSVuby5_o',
      created: false
    },
    notification: {},
    teacherInstance: [],
    studentInstance: [
      {
        id: 10011,
        name: 'Aineopintojen harjoitustyö: Tietorakenteet ja algoritmit',
        start: '2018-03-11T21:00:00.000Z',
        end: '2018-04-29T21:00:00.000Z',
        active: true,
        weekAmount: 7,
        weekMaxPoints: 3,
        currentWeek: 1,
        ohid: 'TKT20010.2018.K.A.1',
        createdAt: '2018-03-26T00:00:00.000Z',
        updatedAt: '2018-03-26T00:00:00.000Z',
        github: 'http://github.com/tiralabra1',
        projectName: 'Tiran labraprojekti',
        userId: 10011,
        courseInstanceId: 10011,
        teacherInstanceId: 10011
      }
    ],
    selectedInstance: [],
    coursePage: [],
    emailPage: {
      loading: false,
      redirect: false
    },
    users: [],
    assistant: []
  }

  let mockFn = jest.fn()

  beforeEach(() => {
    wrapper = shallow(<MyPage getAllStudentCourses={mockFn} getAllTeacherCourses={mockFn} user={props.user} studentInstance={props.studentInstance} teacherInstance={props.teacherInstance} />)
  })

  describe('MyPage Component', () => {
    it('is ok', () => {
      true
    })

    it('should render without throwing an error', () => {
      expect(wrapper.find('.MyPage').exists()).toEqual(true)
    })

    it('should render correctly', () => {
      expect(wrapper).toMatchSnapshot()
    })

    it('renders courses header', () => {
      expect(wrapper.find('.CoursesHeader').length).toEqual(2)
    })
  })
})
