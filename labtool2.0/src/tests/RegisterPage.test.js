import React from 'react'
import { RegisterPage } from '../components/pages/RegisterPage'
import { shallow } from 'enzyme'
import { Input } from 'semantic-ui-react'

jest.mock('../hooks/useDebounce', () => {
  return jest.fn().mockImplementation(value => {
    return value
  })
})

jest.mock('../hooks/useGithubRepo', () => {
  return jest.fn().mockImplementation(repo => {
    if (!repo) {
      return { githubRepo: null, error: null }
    }

    return { githubRepo: null, error: 'fake error' }
  })
})

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
          instructor: false,
          createdAt: '2018-03-26T00:00:00.000Z',
          updatedAt: '2018-03-26T00:00:00.000Z',
          userId: 10010,
          courseInstanceId: 10011,
          firsts: 'Pää',
          lastname: 'Opettaja'
        },
        {
          id: 10011,
          instructor: true,
          createdAt: '2018-03-26T00:00:00.000Z',
          updatedAt: '2018-03-26T00:00:00.000Z',
          userId: 10015,
          courseInstanceId: 10011,
          firsts: 'Ossi Ohjaaja',
          lastname: 'Mutikainen'
        }
      ]
    },
    loading: {
      loading: false,
      loadingHooks: [],
      redirect: false,
      redirectHooks: [],
      redirectFailure: false
    }
  }

  let mockFn = jest.fn()

  beforeEach(() => {
    wrapper = shallow(
      <RegisterPage
        getOneCI={mockFn}
        selectedInstance={props}
        loading={props.loading}
        resetLoading={mockFn}
        courseId={'10012'}
        coursePage={{ data: null }}
        createStudentCourses={mockFn}
        updateStudentProjectInfo={mockFn}
        addRedirectHook={mockFn}
        coursePageInformation={mockFn}
      />
    )
  })

  describe('RegisterPage Component', () => {
    it('is ok', () => {
      true
    })

    it('should render correctly', () => {
      expect(wrapper).toMatchSnapshot()
    })

    it('should render without throwing an error', () => {
      expect(wrapper.find('.Register').length).toEqual(1)
    })

    it('renders project name input', () => {
      expect(wrapper.find('.form-control1').length).toEqual(1)
    })

    it('renders a GitHub link input', () => {
      expect(wrapper.find('.form-control2').length).toEqual(1)
    })

    it('renders a warning if github repo does not exist', () => {
      wrapper
        .find(Input)
        .find({ name: 'github' })
        .simulate('change', null, { value: 'https://github.com/invalid_repo' })

      expect(wrapper.find('GitHubRepoWarning').length).toEqual(1)
    })
  })
})
