import React from 'react'
import { CourseImport } from '../components/pages/CourseImport'
import { shallow } from 'enzyme'

describe('<CourseImport />', () => {
  let wrapper

  let props = {
    courseImport: {
      canImport: true,
      importable: [
        {
          hid: 'TKT20002.2019.K.K.1',
          cname: 'Ohjelmistotekniikan menetelmät',
          starts: '2018-03-11T21:00:00.000Z',
          ends: '2018-04-29T21:00:00.000Z'
        }
      ]
    }
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
    wrapper = shallow(<CourseImport getIsAllowedToImport={mockFn} getImportableCourses={mockFn} courseImport={props.courseImport} loading={loading} resetLoading={mockFn} />)
  })

  describe('CourseImport Component', () => {
    it('is ok', () => {
      true
    })

    it('should render without throwing an error', () => {
      expect(wrapper.find('.CourseImport').exists()).toEqual(true)
    })

    it('should render correctly', () => {
      expect(wrapper).toMatchSnapshot()
    })
  })
})
