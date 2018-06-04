import React from 'react'
import ReactDOM from 'react-dom'
import App from '../App'
import { CoursePage } from '../components/pages/CoursePage'
import ConnectedCoursePage from '../components/pages/CoursePage'
import { shallowToJson } from 'enzyme-to-json'
import { shallow } from 'enzyme'
import { Form } from 'semantic-ui-react'
import { getOneCI } from '../services/courseInstance'

describe('<CoursePage />', () => {
  let wrapper
  let output = {
    id: 10011,
    name: 'Aineopintojen harjoitustyö: Tietorakenteet ja algoritmit',
    active: true,
    weekAmount: 7,
    weekMaxPoints: 8,
    currentWeek: 1,
    ohid: 'TKT20010.2018.K.A.1'
  }
  let student = {
    role: 'student',
    data: {
      id: 10011,
      github: 'http://github.com/tiralabra1',
      projectName: 'Tiran labraprojekti',
      courseInstanceId: 10011,
      userId: 10011,
      teacherInstanceId: 10011,
      weeks: [
        {
          id: 10002,
          points: 2,
          weekNumber: 2,
          feedback: 'Melko hienoa työtä!',
          studentInstanceId: 10011,
          comments: []
        },
        {
          id: 10001,
          points: 2,
          weekNumber: 1,
          feedback: 'yvä',
          studentInstanceId: 10011,
          comments: []
        },
        {
          id: 10003,
          points: 3,
          weekNumber: 3,
          feedback: 'Erittäin hienoa työtä!',
          studentInstanceId: 10011,
          comments: []
        },
        {
          id: 10004,
          points: 3,
          weekNumber: 4,
          feedback: 'Hyvin menee!',
          studentInstanceId: 10011,
          comments: []
        }
      ],
      User: {
        id: 10011,
        username: 'tiraopiskelija1',
        email: 'maarit.opiskelija@helsinki.fi',
        firsts: 'Maarit Mirja',
        lastname: 'Opiskelija',
        studentNumber: '014578343',
        admin: false
      }
    }
  }
  let mockFn = jest.fn()

  beforeEach(() => {
    wrapper = shallow(<CoursePage createOneComment={mockFn} getOneCI={mockFn} coursePageInformation={mockFn} associateTeacherToStudent={mockFn} />)
  })

  describe('Course Page Component', () => {
    it('is ok', () => {
      true
    })

    it('should render without throwing an error', () => {
      expect(wrapper.find('.CoursePage').exists()).toEqual(true)
    })
  })
})
