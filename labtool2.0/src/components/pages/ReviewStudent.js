import React, { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import { withRouter } from 'react-router'
import { Button, Form, Input, Grid, Loader } from 'semantic-ui-react'
import { Link, Redirect } from 'react-router-dom'
import { connect } from 'react-redux'
import { createOneWeek, getWeekDraft, saveWeekDraft } from '../../services/week'
import { getOneCI, coursePageInformation } from '../../services/courseInstance'
import { clearNotifications } from '../../reducers/notificationReducer'
import { toggleCheckWeek, resetChecklist, restoreChecks, verifyCheckPrerequisites } from '../../reducers/weekReviewReducer'
import { resetLoading, addRedirectHook } from '../../reducers/loadingReducer'
import store from '../../store'
import { formatCourseName, trimDate, roundPoints } from '../../util/format'
import { usePersistedState } from '../../hooks/persistedState'

import { FormMarkdownTextArea } from '../MarkdownTextArea'
import RepoLink from '../RepoLink'
import { PreviousWeekDetails } from './ReviewStudent/PreviousWeekDetails'
import { ReviewStudentChecklist } from './ReviewStudent/Checklist'
import MissingMinimumRequirements from '../MissingMinimumRequirements'

import BackButton from '../BackButton'
import DocumentTitle from '../DocumentTitle'
import Error from '../Error'
import { Points } from '../Points'
import '../../util/arrayFlatPolyfill'

const isFinalReview = props => props.weekNumber > props.selectedInstance.weekAmount

/**
 *  The page which is used by teacher to review submissions,.
 */
export const ReviewStudent = props => {
  const [loadedWeekData, setLoadedWeekData] = useState(false)
  const [allowChecksCopy, setAllowChecksCopy] = useState(false)
  const pstate = usePersistedState(`ReviewStudent_${props.studentInstance}:${props.weekNumber}`, {
    points: '',
    grade: '',
    feedback: '',
    instructorNotes: '',
    checks: null
  })

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

  useEffect(() => {
    if (allowChecksCopy && props.weekReview.checks !== null) {
      const d = { ...props.weekReview.checks }
      pstate.checks = d
    }
  }, [props.weekReview.checks])

  const handleSubmit = async e => {
    try {
      e.preventDefault()
      const content = {
        points: pstate.points || null,
        grade: pstate.grade || null,
        studentInstanceId: props.studentInstance,
        feedback: pstate.feedback,
        instructorNotes: pstate.instructorNotes,
        weekNumber: props.weekNumber,
        checks
      }
      if (isFinalReview(props) && !props.selectedInstance.finalReviewHasPoints) {
        pstate.points = null
      }
      pstate.clear()
      if (props.selectedInstance.finalReviewHasPoints && (pstate.points < 0 || pstate.points > getMaximumPoints())) {
        store.dispatch({ type: 'WEEKS_CREATE_ONEFAILURE' })
      } else if (pstate.grade < 0 || (pstate.grade && !isFinalReview(props))) {
        // cannot give grade except for final review
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

  const getMaximumPoints = () => {
    if (checklist && checklist.maxPoints) {
      return checklist.maxPoints
    }
    return props.selectedInstance.weekMaxPoints
  }

  const toggleCheckbox = (checklistItemId, studentId, weekNbr) => async () => {
    setAllowChecksCopy(true)
    props.toggleCheckWeek(checklistItemId, studentId, weekNbr, prerequisites)
  }

  const importWeekDataFromDraft = () => {
    props.getWeekDraft({
      studentInstanceId: props.studentInstance,
      weekNumber: props.weekNumber
    })
  }

  const exportToDraft = () => {
    // produce a JSON object for all the review data;
    // this will be used verbatim as weekData (except for checks;
    // they get passed to weekReview by the reducer)
    const draftData = {}
    draftData.checks = checks
    draftData.points = pstate.points || ''
    draftData.grade = isFinalReview(props) ? pstate.grade || '' : ''
    draftData.feedback = pstate.feedback || ''
    draftData.instructorNotes = pstate.instructorNotes || ''
    return draftData
  }

  const onClickSaveDraft = async () => {
    const content = {
      studentInstanceId: props.studentInstance,
      weekNumber: props.weekNumber,
      reviewData: exportToDraft()
    }
    pstate.clear()
    props.addRedirectHook({
      hook: 'WEEKDRAFTS_CREATE_ONE'
    })
    await props.saveWeekDraft(content)
  }

  const copyChecklistOutput = async e => {
    e.preventDefault()
    pstate.points = roundPoints(Number(e.target.points.value))
    pstate.feedback = e.target.text.value
  }

  const isChecked = (checks, checklistItemId) =>
    checks !== null && checks[checklistItemId] !== undefined
      ? checks[checklistItemId]
      : props.weekReview.checks !== null && props.weekReview.checks[checklistItemId] !== undefined
      ? props.weekReview.checks[checklistItemId]
      : false

  if (props.loading.redirect) {
    pstate.clear()
    return <Redirect to={`/labtool/courses/${props.selectedInstance.ohid}`} />
  }
  if (props.errors && props.errors.length > 0) {
    return <Error errors={props.errors.map(error => `${error.response.data} (${error.response.status} ${error.response.statusText})`)} />
  }
  if (props.loading.loading) {
    return <Loader active />
  }
  if (!Array.isArray(props.weekReview.data)) {
    return <Loader active />
  }

  const checklist = props.selectedInstance.checklists.find(cl => cl.week === Number(props.weekNumber))
  const prerequisites = {}
  // props.ownProps.studentInstance is a string, therefore casting to number.
  const studentData = props.weekReview.data.find(dataArray => dataArray.id === Number(props.ownProps.studentInstance))
  // do we have a draft?
  const loadedFromDraft = !!props.weekReview.draftCreatedAt
  // props.weekNumber is a string, therefore casting to number.
  const weekData = loadedFromDraft ? props.weekReview.draftData : studentData.weeks.find(theWeek => theWeek.weekNumber === Number(props.ownProps.weekNumber))
  const previousWeekData = studentData.weeks.find(week => week.weekNumber === Number(props.ownProps.weekNumber) - 1)
  const emptyChecks = checklist
    ? Object.values(checklist.list)
        .flat()
        .reduce((object, checklistItem) => {
          object[checklistItem.id] = false
          return object
        }, {})
    : {}
  const savedChecks = weekData && weekData.checks ? weekData.checks : {}
  const checks = { ...emptyChecks, ...(props.weekReview.checks !== null ? props.weekReview.checks : savedChecks) } //weekData ? weekData.checks || {} : {}
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
  let checklistOutput = ''
  let checklistPoints = 0
  if (checklist) {
    Object.keys(checklist.list).forEach(category => {
      checklist.list[category].forEach(clItem => {
        //handle existing case where clItems were saved by name in weekData.checks
        if (savedChecks[clItem.name]) {
          savedChecks[clItem.id] = savedChecks[clItem.name]
          delete savedChecks[clItem.name]
        }
        prerequisites[clItem.id] = clItem.prerequisite

        const checked = isChecked(checks, clItem.id)
        // do not add text if the prerequisite is not checked
        const shouldDisplay = clItem.prerequisite === null || isChecked(checks, clItem.prerequisite)
        const addition = checked ? clItem.textWhenOn : clItem.textWhenOff
        if (shouldDisplay && addition) checklistOutput += addition + '\n\n'

        if (!clItem.minimumRequirement) {
          if (checked) {
            checklistPoints += clItem.checkedPoints
          } else {
            checklistPoints += clItem.uncheckedPoints
          }
        }
      })
    })
    if (checklistPoints < 0) {
      checklistPoints = 0
    } else if (checklistPoints > getMaximumPoints()) {
      checklistPoints = getMaximumPoints()
    }
    // make sure we have not checked anything with missing prerequisites
    // (if there is nothing to update, this won't touch the state, so it will
    //  just fall through)
    props.verifyCheckPrerequisites(prerequisites)
  }

  if (!loadedWeekData) {
    if (weekData) {
      if (pstate.checks) {
        props.restoreChecks(props.ownProps.studentInstance, pstate.checks)
      }

      pstate.points = pstate.points || weekData.points
      pstate.grade = pstate.grade || weekData.grade
      pstate.feedback = pstate.feedback || weekData.feedback
      pstate.instructorNotes = pstate.instructorNotes || weekData.instructorNotes
      setLoadedWeekData(true)
    }
  }

  const arrivedFromCoursePage = props.location && props.location.state && props.location.state.cameFromCoursePage

  return (
    <>
      <DocumentTitle
        title={`${isFinalReview(props) ? 'Final Review' : `Week ${weekData && weekData.weekNumber ? weekData.weekNumber : props.ownProps.weekNumber}`} - ${studentData.User.firsts} ${
          studentData.User.lastname
        }`}
      />
      <div className="ReviewStudent">
        <BackButton
          preset={arrivedFromCoursePage && 'coursePage'}
          to={!arrivedFromCoursePage && `/labtool/browsereviews/${props.selectedInstance.ohid}/${studentData.id}`}
          text={!arrivedFromCoursePage && 'Back to student reviews'}
        />
        <div style={{ textAlignVertical: 'center', textAlign: 'center' }}>
          <Link to={`/labtool/courses/${props.selectedInstance.ohid}`} style={{ textAlign: 'center' }}>
            <h2> {formatCourseName(props.selectedInstance.name, props.selectedInstance.ohid, props.selectedInstance.start)}</h2>
          </Link>
          <h3>
            {' '}
            {studentData.User.firsts} {studentData.User.lastname}{' '}
            <div style={{ display: 'inline-block', padding: '0px 0px 0px 25px' }}>
              {studentData.projectName}: <RepoLink url={studentData.github} />
            </div>
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
                    <h3>
                      Points before final review: <Points points={weekPoints + codeReviewPoints} />{' '}
                    </h3>
                    Week points: <Points points={weekPoints} /> <br />
                    Code review points: <Points points={codeReviewPoints} />
                  </div>
                ) : (
                  <div align="left">
                    <h3>
                      Points from previous weeks: <Points points={weekPoints + codeReviewPoints} />{' '}
                    </h3>
                    Week points: <Points points={weekPoints} /> <br />
                    Code review points: <Points points={codeReviewPoints} />
                  </div>
                )}
                <PreviousWeekDetails weekData={previousWeekData} />
                <MissingMinimumRequirements
                  selectedInstance={props.selectedInstance}
                  studentInstance={studentData}
                  currentWeekChecks={!checks ? {} : checks}
                  currentWeekNumber={weekData && weekData.weekNumber ? weekData.weekNumber : props.ownProps.weekNumber}
                  showMaximumGrade={isFinalReview(props)}
                />
                {isFinalReview(props) ? props.selectedInstance.finalReviewHasPoints ? <h2>Final Review Points</h2> : <h2>Final Review</h2> : <h2>Review</h2>}
                {loadedFromDraft && (
                  <div>
                    <p>
                      <em>Loaded from draft saved at {trimDate(props.weekReview.draftCreatedAt)}</em>
                    </p>
                    <br />
                  </div>
                )}
                <Form onSubmit={handleSubmit}>
                  {(!isFinalReview(props) || props.selectedInstance.finalReviewHasPoints) && (
                    <Form.Group inline unstackable>
                      <Form.Field>
                        <label className="showMaxPoints">Points 0-{getMaximumPoints()}</label>

                        <Input
                          name="points"
                          required={true}
                          value={pstate.points}
                          onChange={(e, { value }) => (pstate.points = value)}
                          type="number"
                          step="0.01"
                          style={{ width: '150px', align: 'center' }}
                        />
                      </Form.Field>
                    </Form.Group>
                  )}
                  {isFinalReview(props) ? (
                    <Form.Group inline unstackable>
                      <Form.Field>
                        <label className="labelGrade">Grade 0-5</label>

                        <Input
                          name="grade"
                          value={pstate.grade}
                          onChange={(e, { value }) => (pstate.grade = value)}
                          type="number"
                          min="0"
                          max="5"
                          step="1"
                          style={{ width: '150px', align: 'center' }}
                        />
                      </Form.Field>
                    </Form.Group>
                  ) : null}
                  <h4>Feedback</h4>
                  <Form.Group inline unstackable style={{ textAlignVertical: 'top' }}>
                    <div style={{ width: '100%' }}>
                      <FormMarkdownTextArea value={pstate.feedback} onChange={(e, { value }) => (pstate.feedback = value)} name="comment" style={{ width: '500px', height: '250px' }} />
                    </div>
                  </Form.Group>
                  <h4>Review notes</h4>
                  <p>
                    <em>Only shown to instructors on this course</em>
                  </p>
                  <Form.Group inline unstackable style={{ textAlignVertical: 'top' }}>
                    <div style={{ width: '100%' }}>
                      <FormMarkdownTextArea
                        value={pstate.instructorNotes}
                        onChange={(e, { value }) => (pstate.instructorNotes = value)}
                        name="instructorNotes"
                        style={{ width: '500px', height: '150px' }}
                      />
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
                      <Button className="ui center floated button" type="cancel" onClick={pstate.clear}>
                        Cancel
                      </Button>
                    </Link>
                  </Form.Field>
                </Form>
              </Grid.Column>
              <ReviewStudentChecklist
                showOutput={true}
                kind="week"
                checklist={checklist}
                checks={checks}
                checklistPoints={checklistPoints}
                checklistOutput={checklistOutput}
                isChecked={isChecked}
                toggleCheckbox={clId => toggleCheckbox(clId, props.ownProps.studentInstance, props.ownProps.weekNumber)}
                copyChecklistOutput={copyChecklistOutput}
              />
            </Grid.Row>
          </Grid>
        </div>
      </div>
    </>
  )
}

const mapStateToProps = (state, ownProps) => {
  return {
    ownProps,
    selectedInstance: state.selectedInstance,
    notification: state.notification,
    courseData: state.coursePage,
    weekReview: state.weekReview,
    loading: state.loading,
    errors: Object.values(state.loading.errors)
  }
}

const mapDispatchToProps = {
  createOneWeek,
  getWeekDraft,
  saveWeekDraft,
  getOneCI,
  clearNotifications,
  toggleCheckWeek,
  restoreChecks,
  verifyCheckPrerequisites,
  resetChecklist,
  coursePageInformation,
  resetLoading,
  addRedirectHook
}

ReviewStudent.propTypes = {
  ownProps: PropTypes.object.isRequired,

  courseId: PropTypes.string.isRequired,
  studentInstance: PropTypes.string.isRequired,
  weekNumber: PropTypes.string.isRequired,

  selectedInstance: PropTypes.object.isRequired,
  notification: PropTypes.object.isRequired,
  courseData: PropTypes.object.isRequired,
  weekReview: PropTypes.object.isRequired,
  loading: PropTypes.object.isRequired,
  location: PropTypes.object,

  createOneWeek: PropTypes.func.isRequired,
  getWeekDraft: PropTypes.func.isRequired,
  saveWeekDraft: PropTypes.func.isRequired,
  getOneCI: PropTypes.func.isRequired,
  clearNotifications: PropTypes.func.isRequired,
  toggleCheckWeek: PropTypes.func.isRequired,
  restoreChecks: PropTypes.func.isRequired,
  verifyCheckPrerequisites: PropTypes.func.isRequired,
  resetChecklist: PropTypes.func.isRequired,
  coursePageInformation: PropTypes.func.isRequired,
  resetLoading: PropTypes.func.isRequired,
  addRedirectHook: PropTypes.func.isRequired,

  errors: PropTypes.array
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(ReviewStudent))
