import React from 'react'
import ReactDOM from 'react-dom'
import App from '../App'
import Login from '../components/pages/LoginPage'
import { shallow, mount, render, wrapper } from 'enzyme';
import { shallowToJson } from 'enzyme-to-json'



describe.only('<Login />', () => {
    const mockHandler = jest.fn()
    const loginComponent = shallow(
        <Login
        postLogin = {mockHandler}
        handlePasswordChange = {mockHandler} 
        handleUsernameChange ={mockHandler}
        />
    )
    describe('Testing login Component', () => {

        it('should render without throwing an error', () => {
            expect(shallow(<Login />).exists(<form className='Login'></form>)).toBe(true)
        })
        it('matches snapshot', () => {
            const output = shallow(<Login />)
            expect(output).toMatchSnapshot()
        })
        it('renders a username input', () => {
            expect(shallow(<Login />).find('.form-control1').length).toEqual(1)
        })

        it('renders a password input', () => {
            expect(shallow(<Login />).find('.form-control2').length).toEqual(1)
        })
        

    })



})

