import React from 'react'
import ReactDOM from 'react-router-dom'
import App from '../App'
import Login from '../components/pages/LoginPage'


describe.only('<Login />', () => {

  describe('Login Component', () => {

    it('should render without throwing an error', () => {
      expect(shallow(<Login />).exists(<form className='Login'></form>)).toBe(true)
    })

    it('should render correctly', () => {
      const output = shallow(
        <Login />
      )
    //  expect(output).toMatchSnapshot()
    })

    it('renders a username input', () => {
      expect(shallow(<Login />).find('.form-control1').length).toEqual(1)
    })

    it('renders a password input', () => {
      expect(shallow(<Login />).find('.form-control2').length).toEqual(1)
    })



  })
})
