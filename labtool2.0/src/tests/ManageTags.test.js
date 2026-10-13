import React from 'react'
import { render, screen } from '@testing-library/react'
import { Provider } from 'react-redux'
import { createStore } from 'redux'
import { MemoryRouter } from 'react-router-dom'
import { vi } from 'vitest'
import { ManageTags } from '../components/pages/ManageTags'

describe('<ManageTags />', () => {
  const selectedInstance = { id: 10011, name: 'Tira', ohid: 'TKT20010.2018.K.A.1' }

  const renderPage = (props = {}) => {
    const componentProps = {
      courseId: selectedInstance.ohid,
      tags: { tags: [{ id: 1, name: 'Java', color: 'red', courseInstanceId: selectedInstance.id }] },
      loading: { loading: false, loadingHooks: [], redirect: false, redirectHooks: [], errors: {} },
      selectedInstance,
      courses: [],
      createTag: vi.fn(),
      removeTag: vi.fn(),
      getAllTags: vi.fn(),
      resetLoading: vi.fn(),
      willCreateNewTag: vi.fn(),
      willModifyExistingTag: vi.fn(),
      getOneCI: vi.fn(),
      coursePageInformation: vi.fn(),
      getAllCI: vi.fn(),
      showNotification: vi.fn(),
      ...props
    }
    return render(
      <Provider store={createStore(() => ({ selectedInstance }))}>
        <MemoryRouter>
          <ManageTags {...componentProps} />
        </MemoryRouter>
      </Provider>
    )
  }

  it('shows the tag form to the course staff', () => {
    renderPage({ role: 'teacher', user: { user: { id: 1, sysop: false } } })

    expect(screen.getByRole('heading', { name: 'Add, modify or remove tags' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument()
  })

  it('shows no tag form to a student who opens the page directly', () => {
    renderPage({ noAccess: true })

    expect(screen.getByText('You do not have access to this page.')).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'Add, modify or remove tags' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Save' })).not.toBeInTheDocument()
  })
})
