import React from 'react'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Provider } from 'react-redux'
import { createStore } from 'redux'
import { MemoryRouter } from 'react-router-dom'
import { vi } from 'vitest'
import { courseSettings } from '../reducers/selectedInstanceReducer'
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
      setFinalReviewVisible: vi.fn(),
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
    // the first of the course's checkboxes, after the code review selections
    const registration = screen.getByText('Course registration is active').closest('.checkbox')
    expect(registration.querySelector('input')).toBeChecked()
    const labels = [...document.querySelectorAll('.ui.checkbox label')].map(label => label.textContent)
    expect(labels.slice(-3)).toEqual([
      'Course registration is active',
      'Course has a final review',
      'Points are given for final review'
    ])
  })

  describe('showing the final review to students', () => {
    const toggle = () => document.querySelector('.finalReviewVisibility .ui.toggle.checkbox')
    const confirmDialog = () => document.querySelector('.finalReviewVisibilityConfirm')

    it('is not shown without a final review', () => {
      renderPage()
      expect(screen.queryByText('Show final review results to students')).toBeNull()
    })

    it('is a toggle that is off by default and says the results are hidden', () => {
      renderPage({ selectedInstance: { ...courseData, finalReview: true } })
      expect(toggle().querySelector('input')).not.toBeChecked()
      expect(document.querySelector('.finalReviewVisibilityStatus')).toHaveTextContent(
        'Final review results are hidden from students.'
      )
    })

    it('asks for confirmation before showing the results', async () => {
      const user = userEvent.setup()
      const { props } = renderPage({
        selectedInstance: { ...courseData, finalReview: true, finalReviewVisible: false }
      })

      await user.click(toggle())
      expect(confirmDialog()).toHaveTextContent('Show final review results to students?')
      expect(props.setFinalReviewVisible).not.toHaveBeenCalled()
      await user.click(within(confirmDialog()).getByRole('button', { name: 'Show to students' }))
      expect(props.setFinalReviewVisible).toHaveBeenCalledWith(true)
      expect(confirmDialog()).toBeNull()
    })

    it('changes nothing when the confirmation is cancelled', async () => {
      const user = userEvent.setup()
      const { props } = renderPage({
        selectedInstance: { ...courseData, finalReview: true, finalReviewVisible: true }
      })
      expect(toggle().querySelector('input')).toBeChecked()

      await user.click(toggle())
      expect(confirmDialog()).toHaveTextContent('Hide final review results?')
      await user.click(within(confirmDialog()).getByRole('button', { name: 'Cancel' }))
      expect(props.setFinalReviewVisible).not.toHaveBeenCalled()
    })
  })

  describe('Save and Cancel', () => {
    // as loaded from the server; the form then shows the course with the given changes
    const editedCourse = changes => ({ ...courseData, savedSettings: courseSettings(courseData), ...changes })
    const save = () => screen.getByRole('button', { name: 'Save' })
    const cancel = () => screen.getByRole('button', { name: 'Cancel' })

    it('are disabled while nothing has changed', () => {
      renderPage({ selectedInstance: editedCourse({}) })
      expect(save()).toBeDisabled()
      expect(cancel()).toBeDisabled()
      expect(cancel().closest('a')).toBeNull()
    })

    it('are disabled when a change is undone, e.g. a number typed back as text', () => {
      renderPage({ selectedInstance: editedCourse({ weekAmount: String(courseData.weekAmount) }) })
      expect(save()).toBeDisabled()
    })

    it('are enabled after a change, and Save saves it', async () => {
      const user = userEvent.setup()
      const { props } = renderPage({
        selectedInstance: editedCourse({ finalReview: true, finalReviewVisible: true })
      })
      expect(save()).toBeEnabled()
      expect(cancel()).toBeEnabled()
      expect(cancel().closest('a')).toHaveAttribute('href', `/labtool/courses/${courseData.ohid}`)

      await user.click(save())
      expect(props.modifyOneCI).toHaveBeenCalledWith(
        expect.objectContaining({ finalReview: true, finalReviewVisible: true }),
        courseData.ohid
      )
    })

    it('are enabled after changing the visible code reviews', async () => {
      const user = userEvent.setup()
      renderPage({ selectedInstance: editedCourse({}) })
      expect(save()).toBeDisabled()
      await user.click(screen.getAllByRole('checkbox')[1])
      expect(save()).toBeEnabled()
    })
  })
})
