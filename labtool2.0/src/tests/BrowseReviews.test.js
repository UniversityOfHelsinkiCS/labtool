import React from 'react'
import { BrowseReviews } from '../components/pages/BrowseReviews'
import { shallow } from 'enzyme'

describe('<BrowseReviews />', () => {
  let wrapper

  const coursePage = {
    id: 10011,
    name: 'Aineopintojen harjoitustyö: Tietorakenteet ja algoritmit',
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
        admin: true,
        userId: 10010,
        courseInstanceId: 10011,
        firsts: 'Pää',
        lastname: 'Opettaja'
      },
      {
        id: 10011,
        admin: true,
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
          email: 'johan.studerande@helsinki.fi',
          firsts: 'Johan Wilhelm',
          lastname: 'Studerande',
          studentNumber: '014553242',
          admin: false,
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
          email: 'teras.henkilo@helsinki.fi',
          firsts: 'Teräs',
          lastname: 'Henkilö',
          studentNumber: '014666666',
          admin: false,
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
        codeReviews: [],
        User: {
          id: 10011,
          username: 'tiraopiskelija1',
          email: 'maarit.opiskelija@helsinki.fi',
          firsts: 'Maarit Mirja',
          lastname: 'Opiskelija',
          studentNumber: '014578343',
          admin: false,
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
        expect(wrapper.find('.studentCard').exists()).toEqual(true)
      })
      it('when student participates the course first time', () => {
        expect(wrapper.find('.noPrevious').text()).toEqual('Has not taken part in this course before')
      })
      it('when student participate previous instances of the course', () => {
        const studentWithPreviousParticipation = [
          {
            ...coursePage,
            id: 10000,
            name: 'Aineopintojen harjoitustyö: Tietorakenteet ja algoritmit',
            start: '2017-03-11T21:00:00.000Z',
            end: '2017-04-29T21:00:00.000Z',
            active: false,
            ohid: 'TKT20010.2017.K.A.1',
            courseInstances: [{ id: 1 }]
          },
          {
            ...coursePage,
            courseInstances: [{ id: 10011 }]
          }
        ]
        wrapper = shallow(
          <BrowseReviews
            getOneCI={mockFn}
            coursePageInformation={mockFn}
            getCoursesByStudentId={mockFn}
            courseData={courseData}
            selectedInstance={coursePage}
            studentInstanceToBeReviewed={studentWithPreviousParticipation}
            courseId={coursePage.ohid}
            studentInstance={'10011'}
            loading={loading}
            resetLoading={mockFn}
            initialLoading={false}
            updateStudentProjectInfo={mockFn}
            user={{}}
            createOneComment={mockFn}
            gradeCodeReview={mockFn}
            sendEmail={mockFn}
          />
        )
        expect(wrapper.find('.hasPrevious').text()).toContain('Has taken this course before')
        const popup = wrapper
          .find('.hasPrevious')
          .find('Link')
          .find('Popup')
        expect(popup.props()).toHaveProperty('trigger', <p>TKT20010 16-17 4.period</p>)
      })
      it('student can be marked as dropped and non-dropped', () => {
        wrapper.find({ children: 'Mark as dropped' }).simulate('click')

        expect(mockUpdateStudentProjectInfo).toBeCalledWith(expect.objectContaining({ dropped: true }))
      })
    })
  })
})
