import React from 'react'
import { WeekReviews } from '../components/WeekReviews'
import { shallow } from 'enzyme'

describe('<WeekReviews /> as student', () => {
  let wrapper

  const coursePage = {
    role: 'student',
    data: {
      id: 10011,
      github: 'http://github.com/tiralabra1',
      projectName: 'Tiran labraprojekti',
      createdAt: '2018-03-26T00:00:00.000Z',
      updatedAt: '2018-03-26T00:00:00.000Z',
      courseInstanceId: 10011,
      userId: 10011,
      teacherInstanceId: 10011,
      weeks: [],
      codeReviews: [
        {
          toReview: {
            github: 'http://github.com/tiralabra2',
            projectName: 'Tiran toinen labraprojekti'
          },
          repoToReview: null,
          reviewNumber: 1,
          points: 2.0
        },
        {
          toReview: {
            github: 'http://github.com/superprojekti',
            projectName: 'Tira super projekti'
          },
          repoToReview: null,
          reviewNumber: 2,
          points: 1.0
        },
        {
          toReview: {
            github: null,
            projectName: null
          },
          repoToReview: 'https://github.com/userName/arbitraryRepo',
          reviewNumber: 3,
          points: null
        }
      ],
      User: {
        id: 10011,
        username: 'tiraopiskelija1',
        email: 'maarit.opiskelija@helsinki.invalid',
        firsts: 'Maarit Mirja',
        lastname: 'Opiskelija',
        studentNumber: '014578343',
        teacher: false,
        sysop: false,
        createdAt: '2018-03-26T00:00:00.000Z',
        updatedAt: '2018-03-26T00:00:00.000Z'
      },
      Tags: []
    }
  }

  const coursePageLogic = {
    showDropdown: '',
    selectedTeacher: '',
    filterByAssistant: 0,
    filterByTag: [],
    showCodeReviews: [2]
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
      <WeekReviews
        student={coursePage.data}
        getOneCI={mockFn}
        changeCourseField={mockFn}
        courseData={coursePage}
        coursePageInformation={mockFn}
        associateTeacherToStudent={mockFn}
        selectedInstance={coursePage}
        coursePageLogic={coursePageLogic}
        filterByTag={mockFn}
        getAllTags={mockFn}
        courseReset={mockFn}
        loading={loading}
        resetLoading={mockFn}
        courseId={''}
        user={{}}
        createOneComment={mockFn}
        addLinkToCodeReview={mockFn}
        coursePageReset={mockFn}
        toggleCodeReview={mockFn}
        sendEmail={mockFn}
        updateStudentProjectInfo={mockFn}
        selectTag={mockFn}
        selectTeacher={mockFn}
        modifyOneCI={mockFn}
        studentInstance={''}
        gradeCodeReview={mockFn}
        updateActiveIndex={mockFn}
      />
    )
  })

  describe('WeekReviews Component', () => {
    it('is ok', () => {
      true
    })

    it('should render correctly', () => {
      expect(wrapper).toMatchSnapshot()
    })

    it('renders code review cards', () => {
      expect(wrapper.find('WeekReviewCodeReview').length).toEqual(coursePage.data.codeReviews.length)
    })
  })
})
