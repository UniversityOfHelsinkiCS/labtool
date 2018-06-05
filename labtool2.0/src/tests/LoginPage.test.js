import React from 'react'
import { LoginPage } from '../components/pages/LoginPage'
import { shallow } from 'enzyme'

describe('<Login />', () => {
  let wrapper

  beforeEach(() => {
    wrapper = shallow(<LoginPage />)
  })

  describe('LoginPage Component', () => {
    it('is ok', () => {
      true
    })

    it('should render without throwing an error', () => {
      expect(wrapper.exists(<form className="LoginPage" />)).toBe(true)
    })

    it('should render correctly', () => {
      expect(wrapper).toMatchSnapshot()
    })

    it('renders a username input', () => {
      expect(wrapper.find('.form-control1').length).toEqual(1)
    })

    it('renders a password input', () => {
      expect(wrapper.find('.form-control2').length).toEqual(1)
    })
  })
})
