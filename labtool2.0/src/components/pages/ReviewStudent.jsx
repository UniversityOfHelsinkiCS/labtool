import React, { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import { withRouter } from 'react-router'
import { Button, Form, Input, Grid, Icon, Label, Loader, Message, Modal } from 'semantic-ui-react'
import { Link, Redirect } from 'react-router-dom'
import { connect } from 'react-redux'
import { createOneWeek, getWeekDraft, saveWeekDraft } from '../../services/week'
import { getOneCI, coursePageInformation } from '../../services/courseInstance'
import { clearNotifications } from '../../reducers/notificationReducer'
import {
  toggleCheckWeek,
  resetChecklist,
  restoreChecks,
  verifyCheckPrerequisites
} from '../../reducers/weekReviewReducer'
import { resetLoading, addRedirectHook } from '../../reducers/loadingReducer'
import { resetReviewSave } from '../../reducers/reviewSaveReducer'
import { getChangeLog } from '../../services/changeLog'
import ChangeHistory from '../ChangeHistory'
import store from '../../store'
import { formatCourseName, trimDate, roundPoints } from '../../util/format'
import { usePersistedState } from '../../hooks/persistedState'

import { FormMarkdownTextArea } from '../MarkdownTextArea'
import ReactMarkdown from 'react-markdown'
import ReviewNotes from '../ReviewNotes'
import { createReviewNote } from '../../services/reviewNote'
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

// instructor-only boxes are styled like instructor-only comments (#1142)
const notesBoxStyle = {
  border: '2px solid #f2711c',
  background: '#fff6ef',
  borderRadius: '4px',
  padding: '10px 12px',
  margin: '1em 0'
}
const nullIfEmpty = value => (value === '' || value === null || value === undefined ? null : value)

/**
 *  The page which is used by teacher to review submissions,.
 */
export const ReviewStudent = props => {
  const [loadedWeekData, setLoadedWeekData] = useState(false)
  const [allowChecksCopy, setAllowChecksCopy] = useState(false)
  const [discardedLocalEdits, setDiscardedLocalEdits] = useState(false)
  // unsaved edits restored from this browser: null, or { editedAt } (editedAt may be null for old edits)
  const [unsavedEdits, setUnsavedEdits] = useState(null)
  const [checkedUnsavedEdits, setCheckedUnsavedEdits] = useState(false)
  // empty review notes are collapsed into an "Add review notes" button
  const [notesOpened, setNotesOpened] = useState(false)
  const pstate = usePersistedState(`ReviewStudent_${props.studentInstance}:${props.weekNumber}`, {
    points: '',
    grade: '',
    feedback: '',
    instructorNotes: '',
    checks: null,
    // updatedAt of the saved review these edits are based on, null for a new review (#1127)
    basedOn: null,
    // when the form was last edited in this browser
    editedAt: null
  })

  useEffect(() => {
    // run on component mount
    props.resetLoading()
    props.getOneCI(props.courseId)
    props.coursePageInformation(props.courseId)
    props.clearNotifications()
    props.resetReviewSave()
    props.getChangeLog(props.studentInstance)
    importWeekDataFromDraft()

    return () => {
      // run on component unmount
      props.resetChecklist()
      props.resetReviewSave()
    }
  }, [])

  useEffect(() => {
    if (allowChecksCopy && props.weekReview.checks !== null) {
      const d = { ...props.weekReview.checks }
      pstate.checks = d
    }
  }, [props.weekReview.checks])

  const handleSubmit = e => {
    e.preventDefault()
    submitReview()
  }

  // overwrite: save even though someone else saved after this page was opened
  // confirmedNotAssigned: save although the student has another assigned instructor
  const submitReview = async ({ overwrite = false, confirmedNotAssigned = false } = {}) => {
    try {
      const finalReviewWithoutPoints = isFinalReview(props) && !props.selectedInstance.finalReviewHasPoints
      const content = {
        points: finalReviewWithoutPoints ? null : nullIfEmpty(pstate.points),
        grade: nullIfEmpty(pstate.grade),
        studentInstanceId: props.studentInstance,
        feedback: pstate.feedback,
        instructorNotes: pstate.instructorNotes,
        weekNumber: props.weekNumber,
        checks,
        baseUpdatedAt: pstate.basedOn || null,
        overwrite,
        confirmedNotAssigned
      }
      if (notesLocked) {
        // only the assigned instructor edits the review notes of the final review
        delete content.instructorNotes
      }
      if (finalReviewWithoutPoints) {
        pstate.points = null
      }
      // the form is kept until the save succeeds (cleared on the redirect below)
      if (
        props.selectedInstance.finalReviewHasPoints &&
        (pstate.points < 0 || pstate.points > getMaximumPoints())
      ) {
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

  // every edit of the form is stored in this browser until it is saved
  const edit = (field, value) => {
    pstate[field] = value
    pstate.editedAt = new Date().toISOString()
  }

  const toggleCheckbox = (checklistItemId, studentId, weekNbr) => async () => {
    setAllowChecksCopy(true)
    pstate.editedAt = new Date().toISOString()
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
    edit('points', roundPoints(Number(e.target.points.value)))
    edit('feedback', e.target.text.value)
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
    return (
      <Error
        errors={props.errors.map(
          error => `${error.response.data} (${error.response.status} ${error.response.statusText})`
        )}
      />
    )
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
  const studentData = props.weekReview.data.find(
    dataArray => dataArray.id === Number(props.ownProps.studentInstance)
  )
  // do we have a draft?
  const loadedFromDraft = !!props.weekReview.draftCreatedAt
  // props.weekNumber is a string, therefore casting to number.
  const weekData = loadedFromDraft
    ? props.weekReview.draftData
    : studentData.weeks.find(theWeek => theWeek.weekNumber === Number(props.ownProps.weekNumber))
  // the saved review (not a draft); its updatedAt is the version this page edits (#1127)
  const savedWeek = studentData.weeks.find(
    theWeek => theWeek.weekNumber === Number(props.ownProps.weekNumber)
  )
  const savedVersion = (savedWeek && savedWeek.updatedAt) || null
  const assignedInstructor =
    studentData.teacherInstanceId && props.selectedInstance.teacherInstances
      ? props.selectedInstance.teacherInstances.find(ti => ti.id === studentData.teacherInstanceId)
      : null
  const assignedToMe = assignedInstructor && assignedInstructor.userId === props.currentUserId
  // In the final review only the assigned instructor edits the review notes; the others add notes of
  // their own (additional review notes, never shown to students).
  const notesLocked = Boolean(isFinalReview(props) && assignedInstructor && !assignedToMe)
  const additionalNotes = (studentData.reviewNotes || []).filter(
    note => note.weekNumber === Number(props.ownProps.weekNumber)
  )
  const addReviewNote = text =>
    props.createReviewNote({
      studentInstanceId: studentData.id,
      weekNumber: Number(props.ownProps.weekNumber),
      text
    })
  const previousWeekData = studentData.weeks.find(
    week => week.weekNumber === Number(props.ownProps.weekNumber) - 1
  )
  const emptyChecks = checklist
    ? Object.values(checklist.list)
        .flat()
        .reduce((object, checklistItem) => {
          object[checklistItem.id] = false
          return object
        }, {})
    : {}
  const savedChecks = weekData && weekData.checks ? weekData.checks : {}
  const checks = {
    ...emptyChecks,
    ...(props.weekReview.checks !== null ? props.weekReview.checks : savedChecks)
  } //weekData ? weekData.checks || {} : {}
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

  // Are the values kept in this browser different from the saved review (or the draft, or an empty form)?
  // Then the form shows unsaved edits, and the page says so.
  const differsFromSaved = (local, saved) => {
    const asNumber = value =>
      value === null || value === undefined || value === '' ? '' : String(Number(value))
    const asText = value => (value === null || value === undefined ? '' : String(value))
    const checkedIds = checks =>
      Object.keys(checks || {})
        .filter(id => checks[id])
        .sort()
        .join(',')
    // an empty value kept in the browser is not an edit: the form shows the saved value for it
    const differs = (field, as) => as(local[field]) !== '' && as(local[field]) !== as(saved[field])
    return (
      differs('points', asNumber) ||
      differs('grade', asNumber) ||
      differs('feedback', asText) ||
      differs('instructorNotes', asText) ||
      (local.checks !== null &&
        local.checks !== undefined &&
        checkedIds(local.checks) !== checkedIds(saved.checks))
    )
  }

  if (!checkedUnsavedEdits) {
    const hasLocalValues =
      pstate.checks || pstate.points || pstate.grade || pstate.feedback || pstate.instructorNotes
    const basedOnCurrent = !weekData || (pstate.basedOn || null) === savedVersion
    if (hasLocalValues && basedOnCurrent && differsFromSaved(pstate, weekData || {})) {
      setUnsavedEdits({ editedAt: pstate.editedAt || null })
    }
    setCheckedUnsavedEdits(true)
  }

  if (!loadedWeekData) {
    if (weekData) {
      // Unsaved edits kept in this browser win only if they are based on the review as it is saved now.
      // Otherwise someone saved the review since, and the old edits would silently overwrite it (#1127).
      const hasLocalEdits =
        pstate.checks || pstate.points || pstate.grade || pstate.feedback || pstate.instructorNotes
      const keepLocalEdits = !hasLocalEdits || (pstate.basedOn || null) === savedVersion
      const local = keepLocalEdits
        ? pstate
        : { points: '', grade: '', feedback: '', instructorNotes: '', checks: null }
      if (!keepLocalEdits) {
        setDiscardedLocalEdits(true)
        pstate.checks = null
      }
      if (local.checks) {
        props.restoreChecks(props.ownProps.studentInstance, local.checks)
      }

      pstate.points = local.points || weekData.points
      pstate.grade = local.grade || weekData.grade
      pstate.feedback = local.feedback || weekData.feedback
      pstate.instructorNotes = local.instructorNotes || weekData.instructorNotes
      pstate.basedOn = savedVersion
      setLoadedWeekData(true)
    }
  }

  // someone saved the review after this page was opened: start again from their version
  const loadTheirVersion = () => {
    pstate.reset()
    props.resetReviewSave()
    props.resetChecklist()
    setDiscardedLocalEdits(false)
    setLoadedWeekData(false)
    props.coursePageInformation(props.courseId)
  }

  const conflict = props.reviewSave.conflict
  const formatTime = iso => new Date(iso).toLocaleString('fi-FI')

  const arrivedFromCoursePage =
    props.location && props.location.state && props.location.state.cameFromCoursePage

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
          to={
            !arrivedFromCoursePage &&
            `/labtool/browsereviews/${props.selectedInstance.ohid}/${studentData.id}`
          }
          text={!arrivedFromCoursePage && 'Back to student reviews'}
        />
        <div style={{ textAlignVertical: 'center', textAlign: 'center' }}>
          <Link to={`/labtool/courses/${props.selectedInstance.ohid}`} style={{ textAlign: 'center' }}>
            <h2>
              {' '}
              {formatCourseName(
                props.selectedInstance.name,
                props.selectedInstance.ohid,
                props.selectedInstance.start
              )}
            </h2>
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
                  <div style={{ textAlign: 'left' }}>
                    <h3>
                      Points before final review: <Points points={weekPoints + codeReviewPoints} />{' '}
                    </h3>
                    Week points: <Points points={weekPoints} /> <br />
                    Code review points: <Points points={codeReviewPoints} />
                  </div>
                ) : (
                  <div style={{ textAlign: 'left' }}>
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
                  currentWeekNumber={Number(
                    weekData && weekData.weekNumber ? weekData.weekNumber : props.ownProps.weekNumber
                  )}
                  showMaximumGrade={isFinalReview(props)}
                />
                {isFinalReview(props) ? (
                  props.selectedInstance.finalReviewHasPoints ? (
                    <h2>Final Review Points</h2>
                  ) : (
                    <h2>Final Review</h2>
                  )
                ) : (
                  <h2>Review</h2>
                )}
                {isFinalReview(props) && !props.selectedInstance.finalReviewVisible && (
                  <Message size="small" warning className="finalReviewHidden">
                    <Icon name="eye slash" />
                    The final review is hidden from students. They see it once it is shown in the course
                    settings.
                  </Message>
                )}
                {assignedInstructor && (
                  <Message
                    size="small"
                    warning={!assignedToMe}
                    info={assignedToMe}
                    className="assignedInstructor"
                  >
                    Assigned instructor: {assignedInstructor.firsts} {assignedInstructor.lastname}
                    {assignedToMe
                      ? ' (you)'
                      : ". You are not this student's instructor; saving changes to the grading asks for confirmation."}
                  </Message>
                )}
                {unsavedEdits && (
                  <Message warning className="unsavedEdits">
                    <Message.Header>Unsaved changes</Message.Header>
                    <p>
                      The form shows changes made in this browser
                      {unsavedEdits.editedAt
                        ? ` (last edited ${formatTime(unsavedEdits.editedAt)})`
                        : ''}{' '}
                      that have not been saved yet. Save to keep them, or press Cancel to discard them.
                    </p>
                  </Message>
                )}
                {discardedLocalEdits && (
                  <Message size="small" info onDismiss={() => setDiscardedLocalEdits(false)}>
                    This review has been saved since you last edited it in this browser, so your older unsaved
                    changes were discarded. The form shows the saved review.
                  </Message>
                )}
                {conflict && conflict.code === 'REVIEW_CHANGED' && (
                  <Message warning className="reviewChanged">
                    <Message.Header>This review was changed by someone else</Message.Header>
                    <p>
                      {conflict.message}
                      {conflict.updatedAt && ` (saved ${formatTime(conflict.updatedAt)})`} Your changes have
                      not been saved.
                    </p>
                    <Button type="button" onClick={loadTheirVersion}>
                      Load their version
                    </Button>
                    <Button type="button" color="red" onClick={() => submitReview({ overwrite: true })}>
                      Overwrite with my version
                    </Button>
                  </Message>
                )}
                <Modal size="tiny" open={!!conflict && conflict.code === 'NOT_ASSIGNED_INSTRUCTOR'}>
                  <Modal.Header>You are not this student&apos;s instructor</Modal.Header>
                  <Modal.Content>
                    <p>{conflict && conflict.message}</p>
                    <p>Do you want to save your changes to the grading anyway?</p>
                  </Modal.Content>
                  <Modal.Actions>
                    <Button type="button" onClick={props.resetReviewSave}>
                      Cancel
                    </Button>
                    <Button
                      type="button"
                      color="orange"
                      onClick={() => submitReview({ confirmedNotAssigned: true })}
                    >
                      Save anyway
                    </Button>
                  </Modal.Actions>
                </Modal>
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
                          onChange={(e, { value }) => edit('points', value)}
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
                          onChange={(e, { value }) => edit('grade', value)}
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
                      <FormMarkdownTextArea
                        value={pstate.feedback}
                        onChange={(e, { value }) => edit('feedback', value)}
                        name="comment"
                        style={{ width: '500px', height: '250px' }}
                      />
                    </div>
                  </Form.Group>
                  {/* instructor-only, styled like instructor-only comments (#1142); collapsed while empty */}
                  {notesLocked ? (
                    <div className="instructorNotes lockedNotes" style={notesBoxStyle}>
                      <h4 style={{ marginTop: 0 }}>
                        Review notes by {assignedInstructor.firsts} {assignedInstructor.lastname}
                      </h4>
                      <Label color="orange" size="small" style={{ marginBottom: '10px' }}>
                        <Icon name="eye slash" />
                        Instructors only: not shown to the student
                      </Label>
                      <p className="notesLockedInfo" style={{ color: 'rgba(0,0,0,.6)' }}>
                        Only the assigned instructor edits the review notes of the final review. Add your own
                        note below.
                      </p>
                      {savedWeek && savedWeek.instructorNotes ? (
                        <ReactMarkdown>{savedWeek.instructorNotes}</ReactMarkdown>
                      ) : (
                        <p>
                          <em>No review notes yet.</em>
                        </p>
                      )}
                      <h4>Additional review notes</h4>
                      <ReviewNotes notes={additionalNotes} onAdd={addReviewNote} />
                    </div>
                  ) : (
                    <>
                      {!notesOpened && !pstate.instructorNotes ? (
                        <Button
                          type="button"
                          basic
                          color="orange"
                          className="addInstructorNotes"
                          style={{ margin: '1em 0' }}
                          onClick={() => setNotesOpened(true)}
                        >
                          <Icon name="eye slash" />
                          Add review notes (instructors only)
                        </Button>
                      ) : (
                        <div
                          className="instructorNotes"
                          style={{
                            border: '2px solid #f2711c',
                            background: '#fff6ef',
                            borderRadius: '4px',
                            padding: '10px 12px',
                            margin: '1em 0'
                          }}
                        >
                          <h4 style={{ marginTop: 0 }}>Review notes</h4>
                          <Label color="orange" size="small" style={{ marginBottom: '10px' }}>
                            <Icon name="eye slash" />
                            Instructors only: not shown to the student
                          </Label>
                          <Form.Group inline unstackable style={{ textAlignVertical: 'top' }}>
                            <div style={{ width: '100%' }}>
                              <FormMarkdownTextArea
                                value={pstate.instructorNotes}
                                onChange={(e, { value }) => edit('instructorNotes', value)}
                                name="instructorNotes"
                                style={{ width: '500px', height: '150px' }}
                              />
                            </div>
                          </Form.Group>
                        </div>
                      )}
                      {isFinalReview(props) && (
                        <div className="instructorNotes" style={notesBoxStyle}>
                          <h4 style={{ marginTop: 0 }}>Additional review notes</h4>
                          <ReviewNotes notes={additionalNotes} onAdd={addReviewNote} />
                        </div>
                      )}
                    </>
                  )}
                  <Form.Field>
                    <Button className="ui center floated green button" type="submit">
                      Save
                    </Button>
                    <Button className="ui center floated button" type="button" onClick={onClickSaveDraft}>
                      Save as draft
                    </Button>
                    <Link to={`/labtool/browsereviews/${props.selectedInstance.ohid}/${studentData.id}`}>
                      <Button className="ui center floated button" type="button" onClick={pstate.clear}>
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
                toggleCheckbox={clId =>
                  toggleCheckbox(clId, props.ownProps.studentInstance, props.ownProps.weekNumber)
                }
                copyChecklistOutput={copyChecklistOutput}
              />
            </Grid.Row>
          </Grid>
          <ChangeHistory
            title="Change history"
            entries={props.changeLog.filter(
              entry => entry.kind === 'week_review' && entry.number === Number(props.ownProps.weekNumber)
            )}
          />
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
    reviewSave: state.reviewSave,
    changeLog: state.changeLog.entries,
    currentUserId: state.user && state.user.user ? state.user.user.id : null,
    loading: state.loading,
    errors: Object.values(state.loading.errors)
  }
}

const mapDispatchToProps = {
  createReviewNote,
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
  addRedirectHook,
  resetReviewSave,
  getChangeLog
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
  reviewSave: PropTypes.object.isRequired,
  changeLog: PropTypes.array.isRequired,
  currentUserId: PropTypes.number,
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
  resetReviewSave: PropTypes.func.isRequired,
  getChangeLog: PropTypes.func.isRequired,
  createReviewNote: PropTypes.func,

  errors: PropTypes.array
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(ReviewStudent))
