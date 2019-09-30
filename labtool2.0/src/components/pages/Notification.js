import React, { useEffect } from 'react'
import { connect } from 'react-redux'
import { clearNotifications } from '../../reducers/notificationReducer'
import { Message } from 'semantic-ui-react'

let timeout

/**
 *  Notification, that clears itself after a set of time.
 */
export const Notification = props => {
  useEffect(
    () => {
      const { message } = props.notification
      if (message !== undefined) {
        clearTimeout(timeout)
        timeout = setTimeout(() => {
          props.clearNotifications()
        }, 5000)
      }
    },
    [props.notification.message]
  )

  const message = props.notification.message
  const error = props.notification.error

  if (message === undefined) {
    return <div />
  } else if (error) {
    return (
      <Message className="error" color="red" size="large">
        {message}
      </Message>
    )
  } else {
    return (
      <Message className="success" color="green" size="large">
        {message}
      </Message>
    )
  }
}

const mapStateToProps = state => {
  return {
    notification: state.notification
  }
}

const ConnectedNotification = connect(
  mapStateToProps,
  { clearNotifications }
)(Notification)

export default ConnectedNotification
