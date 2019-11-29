import React, { useEffect } from 'react'
import PropTypes from 'prop-types'
import { Button, Header, Table, Loader, Form } from 'semantic-ui-react'
import { connect } from 'react-redux'
import { Link, Redirect } from 'react-router-dom'
import { getIsAllowedToImport, getImportableCourses, importCourses } from '../../services/courseImport'
import { resetLoading, addRedirectHook } from '../../reducers/loadingReducer'
import { HorizontalScrollable } from '../HorizontalScrollable'
import { formatCourseName } from '../../util/format'
import Error from '../Error'

import DocumentTitle from '../DocumentTitle'
import { finnishLocaleCompare } from '../../util/sort'

const ImportableCourse = ({ instance }) => (
  <Table.Row>
    <Table.Cell>
      <Form.Checkbox name={'import' + instance.hid} />
    </Table.Cell>
    <Table.Cell>{instance.shorterId}</Table.Cell>
    <Table.Cell>{formatCourseName(instance.cname, instance.hid, instance.starts)}</Table.Cell>
    <Table.Cell>{instance.instructor}</Table.Cell>
    <Table.Cell>{instance.europeanStart}</Table.Cell>
    <Table.Cell>{instance.europeanEnd}</Table.Cell>
  </Table.Row>
)
ImportableCourse.propTypes = {
  instance: PropTypes.object.isRequired
}

const sortByStartDate = (a, b) => {
  return new Date(a.starts) - new Date(b.starts) || finnishLocaleCompare(a.cname, b.cname)
}

/**
 *  Show all the courses in a single list.
 */
export const CourseImport = props => {
  useEffect(() => {
    // run on component mount
    props.resetLoading()
    props.getIsAllowedToImport()
    props.getImportableCourses()
  }, [])

  const handleSubmit = async e => {
    e.preventDefault()
    const data = props.importable
    if (data) {
      const courses = data.filter(entry => e.target['import' + entry.hid] && e.target['import' + entry.hid].checked)
      props.addRedirectHook({
        hook: 'COURSE_IMPORT_DO_IMPORT_'
      })
      await props.importCourses({ courses })
    }
  }

  if (props.errors && props.errors.length > 0) {
    return <Error errors={props.errors.map(error => `${error.response.data} (${error.response.status} ${error.response.statusText})`)} />
  }

  return (
    <>
      <DocumentTitle title={'Course import'} />
      <div className="CourseImport">
        <div className="mainContainer">
          <Header as="h2">Import courses</Header>
          {props.loading.loading || !Array.isArray(props.importable) || !props.canImport ? (
            <Loader active />
          ) : props.loading.redirect ? (
            <Redirect to="/labtool/courses" />
          ) : props.importable.length ? (
            <Form onSubmit={handleSubmit}>
              <HorizontalScrollable>
                <Table singleLine color="yellow" style={{ overflowX: 'visible' }}>
                  <Table.Header>
                    <Table.Row>
                      <Table.HeaderCell colSpan="1" key={-1}>
                        Import?
                      </Table.HeaderCell>
                      <Table.HeaderCell colSpan="1">Course ID</Table.HeaderCell>
                      <Table.HeaderCell colSpan="1">Course name</Table.HeaderCell>
                      <Table.HeaderCell colSpan="1">Instructor (original)</Table.HeaderCell>
                      <Table.HeaderCell colSpan="1">Course start date</Table.HeaderCell>
                      <Table.HeaderCell colSpan="1">Course end date</Table.HeaderCell>
                    </Table.Row>
                  </Table.Header>

                  <Table.Body>
                    {props.importable.sort(sortByStartDate).map(instance => (
                      <ImportableCourse key={instance.hid} instance={instance} />
                    ))}
                  </Table.Body>
                </Table>
              </HorizontalScrollable>

              <br />
              <br />

              <Button type="submit" className="ui green button" content="Import" />

              <br />
              <br />

              <Link to="/labtool/courses">
                <Button className="ui button" type="cancel">
                  Cancel
                </Button>
              </Link>
            </Form>
          ) : (
            <div>
              <h4>There are no courses in Kurki to import</h4>

              <Link to="/labtool/courses">
                <Button className="ui button" type="cancel">
                  Back
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

const mapStateToProps = (state, ownProps) => {
  return {
    ...ownProps,
    loading: state.loading,
    errors: Object.values(state.loading.errors),
    canImport: state.courseImport.canImport,
    importable: state.courseImport.importable
  }
}

const mapDispatchToProps = {
  resetLoading,
  getIsAllowedToImport,
  getImportableCourses,
  importCourses,
  addRedirectHook
}

CourseImport.propTypes = {
  loading: PropTypes.object.isRequired,
  canImport: PropTypes.bool,
  importable: PropTypes.array,

  resetLoading: PropTypes.func.isRequired,
  getIsAllowedToImport: PropTypes.func.isRequired,
  getImportableCourses: PropTypes.func.isRequired,
  importCourses: PropTypes.func.isRequired,
  addRedirectHook: PropTypes.func.isRequired,

  errors: PropTypes.array
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(CourseImport)
