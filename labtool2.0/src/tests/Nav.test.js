import React from 'react'
import { render, screen } from '@testing-library/react'
import { Provider } from 'react-redux'
import { createStore } from 'redux'
import { MemoryRouter } from 'react-router-dom'
import { vi } from 'vitest'
import Nav from '../components/pages/Nav'

const renderNav = user => {
  const store = createStore(() => ({ user, courseImport: {} }))
  return render(
    <Provider store={store}>
      <MemoryRouter initialEntries={['/labtool/mypage']}>
        <Nav logout={vi.fn()} />
      </MemoryRouter>
    </Provider>
  )
}

describe('<Nav />', () => {
  it('shows the logout button when logged in', () => {
    renderNav({ user: { firsts: 'Pää', lastname: 'Opettaja' }, token: 'x' })
    expect(screen.getByRole('button', { name: /logout \(pää o\)/i })).toBeInTheDocument()
  })

  it('does not show a logout button when logged out', () => {
    renderNav({})
    expect(screen.queryByRole('button', { name: /logout/i })).not.toBeInTheDocument()
  })
})
