import React, { useEffect, useRef } from 'react'
import PropTypes from 'prop-types'
import { Button, Form, Input, Grid, Card, Loader, Header, Segment } from 'semantic-ui-react'
import { Link, Redirect } from 'react-router-dom'
import { connect } from 'react-redux'
import { createOneWeek, getWeekDraft, saveWeekDraft } from '../../services/week'
import { getOneCI, coursePageInformation } from '../../services/courseInstance'
import { clearNotifications } from '../../reducers/notificationReducer'
import { toggleCheck, resetChecklist } from '../../reducers/weekReviewReducer'
import { resetLoading, addRedirectHook } from '../../reducers/loadingReducer'
import store from '../../store'
import { trimDate } from '../../util/format'

import { FormMarkdownTextArea } from '../MarkdownTextArea'

const PreviousWeekDetails = ({ weekData }) => {
  if (!weekData.feedback && !weekData.instructorNotes) {
    return null
  }

  return (
    <Segment align="left" style={{ marginTop: 20 }}>
      <Header as="h3">Previous week</Header>
      {weekData.feedback && (
        <>
          <Header as="h4">Feedback</Header>
          <p>{weekData.feedback}</p>
        </>
      )}
      {weekData.instructorNotes && (
        <>
          <Header as="h4">Instructor notes</Header>
          <p>{weekData.instructorNotes}</p>
        </>
      )}
    </Segment>
  )
}

const isFinalReview = props => props.weekNumber > props.selectedInstance.weekAmount

/**
 *  The page which is used by teacher to review submissions,.
 */
