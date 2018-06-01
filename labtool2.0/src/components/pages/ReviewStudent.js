import React, { Component } from 'react'
import { Button, Form, Input, Grid } from 'semantic-ui-react'
import { Link } from 'react-router-dom'
import { connect } from 'react-redux'
import { createOneWeek } from '../../services/week'
import { getOneCI } from '../../services/courseInstance'
import { clearNotifications } from '../../reducers/notificationReducer'
import store from '../../store'

/**
 *  The page which is used by teacher to review submissions,.
 */
class ReviewStudent extends Component {
  componentWillMount() {
    this.props.getOneCI(this.props.courseId)
    this.props.clearNotifications()
  }



  componentDidUpdate() {
    if (this.props.notification.error !== undefined) {
      if (!this.props.notification.error) {
        this.props.history.push(`/labtool/courses/${this.props.selectedInstance.ohid}`)
      }
    }
  }

  handleSubmit = async e => {
    try {
      e.preventDefault()
      const content = {
        points: e.target.points.value,
        studentInstanceId: this.props.studentInstance,
        feedback: e.target.comment.value,
        weekNumber: this.props.weekNumber
      }
      if (e.target.points.value < 0 || e.target.points.value > this.props.selectedInstance.weekMaxPoints) {
        store.dispatch({ type: 'WEEKS_CREATE_ONEFAILURE' })
      } else {
        await this.props.createOneWeek(content)
      }
    } catch (error) {
      console.log(error)
    }
  }

  render() {  

    const studentData = this.props.courseData.data.filter(dataArray => dataArray.userId == this.props.ownProps.studentInstance)
    console.log('studentData[0]', studentData[0])
    console.log('studentData[0].weeks', studentData[0].weeks)
    console.log('studentData[0].weeks[2].weekNumber', studentData[0].weeks[2].weekNumber)
    
    console.log('this.props.weekNumber', this.props.weekNumber)
    const weekData = studentData[0].weeks.filter(theWeek => theWeek.weekNumber == this.props.weekNumber)

    console.log('Tämä on weekData -olio:', weekData[0])
    var pointsAndComment = JSON.parse(localStorage.getItem('points and comment'))
    localStorage.removeItem('points and comment')

    console.log(this.props.selectedInstance)
    console.log('coursePage instanssi on courseData täällä: ', this.props.courseData)
    {/* const currentWeek = this.props.selectedInstance.currentWeek */}
{/*}
    console.log('Viikko on this.props.weekNumber: ', this.props.weekNumber)
    console.log('Pisteet pitäisi näkyä tässä: ', this.props.courseData.data[0].weeks[0].points)
    console.log('Feedback pitäisi olla tämä: ', this.props.courseData.data[0].weeks[0].feedback)
    console.log('Opiskelijan nimi: ', this.props.courseData.data[0].User.firsts, this.props.courseData.data[0].User.lastname)
    console.log('Yritetään katsoa mitä ownProps sisältää:', this.props.ownProps)
    console.log('Onkohan tämä studentId??: ', this.props.ownProps.studentInstance)

    var theFirstNames = ""
    var theLastName = ""
    var thePoints = null
    var theFeedback = null
    var theStudentId = this.props.ownProps.studentInstance
    var theCourseInstanceId = this.props.selectedInstance.id
    var indexOfDataArray = null
  */}
    var indexOfDataArray = null

    {/* Here we try to find index of this.props.courseData.data[] */}

    var i = this.props.courseData.data.length
    while (i > 0) {
      i--
      console.log('Käydään läpi data-arraytä indeksissä ', i)
      console.log('...data[', i, '].courseInstanceId = ', this.props.courseData.data[i].courseInstanceId)
      console.log('...data[',i,'].userId = ', this.props.courseData.data[i].userId)
      console.log('this.props.ownProps.studentInstance = ', this.props.ownProps.studentInstance)
      console.log('------------------')
      if (this.props.courseData.data[i].courseInstanceId === this.props.selectedInstance.id 
        && this.props.courseData.data[i].userId == this.props.ownProps.studentInstance) {
          indexOfDataArray = i
          console.log('Asetettiin indexOfDataArrayn arvoksi ', indexOfDataArray)
          break
        }
    }
    {/*}
    if (indexOfDataArray !== null) {
      theFirstNames = this.props.courseData.data[indexOfDataArray].User.firsts
      theLastName = this.props.courseData.data[indexOfDataArray].User.lastname
      thePoints = this.props.courseData.data[indexOfDataArray].weeks[this.props.weekNumber - 1].points
      theFeedback = this.props.courseData.data[indexOfDataArray].weeks[this.props.weekNumber - 1].feedback
  */}
    var thePoints = null
    var theFeedback = ''
    try {
      var thePoints = this.props.courseData.data[indexOfDataArray].weeks[this.props.weekNumber - 1].points
      var theFeedback = this.props.courseData.data[indexOfDataArray].weeks[this.props.weekNumber - 1].feedback
    } catch (e) {
      console.log(e)
    }

    return (
      <div className="ReviewStudent" style={{ textAlignVertical: 'center', textAlign: 'center' }}>
        <h2> {this.props.selectedInstance.name}</h2>
        {/*Tässä on opiskelijan nimen tulostus:
        <h3> {this.props.courseData.data[indexOfDataArray].User.firsts} {this.props.courseData.data[indexOfDataArray].User.lastname} </h3>
        */}
        <h3> {studentData[0].User.firsts} {studentData[0].User.lastname} </h3>
        <h3> Viikko {this.props.weekNumber} </h3>
        <Grid centered>
          <Form onSubmit={this.handleSubmit}>
            <Form.Group inline unstackable>
              <Form.Field>
                <label>Points 0-{this.props.selectedInstance.weekMaxPoints}</label>

                <Input name="points" defaultValue={weekData[0] ? weekData[0].points : ''} type="number" step="0.01" />

              </Form.Field>
            </Form.Group>
            <Form.Group inline unstackable>
              <label> Feedback </label>
              <Form.TextArea defaultValue={weekData[0] ? weekData[0].feedback : ''} name="comment" />

            </Form.Group>
            <Form.Field>
              <Button className="ui left floated green button" type="submit">
                Save
              </Button>
              <Link to={`/labtool/browsereviews/${this.props.selectedInstance.ohid}/${studentData[0].id}`} type="Cancel">
                <Button className="ui right floated button" type="cancel">
                  Cancel
                </Button>
              </Link>
            </Form.Field>
          </Form>
        </Grid>
      </div>
    )
  }
}

const mapStateToProps = (state, ownProps) => {
  return {
    ownProps,
    selectedInstance: state.selectedInstance,
    notification: state.notification,
    courseData: state.coursePage
  }
}

export default connect(mapStateToProps, { createOneWeek, getOneCI, clearNotifications })(ReviewStudent)
