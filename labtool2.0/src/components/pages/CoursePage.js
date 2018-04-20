import React, { Component } from 'react'
import { Button, Table } from 'semantic-ui-react'
import { Link } from 'react-router-dom'
import { connect } from 'react-redux'
import { Card, Header, Grid, Divider } from 'semantic-ui-react'

class CoursePage extends Component {


  componentDidMount() {
    console.log(this.props.selectedInstance.id, 'tässä id')
  }

  render() {
    let instance = []
    if (this.props.coursePage !== [] && this.props.coursePage !== null) {
      if (this.props.coursePage.data) {
        instance = this.props.coursePage.data[0]
      }
    }

    var weeks = []
    for (var i = 1; i <= this.props.selectedInstance.weekAmount; i++) {
      weeks.push(<Table.Row> <Table.Cell>{i}</Table.Cell> <Table.Cell>0</Table.Cell> <Table.Cell>Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.</Table.Cell></Table.Row>

      )
    }
    return (
      
    //const CoursePage = ({ name, start, end, week_amount, week_max_points, current_week, handleFieldChange }) => {
      <div className="CoursePage" style={{ textAlignVertical: 'center', textAlign: 'center', }}>
        <div className="ui grid">
          <Grid centered stretched>
            <Header as='h1' textAlign="center" attached="top" >{this.props.selectedInstance.name}</Header>
          </Grid>
          <Card centered raised fluid>
            <Card.Content>
              <Card.Meta>
                <Table small compact basic="very" >

                  <Table.Row>
                    <Table.Cell>Active</Table.Cell>
                    <Table.Cell>{JSON.stringify(this.props.selectedInstance.active)}</Table.Cell>
                  </Table.Row>
                  <Table.Row>    
                    <Table.Cell>Week amount</Table.Cell>
                    <Table.Cell>{this.props.selectedInstance.weekAmount}</Table.Cell>
                  </Table.Row>
                  <Table.Row>
                    <Table.Cell>Current week</Table.Cell>
                    <Table.Cell>{this.props.selectedInstance.currentWeek}</Table.Cell>
                  </Table.Row>
                  <Table.Row>
                    <Table.Cell>Week maxpoints</Table.Cell>
                    <Table.Cell>{this.props.selectedInstance.weekMaxPoints}</Table.Cell>
                  </Table.Row>
                </Table>
              </Card.Meta>
              <Divider section />
              {instance !== [] && instance !== undefined && instance ?
                instance.github ?
                  <div> 
                    <Card.Header><h2>{instance.projectName}</h2></Card.Header>
                    <Card.Description><h3><a href={instance.github}>{instance.github}</a></h3></Card.Description></div>
                  :
                  <Card.Description>
                    <Link to={`/labtool/courseregistration/${this.props.selectedInstance.ohid}`}>  <Button>Register</Button></Link> </Card.Description> :
                <Card.Description> 
                  <Link to={`/labtool/courseregistration/${this.props.selectedInstance.ohid}`}>  <Button>Register</Button></Link> </Card.Description>}
            </Card.Content>
          </Card>
                

          <h3> Students </h3>
          <Table celled unstackable>
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell>Name</Table.HeaderCell>
                <Table.HeaderCell> Github </Table.HeaderCell>
                <Table.HeaderCell>Week 1</Table.HeaderCell>
                <Table.HeaderCell>Week 2</Table.HeaderCell>
                <Table.HeaderCell>Week 3</Table.HeaderCell>
                <Table.HeaderCell>Week 4</Table.HeaderCell>
                <Table.HeaderCell>Week 5</Table.HeaderCell>
                <Table.HeaderCell>Review</Table.HeaderCell>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              <Table.Row >
                <Table.Cell>Maija Meikäläinen  </Table.Cell>
                <Table.Cell>Name and link</Table.Cell>
                <Table.Cell>4</Table.Cell>
                <Table.Cell>2</Table.Cell>
                <Table.Cell>1</Table.Cell>
                <Table.Cell>0</Table.Cell>
                <Table.Cell>4</Table.Cell>
                <Table.Cell><Button circular color='orange' size="tiny" icon="large black edit"></Button></Table.Cell>
              </Table.Row>
              <Table.Row>
                <Table.Cell>Toivo Untonen </Table.Cell>
                <Table.Cell>Name and link</Table.Cell>
                <Table.Cell>1</Table.Cell>
                <Table.Cell>3</Table.Cell>
                <Table.Cell>2</Table.Cell>
                <Table.Cell>5</Table.Cell>
                <Table.Cell>4.5</Table.Cell>
                <Table.Cell><Button circular color='orange' size="tiny" icon="large black edit"></Button></Table.Cell>
              </Table.Row>
              <Table.Row>
                <Table.Cell>Joonatan Järvinen </Table.Cell>
                <Table.Cell>Name and link</Table.Cell>
                <Table.Cell>4</Table.Cell>
                <Table.Cell>0</Table.Cell>
                <Table.Cell>4</Table.Cell>
                <Table.Cell>5 </Table.Cell>
                <Table.Cell>1.5</Table.Cell>
                <Table.Cell><Button circular color='orange' size="tiny" icon="edit black large" ></Button></Table.Cell>
              </Table.Row>
            </Table.Body>

      
          </Table>
            
          <div className="sixteen wide column" >
            <h3> Comments and feedback </h3>
            <Table celled padded unstackable>
              <Table.Header>
                <Table.Row>
                  <Table.HeaderCell>Week</Table.HeaderCell>
                  <Table.HeaderCell>Points</Table.HeaderCell>
                  <Table.HeaderCell>Comment</Table.HeaderCell>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                <Table.Row>
                  <Table.Cell>1</Table.Cell>
                  <Table.Cell>5</Table.Cell>
                  <Table.Cell>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque ut ultrices sapien. Aliquam neque diam, scelerisque nec metus sit amet, euismod interdum orci. Vivamus eu convallis ex. Etiam faucibus varius lorem in egestas. Pellentesque quis elementum magna, quis sagittis ex. Mauris a sem dignissim, fringilla elit ac, iaculis quam. Ut ut lacus sit amet massa blandit tincidunt. Mauris mattis tempor nibh, fermentum interdum massa placerat tempor.</Table.Cell>
                </Table.Row>
                <Table.Row>
                  <Table.Cell>2</Table.Cell>
                  <Table.Cell>2</Table.Cell>
                  <Table.Cell>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque ut ultrices sapien. Aliquam neque diam, scelerisque nec metus sit amet, euismod interdum orci. Vivamus eu convallis ex. Etiam faucibus varius lorem in egestas. Pellentesque quis elementum magna, quis sagittis ex. Mauris a sem dignissim, fringilla elit ac, iaculis quam. Ut ut lacus sit amet massa blandit tincidunt. Mauris mattis tempor nibh, fermentum interdum massa placerat tempor.</Table.Cell>
                </Table.Row>
                <Table.Row>
                  <Table.Cell>3</Table.Cell>
                  <Table.Cell>0</Table.Cell>
                  <Table.Cell>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque ut ultrices sapien. Aliquam neque diam, scelerisque nec metus sit amet, euismod interdum orci. Vivamus eu convallis ex. Etiam faucibus varius lorem in egestas. Pellentesque quis elementum magna, quis sagittis ex. Mauris a sem dignissim, fringilla elit ac, iaculis quam. Ut ut lacus sit amet massa blandit tincidunt. Mauris mattis tempor nibh, fermentum interdum massa placerat tempor.</Table.Cell>
                </Table.Row>
                <Table.Row>
                  <Table.Cell>4</Table.Cell>
                  <Table.Cell>4</Table.Cell>
                  <Table.Cell>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque ut ultrices sapien. Aliquam neque diam, scelerisque nec metus sit amet, euismod interdum orci. Vivamus eu convallis ex. Etiam faucibus varius lorem in egestas. Pellentesque quis elementum magna, quis sagittis ex. Mauris a sem dignissim, fringilla elit ac, iaculis quam. Ut ut lacus sit amet massa blandit tincidunt. Mauris mattis tempor nibh, fermentum interdum massa placerat tempor.</Table.Cell>
                </Table.Row>
                <Table.Row>
                  <Table.Cell>5</Table.Cell>
                  <Table.Cell>4.5</Table.Cell>
                  <Table.Cell>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque ut ultrices sapien. Aliquam neque diam, scelerisque nec metus sit amet, euismod interdum orci. Vivamus eu convallis ex. Etiam faucibus varius lorem in egestas. Pellentesque quis elementum magna, quis sagittis ex. Mauris a sem dignissim, fringilla elit ac, iaculis quam. Ut ut lacus sit amet massa blandit tincidunt. Mauris mattis tempor nibh, fermentum interdum massa placerat tempor.</Table.Cell>
                </Table.Row>
              </Table.Body>
            </Table> </div>
        </div>
      </div >
    )
  }
}

const mapStateToProps = (state) => {
  return {
    user: state.user,
    studentInstance: state.studentInstance,
    teacherInstance: state.teacherInstance,
    selectedInstance: state.selectedInstance,
    coursePage: state.coursePage
  }
}



export default connect(mapStateToProps, {})(CoursePage)