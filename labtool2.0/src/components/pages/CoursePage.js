import React, { Component } from 'react'
import { Button, Table, Card, Transition, Form, Comment } from 'semantic-ui-react'
import { Link } from 'react-router-dom'
import { connect } from 'react-redux'
import { createOneComment } from '../../services/comment'
import { coursePageInformation } from '../../services/courseInstance'

class CoursePage extends Component {

  handleSubmit = async e => {
    e.preventDefault()
    const content = {
      hidden: false,
      comment: e.target.content.value,
      week: parseInt(e.target.name),
      from: this.props.user.user.username
    }
    try {
      await this.props.createOneComment(content)
      await this.props.coursePageInformation(this.props.selectedInstance.ohid)
      document.getElementById('comment').reset()
    } catch (error) {
      console.log(error)
    }
  }

  /**
   * Shows all information related to a course from user, 
   * with information shown depending on whether the user 
   * is a teacher or student on a course.
   */
  render() {
    let allPoints = 0
    const createIndents = (data, siId) => {
      const indents = []

      for (var i = 0; i < this.props.selectedInstance.weekAmount; i++) {
        let pushattava =
          <Table.Cell key={i}>
            <p>Not reviewed!</p>
          </Table.Cell>

        for (var j = 0; j < data.length; j++) {
          if ((i + 1) === data[j].weekNumber) {
            allPoints += data[j].points
            pushattava = <Table.Cell key={i}>
              <p>{data[j].points}</p>
              {/*               <Link to={`/labtool/reviewstudent/${this.props.selectedInstance.ohid}/${siId}/${i + 1}`}>
                <Button circular color='orange' size="tiny" icon="edit black large" ></Button>
          </Link> */}
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
        headers.push(<Table.HeaderCell key={i}>Week {i + 1} </Table.HeaderCell>)
      }
      return headers
    }

    return (
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


        {/** Shown when the users role in this course is teacher.*/}
        {this.props.courseData.role === 'teacher' ?
          <div>
            <br />
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

            <h2> Students </h2>
            <Table celled unstackable>
              <Table.Header>
                <Table.Row>
                  <Table.HeaderCell>Name</Table.HeaderCell>
                  <Table.HeaderCell> Github </Table.HeaderCell>
                  {createHeaders()}
                  <Table.HeaderCell> Sum </Table.HeaderCell>
                  <Table.HeaderCell> Instructor </Table.HeaderCell>
                  <Table.HeaderCell> Review </Table.HeaderCell>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {this.props.courseData.data.map(data =>

                  <Table.Row key={data.id}>
                    <Table.Cell>{data.User.firsts} {data.User.lastname}</Table.Cell>
                    <Table.Cell><p>{data.projectName}</p><a>{data.github}</a></Table.Cell>
                    {createIndents(data.weeks, data.id)}
                    <Table.Cell>{allPoints}</Table.Cell>
                    <Table.Cell> Ohjaaja </Table.Cell>

                    <Table.Cell>

                      <Link to={`/labtool/browsereviews/${this.props.selectedInstance.ohid}/${data.id}`}>
                        <Button circular color='orange' size="tiny" icon="edit black large" ></Button>

                      </Link>
                    </Table.Cell>
                  </Table.Row>
                )}
              </Table.Body>
            </Table>
          </div>
          :
          <div></div>
        }

        {/** Shown when the users role in this course is student.*/}
        {this.props.courseData.role === "student" && this.props.courseData.data !== null
          ? <div>

            <h3> </h3>

            <Card fluid color='yellow'>
              <Card.Content>
                <h3> {this.props.courseData.data.projectName} </h3>
                <h3> <a href={this.props.courseData.data.github}>{this.props.courseData.data.github}</a> </h3>
              </Card.Content>
            </Card>

            <h3> Points and feedback </h3>

            <Table celled padded unstackable>
              <Table.Header>
                <Table.Row>
                    <Table.HeaderCell>Week</Table.HeaderCell>
                    <Table.HeaderCell>Points</Table.HeaderCell>
                    <Table.HeaderCell>Feedback</Table.HeaderCell>
                    <Table.HeaderCell>Comments</Table.HeaderCell>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {this.props.courseData.data.weeks.map(week => (
                    <Table.Row>
                      <Table.Cell>{week.weekNumber}</Table.Cell>
                      <Table.Cell>{week.points}</Table.Cell>
                      <Table.Cell>{week.feedback}</Table.Cell>
                      <Table.Cell>
                           
                        <Comment.Group>
                        {week.comments.map(comment => (
                          <Comment>
                            <Comment.Author>{comment.from}</Comment.Author>
                            <Comment.Text> {comment.comment} </Comment.Text>
                          </Comment>
                        ))}
                        </Comment.Group>
                        <Form reply onSubmit={this.handleSubmit} name={week.id} id='comment' >
                          <Form.TextArea name="content" placeholder='Your comment...' />
                          
                          <Button content='Add Reply' labelPosition='left' icon='edit' primary />
                        </Form>
                      
                      </Table.Cell>
                    </Table.Row>
                  ))}
                </Table.Body>
              </Table>
            </div>
          : (
            <div />
          )}
      </div>
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

export default connect(mapStateToProps, { createOneComment, coursePageInformation })(CoursePage)
