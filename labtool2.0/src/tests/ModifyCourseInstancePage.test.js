import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Provider } from 'react-redux'
import { createStore } from 'redux'
import { MemoryRouter } from 'react-router-dom'
import { vi } from 'vitest'
import { ModifyCourseInstancePage } from '../components/pages/ModifyCourseInstancePage'

describe('<ModifyCourseInstancePage />', () => {
  const courseData = {
    id: 1,
    name: 'Aineopintojen harjoitustyö: Tietokantasovellus (periodi IV)',
    start: '2018-03-11T21:00:00.000Z',
    end: '2018-03-11T21:00:00.000Z',
    active: true,
    weekAmount: 7,
    weekMaxPoints: 2,
    currentWeek: 1,
    ohid: 'TKT20011.2018.K.A.1',
    currentCodeReview: [1],
    amountOfCodeReviews: 2,
    finalReview: false,
    finalReviewHasPoints: false,
    coursesPage: null,
    courseMaterial: null
  }

  const loading = {
    loading: false,
    loadingHooks: [],
    redirect: false,
    redirectHooks: [],
    redirectFailure: false
  }

  const codeReviewLabels = [
    { value: 1, text: 'Code Review 1' },
    { value: 2, text: 'Code Review 2' }
  ]

  const renderPage = (props = {}) => {
    const defaultProps = {
      codeReviewLabels,
      getOneCI: vi.fn(),
      clearNotifications: vi.fn(),
      loading,
      resetLoading: vi.fn(),
      selectedInstance: courseData,
      courseId: '',
      notification: {},
      redirect: {},
      modifyOneCI: vi.fn(),
      changeCourseField: vi.fn(),
      addRedirectHook: vi.fn(),
      setFinalReview: vi.fn(),
      setFinalReviewHasPoints: vi.fn(),
      forceRedirect: vi.fn(),
      showNotification: vi.fn(),
      getAllCI: vi.fn(),
      coursePageInformation: vi.fn(),
      copyInformationFromCourse: vi.fn()
    }
    const componentProps = { ...defaultProps, ...props }
    const store = createStore(() => ({ selectedInstance: componentProps.selectedInstance }))
    const view = render(
      <Provider store={store}>
        <MemoryRouter>
          <ModifyCourseInstancePage {...componentProps} />
        </MemoryRouter>
      </Provider>
    )

    return { ...view, props: componentProps }
  }

  it('renders the course editing form', () => {
    renderPage()

    expect(screen.getByRole('heading', { name: `Edit course: ${courseData.name}` })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument()
  })

  it('matches the rendered snapshot', () => {
    renderPage()
    const form = screen.getByRole('button', { name: 'Save' }).closest('form')

    expect(form).toMatchSnapshot()
  })

  it('shows the current weekly amount and maximum points', () => {
    renderPage()

    expect(screen.getByText('Week amount')).toBeInTheDocument()
    expect(screen.getByText('Default maximum week points')).toBeInTheDocument()
    expect(screen.getAllByRole('spinbutton').map(input => input.value)).toEqual(['7', '2'])
  })

  it('shows the current week', () => {
    renderPage()

    expect(screen.getByText('Current week')).toBeInTheDocument()
    expect(screen.getByRole('listbox')).toHaveTextContent('Week 1')
  })

  it('shows and updates the code review selections', async () => {
    const user = userEvent.setup()
    renderPage()

    expect(screen.getByText('Visible code reviews')).toBeInTheDocument()
    expect(screen.getByText('Code Review 1')).toBeInTheDocument()
    expect(screen.getByText('Code Review 2')).toBeInTheDocument()

    const checkboxes = screen.getAllByRole('checkbox')
    expect(checkboxes[0]).toBeChecked()
    expect(checkboxes[1]).not.toBeChecked()

    await user.click(checkboxes[1])

    expect(checkboxes[1]).toBeChecked()
  })

  it('shows active course registration', () => {
    renderPage()

    expect(screen.getByText('Course registration is active')).toBeInTheDocument()
    expect(screen.getAllByRole('checkbox').at(-1)).toBeChecked()
  })
})
