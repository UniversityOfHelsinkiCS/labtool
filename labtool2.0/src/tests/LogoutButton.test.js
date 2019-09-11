import React from 'react'
import { LogoutButton } from '../components/LogoutButton'
import { shallow } from 'enzyme'

describe('<LogoutButton />', () => {
  let mockLogout
  let wrapper

  beforeEach(() => {
    mockLogout = jest.fn()
    wrapper = shallow(<LogoutButton logout={mockLogout} />)
  })

  describe('Logout Button', () => {
    it('renders ok', () => {
      expect(wrapper).toBeDefined()
      expect(wrapper.children().text()).toEqual('Logout')
    })

    it('can be clicked to logout', () => {
      wrapper.find('Button').simulate('click')

      expect(mockLogout).toHaveBeenCalled()
    })
  })
})