import React, { Component } from 'react'
import { Card, Button, Header, Table, Container, Message, List, Checkbox } from 'semantic-ui-react'
import './MyPage.css'

class MyPageStudent extends Component {
  render() {
    return (
      <div>
        <Card fluid color='yellow'>
          <Card.Content>
            <Table fixed basic='very'>
              <Table.Header>
                <Header as='h3' block>
                  Tatti Teikäläinen
                </Header>
              </Table.Header>
              <Table.Row>
                <Table.Cell><Card.Description><Header size='small'>014 555 555</Header></Card.Description></Table.Cell>
                <Table.Cell><Card.Description>email@gmail.com</Card.Description></Table.Cell>
                <Table.Cell><Button color='yellow' > <List.Item icon='edit' /></Button></Table.Cell>
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
          <Table singleline key='grey'>
            <Table.Body>
              <Table.Row>
                <Table.Cell>Aineopintojen harjoitustyö: Tietorakenteet ja algoritmit (periodi IV)</Table.Cell>
                <Table.Cell textAlign='center'><div>
                  <Button circular color="green" size="tiny" icon="large black plus icon" />
                  <Button circular disabled size="tiny" icon="large black eye icon"></Button>
                </div></Table.Cell>
              </Table.Row>
              <Table.Row>
                <Table.Cell>Aineopintojen harjoitustyö: Tietokantasovellus (periodi IV)</Table.Cell>
                <Table.Cell textAlign='center'><div>
                  <Button circular color="teal" size="tiny" icon="large black edit icon" />
                  <Button circular size="tiny" icon="large black eye icon" />
                </div></Table.Cell>
                <Table.Cell textAlign='center'></Table.Cell>
              </Table.Row>
              <Table.Row>
                <Table.Cell>Aineopintojen harjoitustyö: Tietorakenteet ja algoritmit (periodi III)</Table.Cell>
                <Table.Cell textAlign='center'><div>
                  <Button circular color="teal" size="tiny" icon="large black edit icon" />
                  <Button circular size="tiny" icon="large black eye icon"></Button>
                </div></Table.Cell>
                <Table.Cell></Table.Cell>
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

export default MyPageStudent