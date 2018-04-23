import React, { Component } from 'react'
import { Button, Table, Grid, Card, Header, Divider } from 'semantic-ui-react'
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
    console.log(instance)

    var weeks = []
    var weeksTeacher = []
    for (var i = 1; i <= this.props.selectedInstance.weekAmount; i++) {
      weeks.push(<Table.Row> <Table.Cell>{i}</Table.Cell> <Table.Cell>0</Table.Cell> <Table.Cell>Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.</Table.Cell></Table.Row>)
      weeksTeacher.push(<Table.HeaderCell>Week {i}</Table.HeaderCell>)
    }
                      

    return (
      <div className="CoursePage" style={{ textAlignVertical: 'center', textAlign: 'center', }}>
        <div className="ui grid">
          


          {this.props.coursePage.role == 'teacher' ?
            <div >

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
                    {weeksTeacher}
                    <Table.HeaderCell>Review</Table.HeaderCell>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {this.props.coursePage.data.map(instance => 
                    <Table.Row textAlign="center" >
                      <Table.Cell>{instance.User.firsts} {instance.User.lastname}</Table.Cell>
                      <Table.Cell><a href={instance.github}>{instance.projectName}</a></Table.Cell>
                      {weeksTeacher.map(w =>
                        <Table.Cell>0</Table.Cell>
                      )}
                      <Table.Cell><Link to={`/labtool/courses/${this.props.selectedInstance.ohid}/reviewStudent/${instance.User.id}`}><Button circular color='orange' size="tiny" icon="large black edit" ></Button></Link></Table.Cell>
                    </Table.Row>
                  )}
                </Table.Body>
              </Table>
            </div>
            :
            <div className="sixteen wide column">
              <h2>{this.props.selectedInstance.name}</h2>

              {instance !== [] && instance !== undefined && instance ?
                instance.github ?
                  <div>
                    <h2>{instance.projectName}</h2>
                    <h3><a href={instance.github} >{instance.github}</a></h3>

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
                          {weeks}
                        </Table.Body>
                      </Table> </div>
                  </div> :
                  <div className="sixteen wide column">
                    <Link to={`/labtool/courseregistration/${this.props.selectedInstance.ohid}`}>  <Button>Register</Button></Link>
                  </div> : <Link to={`/labtool/courseregistration/${this.props.selectedInstance.ohid}`}>  <Button>Register</Button></Link>
              }
            </div>
          }
        </div>
      </div>
    )} 
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