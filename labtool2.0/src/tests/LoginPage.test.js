import React from 'react'
import ReactDOM from 'react-dom'
import App from '../App'
import Login from '../components/pages/LoginPage'
import { shallow, mount, render , wrapper } from 'enzyme';
import { shallowToJson } from 'enzyme-to-json'



describe.only('<Login />', () => {
  
  describe('Login Component', () => {

    // make our assertion and what we expect to happen 
    it('should render without throwing an error', () => {
      expect(shallow(<Login />).exists(<form className='Login'></form>)).toBe(true)
    })

    it('should render correctly', () => {
      const output = shallow(
        <Login />
      )
      expect(shallowToJson(output)).toMatchSnapshot();
    })

    it('renders a username input', () => {
      expect(shallow(<Login />).find('.form-control1').length).toEqual(1)
    })

    it('renders a password input', () => {
      expect(shallow(<Login />).find('.form-control2').length).toEqual(1)
    })

  })
  const onSubmit = jest.fn()

  const wrapper = mount(
    <Login onSubmit={onSubmit} />
  )

 
it('button can be clicked', () => {


  const button = wrapper.find('button')

  expect(button.simulate('submit'))
}) 
/* jatkan vielä tän tekemistä 
it('is able to login'), () => {
const input = wrapper.find('.form-control1')
const inputt = wrapper.find('.form-control2')


 input.simulate('change', { target: { value: 'ss' } })
 inputt.simulate('change', { target: { value: 'ss' } })
 
 expect(button.simulate('submit'))

 expect(onSubmit.mock.calls.length).toBe(1)
} */
}) 

