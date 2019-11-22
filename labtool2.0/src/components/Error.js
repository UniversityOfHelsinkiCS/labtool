import React from 'react'
import { Message } from 'semantic-ui-react'

export default ({ header, errors }) => <Message error icon="warning sign" header={header} content={errors.join('\n')} />
