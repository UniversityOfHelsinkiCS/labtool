import React from 'react'
import { CreateChecklist } from '../components/pages/CreateChecklist'
import { shallow } from 'enzyme'

describe('<CreateChecklist /> component', () => {
  let wrapper
  let fnCalls

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
  const checklist = {
    string: '{}',
    data: {}
  }

  let mockFn = jest.fn()

  beforeEach(() => {
    fnCalls = {
      submit: 0,
      load: 0
    }
    wrapper = shallow(
      <CreateChecklist
        courseId={coursePage.ohid}
        selectedInstance={coursePage}
        checklist={checklist}
        showNotification={mockFn}
        createChecklist={mockFn}
        getOneCI={mockFn}
        getOneChecklist={mockFn}
        resetChecklist={mockFn}
        changeString={mockFn}
      />
    )
  })

  it('renders without error', () => {
    expect(wrapper.find('.CreateChecklist').exists()).toEqual(true)
  })

  describe('Text area', () => {
    it('autofills text area', () => {
      const textArea = wrapper.find('.checklistJSONInput')
      expect(textArea.prop('value')).toEqual(checklist.string)
    })
  })

  // It turns out there's no way of testing form functionality in shallow rendering.
  // https://github.com/airbnb/enzyme/issues/308
})
