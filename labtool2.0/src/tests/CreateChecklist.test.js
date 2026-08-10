import React from 'react'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Provider } from 'react-redux'
import { createStore } from 'redux'
import { MemoryRouter } from 'react-router-dom'
import { vi } from 'vitest'
import { CreateChecklist } from '../components/pages/CreateChecklist'

const courseInstances = [
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

const weekDropdowns = Array.from({ length: courseInstances[0].weekAmount }, (_, index) => ({
  value: `week${index + 1}`,
  text: `Week ${index + 1}`
}))

const renderCreateChecklist = (props = {}) => {
  const defaultProps = {
    courses: courseInstances,
    courseId: courseInstances[0].ohid,
    selectedInstance: courseInstances[0],
    checklist,
    loading,
    weekDropdowns,
    showNotification: vi.fn(),
    resetLoading: vi.fn(),
    createChecklist: vi.fn(),
    getOneCI: vi.fn(),
    getOneChecklist: vi.fn(),
    resetChecklist: vi.fn(),
    changeField: vi.fn(),
    addTopic: vi.fn(),
    addRow: vi.fn(),
    removeTopic: vi.fn(),
    removeRow: vi.fn(),
    moveTopicUp: vi.fn(),
    moveTopicDown: vi.fn(),
    moveRowUp: vi.fn(),
    moveRowDown: vi.fn(),
    getAllCI: vi.fn(),
    castPointsToNumber: vi.fn(),
    applyCategoryPrerequisite: vi.fn(),
    restoreChecklist: vi.fn(),
    addRedirectHook: vi.fn()
  }
  const componentProps = { ...defaultProps, ...props }
  const store = createStore(() => ({ selectedInstance: componentProps.selectedInstance }))
  const view = render(
    <Provider store={store}>
      <MemoryRouter>
        <CreateChecklist {...componentProps} />
      </MemoryRouter>
    </Provider>
  )

  return { ...view, props: componentProps }
}

const selectWeek = async week => {
  const checklistDropdown = screen.getAllByRole('listbox')[0]
  await userEvent.click(checklistDropdown)
  await userEvent.click(within(checklistDropdown).getByRole('option', { name: `Week ${week}` }))
}

describe('<CreateChecklist /> component', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  it('renders the checklist for a selected week', async () => {
    renderCreateChecklist()

    expect(screen.getByText(courseInstances[0].name)).toBeInTheDocument()

    await selectWeek(6)

    expect(screen.getByRole('button', { name: /add new topic/i })).toBeInTheDocument()
    expect(screen.getAllByRole('button', { name: /add new checkbox/i })).toHaveLength(2)
  })

  it('matches the rendered snapshot', async () => {
    const { asFragment } = renderCreateChecklist()

    await selectWeek(6)

    expect(asFragment()).toMatchSnapshot()
  })

  it('shows the checklist text and point values in the editing form', async () => {
    renderCreateChecklist()
    await selectWeek(6)

    const textInputs = screen.getAllByRole('textbox')
    expect(textInputs.map(input => input.value)).toEqual(
      expect.arrayContaining([
        'Koodin laatu kiitettävää',
        'Koodin laadussa parantamisen varaa',
        '',
        'Readmessa feelua'
      ])
    )

    const pointInputs = screen.getAllByRole('spinbutton')
    expect(pointInputs.map(input => input.value)).toEqual(expect.arrayContaining(['2', '0', '0', '-1']))
  })

  it('offers only courses that contain the selected week', async () => {
    renderCreateChecklist()
    await selectWeek(6)

    await userEvent.click(screen.getByText('...from another course'))

    expect(screen.getByRole('option', { name: /ohjelmistotekniikan menetelmät/i })).toBeInTheDocument()
    expect(screen.queryByRole('option', { name: /tietokantasovellus/i })).not.toBeInTheDocument()
  })

  it('shows the total points for each section and the whole checklist', async () => {
    renderCreateChecklist()
    await selectWeek(6)

    const sectionTotals = screen.getAllByText(/total points for this section:/i)
    expect(sectionTotals).toHaveLength(2)
    expect(sectionTotals.map(total => total.textContent)).toEqual(
      expect.arrayContaining(['Total points for this section: 2', 'Total points for this section: 0'])
    )
    expect(screen.getByText(/total points of the checklist:/i)).toHaveTextContent(
      'Total points of the checklist: 2'
    )
    expect(screen.getByText(/maximum points for this review:/i)).toHaveTextContent(
      'Maximum points for this review: 3'
    )
  })

  it('shows a custom maximum-points value entered by the user', async () => {
    renderCreateChecklist()
    await selectWeek(6)

    const maximumPointsInput = screen
      .getAllByRole('spinbutton')
      .find(input => !input.disabled && input.value === '')
    await userEvent.type(maximumPointsInput, '5')

    expect(maximumPointsInput).toHaveValue(5)
    expect(screen.getByText(/maximum points for this review:/i)).toHaveTextContent(
      'Maximum points for this review: 5'
    )
  })
})
