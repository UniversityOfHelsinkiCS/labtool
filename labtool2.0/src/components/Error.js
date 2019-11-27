import React from 'react'
import { Message, List } from 'semantic-ui-react'

export default ({ header, errors }) => (
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
