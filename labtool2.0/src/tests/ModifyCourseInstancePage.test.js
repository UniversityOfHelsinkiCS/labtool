import React from 'react'
import ReactDOM from 'react-dom'
import App from '../App'
import ModifyCourseInstancePage from '../components/pages/ModifyCourseInstancePage'
import { shallowToJson } from 'enzyme-to-json'


describe.only('<ModifyCourseInstancePage />', () => {

    describe('Modyfy Instance Component', () => {


        it('should render without throwing an error', () => {
            expect(shallow(<ModifyCourseInstancePage />).exists(<form className='CourseInstance'></form>)).toBe(true)
        })

        it('should render correctly', () => {
            const output = shallow(
                <ModifyCourseInstancePage />
            )

        })

        it('renders a GitHub link input', () => {
            expect(shallow(<ModifyCourseInstancePage />).find('.form-control1').length).toEqual(1)
        })

        it('renders project name input', () => {
            expect(shallow(<ModifyCourseInstancePage />).find('.form-control2').length).toEqual(1)
        })
        it('renders project name input', () => {
            expect(shallow(<ModifyCourseInstancePage />).find('.form-control3').length).toEqual(1)
        })
        it('renders project name input', () => {
            expect(shallow(<ModifyCourseInstancePage />).find('.form-control4').length).toEqual(1)
        })
    })
})
