import React from 'react'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Provider } from 'react-redux'
import { createStore } from 'redux'
import { MemoryRouter } from 'react-router-dom'
import { vi } from 'vitest'
import { ModifyCourseInstanceStaff } from '../components/pages/ModifyCourseInstanceStaff'

describe('<ModifyCourseInstanceStaff />', () => {
  const selectedInstance = {
    id: 10013,
    name: 'Aineopintojen harjoitustyö: Tietokantasovellus',
    start: '2018-01-16T21:00:00.000Z',
    end: '2018-03-10T21:00:00.000Z',
    active: true,
    weekAmount: 7,
    weekMaxPoints: 3,
    currentWeek: 1,
    ohid: 'TKT20011.2018.K.A.1',
    teacherInstances: [
      {
        id: 1003,
        instructor: false,
        createdAt: '2018-01-16T21:00:00.000Z',
        updatedAt: '2018-01-16T21:00:00.000Z',
        userId: 10010,
        courseInstanceId: 10013
      },
      {
        id: 1004,
        instructor: true,
        createdAt: '2018-01-16T21:00:00.000Z',
        updatedAt: '2018-01-16T21:00:00.000Z',
        userId: 10012,
        courseInstanceId: 10013
      }
    ],
    createdAt: '2018-03-26T00:00:00.000Z',
    updatedAt: '2018-05-28T13:13:32.540Z'
  }

  const users = [
    {
      id: 10010,
      username: 'paaopettaja',
      email: 'paa.opettaja@helsinki.invalid',
      firsts: 'Pää',
      lastname: 'Opettaja',
      teacher: true,
      sysop: true,
      createdAt: '2018-03-26T00:00:00.000Z',
      updatedAt: '2018-03-26T00:00:00.000Z'
    },
    {
      id: 10011,
      username: 'paaopettaja',
      email: 'paa.opettaja@helsinki.invalid',
      firsts: 'Sivu',
      lastname: 'Opiskelija',
      studentNumber: '014822548',
      teacher: false,
      sysop: false,
      createdAt: '2018-03-26T00:00:00.000Z',
      updatedAt: '2018-03-26T00:00:00.000Z'
    },
    {
      id: 10012,
      username: 'aimoassis',
      email: 'aimo.assistentti@helsinki.invalid',
      firsts: 'Aimo',
      lastname: 'Assistentti',
      studentNumber: '014666666',
      teacher: false,
      sysop: false,
      createdAt: '2018-06-08T11:22:00.000Z',
      updatedAt: '2018-06-08T11:22:00.000Z'
    }
  ]

  const loading = {
    loading: false,
    loadingHooks: [],
    redirect: false,
    redirectHooks: [],
    redirectFailure: false
  }

  const renderStaff = (props = {}) => {
    const defaultProps = {
      courseId: '5',
      users,
      selectedInstance,
      loading,
      getAllUsers: vi.fn(),
      getOneCI: vi.fn(),
      createOne: vi.fn().mockResolvedValue(),
      clearNotifications: vi.fn(),
      resetLoading: vi.fn(),
      removeOne: vi.fn().mockResolvedValue(),
      location: {}
    }
    const componentProps = { ...defaultProps, ...props }
    const store = createStore(() => ({ selectedInstance: componentProps.selectedInstance }))
    const view = render(
      <Provider store={store}>
        <MemoryRouter>
          <ModifyCourseInstanceStaff {...componentProps} />
        </MemoryRouter>
      </Provider>
    )

    return { ...view, props: componentProps }
  }

  it('renders correctly', () => {
    renderStaff()

    expect(screen.getAllByRole('row').map(row => row.textContent)).toMatchInlineSnapshot(`
      [
        "NameStatus",
        "Pää Opettajapaa.opettaja@helsinki.invalidTeacher",
        "Aimo Assistenttiaimo.assistentti@helsinki.invalidAssistantRemove assistant",
        "Sivu Opiskelijapaa.opettaja@helsinki.invalidAdd assistant",
      ]
    `)
  })

  it('shows the correct amount of users', () => {
    renderStaff()

    expect(screen.getAllByRole('row')).toHaveLength(4)
  })

  it('shows the teacher name and status', () => {
    renderStaff()
    const row = screen.getByRole('row', { name: /Pää Opettaja/ })

    expect(within(row).getByText('Pää Opettaja')).toBeInTheDocument()
    expect(within(row).getByText('Teacher')).toBeInTheDocument()
  })

  it('shows a non-staff user with the option to add them as an assistant', () => {
    renderStaff()
    const row = screen.getByRole('row', { name: /Sivu Opiskelija/ })

    expect(within(row).getByText('Sivu Opiskelija')).toBeInTheDocument()
    expect(within(row).getByRole('button', { name: 'Add assistant' })).toBeInTheDocument()
  })

  it('shows the assistant name, status, and removal option', () => {
    renderStaff()
    const row = screen.getByRole('row', { name: /Aimo Assistentti/ })

    expect(within(row).getByText('Aimo Assistentti')).toBeInTheDocument()
    expect(within(row).getByText('Assistant')).toBeInTheDocument()
    expect(within(row).getByRole('button', { name: 'Remove assistant' })).toBeInTheDocument()
  })

  it('adds a user as an assistant', async () => {
    const user = userEvent.setup()
    const { props } = renderStaff()
    const row = screen.getByRole('row', { name: /Sivu Opiskelija/ })

    await user.click(within(row).getByRole('button', { name: 'Add assistant' }))

    expect(props.createOne).toHaveBeenCalledWith({ ohid: '5', id: 10011 })
  })

  it('removes an assistant', async () => {
    const user = userEvent.setup()
    const { props } = renderStaff()
    const row = screen.getByRole('row', { name: /Aimo Assistentti/ })

    await user.click(within(row).getByRole('button', { name: 'Remove assistant' }))

    expect(props.removeOne).toHaveBeenCalledWith({ ohid: '5', id: 10012 })
  })
})
