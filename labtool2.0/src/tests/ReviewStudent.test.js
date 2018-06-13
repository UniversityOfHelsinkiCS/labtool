import React from 'react'
import { ReviewStudent } from '../components/pages/ReviewStudent'
import { shallow } from 'enzyme'

describe('<ReviewStudent />', () => {
  let wrapper

  const ownProps = {
    courseId: 'TKT20010.2018.K.A.1',
    studentInstance: '10011',
    weekNumber: '1'
  }


  const props = {
    selectedInstance: {
      id: 10011,
      name: 'Aineopintojen harjoitustyö: Tietorakenteet ja algoritmit',
      start: '2018-03-11T21:00:00.000Z',
      end: '2018-04-29T21:00:00.000Z',
      active: true,
      weekAmount: 7,
      weekMaxPoints: 3,
      currentWeek: 1,
      ohid: 'TKT20010.2018.K.A.1',
      checklists: [
        {
          id: 10002,
          week: 1,
          list: {},
          courseName: 'Aineopintojen harjoitustyö: Tietorakenteet ja algoritmit',
          master: false,
          createdAt: '2018-03-26T00:00:00.000Z',
          updatedAt: '2018-03-26T00:00:00.000Z',
          courseInstanceId: 10011
        }
      ],
      createdAt: '2018-03-26T00:00:00.000Z',
      updatedAt: '2018-03-26T00:00:00.000Z',
      teacherInstances: [
        {
          id: 10001,
          admin: true,
          createdAt: '2018-03-26T00:00:00.000Z',
          updatedAt: '2018-03-26T00:00:00.000Z',
          userId: 10010,
          courseInstanceId: 10011,
          firsts: 'Pää',
          lastname: 'Opettaja'
        },
        {
          id: 10011,
          admin: true,
          createdAt: '2018-03-26T00:00:00.000Z',
          updatedAt: '2018-03-26T00:00:00.000Z',
          userId: 10015,
          courseInstanceId: 10011,
          firsts: 'Ossi Ohjaaja',
          lastname: 'Mutikainen'
        }
      ]
    },
    studentInstance: 10011,
    coursePage: {
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
  }

  let mockFn = jest.fn()

  beforeEach(() => {
    wrapper = shallow(<ReviewStudent getOneCI={mockFn} clearNotifications={mockFn} courseData={props.coursePage} ownProps={ownProps} selectedInstance={props.selectedInstance} />)
  })

  describe('ReviewStudent Component', () => {
    it('is ok', () => {
      true
    })

    it('should render without throwing an error', () => {
      expect(wrapper.find('.ReviewStudent').exists()).toEqual(true)
    })

    it('should render correctly', () => {
      expect(wrapper).toMatchSnapshot()
    })
  })
})
