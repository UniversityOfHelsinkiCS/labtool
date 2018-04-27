import React, { Component } from 'react'
import { Button, Table, List, Accordion, Icon } from 'semantic-ui-react'
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
    let instance = []
    if (this.props.studentInstance) {
      instance = this.props.studentInstance.filter(inst => (inst.courseInstanceId == this.props.selectedInstance.id))
    }

    const headers = []
    const createHeaders = () => {
      for (var i = 0; i < this.props.selectedInstance.weekAmount; i++) {
        headers.push(<Accordion.Title active={activeIndex === i} index={i} onClick={this.handleClick}>  <Icon name='dropdown' /> Week {i + 1} </Accordion.Title>)
      }
      return headers
    }
    const { activeIndex } = this.state

    return (
      <Accordion fluid styled>
        {createHeaders()}
        {headers}

        <Accordion.Content active={activeIndex === 2}>
          <p>
            Three common ways for a prospective owner to acquire a dog is from pet shops, private owners, or shelters.
          </p>
          <p>
            A pet shop may be the most convenient way to buy a dog. Buying a dog from a private owner allows you to
            {' '}assess the pedigree and upbringing of your dog before choosing to take it home. Lastly, finding your
            {' '}dog from a shelter, helps give a good home to a dog who may not find one so readily.
          </p>
        </Accordion.Content>
      </Accordion>
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