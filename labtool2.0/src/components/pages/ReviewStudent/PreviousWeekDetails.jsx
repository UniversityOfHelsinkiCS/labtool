import React from 'react'
import PropTypes from 'prop-types'
import { Header, Segment } from 'semantic-ui-react'

export const PreviousWeekDetails = ({ weekData }) => {
  if (!weekData) {
    // The student doesn't have a review from the previous week (or the previous week doesn't exist),
    // so we don't show this component.
    return null
  }
  if (!weekData.feedback && !weekData.instructorNotes) {
    return null
  }

  return (
    <Segment align="left" style={{ marginTop: 20 }}>
      <Header as="h3">Previous week</Header>
      {weekData.feedback && (
        <>
          <Header as="h4">Feedback</Header>
          <p style={{ whiteSpace: 'pre-line' }}>{weekData.feedback}</p>
        </>
      )}
      {weekData.instructorNotes && (
        <>
          <Header as="h4">Instructor notes</Header>
          <p style={{ whiteSpace: 'pre-line' }}>{weekData.instructorNotes}</p>
        </>
      )}
    </Segment>
  )
}
PreviousWeekDetails.propTypes = {
  weekData: PropTypes.object
}

export default PreviousWeekDetails
