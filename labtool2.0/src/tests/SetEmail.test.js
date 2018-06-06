import React from 'react'
import { Email } from '../components/pages/Email'
import { shallow } from 'enzyme'

describe('<Email/>', () => {
  let wrapper

  const props = {
    emailPage: {
      loading: false,
      redirect: false
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

  beforeEach(() => {
    wrapper = shallow(<Email emailPage={props} user={props} />)
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
