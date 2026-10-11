import React from 'react'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Provider } from 'react-redux'
import { createStore } from 'redux'
import { MemoryRouter } from 'react-router-dom'
import { vi } from 'vitest'
import { StudentChangeHistory } from '../components/pages/StudentChangeHistory'

describe('<StudentChangeHistory />', () => {
  const selectedInstance = { id: 1, ohid: 'TKT20010.2026.S.K.SIM1', name: 'Tiralabra', weekAmount: 7 }
  const courseData = {
    role: 'teacher',
    data: [
      {
        id: 20002,
        projectName: 'Pakkausalgoritmit',
        User: { firsts: 'Johan Wilhelm', lastname: 'Studerande' }
      }
    ]
  }
  const entry = (id, kind, number, changes) => ({
    id,
    kind,
    number,
    changes,
    createdAt: '2026-10-11T10:00:00.000Z',
    by: 'Ossi Ohjaaja Mutikainen'
  })
  const changeLog = [
    entry(4, 'week_review', 8, { grade: { from: null, to: 4 } }),
    entry(3, 'code_review_grade', 1, { points: { from: null, to: 2 } }),
    entry(2, 'repository', null, {
      github: { from: 'https://github.com/a/old', to: 'https://github.com/a/new' }
    }),
    entry(1, 'week_review', 3, { points: { from: null, to: 1.5 } })
  ]

  const renderPage = (props = {}) => {
    const allProps = {
      courseId: selectedInstance.ohid,
      studentInstance: '20002',
      courseData,
      selectedInstance,
      changeLog,
      loading: { loading: false },
      getOneCI: vi.fn(),
      coursePageInformation: vi.fn(),
      getChangeLog: vi.fn(),
      resetLoading: vi.fn(),
      ...props
    }
    const store = createStore(() => ({ selectedInstance, user: { user: {} } }))
    render(
      <Provider store={store}>
        <MemoryRouter>
          <StudentChangeHistory {...allProps} />
        </MemoryRouter>
      </Provider>
    )
    return allProps
  }

  const subjects = () => [...document.querySelectorAll('.changeHistorySubject')].map(s => s.textContent)

  it('loads and shows all changes of the student, each labelled', () => {
    const props = renderPage()

    expect(props.getChangeLog).toHaveBeenCalledWith('20002')
    expect(
      screen.getByRole('heading', { name: 'Change history: Johan Wilhelm Studerande' })
    ).toBeInTheDocument()
    expect(subjects()).toEqual(['Final review · ', 'Code review 1 · ', 'Repository · ', 'Week 3 · '])
    expect(screen.getByText('Points – → 1.5')).toBeInTheDocument()
  })

  it('filters by kind of change', async () => {
    const user = userEvent.setup()
    renderPage()
    const filters = document.querySelector('.changeHistoryFilters')

    await user.click(within(filters).getByRole('button', { name: 'Week reviews' }))
    expect(subjects()).toEqual(['Final review · ', 'Week 3 · '])

    await user.click(within(filters).getByRole('button', { name: 'Repository' }))
    expect(subjects()).toEqual(['Repository · '])

    await user.click(within(filters).getByRole('button', { name: 'All' }))
    expect(subjects()).toHaveLength(4)
  })
})
