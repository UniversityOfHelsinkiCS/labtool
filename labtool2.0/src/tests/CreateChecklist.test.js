import React from 'react'
import { CreateChecklist } from '../components/pages/CreateChecklist'
import { shallow } from 'enzyme'

describe('<CreateChecklist /> component', () => {
  let wrapper

  const courseInstance = [
    {
      id: 10011,
      name: 'Aineopintojen harjoitustyö: Tietorakenteet ja algoritmit',
      start: '2018-03-11T21:00:00.000Z',
      end: '2018-04-29T21:00:00.000Z',
      active: true,
      weekAmount: 7,
      weekMaxPoints: 3,
      currentWeek: 1,
      ohid: 'TKT20010.2018.K.A.1',
      createdAt: '2018-03-26T00:00:00.000Z',
      updatedAt: '2018-03-26T00:00:00.000Z',
      europeanStart: '11.03.2018',
      europeanEnd: '29.04.2018',
      shorterId: 'TKT20010'
    },
    {
      id: 10012,
      name: 'Ohjelmistotekniikan menetelmät',
      start: '2018-03-11T21:00:00.000Z',
      end: '2018-04-29T21:00:00.000Z',
      active: true,
      weekAmount: 7,
      weekMaxPoints: 3,
      currentWeek: 1,
      ohid: 'TKT20002.2018.K.K.1',
      createdAt: '2018-03-26T00:00:00.000Z',
      updatedAt: '2018-03-26T00:00:00.000Z',
      europeanStart: '11.03.2018',
      europeanEnd: '29.04.2018',
      shorterId: 'TKT20002'
    },
    {
      id: 10013,
      name: 'Aineopintojen harjoitustyö: Tietokantasovellus',
      start: '2018-01-16T21:00:00.000Z',
      end: '2018-03-10T21:00:00.000Z',
      active: false,
      weekAmount: 5,
      weekMaxPoints: 3,
      currentWeek: 1,
      ohid: 'TKT20011.2018.K.A.1',
      createdAt: '2018-03-26T00:00:00.000Z',
      updatedAt: '2018-03-26T00:00:00.000Z',
      europeanStart: '16.01.2018',
      europeanEnd: '10.03.2018',
      shorterId: 'TKT20011'
    }
  ]

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

  const loading = {
    loading: false,
    loadingHooks: [],
    redirect: false,
    redirectHooks: [],
    redirectFailure: false
  }

  const weekChoice = 6

  let mockFn = jest.fn()

  beforeEach(() => {
    wrapper = shallow(
      <CreateChecklist
        courses={courseInstance}
        courseId={courseInstance[0].ohid}
        selectedInstance={courseInstance[0]}
        checklist={checklist}
        loading={loading}
        weekDropdowns={[]}
        showNotification={mockFn}
        resetLoading={mockFn}
        createChecklist={mockFn}
        getOneCI={mockFn}
        getOneChecklist={mockFn}
        resetChecklist={mockFn}
        changeField={mockFn}
        addTopic={mockFn}
        addRow={mockFn}
        removeTopic={mockFn}
        removeRow={mockFn}
        getAllCI={mockFn}
        castPointsToNumber={mockFn}
      />
    )
    wrapper.find('#weekDropdown').prop('onChange')(null, { value: weekChoice })
  })

  it('renders without error', () => {
    expect(wrapper.find('.CreateChecklist').exists()).toEqual(true)
  })

  it('should render correctly', () => {
    expect(wrapper).toMatchSnapshot()
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

    describe('Copying form', () => {
      it('Renders a copy form', () => {
        expect(wrapper.find('.copyForm').exists()).toEqual(true)
      })

      it('Renders appropriate options for week', () => {
        const options = wrapper.find('.courseDropdown').prop('options')
        expect(options.length).toEqual(courseInstance.filter(course => course.weekAmount >= weekChoice && course !== courseInstance[0]).length)
      })
    })

    describe('maximum points', () => {
      it('renders a maximum points card', () => {
        expect(wrapper.find('.maxPointsCard').exists()).toEqual(true)
      })

      it('renders correct value for max points', () => {
        let maxPoints = 0
        Object.keys(checklist.data).forEach(key => {
          checklist.data[key].forEach(row => {
            if (row.checkedPoints < row.uncheckedPoints) {
              maxPoints += row.uncheckedPoints
            } else {
              maxPoints += row.checkedPoints
            }
          })
        })
        expect(wrapper.find('.maxPointsNumber').text()).toEqual(String(maxPoints))
      })

      it('renders the correct icon for max points', () => {
        let maxPoints = 0
        Object.keys(checklist.data).forEach(key => {
          checklist.data[key].forEach(row => {
            if (row.checkedPoints < row.uncheckedPoints) {
              maxPoints += row.uncheckedPoints
            } else {
              maxPoints += row.checkedPoints
            }
          })
        })
        if (maxPoints === courseInstance[0].weekMaxPoints) {
          expect(wrapper.find('.maxPointsIcon').prop('content')).toEqual('The total matches maximum weekly points for this course.')
          wrapper.setProps({
            selectedInstance: { ...courseInstance[0], weekMaxPoints: maxPoints + 1 }
          })
          expect(wrapper.find('.maxPointsIcon').prop('content')).toEqual('The total does not match maximum weekly points for this course.')
        } else {
          expect(wrapper.find('.maxPointsIcon').prop('content')).toEqual('The total does not match maximum weekly points for this course.')
          wrapper.setProps({
            selectedInstance: { ...courseInstance[0], weekMaxPoints: maxPoints }
          })
          expect(wrapper.find('.maxPointsIcon').prop('content')).toEqual('The total matches maximum weekly points for this course.')
        }
        wrapper.find('#weekDropdown').prop('onChange')(null, { value: courseInstance[0].weekAmount + 1 })
        expect(wrapper.find('.maxPointsIcon').exists()).toEqual(false)
      })

      it('renders the correct max points for individual topics', () => {
        const maxPoints = []
        Object.keys(checklist.data).forEach(key => {
          checklist.data[key].forEach(row => {
            let bestPoints = 0
            if (row.checkedPoints < row.uncheckedPoints) {
              bestPoints += row.uncheckedPoints
            } else {
              bestPoints += row.checkedPoints
            }
            maxPoints.push(String(bestPoints))
          })
        })
        wrapper.find('.bestPointsNumber').forEach(bestPoints => {
          const index = maxPoints.indexOf(bestPoints.text())
          maxPoints.splice(index, 1)
        })
        expect(maxPoints).toEqual([])
      })
    })
  })

  // It turns out there's no way of testing form functionality in shallow rendering.
  // https://github.com/airbnb/enzyme/issues/308
})
