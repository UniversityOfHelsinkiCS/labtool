import PropTypes from 'prop-types'
import { roundPoints } from '../util/format'

export const Points = ({ points }) => (points !== null ? roundPoints(points) : '-')

Points.propTypes = {
  points: PropTypes.number
}

export default Points
