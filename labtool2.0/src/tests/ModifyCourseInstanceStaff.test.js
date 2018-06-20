import React from 'react'
import { ModifyCourseInstanceStaff } from '../components/pages/ModifyCourseInstanceStaff'
import { shallow } from 'enzyme'
import { Container, Table, Label } from 'semantic-ui-react'

describe('<ModifyCourseInstanceStaff />', () => {
  let wrapper
  let mockFn = jest.fn()
  const selectedI = {
    id: 10013,
    name: 'Aineopintojen harjoitustyö: Tietokantasovellus',
    start: '2018-01-16T21:00:00.000Z',
    end: '2018-03-10T21:00:00.000Z',
    active: true,
    weekAmount: 7,
    weekMaxPoints: 3,
    currentWeek: 1,
    ohid: 'TKT20011.2018.K.A.1',
    teacherInstances: [
      {
        id: 1003,
        admin: 'true',
        createdAt: '2018-01-16T21:00:00.000Z',
        updatedAt: '2018-01-16T21:00:00.000Z',
        userId: 10010,
        courseInstanceId: 10013
      },
      {
        id: 1004,
        admin: 'false',
        createdAt: '2018-01-16T21:00:00.000Z',
        updatedAt: '2018-01-16T21:00:00.000Z',
        userId: 10012,
        courseInstanceId: 10013
      }
    ],
    createdAt: '2018-03-26T00:00:00.000Z',
    updatedAt: '2018-05-28T13:13:32.540Z'
  }
  const courseId = selectedI['ohid']
  const users = [
    {
      id: 10010,
      username: 'paaopettaja',
      email: 'paa.opettaja@helsinki.fi',
      firsts: 'Pää',
      lastname: 'Opettaja',
      admin: true,
      createdAt: '2018-03-26T00:00:00.000Z',
      updatedAt: '2018-03-26T00:00:00.000Z'
    },
    {
      id: 10011,
      username: 'paaopettaja',
      email: 'paa.opettaja@helsinki.fi',
      firsts: 'Sivu',
      lastname: 'Opiskelija',
      studentNumber: '014822548',
      admin: false,
      createdAt: '2018-03-26T00:00:00.000Z',
      updatedAt: '2018-03-26T00:00:00.000Z'
    },
    {
      id: 10012,
      username: 'aimoassis',
      email: 'aimo.assistentti@helsinki.fi',
      firsts: 'Aimo',
      lastname: 'Assistentti',
      studentNumber: '014666666',
      admin: false,
      createdAt: '2018-06-08T11:22:00.000Z',
      updatedAt: '2018-06-08T11:22:00.000Z'
    }
  ]

  const loading = {
    loading: false,
    loadingHooks: [],
    redirect: false,
    redirectHooks: [],
    redirectFailure: false
  }

  beforeEach(() => {
    wrapper = shallow(
      <ModifyCourseInstanceStaff
        courseId={5}
        users={users}
        selectedInstance={selectedI}
        loading={loading}
        getAllUsers={mockFn}
        getOneCI={mockFn}
        createOne={mockFn}
        clearNotifications={mockFn}
        resetLoading={mockFn}
      />
    )
  })

  describe('Components', () => {
    it('renders correctly', () => {
      expect(wrapper).toMatchSnapshot()
    })

    it('shows correct amount of users', () => {
      // Three users and the table header which is also rendered as a row
      expect(wrapper.find(Table.Row).length).toEqual(4)
    })

    it('shows the correct amount of labels', () => {
      expect(wrapper.find(Label).length).toEqual(2)
    })

    it('shows the correct name and label for teacher of the course', () => {
      const name = wrapper.find(Table.Cell).at(0)
      const status = wrapper.find(Label).at(0)
      expect(name.props().children[0] + ' ' + name.props().children[2]).toEqual('Pää Opettaja')
      expect(status.props().children).toEqual('Teacher')
    })

    it('shows the correct name and label for student of the course', () => {
      const name = wrapper.find(Table.Cell).at(2)
      expect(name.props().children[0] + ' ' + name.props().children[2]).toEqual('Sivu Opiskelija')
    })

    it('shows the correct name and label for assistant of the course', () => {
      const name = wrapper.find(Table.Cell).at(4)
      const status = wrapper.find(Label).at(1)
      expect(name.props().children[0] + ' ' + name.props().children[2]).toEqual('Aimo Assistentti')
      expect(status.props().children).toEqual('Assistant')
    })
  })
})
