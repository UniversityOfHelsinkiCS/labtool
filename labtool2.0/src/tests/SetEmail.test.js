import React from 'react'
import ReactDOM from 'react-dom'
import SetEmail from '../components/pages/SetEmail'
import { shallowToJson } from 'enzyme-to-json'


describe.only('<SetEmail/>', () => {

  describe('Testing setEmail Component', () => {
 
    it('should render without throwing an error', () => {
      expect(shallow(<SetEmail />).exists(<form className='Register'></form>)).toBe(true)
    })

    it('renders email input', () => {
      expect(shallow(<SetEmail />).find('.form-control').length).toEqual(1)
    })
  })
})
