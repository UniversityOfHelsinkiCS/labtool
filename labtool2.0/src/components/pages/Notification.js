import React from 'react'
import { connect } from 'react-redux'
import { clearNotifications } from '../../reducers/notificationReducer'
import { Message, Grid } from 'semantic-ui-react'

let timeout


/**
 *  Notification, that clears itself after a set of time.
 */
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
        <Grid>
          <Grid.Row>
            <br />
            <br />
            <br />
          </Grid.Row>
        </Grid>
      )
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
}

const mapStateToProps = state => {
  return {
    notification: state.notification
  }
}

const ConnectedNotification = connect(mapStateToProps, { clearNotifications })(Notification)

export default ConnectedNotification
