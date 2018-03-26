import React, { Component } from 'react'
import { getAll } from '../../services/courseInstance'
import { Link } from 'react-router-dom'

class AllCourses extends Component {
  constructor(props) {
    super(props)
    this.state = {
      courses: [],
    }
  }

  componentDidMount() {
    getAll().then(courses =>
      this.setState({ courses })
    )
  }

  render() {
    return (
      <div>
        <ul>
          {
            this.state.courses.map(c => (
              <li key={c.id}>
                <Link to={`/courses/${c.id}`}>{c.name}</Link>
              </li>
            ))
          }
        </ul>
      </div>
    )
  }
}



export default AllCourses