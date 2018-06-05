import React from 'react'
import { RegisterPage } from '../components/pages/RegisterPage'
import { shallow } from 'enzyme'

describe('<Register />', () => {
  let wrapper

  const props = {
    selectedInstance: {
      id: 10011,
      name: 'Aineopintojen harjoitustyö: Tietorakenteet ja algoritmit',
      start: '2018-03-11T21:00:00.000Z',
      end: '2018-04-29T21:00:00.000Z',
      active: true,
      weekAmount: 7,
      weekMaxPoints: 3,
      currentWeek: 1,
      ohid: 'TKT20010.2018.K.A.1',
      createdAt: '2018-03-26T00:00:00.000Z',
      updatedAt: '2018-03-26T00:00:00.000Z',
      teacherInstances: [
        {
          id: 10001,
          admin: true,
          createdAt: '2018-03-26T00:00:00.000Z',
          updatedAt: '2018-03-26T00:00:00.000Z',
          userId: 10010,
          courseInstanceId: 10011,
          firsts: 'Pää',
          lastname: 'Opettaja'
        },
        {
          id: 10011,
          admin: true,
          createdAt: '2018-03-26T00:00:00.000Z',
          updatedAt: '2018-03-26T00:00:00.000Z',
          userId: 10015,
          courseInstanceId: 10011,
          firsts: 'Ossi Ohjaaja',
          lastname: 'Mutikainen'
        }
      ]
    }
  }

  let mockFn = jest.fn()

  beforeEach(() => {
    wrapper = shallow(<RegisterPage getOneCI={mockFn} selectedInstance={props} />)
  })

  describe('RegisterPage Component', () => {
    it('is ok', () => {
      true
    })

    it('should render correctly', () => {
      expect(wrapper).toMatchSnapshot()
    })

    it('should render without throwing an error', () => {
      expect(wrapper.exists(<form className="Register" />)).toBe(true)
    })

    it('renders project name input', () => {
      expect(wrapper.find('.form-control1').length).toEqual(1)
    })

    it('renders a GitHub link input', () => {
      expect(wrapper.find('.form-control2').length).toEqual(1)
    })
  })
})