export const ReviewStudent = props => {
  const reviewPointsRef = useRef(null)
  const reviewTextRef = useRef(null)

  useEffect(() => {
    // run on component mount
    props.resetLoading()
    props.getOneCI(props.courseId)
    props.coursePageInformation(props.courseId)
    props.clearNotifications()
    importWeekDataFromDraft()

    return () => {
      // run on component unmount
      props.resetChecklist()
    }
  }, [])

  const handleSubmit = async e => {
    try {
      e.preventDefault()
      const content = {
        points: e.target.points.value,
        studentInstanceId: props.studentInstance,
        feedback: e.target.comment.value,
        instructorNotes: e.target.instructorNotes.value,
        weekNumber: props.weekNumber,
        checks: props.weekReview.checks
      }
      if (e.target.points.value < 0 || e.target.points.value > props.selectedInstance.weekMaxPoints) {
        store.dispatch({ type: 'WEEKS_CREATE_ONEFAILURE' })
      } else {
        props.addRedirectHook({
          hook: 'WEEKS_CREATE_ONE'
        })
        await props.createOneWeek(content)
      }
    } catch (error) {
      console.error(error)
    }
  }

  const toggleCheckbox = (name, studentId, weekNbr) => async () => {
    props.toggleCheck(name, studentId, weekNbr)
  }

  const importWeekDataFromDraft = async () => {
    await props.getWeekDraft({
      studentInstanceId: props.studentInstance,
      weekNumber: props.weekNumber
    })
  }

  const exportToDraft = form => {
    // produce a JSON object for all the review data;
    // this will be used verbatim as weekData (except for checks;
    // they get passed to weekReview by the reducer)
    const draftData = {}
    draftData.checks = props.weekReview.checks || {}
    draftData.points = form.points.value || ''
    draftData.feedback = form.comment.value || ''
    draftData.instructorNotes = form.instructorNotes.value || ''
    return draftData
  }

  const onClickSaveDraft = async e => {
    const content = {
      studentInstanceId: props.studentInstance,
      weekNumber: props.weekNumber,
      reviewData: exportToDraft(e.target.form)
    }
    console.error(content)
    props.addRedirectHook({
      hook: 'WEEKDRAFTS_CREATE_ONE'
    })
    await props.saveWeekDraft(content)
  }

  const copyChecklistOutput = async e => {
    e.preventDefault()
    reviewPointsRef.current.inputRef.value = Number(e.target.points.value).toFixed(2)
    /* The below line is as hacky as it is because functional elements cannot directly have refs.
     * This abomination somehow accesses a textarea that is a child of a div that holds the ref.
     */
    reviewTextRef.current.getElementsByTagName('textarea')[0].value = e.target.text.value
  }

  if (props.loading.loading) {
    return <Loader active />
  }
  if (props.loading.redirect) {
    return <Redirect to={`/labtool/courses/${props.selectedInstance.ohid}`} />
  }
  if (Array.isArray(props.weekReview.data)) {
    // props.ownProps.studentInstance is a string, therefore casting to number.
    const studentData = props.weekReview.data.find(dataArray => dataArray.id === Number(props.ownProps.studentInstance))
    // do we have a draft?
    const loadedFromDraft = !!props.weekReview.draftCreatedAt
    // props.weekNumber is a string, therefore casting to number.
    const weekData = loadedFromDraft ? props.weekReview.draftData : studentData.weeks.find(theWeek => theWeek.weekNumber === Number(props.ownProps.weekNumber))
    const previousWeekData = studentData.weeks.find(week => week.weekNumber === Number(props.ownProps.weekNumber) - 1)
    const checks = weekData ? weekData.checks || {} : {}
    const weekPoints = studentData.weeks
      .filter(week => week.weekNumber < props.weekNumber)
      .map(week => week.points)
      .reduce((a, b) => {
        return a + b
      }, 0)
    const codeReviewPoints = studentData.codeReviews
      .map(review => review.points)
      .reduce((a, b) => {
        return a + b
      }, 0)
    const checkList = props.selectedInstance.checklists.find(checkl => checkl.week === Number(props.ownProps.weekNumber))
    let checklistOutput = ''
    let checklistPoints = 0
    if (checkList) {
      Object.keys(checkList.list).forEach(cl => {
        checkList.list[cl].forEach(row => {
          const isChecked = props.weekReview.checks[row.name] === undefined ? (checks[row.name] !== undefined ? checks[row.name] : false) : props.weekReview.checks[row.name]

          const addition = isChecked ? row.textWhenOn : row.textWhenOff
          if (addition) checklistOutput += addition + '\n\n'

          if (isChecked) {
            checklistPoints += row.checkedPoints
          } else {
            checklistPoints += row.uncheckedPoints
          }
        })
      })
      if (checklistPoints < 0) {
        checklistPoints = 0
      } else if (checklistPoints > props.selectedInstance.weekMaxPoints) {
        checklistPoints = props.selectedInstance.weekMaxPoints
      }
    }
    return (
      <div className="ReviewStudent" style={{ textAlignVertical: 'center', textAlign: 'center' }}>
        <h2> {props.selectedInstance.name}</h2>
        <h3>
          {' '}
          {studentData.User.firsts} {studentData.User.lastname}{' '}
          {studentData.Tags.map(tag => (
            <div key={tag.id}>
              <Button compact floated="right" className={`mini ui ${tag.color} button`}>
                {tag.name}
              </Button>
            </div>
          ))}
        </h3>
        {isFinalReview(props) ? <h3>Final Review</h3> : <h3>Week {props.weekNumber}</h3>}
        <Grid>
          <Grid.Row columns={2}>
            <Grid.Column>
              {isFinalReview(props) ? (
                <div align="left">
                  <h3>Points before final review: {weekPoints + codeReviewPoints} </h3>
                  Week points: {weekPoints} <br />
                  Code review points: {codeReviewPoints}
                </div>
              ) : (
                <div align="left">
                  <h3>Points from previous weeks: {weekPoints + codeReviewPoints} </h3>
                  Week points: {weekPoints} <br />
                  Code review points: {codeReviewPoints}
                </div>
              )}
              <PreviousWeekDetails weekData={previousWeekData} />
              {isFinalReview(props) ? <h2>Final Review Points</h2> : <h2>Review</h2>}
              {loadedFromDraft && (
                <div>
                  <p>
                    <em>Loaded from draft saved at {trimDate(props.weekReview.draftCreatedAt)}</em>
                  </p>
                  <br />
                </div>
              )}
              <Form onSubmit={handleSubmit}>
                <Form.Group inline unstackable>
                  <Form.Field>
                    <label>Points 0-{props.selectedInstance.weekMaxPoints}</label>

                    <Input ref={reviewPointsRef} name="points" defaultValue={weekData ? weekData.points : ''} type="number" step="0.01" style={{ width: '150px', align: 'center' }} />
                  </Form.Field>
                </Form.Group>
                <h4>Feedback</h4>
                <Form.Group inline unstackable style={{ textAlignVertical: 'top' }}>
                  <div ref={reviewTextRef}>
                    {/*Do not add any other textareas to this div. If you do, you'll break copyChecklistOutput.*/}
                    <FormMarkdownTextArea defaultValue={weekData ? weekData.feedback : ''} name="comment" style={{ width: '500px', height: '250px' }} />
                  </div>
                </Form.Group>
                <h4>Review notes</h4>
                <p>
                  <em>Only shown to instructors on this course</em>
                </p>
                <Form.Group inline unstackable style={{ textAlignVertical: 'top' }}>
                  <div>
                    <FormMarkdownTextArea defaultValue={weekData ? weekData.instructorNotes : ''} name="instructorNotes" style={{ width: '500px', height: '150px' }} />
                  </div>
                </Form.Group>
                <Form.Field>
                  <Button className="ui center floated green button" type="submit">
                    Save
                  </Button>
                  <Button className="ui center floated button" type="button" onClick={onClickSaveDraft}>
                    Save as draft
                  </Button>
                  <Link to={`/labtool/browsereviews/${props.selectedInstance.ohid}/${studentData.id}`} type="Cancel">
                    <Button className="ui center floated button" type="cancel">
                      Cancel
                    </Button>
                  </Link>
                </Form.Field>
              </Form>
            </Grid.Column>
            {checkList && checks !== undefined ? (
              <Grid.Column>
                <h2>Checklist</h2>
                {checkList ? (
                  <div className="checklist">
                    {Object.keys(checkList.list).map(cl => (
                      <Card className="checklistCard" fluid color="red" key={cl}>
                        <Card.Content header={cl} />
                        {checkList.list[cl].map(row => (
                          <Card.Content className="checklistCardRow" key={row.name}>
                            <Form.Field>
                              <Grid>
                                <Grid.Row>
                                  <Grid.Column width={3}>
                                    <Input
                                      type="checkbox"
                                      defaultChecked={checks[row.name] !== undefined ? checks[row.name] : false}
                                      onChange={toggleCheckbox(row.name, props.ownProps.studentInstance, props.ownProps.weekNumber)}
                                    />
                                  </Grid.Column>
                                  <Grid.Column width={10}>
                                    <span style={{ flexGrow: 1, textAlign: 'center' }}>{row.name}</span>
                                  </Grid.Column>
                                  <Grid.Column width={3}>
                                    <span>{`${row.checkedPoints} p / ${row.uncheckedPoints} p`}</span>
                                  </Grid.Column>
                                </Grid.Row>
                              </Grid>
                            </Form.Field>
                          </Card.Content>
                        ))}
                      </Card>
                    ))}
                    <div>
                      <Form className="checklistOutput" onSubmit={copyChecklistOutput}>
                        <Form.TextArea className="checklistOutputText" name="text" value={checklistOutput} style={{ width: '100%', height: '250px' }} />
                        <p className="checklistOutputPoints">points: {checklistPoints.toFixed(2)}</p>
                        <input type="hidden" name="points" value={checklistPoints} />
                        <Button type="submit">Copy to review fields</Button>
                      </Form>
                    </div>
                  </div>
                ) : (
                  <p>There is no checklist for this week.</p>
                )}
              </Grid.Column>
            ) : (
              <div />
            )}
          </Grid.Row>
        </Grid>
      </div>
    )
  } else {
    return <Loader active />
  }
}

