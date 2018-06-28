import React from 'react'
import { CreateChecklist } from '../components/pages/CreateChecklist'
import { shallow } from 'enzyme'

describe('<CreateChecklist /> component', () => {
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
  const checklist = {
    data: {
      Koodi: [
        {
          name: 'Koodin laatu',
          checkedPoints: 2,
          uncheckedPoints: 0,
          textWhenOn: 'Koodin laatu kiitettävää',
          textWhenOff: 'Koodin laadussa parantamisen varaa'
        }
      ],
      Repo: [
        {
          name: 'Readme kunnossa',
          checkedPoints: 0,
          uncheckedPoints: -1,
          textWhenOn: '',
          textWhenOff: 'Readmessa feelua'
        }
      ]
    }
  }

  let mockFn = jest.fn()

  beforeEach(() => {
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
        changeField={mockFn}
        addTopic={mockFn}
        addRow={mockFn}
        removeTopic={mockFn}
        removeRow={mockFn}
      />
    )
  })

  it('renders without error', () => {
    expect(wrapper.find('.CreateChecklist').exists()).toEqual(true)
  })

  describe('Editing form', () => {
    it('autofills text areas', () => {
      const textInputs = wrapper.find('.textField')
      Object.keys(checklist.data).forEach(key => {
        checklist.data[key].forEach(row => {
          let textWhenOnMatch = undefined
          let textWhenOffMatch = undefined
          textInputs.forEach(ti => {
            if (ti.prop('value') === row.textWhenOn) {
              textWhenOnMatch = ti
            }
            if (ti.prop('value') === row.textWhenOff) {
              textWhenOffMatch = ti
            }
          })
          expect(textWhenOnMatch).not.toBe(undefined)
          expect(textWhenOffMatch).not.toBe(undefined)
        })
      })
    })

    it('autofills point values', () => {
      const pointInputs = wrapper.find('.numberField')
      Object.keys(checklist.data).forEach(key => {
        checklist.data[key].forEach(row => {
          let checkedPointsMatch = undefined
          pointInputs.forEach(ti => {
            if (Number(ti.prop('value')) === row.checkedPoints) {
              checkedPointsMatch = ti
            }
          })
          expect(checkedPointsMatch).not.toBe(undefined)
        })
      })
    })
  })

  // It turns out there's no way of testing form functionality in shallow rendering.
  // https://github.com/airbnb/enzyme/issues/308
})
