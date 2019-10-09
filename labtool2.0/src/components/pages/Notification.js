import React, { useEffect } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { clearNotifications } from '../../reducers/notificationReducer'
import { Message, Transition } from 'semantic-ui-react'

import './Notification.css'

let timeout

/**
 *  Notification, that clears itself after a set of time.
 */
export const Notification = props => {
  useEffect(() => {
    const { message } = props.notification
    if (message !== undefined) {
      clearTimeout(timeout)
      timeout = setTimeout(() => {
        props.clearNotifications()
      }, 5000 + Math.max(0, 10 * message.length - 40))
    }
  }, [props.notification.message])

  const closeNotification = () => {
    clearTimeout(timeout)
    props.clearNotifications()
  }

  const { message, lastMessage, error } = props.notification

  return (
    <Transition visible={!!message} animation={!error ? 'scale' : 'fly down'} duration={250}>
      <div className="notification-wrapper">
        {!error ? (
          <Message floating className="notification success" color="green" size="large" onClick={closeNotification}>
            {message || lastMessage}
          </Message>
        ) : (
          <Message floating className="notification error" color="red" size="large" onClick={closeNotification}>
            {message || lastMessage}
          </Message>
        )}
      </div>
    </Transition>
  )
}

const mapStateToProps = state => {
  return {
    notification: state.notification
  }
}

Notification.propTypes = {
  notification: PropTypes.object.isRequired,
  clearNotifications: PropTypes.func.isRequired
}

export default connect(
  mapStateToProps,
  { clearNotifications }
)(Notification)
