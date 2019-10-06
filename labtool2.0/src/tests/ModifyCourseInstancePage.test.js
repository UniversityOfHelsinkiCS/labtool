import React from 'react'
import { ModifyCourseInstancePage } from '../components/pages/ModifyCourseInstancePage'
import { shallow } from 'enzyme'
import { Popup, Dropdown, Checkbox } from 'semantic-ui-react'

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
    currentCodeReview: [1, 2],
    amountOfCodeReviews: 3
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
    wrapper = shallow(
      <ModifyCourseInstancePage
        codeReviewDropdowns={[{ value: 3, text: '3' }]}
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
      expect(wrapper.find('.form-control3').length).toEqual(1)
    })
    it('renders currently visible code reviews', () => {
      expect(
        wrapper
          .find(Popup)
          .at(0)
          .props().trigger.props.value
      ).toEqual(1)
      expect(
        wrapper
          .find(Popup)
          .at(1)
          .props().trigger.props.value
      ).toEqual(2)
    })

    it('renders dropdown to show currently not visible code reviews', () => {
      expect(wrapper.find(Dropdown).length).toEqual(1)
      expect(wrapper.find(Dropdown).props().options[0].text).toEqual('3')
    })
    it('renders active course checkbox', () => {
      const checkbox = wrapper.find(Checkbox).find({ name: 'courseActive' })

      expect(checkbox.prop('label')).toEqual('Activate course')
    })
  })
})
