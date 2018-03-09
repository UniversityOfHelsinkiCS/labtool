import React, { Component } from 'react'
import { getOne } from '../../services/courseInstance'



class Course extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      course: undefined,
    }
  }

  componentDidMount() {
    getOne(parseInt(this.props.match.params.number, 10)).then(
      course => this.setState({ course })
    )
  }

  render() {
    if (!this.state.course) {
      return <div>course not found!!!</div>
    }

    return (
      <div>
        <h1>{this.state.course.name} </h1>
      </div>
    )
  }
}

export default Course