import React, { Component } from 'react'
import { Button, Table } from 'semantic-ui-react'
import { Link } from 'react-router-dom'
import { connect } from 'react-redux'

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

    var weeks = [];
    for (var i = 1; i <= this.props.selectedInstance.weekAmount; i++) {
      weeks.push(<Table.Row> <Table.Cell>{i}</Table.Cell> <Table.Cell>0</Table.Cell> <Table.Cell>Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.</Table.Cell></Table.Row>

      );
    }
    return (

      //const CoursePage = ({ name, start, end, week_amount, week_max_points, current_week, handleFieldChange }) => {
      <div className="CoursePage" style={{ textAlignVertical: 'center', textAlign: 'center', }}>
        <div class="ui grid">
          <div class="sixteen wide column">
            <h2>{this.props.selectedInstance.name}</h2>

            {instance !== [] && instance !== undefined && instance ?
              instance.github && this.props.coursePage.role === "student" ?
                <div>
                  <h2>{instance.projectName}</h2>
                  <h3>{instance.github}</h3>

                  <div class="sixteen wide column" >
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
                        {weeks}
                      </Table.Body>
                    </Table> </div>
                </div> :
                <Link to={`/labtool/courseregistration/${this.props.selectedInstance.ohid}`}>  <Button>Register</Button></Link> :
              <Link to={`/labtool/courseregistration/${this.props.selectedInstance.ohid}`}>  <Button>Register</Button></Link>
            }
          </div>


          {this.props.coursePage.role == "teacher" ?
            <div class="sixteen wide column" >
              <Table celled >
                <Table.Header>
                  <Table.Row>
                    <Table.HeaderCell>Active: {JSON.stringify(this.props.selectedInstance.active)}</Table.HeaderCell>
                    <Table.HeaderCell>Week amount: {this.props.selectedInstance.weekAmount}</Table.HeaderCell>
                    <Table.HeaderCell>Current week: {this.props.selectedInstance.currentWeek}</Table.HeaderCell>
                    <Table.HeaderCell>Week maxpoints: {this.props.selectedInstance.weekMaxPoints}</Table.HeaderCell>
                  </Table.Row>
                </Table.Header>
              </Table>
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
            </div>
            :

            <div> </div>
          }
        </div >
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