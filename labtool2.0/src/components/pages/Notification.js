import React from 'react'
import { connect } from 'react-redux'
import { clearNotifications } from '../../reducers/notificationReducer'


const EVENT_MESSAGE_CLEAR_TIMEOUT = 1000
let timeout

class Notification extends React.Component {
  render() {
    const message = this.props.notification.message
    const error = this.props.notification.error

    clearTimeout(timeout)
    timeout = setTimeout(clearNotifications, EVENT_MESSAGE_CLEAR_TIMEOUT)

/*     const closeMessage = () => {
      clearTimeout(timeout)
      clearNotifications()
    } */


    if (message === undefined) {
      return (
        <div>
        </div>
      )
    } else if (error) {
      return (
        <div className="error">
          {message}
        </div>
      )
    } else {
      return (
        <div className="success">
          {message}
        </div>
      )
    }
  }
}

const mapStateToProps = (state) => {
  return {
    notification: state.notification
  }
}

const mapDispatchToProps = () => {
  clearNotifications()
}

const ConnectedNotification = connect(
  mapStateToProps,
  mapDispatchToProps
)(Notification)

export default ConnectedNotification