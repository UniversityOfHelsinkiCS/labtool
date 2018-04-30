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
    const headers = []
    const createHeaders = () => {
      const studentData = this.props.courseData.data.find(student => student.id === this.props.studentInstance)
      for (var i = 0; i < this.props.selectedInstance.weekAmount; i++) {
        headers.push(
          <Accordion fluid styled>
            <Accordion.Title active={activeIndex === i} index={i} onClick={this.handleClick}>
              <Icon name='dropdown' /> Week {i + 1} </Accordion.Title>
            <Accordion.Content active={activeIndex === i}>
              <p>
                <h4> Opiskelijan nimi </h4>
                <h4> Pisteet </h4>
                <h4> Kommentit </h4>
                <Link to={`/labtool/reviewstudent/`}>
                  <Button circular color="orange" size="tiny" icon="edit black large" />
                </Link>

              </p>
            </Accordion.Content>
          </Accordion>)
      }
      return headers
    }

    const { activeIndex } = this.state

    return (

      <div>


        <h2> {this.props.selectedInstance.name}</h2>
      </div>
    )
  }
}
const mapStateToProps = (state, ownProps) => {
  return {
    ownProps,
    user: state.user,
    studentInstance: state.studentInstance,
    teacherInstance: state.teacherInstance,
    selectedInstance: state.selectedInstance,
    courseData: state.coursePage
  }
}



export default connect(mapStateToProps, {})(BrowseReviews)
