import React, { Component } from 'react'
import { Button, Table } from 'semantic-ui-react'
import { Link } from 'react-router-dom'
import { connect } from 'react-redux'

class CoursePage extends Component {


  render() {
    let renderButton = false
    let projectName
    let githubLink
    let instance = []
    if (this.props.studentInstance) {
      instance = this.props.studentInstance.filter(inst => (inst.courseInstanceId == this.props.selectedInstance.id))
    }

    console.log(this.props.courseData.data, 'coiurssafdsaf')




    const headers = []

    const createIndents = (data) => {
      const indents = [];
      for (var i = 0; i < this.props.selectedInstance.weekAmount; i++) {
        if (data[i] !== undefined) {
          const weeks = data.map(week => week.weekNumber === i)
          weeks.forEach(element => {
            indents.push(<Table.Cell><p> {element.points}</p></Table.Cell>)
          })



        } else {
          indents.push(<Table.Cell><p>moro</p></Table.Cell>)

        }
      }
      console.log(data, 'joskus jotian')
      return indents
    }



    return (

      //const CoursePage = ({ name, start, end, week_amount, week_max_points, current_week, handleFieldChange }) => {
      <div className="CoursePage" style={{ textAlignVertical: 'center', textAlign: 'center', }}>
        <div className="ui grid">
          <div className="sixteen wide column">
            <h2>{this.props.selectedInstance.name}</h2>
          </div>I
          {this.props.courseData.data === null
            ?
            <div className="sixteen wide column">
              <Link to={`/labtool/courseregistration/${this.props.selectedInstance.ohid}`}>  <Button>Register</Button></Link>
            </div>
            : <p></p>
          }
        </div>
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


        {this.props.courseData.role === 'teacher' ?
          <div>
            <h3> Students </h3>
            <Table celled unstackable>
              <Table.Header>
                <Table.Row>
                  <Table.HeaderCell>Name</Table.HeaderCell>
                  <Table.HeaderCell> Github </Table.HeaderCell>
                  {/* Maps Week n n++; */}
                  <Table.HeaderCell>Week 1</Table.HeaderCell>
                  <Table.HeaderCell>Week 2</Table.HeaderCell>
                  <Table.HeaderCell>Week 3</Table.HeaderCell>
                  <Table.HeaderCell>Week 4</Table.HeaderCell>
                  <Table.HeaderCell>Week 5</Table.HeaderCell>
                  <Table.HeaderCell>Review</Table.HeaderCell>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {this.props.courseData.data.map(data =>

                  <Table.Row>
                    <Table.Cell>{data.User.firsts} {data.User.lastname}</Table.Cell>
                    <Table.Cell><p>{data.projectName}</p><a>{data.github}</a></Table.Cell>
                    {createIndents(data.weeks)}
                  </Table.Row>
                )}
              </Table.Body>
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
          <div></div>
        }
        {this.props.courseData.role === "student" && this.props.courseData.data !== null
          ? <div>

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
                {console.log(this.props.courseData.data.weeks)}
                {this.props.courseData.data.weeks.map(week =>
                  <Table.Row>
                    <Table.Cell>{week.weekNumber}</Table.Cell>
                    <Table.Cell>{week.points}</Table.Cell>
                    <Table.Cell>{week.comment}</Table.Cell>
                  </Table.Row>
                )}
              </Table.Body>
            </Table>
          </div>
          : <div></div>}

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
    courseData: state.coursePage
  }
}



export default connect(mapStateToProps, {})(CoursePage)