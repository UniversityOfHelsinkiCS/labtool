import React, { useEffect } from 'react'
import { Button, Container, Header, Table, Label, Popup, Loader } from 'semantic-ui-react'
import { connect } from 'react-redux'
import { Link } from 'react-router-dom'
import { getAllCI } from '../../services/courseInstance'
import { getIsAllowedToImport } from '../../services/courseImport'
import { resetLoading } from '../../reducers/loadingReducer'
import { HorizontalScrollable } from '../HorizontalScrollable'
import { createYearAndTerm } from '../../util/format'

/**
 *  Show all the courses in a single list.
 */
export const Courses = (props) => {
  useEffect(() => {
    // run on component mount
    props.resetLoading()
    props.getIsAllowedToImport()
    props.getAllCI()
  }, [])

  return (
    <div className="Courses">
      <Container>
        <Header as="h2">Courses</Header>
        {props.loading.loading || !Array.isArray(props.courseInstance) ? (
          <Loader active />
        ) : (
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
                {props.courseInstance.map(instance => (
                  <Table.Row key={instance.id}>
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
                        <Link to={`/labtool/courses/${instance.ohid}`}>
                          {instance.name} ({createYearAndTerm(instance.name, instance.start)})
                        </Link>
                      </strong>
                    </Table.Cell>

                    <Table.Cell> {instance.europeanStart} </Table.Cell>
                    <Table.Cell textAlign="center">
                      <Popup
                        trigger={<Button circular size="tiny" icon={{ name: 'eye', size: 'large', color: 'blue' }} as={Link} to={`/labtool/courses/${instance.ohid}`} />}
                        content="View course"
                      />
                    </Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table>
          </HorizontalScrollable>
        )}
        {props.canImport && (
          <Link to="/labtool/courseimport">
            <br />
            <Button size="small">Import courses to Labtool</Button>
          </Link>
        )}
      </Container>
    </div>
  )
}

const mapStateToProps = (state, ownProps) => {
  return {
    history: ownProps.history,
    courseInstance: state.courseInstance,
    loading: state.loading,
    canImport: state.courseImport.canImport
  }
}

export default connect(
  mapStateToProps,
  { getAllCI, resetLoading, getIsAllowedToImport }
)(Courses)
