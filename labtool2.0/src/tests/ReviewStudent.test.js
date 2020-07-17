import React from 'react'
import { ReviewStudent } from '../components/pages/ReviewStudent'
import { shallow } from 'enzyme'

describe('<ReviewStudent />', () => {
  let wrapper

  const ownProps = {
    courseId: 'TKT20010.2018.K.A.1',
    studentInstance: '10011',
    weekNumber: '1'
  }

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
      finalReviewHasPoints: true,
      ohid: 'TKT20010.2018.K.A.1',
      checklists: [
        {
          id: 10002,
          week: 2,
          list: {},
          courseName: 'Aineopintojen harjoitustyö: Tietorakenteet ja algoritmit',
          master: false,
          createdAt: '2018-03-26T00:00:00.000Z',
          updatedAt: '2018-03-26T00:00:00.000Z',
          courseInstanceId: 10011
        },
        {
          id: 10003,
          week: 1,
          list: {
            Koodi: [
              {
                id: 1,
                name: 'Koodin laatu',
                points: 2,
                textWhenOn: 'Koodi tehty laadukkaasti ja sisältää kommentteja',
                textWhenOff: 'Koodin laadussa parantamisen varaa',
                prerequisite: null
              }
            ],
            Algoritmit: [
              {
                id: 2,
                name: 'Algoritmin runko',
                points: 2,
                textWhenOn: 'Algoritmin runko luotu',
                textWhenOff: 'Algoritmin runko puuttuu',
                prerequisite: null
              },
              {
                id: 3,
                name: 'Tietorakenteita luotu',
                points: 2,
                textWhenOn: 'Tietorakenteita luotu',
                textWhenOff: 'Tietorakenteita ei ole luotu',
                prerequisite: null
              }
            ],
            Dokumentaatio: [
              {
                id: 4,
                name: 'Readme',
                points: 1,
                textWhenOn: 'README kunnossa',
                textWhenOff: 'README puuttuu',
                prerequisite: null
              },
              {
                id: 5,
                name: 'Tuntikirjanpito',
                points: 1,
                textWhenOn: 'Tuntikirjanpito täytetty oikein',
                textWhenOff: 'Tuntikirjanpito puuttuu',
                prerequisite: null
              }
            ],
            README: [
              {
                id: 6,
                name: 'Readme sisältää linkkejä',
                points: 1,
                textWhenOn: 'README:ssa on tarvittavat linkit',
                textWhenOff: 'README:sta puuttuu linkit',
                prerequisite: 4
              }
            ]
          },
          courseName: 'Aineopintojen harjoitustyö: Tietorakenteet ja algoritmit',
          master: false,
          maxPoints: 4,
          createdAt: '2018-03-26T00:00:00.000Z',
          updatedAt: '2018-03-26T00:00:00.000Z',
          courseInstanceId: 10011
        }
      ],
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
    studentInstance: 10011,
    coursePage: {
      role: 'teacher',
      data: [
        {
          id: 10012,
          github: 'http://github.com/tiralabra2',
          projectName: 'Tiran toinen labraprojekti',
          createdAt: '2018-03-26T00:00:00.000Z',
          updatedAt: '2018-03-26T00:00:00.000Z',
          courseInstanceId: 10011,
          userId: 10012,
          teacherInstanceId: 10011,
          weeks: [],
          codeReviews: [],
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
          createdAt: '2018-03-26T00:00:00.000Z',
          updatedAt: '2018-06-05T07:12:28.603Z',
          courseInstanceId: 10011,
          userId: 10031,
          teacherInstanceId: 10011,
          weeks: [],
          codeReviews: [],
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
    },
    weekReview: {
      data: [
        {
          id: 10031,
          github: 'http://github.com/superprojekti',
          projectName: 'Tira super projekti',
          courseInstanceId: 10011,
          userId: 10031,
          teacherInstanceId: 10001,
          weeks: [
            {
              id: 1,
              points: 0,
              weekNumber: 1,
              feedback: 'Koodin laadussa parantamisen varaa\n\nAlgoritmin runko puuttuu\n\nTietorakenteita ei ole luotu\n\nREADME puuttuu\n\nTuntikirjanpito puuttuu\n\n',
              notified: false,
              checks: {
                'Algoritmin runko': true,
                'Tietorakenteita luotu': true,
                'Koodin laatu': true
              },
              studentInstanceId: 10031,
              comments: []
            }
          ],
          codeReviews: [
            {
              id: 10003,
              points: null,
              reviewNumber: 1,
              linkToReview: null,
              studentInstanceId: 10031,
              toReview: 10011
            },
            {
              id: 10008,
              points: null,
              reviewNumber: 2,
              linkToReview: null,
              studentInstanceId: 10031,
              toReview: 10012
            }
          ],
          User: {
            id: 10031,
            username: 'superopiskelija',
            email: 'teras.henkilo@helsinki.invalid',
            firsts: 'Teräs',
            lastname: 'Henkilö',
            studentNumber: '014666666',
            teacher: false,
            sysop: false
          },
          Tags: [
            {
              id: 20007,
              name: 'FORTRAN',
              color: 'pink',
              courseInstanceId: null,
              StudentTag: {
                id: 30007,
                studentInstanceId: 10031,
                tagId: 20007,
                createdAt: '2018-06-13T00:00:00.000Z',
                updatedAt: '2018-06-13T00:00:00.000Z'
              }
            }
          ]
        },
        {
          id: 10011,
          github: 'http://github.com/tiraopi1/tiralabra1',
          projectName: 'Tiran labraprojekti',
          courseInstanceId: 10011,
          userId: 10011,
          teacherInstanceId: 10011,
          weeks: [
            {
              id: 10002,
              points: 2,
              weekNumber: 2,
              feedback: 'Melko hienoa työtä!',
              notified: false,
              checks: {},
              studentInstanceId: 10011,
              comments: []
            },
            {
              id: 10001,
              points: 3,
              weekNumber: 1,
              feedback: 'Hienoa työtä!',
              notified: false,
              checks: {},
              studentInstanceId: 10011,
              comments: []
            },
            {
              id: 10003,
              points: 3,
              weekNumber: 3,
              feedback: 'Erittäin hienoa työtä!',
              notified: false,
              checks: {},
              studentInstanceId: 10011,
              comments: []
            },
            {
              id: 10004,
              points: 3,
              weekNumber: 4,
              feedback: 'Hyvin menee!',
              notified: false,
              checks: {},
              studentInstanceId: 10011,
              comments: []
            }
          ],
          codeReviews: [
            {
              id: 10001,
              points: null,
              reviewNumber: 1,
              linkToReview: null,
              studentInstanceId: 10011,
              toReview: 10012
            },
            {
              id: 10007,
              points: null,
              reviewNumber: 2,
              linkToReview: null,
              studentInstanceId: 10011,
              toReview: 10031
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
            sysop: false
          },
          Tags: [
            {
              id: 20003,
              name: 'game',
              color: 'black',
              courseInstanceId: null,
              StudentTag: {
                id: 30003,
                studentInstanceId: 10011,
                tagId: 20003,
                createdAt: '2018-06-13T00:00:00.000Z',
                updatedAt: '2018-06-13T00:00:00.000Z'
              }
            },
            {
              id: 20002,
              name: 'HTML',
              color: 'yellow',
              courseInstanceId: null,
              StudentTag: {
                id: 30002,
                studentInstanceId: 10011,
                tagId: 20002,
                createdAt: '2018-06-13T00:00:00.000Z',
                updatedAt: '2018-06-13T00:00:00.000Z'
              }
            },
            {
              id: 20001,
              name: 'Javascript',
              color: 'red',
              courseInstanceId: null,
              StudentTag: {
                id: 30001,
                studentInstanceId: 10011,
                tagId: 20001,
                createdAt: '2018-06-13T00:00:00.000Z',
                updatedAt: '2018-06-13T00:00:00.000Z'
              }
            }
          ]
        },
        {
          id: 10012,
          github: 'http://github.com/tiraopi2/tiralabra2',
          projectName: 'Tiran toinen labraprojekti',
          courseInstanceId: 10011,
          userId: 10012,
          teacherInstanceId: 10011,
          weeks: [],
          codeReviews: [
            {
              id: 10002,
              points: null,
              reviewNumber: 1,
              linkToReview: null,
              studentInstanceId: 10012,
              toReview: 10031
            },
            {
              id: 10009,
              points: null,
              reviewNumber: 2,
              linkToReview: null,
              studentInstanceId: 10012,
              toReview: 10011
            }
          ],
          User: {
            id: 10012,
            username: 'tiraopiskelija2',
            email: 'johan.studerande@helsinki.invalid',
            firsts: 'Johan Wilhelm',
            lastname: 'Studerande',
            studentNumber: '014553242',
            teacher: false,
            sysop: false
          },
          Tags: [
            {
              id: 20005,
              name: 'Node.js',
              color: 'blue',
              courseInstanceId: null,
              StudentTag: {
                id: 30005,
                studentInstanceId: 10012,
                tagId: 20005,
                createdAt: '2018-06-13T00:00:00.000Z',
                updatedAt: '2018-06-13T00:00:00.000Z'
              }
            },
            {
              id: 20001,
              name: 'Javascript',
              color: 'red',
              courseInstanceId: null,
              StudentTag: {
                id: 30004,
                studentInstanceId: 10012,
                tagId: 20001,
                createdAt: '2018-06-13T00:00:00.000Z',
                updatedAt: '2018-06-13T00:00:00.000Z'
              }
            }
          ]
        }
      ],
      checks: {}
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
      <ReviewStudent
        getOneCI={mockFn}
        clearNotifications={mockFn}
        getWeekDraft={mockFn}
        courseData={props.coursePage}
        ownProps={ownProps}
        selectedInstance={props.selectedInstance}
        weekReview={props.weekReview}
        loading={props.loading}
        resetLoading={mockFn}
        coursePageInformation={mockFn}
        courseId={''}
        studentInstance={''}
        weekNumber={''}
        notification={{}}
        createOneWeek={mockFn}
        saveWeekDraft={mockFn}
        toggleCheckWeek={mockFn}
        initChecks={mockFn}
        restoreChecks={mockFn}
        resetChecklist={mockFn}
        addRedirectHook={mockFn}
        verifyCheckPrerequisites={mockFn}
        {...ownProps}
      />
    )
  })

  describe('ReviewStudent Component', () => {
    it('is ok', () => {
      true
    })

    it('should render without throwing an error', () => {
      expect(wrapper.find('.ReviewStudent').exists()).toEqual(true)
    })

    it('should render correctly', () => {
      expect(wrapper).toMatchSnapshot()
    })

    it('should render maximum points correctly', () => {
      const maxPoints = props.selectedInstance.checklists.find(cl => cl.week === props.selectedInstance.currentWeek).maxPoints
      expect(wrapper.find('.showMaxPoints').text()).toEqual('Points 0-' + maxPoints)
    })

    describe('Checklist', () => {
      it('renders a checklist', () => {
        expect(wrapper.find('ReviewStudentChecklist').exists()).toEqual(true)
      })

      it('renders a card for each checklist topic', () => {
        const cl = props.selectedInstance.checklists.find(cl => cl.week === props.selectedInstance.currentWeek).list
        const expected = Object.keys(cl).filter(cat => cl[cat].some(clItem => clItem.prerequisite === null)).length
        expect(
          wrapper
            .find('ReviewStudentChecklist')
            .dive()
            .find('.checklistCard').length
        ).toEqual(expected)
      })

      it('renders a row for each checklist item', () => {
        let expected = 0
        const checklist = props.selectedInstance.checklists.find(cl => cl.week === props.selectedInstance.currentWeek).list
        Object.keys(checklist).forEach(key => {
          expected += checklist[key].filter(clItem => clItem.prerequisite === null).length
        })
        expect(
          wrapper
            .find('ReviewStudentChecklist')
            .dive()
            .find('.checklistCardRow').length
        ).toEqual(expected)
      })
    })
  })
})
