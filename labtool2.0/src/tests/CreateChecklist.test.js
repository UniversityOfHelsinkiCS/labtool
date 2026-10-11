import React from 'react'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Provider } from 'react-redux'
import { createStore } from 'redux'
import { MemoryRouter } from 'react-router-dom'
import { vi } from 'vitest'
import { CreateChecklist } from '../components/pages/CreateChecklist'
import checklistReducer, * as checklistActions from '../reducers/checklistReducer'

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
        id: 10001,
        name: 'Koodin laatu',
        checkedPoints: 2,
        uncheckedPoints: 0,
        textWhenOn: 'Koodin laatu kiitettävää',
        textWhenOff: 'Koodin laadussa parantamisen varaa'
      }
    ],
    Repo: [
      {
        id: 10002,
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

// non-empty checklists on other courses that can be copied
const copyableChecklists = [
  { courseInstanceId: 10012, week: 6, forCodeReview: false },
  { courseInstanceId: 10013, week: 1, forCodeReview: false }
]

const renderCreateChecklist = (props = {}) => {
  const defaultProps = {
    courses: courseInstances,
    copyableChecklists,
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
    getCopyableChecklists: vi.fn(),
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

const selectWeek = async (user, week) => {
  const checklistDropdown = screen.getAllByRole('listbox')[0]
  await user.click(checklistDropdown)
  await user.click(within(checklistDropdown).getByRole('option', { name: `Week ${week}` }))
}

describe('<CreateChecklist /> component', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  it('renders the checklist for a selected week', async () => {
    const user = userEvent.setup()
    renderCreateChecklist()

    expect(screen.getByText(courseInstances[0].name)).toBeInTheDocument()

    await selectWeek(user, 6)

    expect(screen.getByRole('button', { name: /add new topic/i })).toBeInTheDocument()
    expect(screen.getAllByRole('button', { name: /add new checkbox/i })).toHaveLength(2)
  })

  it('matches the rendered snapshot', async () => {
    const user = userEvent.setup()
    const { asFragment } = renderCreateChecklist()

    await selectWeek(user, 6)

    expect(asFragment()).toMatchSnapshot()
  })

  it('shows the checklist text and point values in the editing form', async () => {
    const user = userEvent.setup()
    renderCreateChecklist()
    await selectWeek(user, 6)

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

  it('offers checklist items as category prerequisites', async () => {
    const user = userEvent.setup()
    renderCreateChecklist()
    await selectWeek(user, 6)

    expect(screen.getByRole('option', { name: 'Koodin laatu' })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'Readme kunnossa' })).toBeInTheDocument()
  })

  it('offers only courses that contain the selected week', async () => {
    const user = userEvent.setup()
    renderCreateChecklist()
    await selectWeek(user, 6)

    await user.click(screen.getByText('...from another course'))

    expect(screen.getByRole('option', { name: /ohjelmistotekniikan menetelmät/i })).toBeInTheDocument()
    expect(screen.queryByRole('option', { name: /tietokantasovellus/i })).not.toBeInTheDocument()
  })

  it('fetches the checklists that can be copied', () => {
    const { props } = renderCreateChecklist()
    expect(props.getCopyableChecklists).toHaveBeenCalled()
  })

  it('offers only courses that have a checklist to copy for the selected week', async () => {
    const user = userEvent.setup()
    renderCreateChecklist()
    await selectWeek(user, 1)

    await user.click(screen.getByText('...from another course'))

    expect(screen.getByRole('option', { name: /tietokantasovellus/i })).toBeInTheDocument()
    expect(screen.queryByRole('option', { name: /ohjelmistotekniikan menetelmät/i })).not.toBeInTheDocument()
  })

  it('lists earlier runs of the same course first, newest first (#1139)', async () => {
    const user = userEvent.setup()
    const course = (id, ohid, name, start) => ({
      id,
      ohid,
      name,
      start,
      europeanStart: start.slice(0, 4),
      weekAmount: 7,
      amountOfCodeReviews: 0,
      finalReview: false
    })
    const courses = [
      courseInstances[0],
      course(1, 'TKT20002.2019.K.K.1', 'Ohjelmistotekniikka', '2019-01-15T00:00:00.000Z'),
      course(2, 'TKT20010.2016.K.A.1', 'Tiralabra 2016', '2016-01-15T00:00:00.000Z'),
      course(3, 'TKT20011.2018.K.A.1', 'Tietokantasovellus', '2018-01-15T00:00:00.000Z'),
      course(4, 'TKT20010.2017.K.A.1', 'Tiralabra 2017', '2017-01-15T00:00:00.000Z')
    ]
    renderCreateChecklist({
      courses,
      copyableChecklists: [1, 2, 3, 4].map(courseInstanceId => ({
        courseInstanceId,
        week: 1,
        forCodeReview: false
      }))
    })
    await selectWeek(user, 1)

    await user.click(screen.getByText('...from another course'))

    const courseDropdown = screen.getAllByRole('listbox')[2]
    expect(
      within(courseDropdown)
        .getAllByRole('option')
        .map(option => option.textContent)
    ).toEqual([
      'Tiralabra 2017 (2017)',
      'Tiralabra 2016 (2016)',
      'Ohjelmistotekniikka (2019)',
      'Tietokantasovellus (2018)'
    ])
  })

  it('offers no courses when no other course has a checklist to copy', async () => {
    const user = userEvent.setup()
    renderCreateChecklist({ copyableChecklists: [] })
    await selectWeek(user, 6)

    await user.click(screen.getByText('...from another course'))

    expect(screen.queryByRole('option', { name: /ohjelmistotekniikan menetelmät/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('option', { name: /tietokantasovellus/i })).not.toBeInTheDocument()
  })

  it('shows the total points for each section and the whole checklist', async () => {
    const user = userEvent.setup()
    renderCreateChecklist()
    await selectWeek(user, 6)

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
    const user = userEvent.setup()
    renderCreateChecklist()
    await selectWeek(user, 6)

    const maximumPointsInput = screen
      .getAllByRole('spinbutton')
      .find(input => !input.disabled && input.value === '')
    await user.type(maximumPointsInput, '5')

    expect(maximumPointsInput).toHaveValue(5)
    expect(screen.getByText(/maximum points for this review:/i)).toHaveTextContent(
      'Maximum points for this review: 5'
    )
  })

  describe('when a week is remembered from an earlier visit', () => {
    const remember = (key, value) =>
      window.localStorage.setItem(
        `labtoolPersistedState_CreateChecklist_${courseInstances[0].ohid}_${key}`,
        JSON.stringify(value)
      )

    it('reloads the saved checklist from the server', () => {
      remember('current', 'week1')
      remember('canSave', false)
      const { props } = renderCreateChecklist()
      expect(props.getOneChecklist).toHaveBeenCalledTimes(1)
      expect(props.getOneChecklist).toHaveBeenCalledWith(
        expect.objectContaining({ courseInstanceId: courseInstances[0].id, week: 1, forCodeReview: false })
      )
    })

    it('keeps unsaved edits instead of reloading', () => {
      remember('current', 'week1')
      remember('canSave', true)
      const { props } = renderCreateChecklist()
      expect(props.getOneChecklist).not.toHaveBeenCalled()
    })
  })

  it('edits the description of each check and saves it with the checklist (#525)', async () => {
    const user = userEvent.setup()
    const changeField = vi.fn()
    const createChecklist = vi.fn()
    const described = {
      data: { ...checklist.data, Koodi: [{ ...checklist.data.Koodi[0], description: 'About the code' }] }
    }
    const { container } = renderCreateChecklist({ changeField, createChecklist, checklist: described })
    await selectWeek(user, 6)

    // one kuvaus per check, none per topic
    const inputs = [...container.querySelectorAll('.checkDescriptionInput textarea')]
    expect(inputs.map(input => input.value)).toEqual(['About the code', ''])
    const labels = [...container.querySelectorAll('.checkDescriptionInput label')]
    expect(labels.map(label => label.textContent)).toEqual(['Kuvaus', 'Kuvaus'])
    await user.type(inputs[1], 'x')
    expect(changeField).toHaveBeenCalledWith({ key: 'Repo', index: 0, field: 'description', value: 'x' })

    await user.click(container.querySelector('.saveButton'))
    expect(createChecklist).toHaveBeenCalledWith(
      expect.objectContaining({
        checklist: expect.objectContaining({
          Koodi: [expect.objectContaining({ description: 'About the code' })]
        })
      })
    )
  })

  describe('two checkboxes with the same name (#1163)', () => {
    const duplicateRow = id => ({
      id,
      name: 'Test',
      checkedPoints: 1,
      uncheckedPoints: 0,
      textWhenOn: '',
      textWhenOff: ''
    })

    // The editor wired to the real checklist reducer, so that edits and deletions show up on screen.
    const Harness = () => {
      const [state, dispatch] = React.useReducer(checklistReducer, {
        data: { Koodi: [duplicateRow(1), duplicateRow(2)] },
        maxPoints: ''
      })
      const bind = action => data => action(data)(dispatch)
      return (
        <CreateChecklist
          {...renderProps()}
          checklist={state}
          changeField={bind(checklistActions.changeField)}
          removeRow={bind(checklistActions.removeRow)}
          castPointsToNumber={bind(checklistActions.castPointsToNumber)}
        />
      )
    }

    const renderProps = () => ({
      courses: courseInstances,
      copyableChecklists,
      courseId: courseInstances[0].ohid,
      selectedInstance: courseInstances[0],
      loading,
      weekDropdowns,
      showNotification: vi.fn(),
      resetLoading: vi.fn(),
      createChecklist: vi.fn(),
      getOneCI: vi.fn(),
      getOneChecklist: vi.fn(),
      getCopyableChecklists: vi.fn(),
      resetChecklist: vi.fn(),
      addTopic: vi.fn(),
      addRow: vi.fn(),
      removeTopic: vi.fn(),
      moveTopicUp: vi.fn(),
      moveTopicDown: vi.fn(),
      moveRowUp: vi.fn(),
      moveRowDown: vi.fn(),
      getAllCI: vi.fn(),
      applyCategoryPrerequisite: vi.fn(),
      restoreChecklist: vi.fn(),
      addRedirectHook: vi.fn()
    })

    const renderHarness = () => {
      const store = createStore(() => ({ selectedInstance: courseInstances[0] }))
      return render(
        <Provider store={store}>
          <MemoryRouter>
            <Harness />
          </MemoryRouter>
        </Provider>
      )
    }

    const textWhenOnInputs = container =>
      [...container.querySelectorAll('.textField input')].filter((_, i) => i % 2 === 0)

    it('typing into the second checkbox changes only the second one', async () => {
      const user = userEvent.setup()
      const { container } = renderHarness()
      await selectWeek(user, 6)

      await user.type(textWhenOnInputs(container)[1], 'second')

      expect(textWhenOnInputs(container).map(input => input.value)).toEqual(['', 'second'])
    })

    it('deleting the second checkbox removes it from the editor', async () => {
      const user = userEvent.setup()
      const { container } = renderHarness()
      await selectWeek(user, 6)
      await user.type(textWhenOnInputs(container)[0], 'first')

      // [0] is "Delete topic", [1] and [2] are the two checkboxes
      await user.click(container.querySelectorAll('.deleteButtonText')[2].closest('button'))

      expect(textWhenOnInputs(container).map(input => input.value)).toEqual(['first'])
    })
  })

  describe('prerequisites between new checkboxes (#1124)', () => {
    const showNotification = vi.fn()
    const createChecklist = vi.fn()

    const Harness = () => {
      const [state, dispatch] = React.useReducer(checklistReducer, { data: { Koodi: [] }, maxPoints: '' })
      const bind = action => data => action(data)(dispatch)
      return (
        <CreateChecklist
          courses={courseInstances}
          copyableChecklists={[]}
          courseId={courseInstances[0].ohid}
          selectedInstance={courseInstances[0]}
          loading={loading}
          weekDropdowns={weekDropdowns}
          checklist={state}
          showNotification={showNotification}
          createChecklist={createChecklist}
          addRow={bind(checklistActions.addRow)}
          changeField={bind(checklistActions.changeField)}
          castPointsToNumber={bind(checklistActions.castPointsToNumber)}
          resetLoading={vi.fn()}
          getOneCI={vi.fn()}
          getOneChecklist={vi.fn()}
          getCopyableChecklists={vi.fn()}
          resetChecklist={vi.fn()}
          addTopic={vi.fn()}
          removeTopic={vi.fn()}
          removeRow={vi.fn()}
          moveTopicUp={vi.fn()}
          moveTopicDown={vi.fn()}
          moveRowUp={vi.fn()}
          moveRowDown={vi.fn()}
          getAllCI={vi.fn()}
          applyCategoryPrerequisite={vi.fn()}
          restoreChecklist={vi.fn()}
          addRedirectHook={vi.fn()}
        />
      )
    }

    const addCheckbox = async (user, container, name) => {
      await user.click(screen.getByRole('button', { name: /add new checkbox/i }))
      await user.type(container.querySelector('.newRowNameInput input'), `${name}{enter}`)
    }

    it('a new checkbox can require another new checkbox, and the checklist saves', async () => {
      const user = userEvent.setup()
      const store = createStore(() => ({ selectedInstance: courseInstances[0] }))
      const { container } = render(
        <Provider store={store}>
          <MemoryRouter>
            <Harness />
          </MemoryRouter>
        </Provider>
      )
      await selectWeek(user, 6)
      await addCheckbox(user, container, 'First')
      await addCheckbox(user, container, 'Second')

      const secondDropdown = container.querySelectorAll('.prerequisiteDropdown')[1]
      await user.click(secondDropdown)
      // the checkbox itself is not offered as its own prerequisite
      expect(within(secondDropdown).queryByRole('option', { name: 'Second' })).not.toBeInTheDocument()
      await user.click(within(secondDropdown).getByRole('option', { name: 'First' }))

      await user.click(container.querySelector('.saveButton'))

      expect(showNotification).not.toHaveBeenCalledWith(expect.objectContaining({ error: true }))
      expect(createChecklist).toHaveBeenCalled()
      const [first, second] = createChecklist.mock.calls[0][0].checklist.Koodi
      expect(Number.isFinite(first.tempId)).toBe(true)
      expect(second.prerequisite).toBe(first.tempId)
    })
  })
})
