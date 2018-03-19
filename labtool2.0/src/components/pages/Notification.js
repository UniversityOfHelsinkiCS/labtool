import React from 'react'
import { connect } from 'react-redux'
import { clearNotifications } from '../../reducers/notificationReducer'


let timeout

class Notification extends React.Component {
  componentDidUpdate() {
    const message = this.props.notification.message
    if (message !== undefined) {
      clearTimeout(timeout)
      timeout = setTimeout(() => {
        this.props.clearNotifications()
      }, 5000)
    }
  }
  render() {
    const message = this.props.notification.message
    const error = this.props.notification.error
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

const ConnectedNotification = connect(
  mapStateToProps,
  { clearNotifications }
)(Notification)

export default ConnectedNotification