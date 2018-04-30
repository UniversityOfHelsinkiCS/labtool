import React, { Component } from 'react'
import { Button, Table, List, Accordion, Icon, Form, } from 'semantic-ui-react'
import { connect } from 'react-redux'

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
      for (var i = 0; i < this.props.selectedInstance.weekAmount; i++) {
        headers.push(
        <Accordion fluid styled>
        <Accordion.Title active={activeIndex === i} index={i} onClick={this.handleClick}>  
        <Icon name='dropdown' /> Week {i + 1} </Accordion.Title> 
        <Accordion.Content active={activeIndex === i}> 
        <p>
          Opiskelijan nimi
          Pisteet 
          Kommentit
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
        {createHeaders()}
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



export default connect(mapStateToProps, {})(BrowseReviews)