const mapStateToProps = (state, ownProps) => {
  return {
    ownProps,
    selectedInstance: state.selectedInstance,
    notification: state.notification,
    courseData: state.coursePage,
    weekReview: state.weekReview,
    loading: state.loading
  }
}

const mapDispatchToProps = {
  createOneWeek,
  getWeekDraft,
  saveWeekDraft,
  getOneCI,
  clearNotifications,
  toggleCheck,
  resetChecklist,
  coursePageInformation,
  resetLoading,
  addRedirectHook
}

ReviewStudent.propTypes = {
  courseId: PropTypes.string.isRequired,
  studentInstance: PropTypes.string.isRequired,
  weekNumber: PropTypes.string.isRequired,

  selectedInstance: PropTypes.object.isRequired,
  notification: PropTypes.object.isRequired,
  courseData: PropTypes.object.isRequired,
  weekReview: PropTypes.object.isRequired,
  loading: PropTypes.object.isRequired,

  createOneWeek: PropTypes.func.isRequired,
  getWeekDraft: PropTypes.func.isRequired,
  saveWeekDraft: PropTypes.func.isRequired,
  getOneCI: PropTypes.func.isRequired,
  clearNotifications: PropTypes.func.isRequired,
  toggleCheck: PropTypes.func.isRequired,
  resetChecklist: PropTypes.func.isRequired,
  coursePageInformation: PropTypes.func.isRequired,
  resetLoading: PropTypes.func.isRequired,
  addRedirectHook: PropTypes.func.isRequired
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ReviewStudent)
