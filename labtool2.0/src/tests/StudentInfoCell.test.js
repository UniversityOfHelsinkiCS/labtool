import React from 'react'
import { shallow } from 'enzyme'
import { StudentInfoCell } from '../components/StudentTable/StudentInfoCell'

describe('<StudentInfoCell />', () => {
  const studentData = {
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
    weekdrafts: [],
    validRegistration: true,
    dropped: false,
    Tags: [],
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
    },
    repoExists: false
  }

  let wrapper

  beforeEach(() => {
    wrapper = shallow(<StudentInfoCell studentData={studentData} ohid="test" />)
  })

  test('displays warning if repo is not accessible', () => {
    expect(wrapper.find('RepoAccessWarning').length).toEqual(1)
  })
})
