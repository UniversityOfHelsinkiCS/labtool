import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { Table } from 'semantic-ui-react'

export const GradeCell = ({ weeks, weekAmount }) => (
  <Table.Cell key="grade" textAlign="center">
    {(weeks.find(week => week.weekNumber === weekAmount + 1) || {}).grade || '-'}
  </Table.Cell>
)

const mapStateToProps = (state, ownProps) => {
  return {
    weeks: state.coursePage.data.find(student => student.id === ownProps.studentId).weeks,
    weekAmount: state.selectedInstance.weekAmount
  }
}

GradeCell.propTypes = {
  weeks: PropTypes.array.isRequired,
  weekAmount: PropTypes.number.isRequired
}

export default connect(mapStateToProps)(GradeCell)
