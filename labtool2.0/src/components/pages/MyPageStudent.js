import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Card, Button, Checkbox, Header, Table, Container, List } from 'semantic-ui-react'
import './MyPage.css'
import { Link } from 'react-router-dom'

class MyPageStudent extends Component {

  editEmail = (event) => {
    event.preventDefault()

  }

  render() {
    const user = { ...this.props.user.returnedUser }
    return (
      <div>
        <Card fluid color='yellow'>
          <Card.Content>
            <Table fixed basic='very'>
              <Table.Header>
                <Header as='h3' block>
                  {user.firsts} {user.lastname}
                </Header>
              </Table.Header>
              <Table.Row>
                <Table.Cell><Card.Description><Header size='small'>{user.studentnumber}</Header></Card.Description></Table.Cell>
                <Table.Cell><Card.Description>{user.email}</Card.Description></Table.Cell>
                <Table.Cell><Button color='yellow' ><Link to="/email" > <List.Item icon='edit' /></Link></Button></Table.Cell>
              </Table.Row>
              <Table.Row>
                <Table.Cell></Table.Cell>
                <Table.Cell>I want to receive notifications for receiving feedback etc.</Table.Cell>
                <Table.Cell><Checkbox /></Table.Cell>
              </Table.Row>
            </Table>
          </Card.Content>
        </Card>
        <Container>
          <Header as='h2' className='CoursesHeader'>My Courses</Header>
          <Table singleline>
            <Table.Body>
              <Table.Row>
                <Table.Cell>Aineopintojen harjoitustyö: Tietorakenteet ja algoritmit (periodi IV)</Table.Cell>
                <Table.Cell textAlign='center'><div>
                  <Button circular size="tiny" icon="large black eye icon"></Button>
                </div></Table.Cell>
              </Table.Row>
              <Table.Row>
                <Table.Cell>Aineopintojen harjoitustyö: Tietokantasovellus (periodi IV)</Table.Cell>
                <Table.Cell textAlign='center'><div>
                  <Button circular color="green" size="tiny" icon="large black eye icon"></Button>
                </div></Table.Cell>
              </Table.Row>
              <Table.Row>
                <Table.Cell>Aineopintojen harjoitustyö: Tietorakenteet ja algoritmit (periodi III)</Table.Cell>
                <Table.Cell textAlign='center'><div>
                  <Button circular disabled size="tiny" icon="large black eye icon"></Button>
                </div></Table.Cell>
              </Table.Row>
            </Table.Body>
          </Table>
          <div className="Instructions">
            <List>
              <List.Item icon='eye' content='Show course page' />
              <List.Item icon='edit' content='Edit course' />
              <List.Item icon='plus' content='Create course' />
            </List>
          </div>
        </Container>
      </div>
    )
  }
}

const mapStateToProps = (state) => {
  return {
    user: state.user,
  }
}


export default connect(mapStateToProps, {})(MyPageStudent)