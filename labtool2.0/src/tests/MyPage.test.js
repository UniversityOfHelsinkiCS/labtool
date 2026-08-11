import React from 'react'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { vi } from 'vitest'
import { MyPage } from '../components/pages/MyPage'

vi.stubGlobal(
  'matchMedia',
  vi.fn().mockReturnValue({
    matches: false,
    addListener: vi.fn(),
    removeListener: vi.fn()
  })
)

describe('<MyPage />', () => {
  const props = {
    courseInstance: [],
    user: {
      user: {
        id: 10011,
        email: 'maarit.opiskelija@helsinki.invalid',
        firsts: 'Maarit Mirja',
        lastname: 'Opiskelija',
        studentNumber: '014578343',
        username: 'tiraopiskelija1'
      },
      token:
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InRpcmFvcGlza2VsaWphMSIsImlkIjoxMDAxMSwiaWF0IjoxNTI4MjA1ODkxfQ.5XJuUcATdFylTxnEISTCM8h2uwTnMDXrcBZSVuby5_o',
      created: false
    },
    notification: {},
    teacherInstance: [],
    studentInstance: [
      {
        id: 10011,
        name: 'Aineopintojen harjoitustyö: Tietorakenteet ja algoritmit (periodi IV)',
        start: '2018-03-11T21:00:00.000Z',
        end: '2018-04-29T21:00:00.000Z',
        active: true,
        weekAmount: 7,
        weekMaxPoints: 3,
        currentWeek: 1,
        ohid: 'TKT20010.2018.K.A.1',
        createdAt: '2018-03-26T00:00:00.000Z',
        updatedAt: '2018-03-26T00:00:00.000Z',
        github: 'http://github.com/tiralabra1',
        projectName: 'Tiran labraprojekti',
        userId: 10011,
        courseInstanceId: 10011,
        teacherInstanceId: 10011
      }
    ],
    selectedInstance: [],
    coursePage: [],
    emailPage: {
      loading: false,
      redirect: false
    },
    users: [],
    assistant: []
  }
  const teacherInstance = [
    {
      id: 1003,
      ohid: 'TKT20010.2018.K.A.1',
      name: 'Teacher course',
      instructor: false,
      createdAt: '2018-01-16T21:00:00.000Z',
      updatedAt: '2018-01-16T21:00:00.000Z',
      userId: 10010,
      courseInstanceId: 10013
    }
  ]

  const renderMyPage = (overrides = {}) => {
    const componentProps = {
      getAllStudentCourses: vi.fn(),
      getAllTeacherCourses: vi.fn(),
      getIsAllowedToImport: vi.fn(),
      user: props.user,
      studentInstance: props.studentInstance,
      teacherInstance: props.teacherInstance,
      ...overrides
    }
    const view = render(
      <MemoryRouter>
        <MyPage {...componentProps} />
      </MemoryRouter>
    )

    return { ...view, props: componentProps }
  }

  it('matches the rendered snapshot', () => {
    const { asFragment } = renderMyPage()

    expect(asFragment()).toMatchSnapshot()
  })

  it('shows the user profile and loads course memberships', () => {
    const { props: componentProps } = renderMyPage()

    expect(screen.getByRole('heading', { name: 'Opiskelija, Maarit Mirja' })).toBeInTheDocument()
    expect(screen.getByText('tiraopiskelija1')).toBeInTheDocument()
    expect(screen.getByText('014578343')).toBeInTheDocument()
    expect(screen.getByText('maarit.opiskelija@helsinki.invalid')).toBeInTheDocument()
    expect(componentProps.getAllStudentCourses).toHaveBeenCalledOnce()
    expect(componentProps.getAllTeacherCourses).toHaveBeenCalledOnce()
    expect(componentProps.getIsAllowedToImport).toHaveBeenCalledOnce()
  })

  it('shows student courses when the user is a student', () => {
    renderMyPage()

    expect(screen.getByRole('heading', { name: 'My Courses (Student)' })).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'My Courses (Teacher)' })).not.toBeInTheDocument()
  })

  it('shows teacher courses when the user is a teacher', () => {
    renderMyPage({ teacherInstance, studentInstance: [] })

    expect(screen.getByRole('heading', { name: 'My Courses (Teacher)' })).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'My Courses (Student)' })).not.toBeInTheDocument()
  })

  it('shows both course sections when the user is a student and a teacher', () => {
    renderMyPage({ teacherInstance })

    expect(screen.getByRole('heading', { name: 'My Courses (Student)' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'My Courses (Teacher)' })).toBeInTheDocument()
  })
})