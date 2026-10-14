import React, { useState, useEffect } from 'react'
import { Dropdown } from 'semantic-ui-react'
import PropTypes from 'prop-types'
import { isGithubRepoUrl } from '../util/links'

const RevieweeDropdown = props => {
  const {
    dropdownUsers,
    studentData,
    codeReviewLogic,
    addCodeReview,
    create,
    courseData,
    amountOfCodeReviews
  } = props

  const checkDropped = value => {
    if (value === null) return false
    return courseData.data.find(student => student.id === value).dropped
  }

  const checkValidRegistration = value => {
    if (value === null) return false
    return !courseData.data.find(student => student.id === value).validRegistration
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

  const codeReviewRound = create ? -1 : codeReviewLogic.selectedDropdown

  // Check if another reviewer has already been assigned the same reviewee in this round
  const reviewedByAnotherInRound = value => {
    if (value === null || value === undefined) return false
    const selections = codeReviewLogic.currentSelections[codeReviewRound] || {}
    return Object.entries(selections).some(
      ([reviewer, reviewee]) => Number(reviewer) !== studentData.id && reviewee === value
    )
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

  const initialOptions = dropdownUsers.filter(
    d => d.value !== studentData.id && !checkDropped(d.value) && !checkValidRegistration(d.value)
  )
  const [options, setOptions] = useState(initialOptions)

  useEffect(() => {
    setOptions(
      !Number.isInteger(reviewee) && reviewee !== null
        ? [...initialOptions, { value: reviewee, text: reviewee }]
        : initialOptions
    )
  }, [codeReviewLogic])

  const handleAdditions = (e, { value }) => {
    if (isGithubRepoUrl(value)) {
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
    const codeReview = codeReviewLogic.codeReviewStates[codeReviewLogic.selectedDropdown].find(
      cr => cr.reviewer === studentData.id
    )
    return codeReview ? codeReview.toReview || codeReview.repoToReview : null
  }

  return (
    <div>
      <Dropdown
        selection
        fluid
        options={options.map(option => ({
          ...option,
          icon: reviewedInPrevious(option.value) ? 'repeat' : null,
          description: reviewedByAnotherInRound(option.value) ? 'also reviewed by another student' : null
        }))}
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
      {reviewedByAnotherInRound(value()) && (
        <>
          <br />
          <strong>Another student is also reviewing this project in this code review</strong>
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
