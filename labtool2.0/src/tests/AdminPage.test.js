import React from 'react'
import { AdminPage } from '../components/pages/AdminPage'
import { shallow } from 'enzyme'
import { Redirect } from 'react-router'

describe('<AdminPage />', () => {
  let wrapper

  const user = {
    id: 10012,
    username: 'tiraopiskelija2',
    email: 'johan.studerande@helsinki.invalid',
    firsts: 'Johan Wilhelm',
    lastname: 'Studerande',
    studentNumber: '014553242',
    teacher: false,
    sysop: true,
    createdAt: '2018-03-26T00:00:00.000Z',
    updatedAt: '2018-03-26T00:00:00.000Z'
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
      <AdminPage user={{ user }} courseInstance={[]} users={[]} loading={loading} resetLoading={mockFn} getAllCI={mockFn} getAllUsers={mockFn} updateOtherUser={mockFn} clearNotifications={mockFn} />
    )
  })

  describe('AdminPage Component', () => {
    it('is ok', () => {
      true
    })

    it('should render without throwing an error', () => {
      expect(wrapper.find('.AdminPage').exists()).toEqual(true)
    })

    it('should redirect if user is not an admin', () => {
      const nonSysop = { ...user, sysop: false }
      wrapper.setProps({ user: { user: nonSysop } })
      expect(wrapper.find(Redirect)).toHaveLength(1)
    })
  })
})
