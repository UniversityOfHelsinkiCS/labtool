import React from 'react'
import { ModifyCourseInstancePage } from '../components/pages/ModifyCourseInstancePage'
import { shallow } from 'enzyme'
import { Form } from 'semantic-ui-react'

describe('<ModifyCourseInstancePage />', () => {
  let wrapper

  const courseData = {
    id: 1,
    name: 'Aineopintojen harjoitustyö: Tietokantasovellus (periodi IV)',
    start: '2018-03-11T21:00:00.000Z',
    end: '2018-03-11T21:00:00.000Z',
    active: true,
    weekAmount: 7,
    weekMaxPoints: 2,
    currentWeek: 1,
    ohid: 'TKT20011.2018.K.A.1'
  }
  let mockFn = jest.fn()

  beforeEach(() => {
    wrapper = shallow(<ModifyCourseInstancePage getOneCI={mockFn} clearNotifications={mockFn} selectedInstance={courseData} />)
  })

  describe('Modify Instance Component', () => {
    it('is ok', () => {
      true
    })

    it('should render without throwing an error', () => {
      expect(wrapper.find('.CoursePage').exists()).toEqual(true)
    })

    it('should render correctly', () => {
      expect(wrapper).toMatchSnapshot()
    })

    it('renders weekly amount', () => {
      expect(wrapper.find('.form-control1').length).toEqual(1)
    })

    it('renders weekly maxpoints', () => {
      expect(wrapper.find('.form-control2').length).toEqual(1)
    })
    it('renders current week', () => {
      expect(wrapper.find('.form-control3').length).toEqual(1)
    })
    it('renders active course checkbox', () => {
      const input = wrapper.find(Form.Field).at(0)
      expect(input.props().children.props['label']).toEqual('Activate course')
    })

    it('renders inactive course checkbox', () => {
      const input = wrapper.find(Form.Field).at(1)
      expect(input.props().children.props['label']).toEqual('Deactivate course')
    })
  })
})
