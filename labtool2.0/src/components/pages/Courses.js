import React, { Component } from 'react'
import { Button, List, Container, Header, Table } from 'semantic-ui-react'
import { connect } from 'react-redux'
import { Link } from 'react-router-dom'

class Courses extends Component {
  render() {
    return (
      <div>
        <Container>
          <Header as="h2">Courses</Header>
          <Table celled>
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell colSpan="1">Course id</Table.HeaderCell>
                <Table.HeaderCell colSpan="1">Course name</Table.HeaderCell>
                <Table.HeaderCell colSpan="1">Course start date</Table.HeaderCell>
                <Table.HeaderCell colSpan="1">Course active</Table.HeaderCell>

                <Table.HeaderCell colSpan="2">jotain</Table.HeaderCell>
              </Table.Row>
            </Table.Header>

            <Table.Body>
              {this.props.courseInstance.map(instance => (
                <Table.Row key={''}>
                  <Table.Cell>{instance.ohid} </Table.Cell>
                  <Table.Cell>
                    <Link to="{`/labtool/ModifyCourseInstancePage/${instance.ohid}`}">{instance.name} </Link>
                  </Table.Cell>
                  <Table.Cell>{instance.start.substring(0, 10)} </Table.Cell>
                  <Table.Cell>{JSON.stringify(instance.active)} </Table.Cell>

                  <Table.Cell textAlign="right">
                    <div>
                      <Link to={`/labtool/courses/${instance.ohid}`}>
                        <Button circular color="blue" size="tiny" icon="large black eye icon" />
                      </Link>
                      <Link to={`/labtool/ModifyCourseInstancePage/${instance.ohid}`}>
                        <Button circular color="orange" size="tiny" icon="large black edit icon" />
                      </Link>
                    </div>
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>

          <div className="Instructions">
            <List>
              <List.Item icon="eye" content="Show course page" />
              <List.Item icon="edit" content="Edit course" />
            </List>
          </div>
        </Container>
      </div>
    )
  }
}

const mapStateToProps = (state, ownProps) => {
  return {
    courseInstance: state.courseInstance
  }
}

export default connect(mapStateToProps, null)(Courses)
