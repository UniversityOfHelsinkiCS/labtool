import React from 'react'
import ReactDOM from 'react-dom'
import Email from '../components/pages/Email'
import { shallowToJson } from 'enzyme-to-json'


describe.only('<SetEmail/>', () => {

  describe('Testing setEmail Component', () => {
 
    it('should render without throwing an error', () => {
      expect(shallow(<Email />).exists(<form className='Register'></form>)).toBe(true)
    })

    it('renders email input', () => {
      expect(shallow(<Email />).find('.form-control').length).toEqual(1)
    })
  })
})