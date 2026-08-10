import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { vi } from 'vitest'
import { RegisterPage } from '../components/pages/RegisterPage'

vi.mock('../hooks/useDebounce', () => {
  return {
    default: vi.fn().mockImplementation(value => {
      return value
    })
  }
})

vi.mock('../hooks/useGithubRepo', () => {
  return {
    default: vi.fn().mockImplementation(repo => {
      if (!repo) {
        return { githubRepo: null, error: null }
      }

      return { githubRepo: null, error: 'fake error' }
    })
  }
})

const selectedInstance = {
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
}

const loading = {
  loading: false,
  loadingHooks: [],
  redirect: false,
  redirectHooks: [],
  redirectFailure: false
}

const renderRegisterPage = (props = {}) => {
  const defaultProps = {
    getOneCI: vi.fn(),
    selectedInstance,
    loading,
    resetLoading: vi.fn(),
    courseId: '10012',
    coursePage: { data: null },
    createStudentCourses: vi.fn(),
    updateStudentProjectInfo: vi.fn(),
    addRedirectHook: vi.fn(),
    coursePageInformation: vi.fn()
  }

  const componentProps = { ...defaultProps, ...props }

  return render(
    <MemoryRouter>
      <RegisterPage {...componentProps} />
    </MemoryRouter>
  )
}

describe('<Register />', () => {
  describe('RegisterPage Component', () => {
    it('matches the rendered snapshot', () => {
      const { asFragment } = renderRegisterPage()

      expect(asFragment()).toMatchSnapshot()
    })

    it('renders the registration form', () => {
      renderRegisterPage()

      expect(
        screen.getByRole('heading', {
          name: `Register for ${selectedInstance.name}`
        })
      ).toBeInTheDocument()
      expect(screen.getByPlaceholderText('MyProjectName')).toHaveAttribute('name', 'projectName')
      expect(screen.getByDisplayValue('https://github.com')).toHaveAttribute('name', 'github')
      expect(screen.getByRole('button', { name: /submit/i })).toBeInTheDocument()
      expect(screen.getByRole('link', { name: /cancel/i })).toHaveAttribute(
        'href',
        `/labtool/courses/${selectedInstance.ohid}`
      )
    })

    it('renders a warning if the GitHub repository does not exist', async () => {
      const user = userEvent.setup()
      renderRegisterPage()

      const githubLinkInput = screen.getByDisplayValue('https://github.com')
      await user.clear(githubLinkInput)
      await user.type(githubLinkInput, 'https://github.com/invalid_repo')

      expect(
        await screen.findByText(/your github repository either is private or it does not exist/i)
      ).toBeInTheDocument()
    })
  })
})
