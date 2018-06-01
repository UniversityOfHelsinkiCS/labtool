import React from 'react'
import ReactDOM from 'react-dom'
import App from '../App'
import { ModifyCourseInstancePage } from '../components/pages/ModifyCourseInstancePage'
import ConnectecModifyCourseInstancePage from '../components/pages/ModifyCourseInstancePage'
import { shallowToJson } from 'enzyme-to-json'
import { shallow } from 'enzyme'
import { Form } from 'semantic-ui-react'

describe('<ModifyCourseInstancePage />', () => {
  let wrapper
  let output = {
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
  let mym = jest.fn()

  beforeEach(() => {
    wrapper = shallow(<ModifyCourseInstancePage getOneCI={mym} clearNotifications={mym} output={output} selectedInstance={output.ohid} />)
  })

  describe('Modify Instance Component', () => {
    it('is ok', () => {
      true
    })

    it('should render without throwing an error', () => {
      expect(wrapper.find('.CoursePage').exists()).toEqual(true)
    })

    it('should render correctly', () => {
      expect(wrapper.length).toEqual(1)
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
