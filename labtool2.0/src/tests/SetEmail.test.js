import React from 'react'
import { Email } from '../components/pages/Email'
import { shallow } from 'enzyme'

describe('<Email/>', () => {
  let wrapper

  const props = {
    loading: {
      loading: false,
      loadingHooks: [],
      redirect: false,
      redirectHooks: [],
      redirectFailure: false
    },
    user: {
      id: 2,
      email: '',
      firsts: 'Hans Peter',
      lastname: 'Backlund',
      studentNumber: '014623598',
      username: 'tiraopiskelija4'
    },
    token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InRpcmFvcGlza2VsaWphNCIsImlkIjoyLCJpYXQiOjE1MjgyMDIwMjZ9.UxRliHDq_cDTclh-sO4GRXfQthlmqGcCqIbuyo9j2SE',
    created: true
  }

  let mockFn = jest.fn()

  beforeEach(() => {
    wrapper = shallow(<Email loading={props.loading} user={props} resetLoading={mockFn} forceSetLoading={mockFn} updateUser={mockFn} addRedirectHook={mockFn} />)
  })

  describe('Email Component', () => {
    it('is ok', () => {
      true
    })

    it('should render without throwing an error', () => {
      expect(wrapper.find('.Email').exists()).toEqual(true)
    })

    it('should render correctly', () => {
      expect(wrapper).toMatchSnapshot()
    })

    it('renders email input', () => {
      expect(wrapper.find('.form-control').length).toEqual(1)
    })
  })
})
