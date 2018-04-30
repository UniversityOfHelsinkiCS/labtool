import React, { Component } from 'react'
import { Button, Table, List, Accordion, Icon, Form, } from 'semantic-ui-react'
import { connect } from 'react-redux'
import { Link } from 'react-router-dom'

class BrowseReviews extends Component {
  state = { activeIndex: 0 }

  handleClick = (e, titleProps) => {
    const { index } = titleProps
    const { activeIndex } = this.state
    const newIndex = activeIndex === index ? -1 : index

    this.setState({ activeIndex: newIndex })
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
                      <h4> Comments </h4>
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
                      <Link to={`/labtool/reviewstudent/${this.props.selectedInstance.ohid}/${studentInstance}/${i}`}>
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



export default connect(mapStateToProps, {})(BrowseReviews)