import React, { Component } from 'react'
import { Button, Card, Accordion, Icon, Form, Comment } from 'semantic-ui-react'
import { connect } from 'react-redux'
import { Link } from 'react-router-dom'
import { createOneComment } from '../../services/comment'
import { coursePageInformation } from '../../services/courseInstance'

/**
 * Maps all comments from a single instance from coursePage reducer
 */
class BrowseReviews extends Component {
  state = { activeIndex: 0 }

  handleClick = (e, titleProps) => {
    const { index } = titleProps
    const { activeIndex } = this.state
    const newIndex = activeIndex === index ? -1 : index

    this.setState({ activeIndex: newIndex })
  }

  handleSubmit = async e => {
    e.preventDefault()
    const content = {
      hidden: e.target.hidden.checked,
      comment: e.target.content.value,
      week: parseInt(e.target.name),
      from: this.props.user.user.username
    }
    document.getElementById(e.target.name).reset()
    try {
      console.log(e.target)
      await this.props.createOneComment(content)
      await this.props.coursePageInformation(this.props.selectedInstance.ohid)
    } catch (error) {
      console.log(error)
    }
  }

  render() {
    const createHeaders = (studhead, studentInstance) => {
      let headers = []
      studhead.data.map(student => {
        if (student.id == studentInstance) {
          headers.push(
            <Card fluid color='yellow'>
              <Card.Content>
                <h2>{student.User.firsts} {student.User.lastname}</h2>
                <h3> {this.props.courseData.data[0].projectName} </h3>
                <h3> <a href={this.props.courseData.data[0].github}>{this.props.courseData.data[0].github}</a> </h3>
              </Card.Content>
            </Card>
            
          )
          for (var i = 0; i < this.props.selectedInstance.weekAmount; i++) {
            const weekPoints = student.weeks.find(week => week.weekNumber == (i + 1))
            if (weekPoints) {
              headers.push(
                <Accordion key={i} fluid styled>
                  <Accordion.Title active={activeIndex === i} index={i} onClick={this.handleClick}>
                    <Icon name='dropdown' /> Week {i + 1} </Accordion.Title>
                  <Accordion.Content active={activeIndex === i}>
                      <h4> {weekPoints.points} </h4>
                      <h4> {weekPoints.feedback} </h4>
                      <h4> Comments </h4>
                      <Comment.Group>
                      {this.props.courseData.data[0].weeks[i] ? 
                      this.props.courseData.data[0].weeks[i].comments.map(comment => (
                        comment.hidden ?
                        <Comment disabled>
                          <Comment.Content>
                          <Comment.Metadata>
                            <div>Hidden</div>
                          </Comment.Metadata>
                          <Comment.Author>{comment.from}</Comment.Author>
                          <Comment.Text> {comment.comment} </Comment.Text>
                          </Comment.Content>
                        </Comment> :
                        <Comment>
                          <Comment.Author>{comment.from}</Comment.Author>
                          <Comment.Text> {comment.comment} </Comment.Text>
                      </Comment>
                      )) : <h4> No comments </h4>}
                      </Comment.Group>
                      <Form reply onSubmit={this.handleSubmit} name={weekPoints.id} id={weekPoints.id} >
                          <Form.TextArea name="content" placeholder='Your comment...' defaultValue="" />
                          <Form.Checkbox label="Make this comment hidden from others" name="hidden" />
                          <Button content='Add Reply' labelPosition='left' icon='edit' primary />
                        </Form>
                        <h3>Review</h3>
                      <Link to={`/labtool/reviewstudent/${this.props.selectedInstance.ohid}/${studentInstance}/${i+1}`}>
                        <Button circular color="orange" size="tiny" icon="edit black large" />
                      </Link>
                    
                  </Accordion.Content>
                </Accordion>
              )
            } else {
              headers.push(
                <Accordion key={i} fluid styled>
                  <Accordion.Title active={activeIndex === i} index={i} onClick={this.handleClick}>
                    <Icon name='dropdown' /> Week {i + 1} </Accordion.Title>
                  <Accordion.Content active={activeIndex === i}>
                      <h4> Not Graded </h4>
                      <h4> No comments </h4>
                      <Link to={`/labtool/reviewstudent/${this.props.selectedInstance.ohid}/${studentInstance}/${i+1}`}>
                        <Button circular color="orange" size="tiny" icon="edit black large" />
                      </Link>
                  </Accordion.Content>
                </Accordion>
              )
            }
          }
        }
      })
      return headers
    }

    const { activeIndex } = this.state

    return (
      <div>
        {this.props.courseData.role === 'teacher'
          ? <div>
            <h2> {this.props.selectedInstance.name}</h2>
            {createHeaders(this.props.courseData, this.props.studentInstance)}
          </div>
          : <p></p>}
      </div>
    )
  }
}
const mapStateToProps = (state, ownProps) => {
  return {
    ownProps,
    user: state.user,
    selectedInstance: state.selectedInstance,
    courseData: state.coursePage
  }
}



export default connect(mapStateToProps, { createOneComment, coursePageInformation })(BrowseReviews)