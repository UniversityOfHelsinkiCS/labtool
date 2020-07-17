import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { Table } from 'semantic-ui-react'

export const PointHeaders = ({ weekAmount, amountOfCodeReviews, finalReview }) => {
  return (
    <>
      {Array.from({ length: weekAmount }, (_, k) => k).map(i => (
        <Table.HeaderCell key={`week${i}`}>
          <abbr title="Week">Wk</abbr> {i + 1}
        </Table.HeaderCell>
      ))}
      {Array.from({ length: amountOfCodeReviews }, (_, k) => k).map(i => (
        <Table.HeaderCell key={`cr${i + 1}`}>
          Code
          <br />
          Review
          <br />
          {i + 1}{' '}
        </Table.HeaderCell>
      ))}
      {finalReview && (
        <Table.HeaderCell>
          Final
          <br />
          Review{' '}
        </Table.HeaderCell>
      )}
    </>
  )
}

PointHeaders.propTypes = {
  weekAmount: PropTypes.number.isRequired,
  amountOfCodeReviews: PropTypes.number.isRequired,
  finalReview: PropTypes.bool
}

const mapStateToProps = state => {
  return {
    weekAmount: state.selectedInstance.weekAmount,
    amountOfCodeReviews: state.selectedInstance.amountOfCodeReviews,
    finalReview: state.selectedInstance.finalReview
  }
}

export default connect(mapStateToProps)(PointHeaders)
