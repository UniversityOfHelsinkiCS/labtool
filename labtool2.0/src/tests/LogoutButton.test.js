import React from 'react'
import { LogoutButton } from '../components/LogoutButton'
import { shallow } from 'enzyme'
import { Icon } from 'semantic-ui-react'

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
      expect(wrapper.find(Icon).find({ name: 'sign out alternative' })).toBeDefined()
      expect(wrapper.findWhere(n => n.text() === 'Logout')).toBeDefined()
    })

    it('can be clicked to logout', () => {
      wrapper.find('Button').simulate('click')

      expect(mockLogout).toHaveBeenCalled()
    })
  })
})
