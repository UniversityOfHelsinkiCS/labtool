import React, { useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { clearNotifications } from '../../reducers/notificationReducer'
import { Message, Modal, Button, Icon } from 'semantic-ui-react'

/**
 *  Notification, that clears itself after a set of time.
 */
export const Notification = props => {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    setOpen(true)
  }, [props.notification.message])

  const handleClose = () => {
    props.clearNotifications()
    setOpen(false)
  }

  const message = props.notification.message
  const error = props.notification.error

  const createNotification = () => (
    <Modal open={open} basic size="small">
      <Modal.Content>
        <Message className={error ? 'error' : 'success'} color={error ? 'red' : 'green'} size="large">
          {message}
        </Message>
      </Modal.Content>
      <Modal.Actions>
        <Button color="grey" onClick={handleClose} inverted>
          <Icon name="checkmark" /> Got it
        </Button>
      </Modal.Actions>
    </Modal>
  )

  if (message === undefined) {
    return <div />
  }
  return <div>{createNotification()}</div>
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
