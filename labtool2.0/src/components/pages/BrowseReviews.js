import React, { Component } from 'react'
import { Button, Card, Accordion, Icon, Form, Comment } from 'semantic-ui-react'
import { connect } from 'react-redux'
import { Link } from 'react-router-dom'
import { createOneComment } from '../../services/comment'
import { getOneCI, coursePageInformation } from '../../services/courseInstance'
import ReactMarkdown from 'react-markdown'

/**
 * Maps all comments from a single instance from coursePage reducer
 */
export class BrowseReviews extends Component {
  state = { activeIndex: 0 }

  componentWillMount() {
    this.props.getOneCI(this.props.courseId)
    this.props.coursePageInformation(this.props.courseId)
  }

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
      week: parseInt(e.target.name, 10)
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
        // studentInstance is id of student. Type: String
        // Tämä pitää myös korjata.
        if (student.id == studentInstance) {
          headers.push(
            <Card fluid color="yellow">
              <Card.Content>
                <h2>
                  {student.User.firsts} {student.User.lastname}
                </h2>
                <h3> {student.projectName} </h3>
                <h3>
                  {' '}
                  <a href={student.github}>{student.github} </a>
                </h3>
              </Card.Content>
            </Card>
          )
          for (var i = 0; i < this.props.selectedInstance.weekAmount; i++) {
            const weeks = student.weeks.find(week => week.weekNumber === i + 1)
            if (weeks) {
              headers.push(
                <Accordion key={i} fluid styled>
                  <Accordion.Title active={activeIndex === i} index={i} onClick={this.handleClick}>
                    <Icon name="dropdown" /> Week {i + 1}, points {weeks.points}
                  </Accordion.Title>
                  <Accordion.Content active={activeIndex === i}>
                    <Card fluid color="yellow">
                      <Card.Content>
                        <h4> Points: {weeks.points} </h4>
                        <h4>
                          {' '}
                          Weekly feedback: <ReactMarkdown>{weeks.feedback}</ReactMarkdown>{' '}
                        </h4>
                      </Card.Content>
                    </Card>
                    <h4> Comments </h4>
                    <Comment.Group>
                      {weeks ? (
                        weeks.comments.map(
                          comment =>
                            comment.hidden ? (
                              <Comment disabled>
                                <Comment.Content>
                                  <Comment.Metadata>
                                    <div>Hidden</div>
                                  </Comment.Metadata>
                                  <Comment.Author>{comment.from}</Comment.Author>
                                  <Comment.Text>
                                    {' '}
                                    <ReactMarkdown>{comment.comment}</ReactMarkdown>{' '}
                                  </Comment.Text>
                                </Comment.Content>
                              </Comment>
                            ) : (
                              <Comment>
                                <Comment.Author>{comment.from}</Comment.Author>
                                <Comment.Text>
                                  {' '}
                                  <ReactMarkdown>{comment.comment}</ReactMarkdown>{' '}
                                </Comment.Text>
                              </Comment>
                            )
                        )
                      ) : (
                        <h4> No comments </h4>
                      )}
                    </Comment.Group>
                    <Form reply onSubmit={this.handleSubmit} name={weeks.id} id={weeks.id}>
                      <Form.TextArea name="content" placeholder="Your comment..." defaultValue="" />
                      <Form.Checkbox label="Add comment for instructors only" name="hidden" />
                      <Button content="Add Reply" labelPosition="left" icon="edit" primary />
                    </Form>
                    <h3>Review</h3>
                    <Link to={`/labtool/reviewstudent/${this.props.selectedInstance.ohid}/${studentInstance}/${i + 1}`}>
                      <Button circular color="orange" size="tiny" icon="edit black large" />
                    </Link>
                  </Accordion.Content>
                </Accordion>
              )
            } else {
              headers.push(
                <Accordion key={i} fluid styled>
                  <Accordion.Title active={activeIndex === i} index={i} onClick={this.handleClick}>
                    <Icon name="dropdown" /> Week {i + 1}{' '}
                  </Accordion.Title>
                  <Accordion.Content active={activeIndex === i}>
                    <h4> Not Graded </h4>
                    <h4> No comments </h4>
                    <Link to={`/labtool/reviewstudent/${this.props.selectedInstance.ohid}/${studentInstance}/${i + 1}`}>
                      <Button circular color="orange" size="tiny" icon="edit black large" />
                    </Link>
                  </Accordion.Content>
                </Accordion>
              )
            }
          }
        }
        return student
      })
      return headers
    }

    const { activeIndex } = this.state

    return (
      <div className="BrowseReviews">
        {this.props.courseData.role === 'teacher' ? (
          <div>
            <h2> {this.props.selectedInstance.name}</h2>
            {createHeaders(this.props.courseData, this.props.studentInstance)}
          </div>
        ) : (
          <p />
        )}
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

export default connect(mapStateToProps, { createOneComment, getOneCI, coursePageInformation })(BrowseReviews)
