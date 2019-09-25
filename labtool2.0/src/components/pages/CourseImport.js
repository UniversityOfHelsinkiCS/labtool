import React, { Component } from 'react'
import { Button, Container, Header, Table, Loader, Form } from 'semantic-ui-react'
import { connect } from 'react-redux'
import { Link, Redirect } from 'react-router-dom'
import { getIsAllowedToImport, getImportableCourses, importCourses } from '../../services/courseImport'
import { resetLoading, addRedirectHook } from '../../reducers/loadingReducer'
import { HorizontalScrollable } from '../HorizontalScrollable'

/**
 *  Show all the courses in a single list.
 */
export class CourseImport extends Component {
  componentWillMount = async () => {
    await this.props.resetLoading()
    this.props.getIsAllowedToImport()
    this.props.getImportableCourses()
  }

  handleSubmit = async e => {
    e.preventDefault()
    const data = this.props.importable
    if (data) {
      const courses = data.filter(entry => e.target['import' + entry.hid] && e.target['import' + entry.hid].checked)
      this.props.addRedirectHook({
        hook: 'COURSE_IMPORT_DO_IMPORT_'
      })
      await this.props.importCourses({ courses })
    }
  }

  render() {
    return (
      <div className="CourseImport">
        <Container>
          <Header as="h2">Import courses</Header>
          {this.props.loading.loading || !Array.isArray(this.props.importable) || !this.props.canImport ? (
            <Loader active />
          ) : this.props.loading.redirect ? (
            <Redirect to="/labtool/courses" />
          ) : this.props.importable.length ? (
            <Form onSubmit={this.handleSubmit}>
              <HorizontalScrollable>
                <Table singleLine color="yellow" style={{ overflowX: 'visible' }}>
                  <Table.Header>
                    <Table.Row>
                      <Table.HeaderCell colSpan="1" key={-1}>
                        Import?
                      </Table.HeaderCell>
                      <Table.HeaderCell colSpan="1">Course id</Table.HeaderCell>
                      <Table.HeaderCell colSpan="1">Course name</Table.HeaderCell>
                      <Table.HeaderCell colSpan="1">Course start date</Table.HeaderCell>
                      <Table.HeaderCell colSpan="1">Course end date</Table.HeaderCell>
                    </Table.Row>
                  </Table.Header>

                  <Table.Body>
                    {this.props.importable.map(instance => (
                      <Table.Row key={instance.hid}>
                        <Table.Cell>
                          <Form.Checkbox name={'import' + instance.hid} />
                        </Table.Cell>
                        <Table.Cell>{instance.shorterId}</Table.Cell>
                        <Table.Cell>{instance.cname}</Table.Cell>
                        <Table.Cell>{instance.europeanStart}</Table.Cell>
                        <Table.Cell>{instance.europeanEnd}</Table.Cell>
                      </Table.Row>
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
        </Container>
      </div>
    )
  }
}

const mapStateToProps = (state, ownProps) => {
  return {
    loading: state.loading,
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

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(CourseImport)
