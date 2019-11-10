import React from 'react'
import { BrowseReviews } from '../components/pages/BrowseReviews'
import { shallow } from 'enzyme'

describe('<BrowseReviews />', () => {
  let wrapper

  const currentCourseId = 10011
  const otherParticipationId = 10000

  const coursePage = {
    id: 10011,
    name: 'Aineopintojen harjoitustyö: Tietorakenteet ja algoritmit (periodi IV)',
    start: '2018-03-11T21:00:00.000Z',
    end: '2018-04-29T21:00:00.000Z',
    active: true,
    weekAmount: 7,
    weekMaxPoints: 3,
    currentWeek: 1,
    ohid: 'TKT20010.2018.K.A.1',
    teacherInstances: [
      {
        id: 10001,
        instructor: false,
        userId: 10010,
        courseInstanceId: 10011,
        firsts: 'Pää',
        lastname: 'Opettaja'
      },
      {
        id: 10011,
        instructor: true,
        userId: 10015,
        courseInstanceId: 10011,
        firsts: 'Ossi Ohjaaja',
        lastname: 'Mutikainen'
      }
    ]
  }

  const courseData = {
    role: 'teacher',
    data: [
      {
        id: 10012,
        github: 'http://github.com/tiralabra2',
        projectName: 'Tiran toinen labraprojekti',
        dropped: false,
        createdAt: '2018-03-26T00:00:00.000Z',
        updatedAt: '2018-03-26T00:00:00.000Z',
        courseInstanceId: 10011,
        userId: 10012,
        teacherInstanceId: 10011,
        weeks: [],
        User: {
          id: 10012,
          username: 'tiraopiskelija2',
          email: 'johan.studerande@helsinki.invalid',
          firsts: 'Johan Wilhelm',
          lastname: 'Studerande',
          studentNumber: '014553242',
          teacher: false,
          sysop: false,
          createdAt: '2018-03-26T00:00:00.000Z',
          updatedAt: '2018-03-26T00:00:00.000Z'
        }
      },
      {
        id: 10031,
        github: 'http://github.com/superprojekti',
        projectName: 'Tira super projekti',
        dropped: false,
        createdAt: '2018-03-26T00:00:00.000Z',
        updatedAt: '2018-06-05T07:12:28.603Z',
        courseInstanceId: 10011,
        userId: 10031,
        teacherInstanceId: 10011,
        weeks: [],
        User: {
          id: 10031,
          username: 'superopiskelija',
          email: 'teras.henkilo@helsinki.invalid',
          firsts: 'Teräs',
          lastname: 'Henkilö',
          studentNumber: '014666666',
          teacher: false,
          sysop: false,
          createdAt: '2018-03-26T00:00:00.000Z',
          updatedAt: '2018-03-26T00:00:00.000Z'
        }
      },
      {
        id: 10011,
        github: 'http://github.com/tiralabra1',
        projectName: 'Tiran labraprojekti',
        dropped: false,
        createdAt: '2018-03-26T00:00:00.000Z',
        updatedAt: '2018-03-26T00:00:00.000Z',
        courseInstanceId: 10011,
        userId: 10011,
        teacherInstanceId: 10011,
        weeks: [
          {
            id: 10002,
            points: 2,
            weekNumber: 2,
            feedback: 'Melko hienoa työtä!',
            instructorNotes: 'READMEssa ongelmia',
            createdAt: '2018-03-26T00:00:00.000Z',
            updatedAt: '2018-03-26T00:00:00.000Z',
            studentInstanceId: 10011,
            comments: []
          },
          {
            id: 10001,
            points: 3,
            weekNumber: 1,
            feedback: 'Hienoa työtä!',
            instructorNotes: '',
            createdAt: '2018-03-26T00:00:00.000Z',
            updatedAt: '2018-03-26T00:00:00.000Z',
            studentInstanceId: 10011,
            comments: []
          },
          {
            id: 10003,
            points: 3,
            weekNumber: 3,
            feedback: 'Erittäin hienoa työtä!',
            instructorNotes: '',
            createdAt: '2018-03-26T00:00:00.000Z',
            updatedAt: '2018-03-26T00:00:00.000Z',
            studentInstanceId: 10011,
            comments: []
          },
          {
            id: 10004,
            points: 3,
            weekNumber: 4,
            feedback: 'Hyvin menee!',
            instructorNotes: '',
            createdAt: '2018-03-26T00:00:00.000Z',
            updatedAt: '2018-03-26T00:00:00.000Z',
            studentInstanceId: 10011,
            comments: []
          }
        ],
        codeReviews: [
          {
            id: 272,
            points: null,
            revieweNumber: 1,
            linkToReview: 'https:github.com/toReview/repo/pull/1',
            repoToReview: null,
            studentInstanceId: 10011,
            toReview: 10031
          },
          {
            d: 273,
            points: null,
            revieweNumber: 2,
            linkToReview: null,
            repoToReview: 'https://github.com/userName/arbitraryRepo',
            studentInstanceId: 10011,
            toReview: null
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
        }
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

  let mockFn = jest.fn()

  let mockUpdateStudentProjectInfo

  const studentWithoutPreviousParticipation = [coursePage]

  const studentInstanceId = '10011'

  const teacherCourses = [
    {
      id: otherParticipationId
    },
    {
      id: currentCourseId
    }
  ]

  beforeEach(() => {
    mockUpdateStudentProjectInfo = jest.fn()

    wrapper = shallow(
      <BrowseReviews
        getOneCI={mockFn}
        coursePageInformation={mockFn}
        getCoursesByStudentId={mockFn}
        updateStudentProjectInfo={mockUpdateStudentProjectInfo}
        courseData={courseData}
        selectedInstance={coursePage}
        studentInstanceToBeReviewed={studentWithoutPreviousParticipation}
        teacherInstance={teacherCourses}
        getAllTeacherCourses={mockFn}
        courseId={coursePage.ohid}
        studentInstance={studentInstanceId} //studentInstance id which was chosen randomly from courseData
        loading={loading}
        resetLoading={mockFn}
        initialLoading={false}
        user={{}}
        createOneComment={mockFn}
        gradeCodeReview={mockFn}
        sendEmail={mockFn}
      />
    )
  })

  describe('BrowseReviews Component', () => {
    it('is ok', () => {
      true
    })

    it('should render without throwing an error', () => {
      expect(wrapper.find('.BrowseReviews').exists()).toEqual(true)
    })

    it('should render correctly', () => {
      expect(wrapper).toMatchSnapshot()
    })

    describe('student card', () => {
      it('should render student card', () => {
        expect(wrapper.find('StudentCard').exists()).toEqual(true)
      })
      it('when student participates the course first time', () => {
        wrapper = wrapper.find('StudentCard').dive()
        expect(wrapper.find('.noOther').text()).toEqual('Has no other participation in this course')
      })
      describe('when student participate other instances of the course', () => {
        const studentWithOtherParticipation = [
          {
            ...coursePage,
            id: otherParticipationId,
            name: 'Aineopintojen harjoitustyö: Tietorakenteet ja algoritmit',
            start: '2017-03-11T21:00:00.000Z',
            end: '2017-04-29T21:00:00.000Z',
            active: false,
            ohid: 'TKT20010.2017.K.A.1',
            courseInstances: [{ id: 1, validRegistration: true }]
          },
          {
            ...coursePage,
            courseInstances: [{ id: 10011, validRegistration: true }]
          }
        ]
        beforeEach(() => {
          wrapper.setProps({ studentInstanceToBeReviewed: studentWithOtherParticipation, studentInstanceId: '10011' })
          wrapper = wrapper.find('StudentCard').dive()
        })

        it('Teacher has access to other participation', () => {
          expect(wrapper.find('.hasOther').text()).toContain('Has taken this course in other periods')
          const popup = wrapper
            .find('.hasOther')
            .find('Link')
            .find('Popup')
          expect(popup.props()).toHaveProperty('trigger', <p>TKT20010 2016-2017 P.IV</p>)
        })

        it('Teacher has no access to other participation', () => {
          wrapper.setProps({ teacherInstance: [{ id: currentCourseId }] })
          expect(
            wrapper
              .find('.hasOther')
              .find('Link')
              .exists()
          ).toBeFalsy()
          expect(
            wrapper
              .find('.hasOther')
              .find('.noAccess')
              .text()
          ).toContain('TKT20010 2016-2017 P.IV')
        })
      })
      it('student can be marked as dropped and non-dropped', () => {
        wrapper = wrapper.find('StudentCard').dive()
        wrapper.find({ children: 'Mark as dropped' }).simulate('click')

        expect(mockUpdateStudentProjectInfo).toBeCalledWith(expect.objectContaining({ dropped: true }))
      })
      it('students course registration can be marked as valid and invalid', () => {
        wrapper = wrapper.find('StudentCard').dive()
        //wrapper.find({ children: 'Mark registration as valid' }).simulate('click')
        shallow(wrapper.find('Popup').prop('trigger')).dive().find('#buttonInvalidRegistration').simulate('click')

        expect(mockUpdateStudentProjectInfo).toBeCalledWith(expect.objectContaining({ validRegistration: true }))
      })
    })
  })
})
