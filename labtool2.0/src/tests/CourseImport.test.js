import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { vi } from 'vitest'
import { CourseImport } from '../components/pages/CourseImport'

vi.stubGlobal(
  'matchMedia',
  vi.fn().mockReturnValue({
    matches: false,
    addListener: vi.fn(),
    removeListener: vi.fn()
  })
)

const importableCourse = {
  hid: 'TKT20002.2019.K.K.1',
  shorterId: 'TKT20002',
  cname: 'Ohjelmistotekniikan menetelmät',
  instructor: 'Ada Lovelace',
  starts: '2019-03-11 00:00:00 +0200',
  ends: '2019-04-29 00:00:00 +0300',
  europeanStart: '11.03.2019',
  europeanEnd: '29.04.2019'
}

const loading = {
  loading: false,
  loadingHooks: [],
  redirect: false,
  redirectHooks: [],
  redirectFailure: false
}

const renderCourseImport = (props = {}) => {
  const defaultProps = {
    canImport: true,
    importable: [{ ...importableCourse }],
    loading,
    resetLoading: vi.fn(),
    getIsAllowedToImport: vi.fn(),
    getImportableCourses: vi.fn(),
    importCourses: vi.fn(),
    addRedirectHook: vi.fn()
  }

  const componentProps = { ...defaultProps, ...props }

  const view = render(
    <MemoryRouter>
      <CourseImport {...componentProps} />
    </MemoryRouter>
  )

  return { ...view, props: componentProps }
}

describe('<CourseImport />', () => {
  it('matches the rendered snapshot', () => {
    const { asFragment } = renderCourseImport()

    expect(asFragment()).toMatchSnapshot()
  })

  it('shows the courses available for import and loads fresh import data', () => {
    const { props } = renderCourseImport()

    expect(screen.getByRole('heading', { name: /import courses/i })).toBeInTheDocument()
    expect(screen.getByRole('cell', { name: 'TKT20002' })).toBeInTheDocument()
    expect(screen.getByRole('cell', { name: /ohjelmistotekniikan menetelmät/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /^import$/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /cancel/i })).toHaveAttribute('href', '/labtool/courses')
    expect(props.resetLoading).toHaveBeenCalledOnce()
    expect(props.getIsAllowedToImport).toHaveBeenCalledOnce()
    expect(props.getImportableCourses).toHaveBeenCalledOnce()
  })

  it('imports the selected courses', async () => {
    const importCourses = vi.fn()
    const addRedirectHook = vi.fn()
    renderCourseImport({ importCourses, addRedirectHook })

    const checkbox = screen.getByRole('checkbox')
    const importButton = screen.getByRole('button', { name: /^import$/i })
    Object.defineProperty(importButton.form, checkbox.name, { value: checkbox })

    await userEvent.click(checkbox)
    expect(checkbox).toBeChecked()
    await userEvent.click(importButton)

    expect(addRedirectHook).toHaveBeenCalledWith({ hook: 'COURSE_IMPORT_DO_IMPORT_' })
    expect(importCourses).toHaveBeenCalledWith({ courses: [importableCourse] })
  })

  it('shows an empty state when there are no courses to import', () => {
    renderCourseImport({ importable: [] })

    expect(
      screen.getByRole('heading', { name: /there are no courses in kurki to import/i })
    ).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /back/i })).toHaveAttribute('href', '/labtool/courses')
    expect(screen.queryByRole('button', { name: /^import$/i })).not.toBeInTheDocument()
  })
})
