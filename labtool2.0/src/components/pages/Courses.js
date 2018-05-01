import React, { Component } from 'react'
import { Button, List, Container, Header, Table, Icon } from 'semantic-ui-react'
import { connect } from 'react-redux'
import { Link } from 'react-router-dom'

class Courses extends Component {
  render() {
    return (
      <div>
        <Container>
          <Header as="h2">Courses</Header>
          <Table celled singleLine>
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell colSpan="1">Course id</Table.HeaderCell>
                <Table.HeaderCell colSpan="1">Course name</Table.HeaderCell>
                <Table.HeaderCell colSpan="1">Course start date</Table.HeaderCell>
                <Table.HeaderCell colSpan="1">Course active</Table.HeaderCell>

                <Table.HeaderCell colSpan="2" />
              </Table.Row>
            </Table.Header>

            <Table.Body>
              {this.props.courseInstance.map(instance => (
                <Table.Row key={''}>
                  <Table.Cell>{instance.ohid} </Table.Cell>
                  <Table.Cell selectable>  <a href='{`/courses/${instance.ohid}`}'>{instance.name}</a>
                  </Table.Cell>
                  <Table.Cell>{instance.start.substring(0, 10)} </Table.Cell>
                  <Table.Cell>{JSON.stringify(instance.active)} </Table.Cell>

                  <Table.Cell textAlign="center">
                    <div>
                      {instance.active === true ? (
                        <Button circular size="tiny" icon="large black eye icon" as={Link} to={`/labtool/courses/${instance.ohid}`} style={{ backgroundColor: '#21ba45' }} />
                    ) : (
                        <Button circular size="tiny" icon="large black eye icon" as={Link} to={`/labtool/courses/${instance.ohid}`} />
                      )}
                    </div>
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>

          <div className="Instructions">
            <List>
              <List.Item icon="eye" content="Show course page" />
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
