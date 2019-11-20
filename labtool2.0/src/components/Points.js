import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { roundPoints } from '../util/format'

export const Points = ({ points }) => (points !== null ? roundPoints(points) : '-')

Points.propTypes = {
  points: PropTypes.number
}

export default connect(
  null,
  {}
)(Points)
