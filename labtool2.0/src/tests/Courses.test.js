import React from 'react'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { vi } from 'vitest'
import { Courses } from '../components/pages/Courses'

vi.stubGlobal(
  'matchMedia',
  vi.fn().mockReturnValue({
    matches: false,
    addListener: vi.fn(),
    removeListener: vi.fn()
  })
)

const courseInstances = [
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
    name: 'Aineopintojen harjoitustyö: Tietokantasovellus (periodi III)',
    start: '2018-01-16T21:00:00.000Z',
    end: '2018-03-10T21:00:00.000Z',
    active: false,
    weekAmount: 7,
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

const loading = {
  loading: false,
  loadingHooks: [],
  redirect: false,
  redirectHooks: [],
  redirectFailure: false
}

const renderCourses = (props = {}) => {
  const defaultProps = {
    history: {},
    courseInstance: courseInstances,
    loading,
    resetLoading: vi.fn(),
    getIsAllowedToImport: vi.fn(),
    getAllCI: vi.fn()
  }

  const componentProps = { ...defaultProps, ...props }
  const view = render(
    <MemoryRouter>
      <Courses {...componentProps} />
    </MemoryRouter>
  )

  return { ...view, props: componentProps }
}

describe('<Courses />', () => {
  it('matches the rendered snapshot', () => {
    const { asFragment } = renderCourses()

    expect(asFragment()).toMatchSnapshot()
  })

  it('shows the available courses and loads fresh course data', () => {
    const { props } = renderCourses()

    expect(screen.getByRole('heading', { name: 'Courses' })).toBeInTheDocument()
    expect(screen.getByRole('cell', { name: 'TKT20010' })).toBeInTheDocument()
    expect(screen.getByRole('cell', { name: 'TKT20002' })).toBeInTheDocument()
    expect(screen.getByRole('cell', { name: 'TKT20011' })).toBeInTheDocument()
    expect(screen.getAllByText('Active registration')).toHaveLength(2)
    expect(screen.getByRole('link', { name: /ohjelmistotekniikan menetelmät/i })).toHaveAttribute(
      'href',
      '/labtool/courses/TKT20002.2018.K.K.1'
    )
    expect(props.resetLoading).toHaveBeenCalledOnce()
    expect(props.getIsAllowedToImport).toHaveBeenCalledOnce()
    expect(props.getAllCI).toHaveBeenCalledOnce()
  })

  it('hides the course list while courses are being fetched', () => {
    renderCourses({ loading: { ...loading, loading: true } })

    expect(screen.getByRole('heading', { name: 'Courses' })).toBeInTheDocument()
    expect(screen.queryByRole('table')).not.toBeInTheDocument()
  })
})
