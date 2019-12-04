import React from 'react'
import { ModifyCourseInstancePage } from '../components/pages/ModifyCourseInstancePage'
import { shallow } from 'enzyme'
import { Checkbox } from 'semantic-ui-react'

describe('<ModifyCourseInstancePage />', () => {
  let wrapper

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
    amountOfCodeReviews: 2
  }

  const loading = {
    loading: false,
    loadingHooks: [],
    redirect: false,
    redirectHooks: [],
    redirectFailure: false
  }

  let mockFn = jest.fn()

  const codeReviewLabels = [{ value: 1, text: 'Code Review 1' }, { value: 2, text: 'Code Review 2' }]

  beforeEach(() => {
    wrapper = shallow(
      <ModifyCourseInstancePage
        codeReviewLabels={codeReviewLabels}
        getOneCI={mockFn}
        clearNotifications={mockFn}
        loading={loading}
        resetLoading={mockFn}
        selectedInstance={courseData}
        courseId={''}
        notification={{}}
        redirect={{}}
        modifyOneCI={mockFn}
        changeCourseField={mockFn}
        addRedirectHook={mockFn}
        setFinalReview={mockFn}
        setFinalReviewHasPoints={mockFn}
        forceRedirect={mockFn}
        showNotification={mockFn}
        getAllCI={mockFn}
        coursePageInformation={mockFn}
        copyInformationFromCourse={mockFn}
      />
    )
  })

  describe('Modify Instance Component', () => {
    it('is ok', () => {
      true
    })

    it('should render without throwing an error', () => {
      expect(wrapper.find('.CoursePage').exists()).toEqual(true)
    })

    it('should render correctly', () => {
      expect(wrapper).toMatchSnapshot()
    })

    it('renders weekly amount', () => {
      expect(wrapper.find('.form-control1').length).toEqual(1)
    })

    it('renders weekly maxpoints', () => {
      expect(wrapper.find('.form-control2').length).toEqual(1)
    })

    it('renders current week', () => {
      expect(wrapper.find('.weekDropdown').length).toEqual(1)
    })

    it('renders code review checkboxes', () => {
      expect(wrapper.find('.crCheckboxes').exists()).toEqual(true)
      const visibleCr = wrapper
        .find('.crCheckboxes')
        .find('.cr1')
        .find('CodeReviewCheckbox')
      expect(visibleCr.props().initialCheckState).toEqual(true)

      const hiddenCr = wrapper
        .find('.crCheckboxes')
        .find('.cr2')
        .find('CodeReviewCheckbox')
      expect(hiddenCr.props().initialCheckState).toEqual(false)
    })

    it('renders active course checkbox', () => {
      const checkbox = wrapper.find(Checkbox).find({ name: 'courseActive' })

      expect(checkbox.prop('label')).toEqual('Course registration is active')
    })
  })
})
