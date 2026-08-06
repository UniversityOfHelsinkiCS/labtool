import React from 'react'
import PropTypes from 'prop-types'
import { Icon, Label } from 'semantic-ui-react'
import Points from './Points'

export const TotalPoints = ({ student }) => (
  <Label basic color="green">
    <Icon name="check" />
    <strong> Total Points: </strong>
    <Points
      points={
        student.weeks
          .map(week => week.points)
          .reduce((a, b) => {
            return a + b
          }, 0) +
        student.codeReviews
          .map(cr => cr.points)
          .reduce((a, b) => {
            return a + b
          }, 0)
      }
    />
  </Label>
)

TotalPoints.propTypes = {
  student: PropTypes.object
}

export default TotalPoints
