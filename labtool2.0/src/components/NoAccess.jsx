import React from 'react'
import LabtoolError from './Error'

/** Shown instead of a course staff page to a user who is not on the course staff (see util/courseAccess). */
const NoAccess = () => <LabtoolError header="No access" errors={['You do not have access to this page.']} />

export default NoAccess
