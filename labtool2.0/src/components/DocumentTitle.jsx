import React from 'react'
import PropTypes from 'prop-types'
import { Helmet } from 'react-helmet'

export const DocumentTitle = ({ title }) => (
  <Helmet titleTemplate={'%s | Labtool'} defaultTitle={'Labtool'}>
    <title>{title}</title>
  </Helmet>
)
DocumentTitle.propTypes = {
  title: PropTypes.string.isRequired
}

export default DocumentTitle
