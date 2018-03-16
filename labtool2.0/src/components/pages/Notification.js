import React from 'react'
import { connect } from 'react-redux'

class Notification extends React.Component {
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
  mapStateToProps
)(Notification)

export default ConnectedNotification