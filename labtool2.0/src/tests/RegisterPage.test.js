import React from 'react'
import ReactDOM from 'react-dom'
import App from '../App'
import Register from '../components/pages/RegisterPage'
import { shallow, mount, render } from 'enzyme';
import { shallowToJson } from 'enzyme-to-json'


describe.only('<Register />', () => {
  
  describe('Register Component', () => {

    // make our assertion and what we expect to happen 
    it('should render without throwing an error', () => {
      expect(shallow(<Register />).exists(<form className='Register'></form>)).toBe(true)
    })

    it('should render correctly', () => {
        const output = shallow(
          <Register />
        )
        expect(shallowToJson(output)).toMatchSnapshot();
    })

    it('renders a GitHub link input', () => {
      expect(shallow(<Register />).find('#github').length).toEqual(0)
    })

    it('renders project name input', () => {
      expect(shallow(<Register />).find('#name').length).toEqual(0)
    })
  })
})
