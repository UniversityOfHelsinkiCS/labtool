import React, { Component } from 'react'
import { Button, Table, List, Accordion, Icon, Form, Comment } from 'semantic-ui-react'
import { connect } from 'react-redux'
import { Link } from 'react-router-dom'
import { createOneComment } from '../../services/comment'
import { coursePageInformation } from '../../services/courseInstance'

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
      hidden: false,
      comment: e.target.content.value,
      week: parseInt(e.target.name),
      from: this.props.user.user.username
    }
    try {
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
          for (var i = 0; i < this.props.selectedInstance.weekAmount; i++) {
            const weekPoints = student.weeks.find(week => week.weekNumber == (i + 1))
            if (weekPoints) {
              headers.push(
                <Accordion fluid styled>
                  <Accordion.Title active={activeIndex === i} index={i} onClick={this.handleClick}>
                    <Icon name='dropdown' /> Week {i + 1} </Accordion.Title>
                  <Accordion.Content active={activeIndex === i}>
                    <p>
                      <h4> {student.User.firsts} {student.User.lastname} </h4>
                      <h4> {weekPoints.points} </h4>
                      <h4> {weekPoints.feedback} </h4>
                      <h4> Comments </h4>
                      <Comment.Group>
                      {this.props.courseData.data[0].weeks[i] ? 
                      this.props.courseData.data[0].weeks[i].comments.map(comment => (
                        <Comment>
                        <Comment.Author>{comment.from}</Comment.Author>
                        <Comment.Text> {comment.comment} </Comment.Text>
                      </Comment>
                      )) : <h4> No comments </h4>}
                      </Comment.Group>
                      <Form reply onSubmit={this.handleSubmit} name={weekPoints.id}>
                          <Form.TextArea name="content" />
                          
                          <Button content='Add Reply' labelPosition='left' icon='edit' primary />
                        </Form>
                        <h3>Review</h3>
                      <Link to={`/labtool/reviewstudent/${this.props.selectedInstance.ohid}/${studentInstance}/${i+1}`}>
                        <Button circular color="orange" size="tiny" icon="edit black large" />
                      </Link>
                    </p>
                  </Accordion.Content>
                </Accordion>
              )
            } else {
              headers.push(
                <Accordion fluid styled>
                  <Accordion.Title active={activeIndex === i} index={i} onClick={this.handleClick}>
                    <Icon name='dropdown' /> Week {i + 1} </Accordion.Title>
                  <Accordion.Content active={activeIndex === i}>
                    <p>
                      <h4> {student.User.firsts} {student.User.lastname} </h4>
                      <h4> Not Graded </h4>
                      <h4> No comments </h4>
                      <Link to={`/labtool/reviewstudent/${this.props.selectedInstance.ohid}/${studentInstance}/${i+1}`}>
                        <Button circular color="orange" size="tiny" icon="edit black large" />
                      </Link>
                    </p>
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