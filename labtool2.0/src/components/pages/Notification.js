import React, { useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { clearNotifications } from '../../reducers/notificationReducer'
import { Message, Modal, Button, Icon } from 'semantic-ui-react'

let timeout

/**
 *  Notification, that clears itself after a set of time.
 */
export const Notification = props => {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    setOpen(true)
    // const { message } = props.notification
    // if (message !== undefined) {
    //   clearTimeout(timeout)
    //   timeout = setTimeout(() => {
    //     props.clearNotifications()
    //   }, 5000)
    // }
  }, [props.notification.message])

  // const handleOpen = () => {
  //   if (message) {
  //     setOpen(true)
  //   }
  // }

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
  } else {
    return <div>{createNotification()}</div>
    // <Modal open={open} basic size="small">
    //   {console.log('open', open)}
    //   {console.log('message', props.notification.message)}
    //   <Modal.Content>
    //     <Message className="error" color="red" size="large">
    //       {message}
    //     </Message>
    //   </Modal.Content>
    //   <Modal.Actions>
    //     <Button color="grey" onClick={handleClose} inverted>
    //       <Icon name="checkmark" /> Got it
    //     </Button>
    //   </Modal.Actions>
    // </Modal>
    // // <Message className="error" color="red" size="large">
    // //   {message}
    // // </Message>
  }
  // else {
  //   return (
  //     <Modal open={open} basic size="small">
  //       {console.log('open', open)}
  //       {console.log('message', props.notification.message)}
  //       <Modal.Content>
  //         <Message className="success" color="green" size="large">
  //           {message}
  //         </Message>
  //       </Modal.Content>
  //       <Modal.Actions>
  //         <Button color="grey" onClick={handleClose} inverted>
  //           <Icon name="checkmark" /> Got it
  //         </Button>
  //       </Modal.Actions>
  //     </Modal>
  //     // <Message className="success" color="green" size="large">
  //     //   {message}
  //     // </Message>
  //   )
  // }
}

const mapStateToProps = state => {
  return {
    notification: state.notification
  }
}

Notification.propTypes = {
  notification: PropTypes.object.isRequired
}

export default connect(
  mapStateToProps,
  { clearNotifications }
)(Notification)
