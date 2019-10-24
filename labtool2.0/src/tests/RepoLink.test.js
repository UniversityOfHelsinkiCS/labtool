import React from 'react'
import RepoLink from '../components/RepoLink'
import { shallow } from 'enzyme'

describe('<RepoLink />', () => {
  let wrapper

  describe('Repository link', () => {
    beforeEach(() => {
      const url = 'https://github.com/userName/repo'
      wrapper = shallow(<RepoLink url={url} />)
    })

    it('when it is a github repository', () => {
      const githubIcon = wrapper.find('Icon')
      expect(githubIcon.props()).toHaveProperty('name', 'github')
      expect(wrapper.find('a').text()).not.toContain('https://github.com/')
      expect(wrapper.find('a').text()).toContain('userName/repo')
    })
  })
})
