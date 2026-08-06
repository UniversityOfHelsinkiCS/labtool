import React from 'react'
import PropTypes from 'prop-types'
import { Message, List } from 'semantic-ui-react'

export const LabtoolError = ({ header, errors }) => (
  <Message
    error
    icon="warning sign"
    header={header || 'Error'}
    content={
      <List bulleted>
        {errors.map(error => (
          <List.Item key={error}>{error}</List.Item>
        ))}
      </List>
    }
  />
)
LabtoolError.propTypes = {
  header: PropTypes.string,
  errors: PropTypes.array
}

export default LabtoolError
