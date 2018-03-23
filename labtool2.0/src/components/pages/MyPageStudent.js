import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Card, Button, Checkbox, Header, Table, Container, Message, List } from 'semantic-ui-react'
import './MyPage.css'

class MyPageStudent extends Component {

  render() {
    const user = { ... this.props.user.returnedUser }
    return (
      <div>
        <Message
          success
          header='Login successful'
          color='green'
        />
        <Card fluid color='green'>
          <Card.Content>
            <Table fixed basic='very'>
              <Table.Header>
                <Header as='h3' block>
                  {user.firsts} {user.lastname}
                </Header>
              </Table.Header>
              <Table.Row>
                <Table.Cell><Card.Description><Header size='small'>*opiskelijanumero*</Header></Card.Description></Table.Cell>
                <Table.Cell><Card.Description>email@gmail.com</Card.Description></Table.Cell>
                <Table.Cell><Button>Muokkaa</Button></Table.Cell>
              </Table.Row>
              <Table.Row>
                <Table.Cell></Table.Cell>
                <Table.Cell>I want to receive emails regarding my courses</Table.Cell>
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