import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'
import { Notification } from '../components/pages/Notification'

describe('<Notification />', () => {
  const message = 'This is a test message, please ignore.'

  it('shows a success notification and clears it when clicked', async () => {
    const user = userEvent.setup()
    const clearNotifications = vi.fn()
    const { asFragment } = render(
      <Notification notification={{ message, error: null }} clearNotifications={clearNotifications} />
    )

    const notification = screen.getByText(message)

    expect(notification).toBeVisible()
    expect(notification).toHaveClass('success')
    expect(asFragment()).toMatchSnapshot()

    await user.click(notification)

    expect(clearNotifications).toHaveBeenCalledTimes(1)
  })

  it('shows an error notification and clears it when clicked', async () => {
    const user = userEvent.setup()
    const clearNotifications = vi.fn()
    const { asFragment } = render(
      <Notification
        notification={{ message, error: 'Something went wrong...' }}
        clearNotifications={clearNotifications}
      />
    )

    const notification = screen.getByText(message)

    expect(notification).toBeVisible()
    expect(notification).toHaveClass('error')
    expect(asFragment()).toMatchSnapshot()

    await user.click(notification)

    expect(clearNotifications).toHaveBeenCalledTimes(1)
  })

  it('hides the previous message when there is no current notification', () => {
    const { asFragment } = render(
      <Notification
        notification={{ message: undefined, lastMessage: message, error: null }}
        clearNotifications={vi.fn()}
      />
    )

    expect(screen.queryByText(message)).not.toBeInTheDocument()
    expect(asFragment()).toMatchSnapshot()
  })
})
