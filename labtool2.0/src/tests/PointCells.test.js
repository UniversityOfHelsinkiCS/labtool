import React from 'react'
import { shallow } from 'enzyme'
import { PointCells } from '../components/StudentTable/PointCells'

describe('<PointCells />', () => {
  const gradedWeek = p => ({ points: p })
  const emptyWeek = () => ({ points: null })

  const studentData = {
    id: 10031,
    github: 'http://github.com/superprojekti',
    projectName: 'Tira super projekti',
    createdAt: '2018-03-26T00:00:00.000Z',
    updatedAt: '2018-06-05T07:12:28.603Z',
    courseInstanceId: 10011,
    userId: 10031,
    teacherInstanceId: 10011,
    weeks: [gradedWeek(3), emptyWeek(), emptyWeek(), emptyWeek(), emptyWeek(), emptyWeek(), emptyWeek(), emptyWeek()],
    codeReviews: [{ linkToReview: 'https://github.com/example/example/issues/1', points: null, reviewNumber: 1 }],
    weekdrafts: [{ weekNumber: 2 }],
    validRegistration: true,
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
    },
    Tags: [
      {
        id: 20008,
        name: 'DROPPED',
        color: 'grey'
      },
      {
        id: 20002,
        name: 'HTML',
        color: 'yellow'
      }
    ]
  }

  const studentDataWithCodeReview = {
    id: 10011,
    github: 'http://github.com/tiralabra1',
    projectName: 'Tiran labraprojekti',
    createdAt: '2018-03-26T00:00:00.000Z',
    updatedAt: '2018-03-26T00:00:00.000Z',
    courseInstanceId: 10011,
    userId: 10011,
    teacherInstanceId: 10011,
    weeks: [emptyWeek(), emptyWeek(), emptyWeek(), emptyWeek(), emptyWeek(), emptyWeek(), emptyWeek(), emptyWeek()],
    codeReviews: [{ linkToReview: null, points: null, reviewNumber: 1 }],
    weekdrafts: [],
    validRegistration: true,
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

  const selectedInstance = {
    id: 10011,
    finalReview: true,
    weekAmount: 8
  }

  let wrapper

  beforeEach(() => {
    wrapper = shallow(<PointCells studentData={studentData} selectedInstance={selectedInstance} />)
  })

  test('displays review button for unreviewed week', () => {
    wrapper.setProps({ selectedInstance: { ...selectedInstance, currentWeek: 4 } })
    expect(wrapper.find('.reviewButton').length).toEqual(1)
  })

  test('displays review button with pause icon for unreviewed week that has a draft', () => {
    wrapper.setProps({ selectedInstance: { ...selectedInstance, currentWeek: 2 } })
    expect(wrapper.find('.reviewDraftButton').length).toEqual(1)
  })

  test('displays review button for final review', () => {
    wrapper.setProps({ selectedInstance: { ...selectedInstance, finalReview: true, currentWeek: 8 } })
    expect(wrapper.find('.reviewButton').length).toEqual(1)
  })

  it('displays review button for active code review if student has submitted review and code review is unreviewed', () => {
    wrapper.setProps({ selectedInstance: { ...selectedInstance, currentCodeReview: [1], amountOfCodeReviews: 1 } })
    expect(wrapper.find('.codeReviewButton').length).toEqual(1)
  })

  it('displays hourglass icon for active code review if student has not submitted their review', () => {
    wrapper.setProps({ studentData: studentDataWithCodeReview, selectedInstance: { ...selectedInstance, currentCodeReview: [1], amountOfCodeReviews: 1 } })
    expect(wrapper.find('.codeReviewNotReady').length).toEqual(1)
  })
})
