import React, { Component } from 'react'
import { Button, Table, List } from 'semantic-ui-react'

class BrowseReviews extends Component {
  render() {
    return (
      <div>
        <h2> Tiralabra 2018 Kevät </h2>
        <h3> Maija Meikäläinen </h3>
        <h2> Week 1 </h2>
        <Table celled padded >
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell>Week</Table.HeaderCell>
              <Table.HeaderCell>Points</Table.HeaderCell>
              <Table.HeaderCell>Comment</Table.HeaderCell>
              <Table.HeaderCell> Edit </Table.HeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            <Table.Row>
              <Table.Cell>1</Table.Cell>
              <Table.Cell>5</Table.Cell>
              <Table.Cell>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque ut ultrices sapien. Aliquam neque diam, scelerisque nec metus sit amet, euismod interdum orci. Vivamus eu convallis ex. Etiam faucibus varius lorem in egestas. Pellentesque quis elementum magna, quis sagittis ex. Mauris a sem dignissim, fringilla elit ac, iaculis quam. Ut ut lacus sit amet massa blandit tincidunt. Mauris mattis tempor nibh, fermentum interdum massa placerat tempor.</Table.Cell>
              <Table.Cell><Button color='blue' > <List.Item icon='edit' /></Button></Table.Cell>
            </Table.Row>
            <Table.Row>
              <Table.Cell>2</Table.Cell>
              <Table.Cell>2</Table.Cell>
              <Table.Cell>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque ut ultrices sapien. Aliquam neque diam, scelerisque nec metus sit amet, euismod interdum orci. Vivamus eu convallis ex. Etiam faucibus varius lorem in egestas. Pellentesque quis elementum magna, quis sagittis ex. Mauris a sem dignissim, fringilla elit ac, iaculis quam. Ut ut lacus sit amet massa blandit tincidunt. Mauris mattis tempor nibh, fermentum interdum massa placerat tempor.</Table.Cell>
              <Table.Cell><Button color='blue' > <List.Item icon='edit' /></Button></Table.Cell>
            </Table.Row>
            <Table.Row>
              <Table.Cell>3</Table.Cell>
              <Table.Cell>0</Table.Cell>
              <Table.Cell>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque ut ultrices sapien. Aliquam neque diam, scelerisque nec metus sit amet, euismod interdum orci. Vivamus eu convallis ex. Etiam faucibus varius lorem in egestas. Pellentesque quis elementum magna, quis sagittis ex. Mauris a sem dignissim, fringilla elit ac, iaculis quam. Ut ut lacus sit amet massa blandit tincidunt. Mauris mattis tempor nibh, fermentum interdum massa placerat tempor.</Table.Cell>
              <Table.Cell><Button color='blue' > <List.Item icon='edit' /></Button></Table.Cell>
            </Table.Row>
            <Table.Row>
              <Table.Cell>4</Table.Cell>
              <Table.Cell>4</Table.Cell>
              <Table.Cell>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque ut ultrices sapien. Aliquam neque diam, scelerisque nec metus sit amet, euismod interdum orci. Vivamus eu convallis ex. Etiam faucibus varius lorem in egestas. Pellentesque quis elementum magna, quis sagittis ex. Mauris a sem dignissim, fringilla elit ac, iaculis quam. Ut ut lacus sit amet massa blandit tincidunt. Mauris mattis tempor nibh, fermentum interdum massa placerat tempor.</Table.Cell>
              <Table.Cell><Button color='blue' > <List.Item icon='edit' /></Button></Table.Cell>
            </Table.Row>
            <Table.Row>
              <Table.Cell> null </Table.Cell>
              <Table.Cell> null </Table.Cell>
              <Table.Cell> null </Table.Cell>
              <Table.Cell><Button color='blue' > <List.Item icon='edit' /></Button></Table.Cell>
            </Table.Row>
          </Table.Body>
        </Table>
      </div>
    )
  }
}
export default BrowseReviews