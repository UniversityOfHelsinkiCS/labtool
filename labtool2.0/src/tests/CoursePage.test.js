import React from 'react'
import ReactDOM from 'react-dom'
import App from '../App'
import { CoursePage } from '../components/pages/CoursePage'
import { shallow } from 'enzyme'

describe.only('<CoursePage />', () => {
  let wrapper
  let course = {
    id: 10011,
    name: 'Aineopintojen harjoitustyö: Tietorakenteet ja algoritmit',
    start: '2018-03-11T21:00:00.000Z',
    end: '2018-04-29T21:00:00.000Z',
    active: true,
    weekAmount: 7,
    weekMaxPoints: 8,
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
        { id: 10002, points: 2, weekNumber: 2, feedback: 'Melko hienoa työtä!', createdAt: '2018-03-26T00:00:00.000Z', updatedAt: '2018-03-26T00:00:00.000Z', studentInstanceId: 10011, comments: [] },
        { id: 10001, points: 2, weekNumber: 1, feedback: 'yvä', createdAt: '2018-03-26T00:00:00.000Z', updatedAt: '2018-06-01T09:57:10.180Z', studentInstanceId: 10011, comments: [] },
        {
          id: 10003,
          points: 3,
          weekNumber: 3,
          feedback: 'Erittäin hienoa työtä!',
          studentInstanceId: 10011,
          comments: []
        },
        { id: 10004, points: 3, weekNumber: 4, feedback: 'Hyvin menee!', createdAt: '2018-03-26T00:00:00.000Z', updatedAt: '2018-03-26T00:00:00.000Z', studentInstanceId: 10011, comments: [] }
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
})
