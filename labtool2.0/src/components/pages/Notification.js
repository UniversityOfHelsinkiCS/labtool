import React from 'react'
import '../styles/error.css'
import { connect } from 'react-redux'

class Notification extends React.Component {
  render() {
    const message = this.props.notification.message
    const success = this.props.notification.success

    if (message === '') {
      return (
        <div>
        </div>
      )
    } else if (success) {
      return (
        <div className="success">
          {message}
        </div>
      )
    } else {
      return (
        <div className="error">
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
  mapStateToProps
)(Notification)

export default ConnectedNotification