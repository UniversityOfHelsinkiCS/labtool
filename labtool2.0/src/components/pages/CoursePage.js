import React, { Component } from 'react'
import { Button, Table, Grid, Card, Header, Divider } from 'semantic-ui-react'
import { Link } from 'react-router-dom'
import { connect } from 'react-redux'

class CoursePage extends Component {

  render() {
    let instance = []
    if (this.props.studentInstance) {
      instance = this.props.studentInstance.filter(inst => (inst.courseInstanceId == this.props.selectedInstance.id))
    }


    const createIndents = (data, siId) => {
      const indents = []
      for (var i = 0; i < this.props.selectedInstance.weekAmount; i++) {
        let pushattava =
          <Table.Cell>
            <p>Not reviewed!</p>
          </Table.Cell>

        for (var j = 0; j < data.length; j++) {
          if ((i + 1) === data[j].weekNumber) {
            pushattava = <Table.Cell>
              <p>{data[j].points}</p>
              <Link to={`/labtool/reviewstudent/${this.props.selectedInstance.ohid}/${siId}/${i + 1}`} joku={"teerenpeli"}>
                <Button circular color='orange' size="tiny" icon="edit black large" ></Button>
              </Link>
            </Table.Cell>

          }
        }
        indents.push(pushattava)
      }
      return indents
    }

    const createHeaders = () => {
      const headers = []
      for (var i = 0; i < this.props.selectedInstance.weekAmount; i++) {
        headers.push(<Table.HeaderCell>Week {i + 1} </Table.HeaderCell>)
      }
      return headers
    }

    const review = () => {

    }


    return (
      //const CoursePage = ({ name, start, end, week_amount, week_max_points, current_week, handleFieldChange }) => {
      <div className="CoursePage" style={{ textAlignVertical: 'center', textAlign: 'center', }}>
        <div className="ui grid">
          <div className="sixteen wide column">
            <h2>{this.props.selectedInstance.name}</h2>
          </div>
          {this.props.courseData.data === null
            ?
            <div className="sixteen wide column">
              <Link to={`/labtool/courseregistration/${this.props.selectedInstance.ohid}`}>  <Button>Register</Button></Link>
            </div>
            : <p></p>
          }
        </div>



        {this.props.courseData.role === 'teacher' ?
          <div>

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
                  {createHeaders()}
                  <Table.HeaderCell> Maxpoints </Table.HeaderCell>
                  <Table.HeaderCell> Instructor </Table.HeaderCell>
                  <Table.HeaderCell> Review </Table.HeaderCell>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {this.props.courseData.data.map(data =>

                  <Table.Row>
                    <Table.Cell>{data.User.firsts} {data.User.lastname}</Table.Cell>
                    <Table.Cell><p>{data.projectName}</p><a>{data.github}</a></Table.Cell>
                    {createIndents(data.weeks, data.id)}
                    <Table.Cell> Summa </Table.Cell>
                    <Table.Cell> Ohjaaja </Table.Cell>
                    <Link to={`/labtool/browsereviews/`}>
                      <Button circular color='orange' size="tiny" icon="edit black large" onClick={review()} ></Button>
                    </Link>

                  </Table.Row>
                )}
              </Table.Body>
            </Table>
          </div>
          :
          <div></div>
        }
        {this.props.courseData.role === "student" && this.props.courseData.data !== null
          ? <div>

            <h3> </h3>

            <Card fluid color='yellow'>
              <Card.Content>
                <h3> {this.props.courseData.data.projectName} </h3>
                <h3> <Link to={this.props.courseData.data.github}>{this.props.courseData.data.github}</Link> </h3>
              </Card.Content>
            </Card>

            <h3> Points and feedback </h3>

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