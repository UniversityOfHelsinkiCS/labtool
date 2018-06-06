import React from 'react'
import { Notification } from '../components/pages/Notification'
import { shallow } from 'enzyme'

describe('<Notification /> without error', () => {
  let wrapper

  const notification = {
    message: 'This is a test message, please ignore.',
    error: null
  }

  beforeEach(() => {
    wrapper = shallow(<Notification notification={notification} />)
  })

  describe('Notification Component', () => {
    it('is ok', () => {
      true
    })

    it('should render without throwing an error', () => {
      expect(wrapper.find('.success').exists()).toEqual(true)
    })

    it('should render correctly', () => {
      expect(wrapper).toMatchSnapshot()
    })
  })
})

describe('<Notification /> with error', () => {
  let wrapper

  const notification = {
    message: 'This is a test message, please ignore.',
    error: 'Something went wrong...'
  }

  beforeEach(() => {
    wrapper = shallow(<Notification notification={notification} />)
  })

  describe('Notification Component', () => {
    it('is ok', () => {
      true
    })

    it('should render without throwing an error', () => {
      expect(wrapper.find('.error').exists()).toEqual(true)
    })

    it('should render correctly', () => {
      expect(wrapper).toMatchSnapshot()
    })
  })
})

describe('<Notification /> without content', () => {
  let wrapper

  const notification = {
    message: undefined,
    error: null
  }

  beforeEach(() => {
    wrapper = shallow(<Notification notification={notification} />)
  })

  describe('Notification Component', () => {
    it('is ok', () => {
      true
    })

    it('should not show the message', () => {
      expect(wrapper.find('.success').exists()).toEqual(false)
    })

    it('should not give an error', () => {
      expect(wrapper.find('.error').exists()).toEqual(false)
    })

    it('should render correctly', () => {
      expect(wrapper).toMatchSnapshot()
    })
  })
})