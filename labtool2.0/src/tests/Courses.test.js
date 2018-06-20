import React from 'react'
import { Courses } from '../components/pages/Courses'
import { shallow } from 'enzyme'

describe('<Courses />', () => {
  let wrapper

  let props = {
    courseInstance: [
      {
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
        europeanStart: '11.03.2018',
        europeanEnd: '29.04.2018',
        shorterId: 'TKT20010'
      },
      {
        id: 10012,
        name: 'Ohjelmistotekniikan menetelmät',
        start: '2018-03-11T21:00:00.000Z',
        end: '2018-04-29T21:00:00.000Z',
        active: true,
        weekAmount: 7,
        weekMaxPoints: 3,
        currentWeek: 1,
        ohid: 'TKT20002.2018.K.K.1',
        createdAt: '2018-03-26T00:00:00.000Z',
        updatedAt: '2018-03-26T00:00:00.000Z',
        europeanStart: '11.03.2018',
        europeanEnd: '29.04.2018',
        shorterId: 'TKT20002'
      },
      {
        id: 10013,
        name: 'Aineopintojen harjoitustyö: Tietokantasovellus',
        start: '2018-01-16T21:00:00.000Z',
        end: '2018-03-10T21:00:00.000Z',
        active: false,
        weekAmount: 7,
        weekMaxPoints: 3,
        currentWeek: 1,
        ohid: 'TKT20011.2018.K.A.1',
        createdAt: '2018-03-26T00:00:00.000Z',
        updatedAt: '2018-03-26T00:00:00.000Z',
        europeanStart: '16.01.2018',
        europeanEnd: '10.03.2018',
        shorterId: 'TKT20011'
      }
    ]
  }

  const loading = {
    loading: false,
    loadingHooks: [],
    redirect: false,
    redirectHooks: [],
    redirectFailure: false
  }

  let mockFn = jest.fn()

  beforeEach(() => {
    wrapper = shallow(<Courses getAllCI={mockFn} courseInstance={props.courseInstance} loading={loading} resetLoading={mockFn} />)
  })

  describe('Courses Component', () => {
    it('is ok', () => {
      true
    })

    it('should render without throwing an error', () => {
      expect(wrapper.find('.Courses').exists()).toEqual(true)
    })

    it('should render correctly', () => {
      expect(wrapper).toMatchSnapshot()
    })
  })
})
