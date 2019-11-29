import React, { useState } from 'react'
import { Checkbox, Segment } from 'semantic-ui-react'
import PropTypes from 'prop-types'

export const CodeReviewCheckbox = props => {
  const { setCodeReviewVisible, hideCodeReview, initialCheckState, codeReview } = props
  const [checked, setChecked] = useState(initialCheckState)

  const handleCheckChange = value => (e, { checked }) => {
    if (checked) {
      setCodeReviewVisible(value)
    } else {
      hideCodeReview(value)
    }
    setChecked(checked)
  }
  return (
    <Segment vertical>
      <Checkbox label={codeReview.text} checked={checked} onChange={handleCheckChange(codeReview.value)} />
    </Segment>
  )
}

CodeReviewCheckbox.propTypes = {
  setCodeReviewVisible: PropTypes.func.isRequired,
  hideCodeReview: PropTypes.func.isRequired,
  initialCheckState: PropTypes.bool.isRequired,
  codeReview: PropTypes.object.isRequired
}
