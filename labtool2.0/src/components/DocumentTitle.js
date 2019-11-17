import React from 'react'
import { Helmet } from 'react-helmet'

export default ({ title }) => (
  <Helmet titleTemplate={'%s | Labtool 2.0'} defaultTitle={'Labtool 2.0'}>
    <title>{title}</title>
  </Helmet>
)
