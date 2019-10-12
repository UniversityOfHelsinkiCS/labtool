import React, { useState } from 'react'
import { Dropdown } from 'semantic-ui-react'
import PropTypes from 'prop-types'

const RevieweeDropdown = props => {
  const [options, setOptions] = useState(props.dropdownUsers.filter(d => d.value !== props.data.id))

  const handleAdditions = (e, { value }) => {
    if (value.includes('http')) {
      const newOption = { text: value, value }
      setOptions(options.concat(newOption))
    }
  }

  if (!props.codeReviewLogic.selectedDropdown) {
    return null
  }

  const value = () => {
    if (props.create) {
      return props.codeReviewLogic.currentSelections['create'][props.data.id]
    }
    return props.codeReviewLogic.currentSelections[props.codeReviewLogic.selectedDropdown][props.data.id]
      ? props.codeReviewLogic.currentSelections[props.codeReviewLogic.selectedDropdown][props.data.id]
      : ''
  }

  const codeReviewRound = props.create ? 'create' : props.codeReviewLogic.selectedDropdown

  return (
    <Dropdown
      fluid
      selection
      options={options}
      value={value()}
      search
      allowAdditions
      onAddItem={handleAdditions}
      placeholder="select a student or add a repo link"
      onChange={props.addCodeReview(codeReviewRound, props.data.id)}
    />
  )
}

RevieweeDropdown.propTypes = {
  dropdownUsers: PropTypes.array.isRequired,
  data: PropTypes.object.isRequired,
  codeReviewLogic: PropTypes.object.isRequired,
  addCodeReview: PropTypes.func.isRequired,
  create: PropTypes.bool.isRequired
}

export default RevieweeDropdown