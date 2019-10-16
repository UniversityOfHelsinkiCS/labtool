import React, { useState } from 'react'
import { Modal, Button, Icon } from 'semantic-ui-react'
import PropTypes from 'prop-types'

//used in ModifyCourseInstanceCodeReviews
export const ConfirmationModal = props => {
  const [open, setOpen] = useState(false)

  const toggleOpen = () => setOpen(true)
  const toggleClose = () => setOpen(false)

  const currentReviewee = props.getCurrentReviewee(props.selectedDropdown, props.data.id)

  return (
    <Modal size="tiny" open={open} trigger={<Icon id="tag" onClick={toggleOpen} name="window close" size="large" color="red" style={{ float: 'right' }} />}>
      <Modal.Content>
        <Modal.Description>
          <p>Do you wish to remove the following code review:</p>
          <div>
            {props.data.User.firsts} {props.data.User.lastname} reviewing
            {currentReviewee.includes('http') ? (
              <div>
                <br />
                <a href={currentReviewee} target="_blank" rel="noopener noreferrer">
                  {currentReviewee}
                </a>
              </div>
            ) : (
              <div>
                <br />
                {currentReviewee}
              </div>
            )}
          </div>
        </Modal.Description>
      </Modal.Content>
      <Modal.Actions>
        <Button negative icon="close" labelPosition="right" color="red" content="No" onClick={toggleClose} />
        <Button positive icon="checkmark" labelPosition="right" content="Yes" onClick={props.removeOne(props.data.id)} />
      </Modal.Actions>
    </Modal>
  )
}
ConfirmationModal.propTypes = {
  data: PropTypes.object.isRequired,
  selectedDropdown: PropTypes.number.isRequired,
  getCurrentReviewee: PropTypes.func.isRequired,
  removeOne: PropTypes.func.isRequired
}
export default ConfirmationModal
