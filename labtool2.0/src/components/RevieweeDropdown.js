import React, { useState, useEffect } from 'react'
import { Dropdown } from 'semantic-ui-react'
import PropTypes from 'prop-types'

const RevieweeDropdown = props => {
  const { dropdownUsers, studentData, codeReviewLogic, addCodeReview, create, courseData, amountOfCodeReviews } = props

  const checkDropped = value => {
    if (value === null) return false
    return courseData.data.find(student => student.id === value).dropped
  }

  // Check if a reviewee was reviewed by the same reviewer in previous rounds of code reviews
  const reviewedInPrevious = value => {
    if (!create && codeReviewLogic.selectedDropdown === 1) return false
    if (create && amountOfCodeReviews === 0) return false
    if (value === null) return false

    const currentRound = create ? amountOfCodeReviews + 1 : codeReviewLogic.selectedDropdown

    const reviewed = courseData.data
      .find(student => student.id === studentData.id)
      .codeReviews.filter(cr => cr.reviewNumber < currentRound)
      .map(cr => cr.toReview || cr.repoToReview)
    return reviewed.includes(value)
  }

  const reviewee = create
    ? //if the code round is a new created one
      codeReviewLogic.currentSelections[-1][studentData.id]
      ? codeReviewLogic.currentSelections[-1][studentData.id]
      : null
    : // otherwise check if a code round has been selected
    codeReviewLogic.selectedDropdown !== null
    ? codeReviewLogic.currentSelections[codeReviewLogic.selectedDropdown][studentData.id]
      ? codeReviewLogic.currentSelections[codeReviewLogic.selectedDropdown][studentData.id]
      : null
    : null

  const initialOptions = dropdownUsers.filter(d => d.value !== studentData.id && !checkDropped(d.value))
  const [options, setOptions] = useState(initialOptions)

  useEffect(() => {
    setOptions(!Number.isInteger(reviewee) && reviewee !== null ? [...initialOptions, { value: reviewee, text: reviewee }] : initialOptions)
  }, [codeReviewLogic])

  const handleAdditions = (e, { value }) => {
    if (value.includes('http')) {
      const newOption = { text: value, value }
      setOptions(options.concat(newOption))
    }
  }

  if (!codeReviewLogic.selectedDropdown && !create) {
    return null
  }

  const value = () => {
    if (create) {
      return codeReviewLogic.currentSelections[-1][studentData.id]
    }
    const codeReview = codeReviewLogic.codeReviewStates[codeReviewLogic.selectedDropdown].find(cr => cr.reviewer === studentData.id)
    return codeReview ? codeReview.toReview || codeReview.repoToReview : null
  }

  const codeReviewRound = create ? -1 : codeReviewLogic.selectedDropdown

  return (
    <div>
      <Dropdown
        selection
        fluid
        options={options.map(option => ({ ...option, icon: reviewedInPrevious(option.value) ? 'repeat' : null }))}
        value={value()}
        search
        allowAdditions
        onAddItem={handleAdditions}
        placeholder="select a student or add a repo link"
        onChange={addCodeReview(codeReviewRound, studentData.id)}
      />
      {reviewedInPrevious(value()) && (
        <>
          <br />
          <strong>This student has already reviewed this project in an earlier code review</strong>
        </>
      )}
    </div>
  )
}

RevieweeDropdown.propTypes = {
  dropdownUsers: PropTypes.array.isRequired,
  studentData: PropTypes.object.isRequired,
  codeReviewLogic: PropTypes.object.isRequired,
  addCodeReview: PropTypes.func.isRequired,
  create: PropTypes.bool.isRequired,
  courseData: PropTypes.object.isRequired,
  amountOfCodeReviews: PropTypes.number
}

export default RevieweeDropdown
