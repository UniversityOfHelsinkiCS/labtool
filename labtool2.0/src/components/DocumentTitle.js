import React from 'react'
import { Helmet } from 'react-helmet'

export default ({ title }) => (
  <Helmet titleTemplate={'%s | Labtool'} defaultTitle={'Labtool'}>
    <title>{title}</title>
  </Helmet>
)
