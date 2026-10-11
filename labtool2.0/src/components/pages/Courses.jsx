import React, { useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import { Button, Header, Table, Label, Popup, Loader, Checkbox } from 'semantic-ui-react'
import { connect } from 'react-redux'
import { Link } from 'react-router-dom'
import { getAllCI } from '../../services/courseInstance'
import { getIsAllowedToImport } from '../../services/courseImport'
import { resetLoading } from '../../reducers/loadingReducer'
import { HorizontalScrollable } from '../HorizontalScrollable'
import { formatCourseName } from '../../util/format'
import DocumentTitle from '../DocumentTitle'
import { CourseName } from '../InvalidCourse'
import Error from '../Error'

/**
 *  Show all the courses in a single list.
 */
export const Courses = props => {
  const [showInvalid, setShowInvalid] = useState(false)
  const invalidCount = Array.isArray(props.courseInstance)
    ? props.courseInstance.filter(instance => instance.invalid).length
    : 0
  useEffect(() => {
    // run on component mount
    props.resetLoading()
    props.getIsAllowedToImport()
    props.getAllCI()
  }, [])

  if (props.errors && props.errors.length > 0) {
    return (
      <Error
        errors={props.errors.map(
          error => `${error.response.data} (${error.response.status} ${error.response.statusText})`
        )}
      />
    )
  }

  return (
    <>
      <DocumentTitle title="Courses" />
      <div className="Courses">
        <div className="mainContainer">
          <Header as="h2">Courses</Header>
          {props.loading.loading || !Array.isArray(props.courseInstance) ? (
            <Loader active />
          ) : (
            <div>
              <HorizontalScrollable>
                <Table singleLine color="yellow" style={{ overflowX: 'visible' }}>
                  <Table.Header>
                    <Table.Row>
                      <Table.HeaderCell colSpan="1"> </Table.HeaderCell>
                      <Table.HeaderCell colSpan="1">Course ID</Table.HeaderCell>
                      <Table.HeaderCell colSpan="1">Course name</Table.HeaderCell>
                      <Table.HeaderCell colSpan="1">Course start date</Table.HeaderCell>
                      <Table.HeaderCell colSpan="2"> </Table.HeaderCell>
                    </Table.Row>
                  </Table.Header>

                  <Table.Body>
                    {props.courseInstance
                      .filter(instance => showInvalid || !instance.invalid)
                      .map(instance => (
                        <Table.Row
                          key={instance.id}
                          className={instance.invalid ? 'invalidCourse' : undefined}
                        >
                          <Table.Cell>
                            <div>
                              {instance.active === true ? (
                                <Label ribbon style={{ backgroundColor: '#21ba45' }}>
                                  Active registration
                                </Label>
                              ) : (
                                ''
                              )}
                            </div>
                          </Table.Cell>
                          <Table.Cell>{instance.shorterId} </Table.Cell>
                          <Table.Cell>
                            <strong>
                              <Link
                                to={{
                                  pathname: `/labtool/courses/${instance.ohid}`,
                                  state: { hidePanel: true }
                                }}
                              >
                                <CourseName course={instance}>
                                  {formatCourseName(instance.name, instance.ohid, instance.start)}
                                </CourseName>
                              </Link>
                            </strong>
                          </Table.Cell>

                          <Table.Cell> {instance.europeanStart} </Table.Cell>
                          <Table.Cell textAlign="center">
                            <Popup
                              trigger={
                                <Button
                                  circular
                                  size="tiny"
                                  icon={{ name: 'eye', size: 'large', color: 'blue' }}
                                  as={Link}
                                  to={{
                                    pathname: `/labtool/courses/${instance.ohid}`,
                                    state: { hidePanel: true }
                                  }}
                                />
                              }
                              content="View course"
                            />
                          </Table.Cell>
                        </Table.Row>
                      ))}
                  </Table.Body>
                </Table>
              </HorizontalScrollable>
              {invalidCount > 0 && (
                // courses marked invalid (#905), shown only to their staff and admins
                <Checkbox
                  toggle
                  className="showInvalidCourses"
                  label={`Show invalid courses (${invalidCount})`}
                  checked={showInvalid}
                  onChange={() => setShowInvalid(!showInvalid)}
                  style={{ marginTop: '1em' }}
                />
              )}
            </div>
          )}
        </div>
      </div>
    </>
  )
}

const mapStateToProps = (state, ownProps) => {
  return {
    history: ownProps.history,
    courseInstance: state.courseInstance,
    loading: state.loading,
    errors: Object.values(state.loading.errors),
    canImport: state.courseImport.canImport
  }
}

Courses.propTypes = {
  history: PropTypes.object.isRequired,
  courseInstance: PropTypes.oneOfType([PropTypes.array, PropTypes.object]),
  loading: PropTypes.object.isRequired,
  canImport: PropTypes.bool,

  getAllCI: PropTypes.func.isRequired,
  resetLoading: PropTypes.func.isRequired,
  getIsAllowedToImport: PropTypes.func.isRequired,

  errors: PropTypes.array
}

export default connect(mapStateToProps, { getAllCI, resetLoading, getIsAllowedToImport })(Courses)
