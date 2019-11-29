import React, { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import { withRouter } from 'react-router'
import { Button, Form, Input, Grid, Card, Loader, Icon } from 'semantic-ui-react'
import { Link, Redirect } from 'react-router-dom'
import { connect } from 'react-redux'
import { getOneCI, coursePageInformation } from '../../services/courseInstance'
import { clearNotifications } from '../../reducers/notificationReducer'
import { gradeCodeReview } from '../../services/codeReview'
import { toggleCheckCodeReview, resetChecklist, restoreChecks } from '../../reducers/weekReviewReducer'
import { resetLoading, addRedirectHook } from '../../reducers/loadingReducer'
import store from '../../store'
import { usePersistedState } from '../../hooks/persistedState'

import RepoLink from '../RepoLink'
import BackButton from '../BackButton'
import DocumentTitle from '../DocumentTitle'
import Error from '../Error'
import { Points } from '../Points'
import { roundPoints } from '../../util/format'

/**
 *  The page which is used by teacher to review submissions,.
 */
export const ReviewStudentCodeReview = props => {
  const [loadedCrData, setLoadedCrData] = useState(false)
  const [allowChecksCopy, setAllowChecksCopy] = useState(false)
  const pstate = usePersistedState(`ReviewStudentCodeReview_${props.studentInstance}:${props.codeReviewNumber}`, {
    points: '',
    checks: null
  })

  useEffect(() => {
    // run on component mount
    props.resetLoading()
    props.getOneCI(props.courseId)
    props.coursePageInformation(props.courseId)
    props.clearNotifications()

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

  const constructChecks = thisChecks => {
    let checksObj = {}
    Object.keys(checkList.list).forEach(category => {
      checkList.list[category].forEach(clItem => {
        checksObj[clItem.id] = false
      })
    })
    checksObj = { ...checksObj, ...thisChecks }
    return Object.keys(checksObj).map(id => ({ id: Number(id, 10), checked: checksObj[id] }))
  }

  const decodeChecks = checksList => {
    const checksObj = {}
    checksList.forEach(({ checklistItemId, checked }) => (checksObj[checklistItemId] = checked))
    return checksObj
  }

  const handleSubmit = async e => {
    try {
      e.preventDefault()
      const content = {
        points: Number(e.target.points.value),
        checks: constructChecks(props.weekReview.checks),
        studentInstanceId: Number(props.studentInstance),
        reviewNumber: Number(props.codeReviewNumber)
      }
      pstate.clear()
      const maxPoints = getMaximumPoints()
      if (e.target.points.value < 0 || (maxPoints && e.target.points.value > maxPoints)) {
        store.dispatch({ type: 'CODE_REVIEW_GRADE_FAILURE', response: { response: { data: 'Invalid points value' } } })
      } else {
        props.addRedirectHook({
          hook: 'CODE_REVIEW_GRADE_'
        })
        await props.gradeCodeReview(content)
      }
    } catch (error) {
      console.error(error)
    }
  }

  const getMaximumPoints = () => {
    const checklist = props.selectedInstance.checklists.find(checkl => checkl.forCodeReview)
    if (checklist && checklist.maxPoints) {
      return checklist.maxPoints
    }
    return null
  }

  const toggleCheckbox = (checklistItemId, studentId, crNbr) => async () => {
    setAllowChecksCopy(true)
    props.toggleCheckCodeReview(checklistItemId, studentId, crNbr)
  }

  const copyChecklistOutput = async e => {
    e.preventDefault()
    pstate.points = roundPoints(Number(e.target.points.value))
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

  const student = props.courseData.data.find(student => student.id === Number(props.studentInstance))
  const cr = student.codeReviews.find(cr => cr.reviewNumber === Number(props.codeReviewNumber))
  const checkList = props.selectedInstance.checklists.find(checkl => checkl.forCodeReview)
  const maxPoints = getMaximumPoints()
  const weekPoints = student.weeks
    .map(week => week.points)
    .reduce((a, b) => {
      return a + b
    }, 0)
  const codeReviewPoints = student.codeReviews
    .filter(review => review.reviewNumber < Number(props.codeReviewNumber))
    .map(review => review.points)
    .reduce((a, b) => {
      return a + b
    }, 0)
  const savedChecks = cr ? cr.checks || {} : {}
  const checks = props.weekReview.checks !== null ? props.weekReview.checks : savedChecks
  let checklistPoints = 0
  const toReviewProject = cr.toReview ? props.courseData.data.find(student => student.id === cr.toReview) : null
  if (checkList) {
    Object.keys(checkList.list).forEach(category => {
      checkList.list[category].forEach(clItem => {
        //handle existing case where clItems were saved by name in weekData.checks
        if (savedChecks[clItem.name]) {
          savedChecks[clItem.id] = savedChecks[clItem.name]
          delete savedChecks[clItem.name]
        }

        const checked = isChecked(checks, clItem.id)
        if (checked) {
          checklistPoints += clItem.checkedPoints
        } else {
          checklistPoints += clItem.uncheckedPoints
        }
      })
    })
    if (checklistPoints < 0) {
      checklistPoints = 0
    } else if (maxPoints !== null && checklistPoints > maxPoints) {
      checklistPoints = maxPoints
    }
  }

  if (!loadedCrData) {
    if (cr.points) {
      if (cr.checks) {
        props.restoreChecks(props.ownProps.studentInstance, decodeChecks(cr.checks))
      }

      pstate.points = pstate.points || cr.points
      setLoadedCrData(true)
    }
  }

  const arrivedFromCoursePage = props.location && props.location.state && props.location.state.cameFromCoursePage

  return (
    <>
      <DocumentTitle title={`Review code review - ${student.User.firsts} ${student.User.lastname}`} />
      <div className="ReviewStudentCodeReview">
        <BackButton
          preset={arrivedFromCoursePage && 'coursePage'}
          to={!arrivedFromCoursePage && `/labtool/browsereviews/${props.selectedInstance.ohid}/${student.id}`}
          text={!arrivedFromCoursePage && 'Back to student reviews'}
        />
        <div style={{ textAlignVertical: 'center', textAlign: 'center' }}>
          <h2> {props.selectedInstance.name}</h2>
          <h3>
            {' '}
            {student.User.firsts} {student.User.lastname}
          </h3>
          <h3>Code Review {props.codeReviewNumber}</h3>
          <Grid>
            <Grid.Row columns={2}>
              <Grid.Column>
                <div align="left">
                  <h3>
                    Points so far: <Points points={weekPoints + codeReviewPoints} />{' '}
                  </h3>
                  Earlier code review points: <Points points={codeReviewPoints} />
                  <br />
                  Week points: <Points points={weekPoints} />
                </div>
                <h3>Project to review</h3>
                {toReviewProject ? (
                  <p>
                    {toReviewProject.projectName}: <RepoLink url={toReviewProject.github} />
                  </p>
                ) : cr.repoToReview ? (
                  <RepoLink url={cr.repoToReview} />
                ) : (
                  <p>No assigned project to review</p>
                )}
                <h3>Link to code review</h3>
                {cr.linkToReview ? (
                  <p>
                    <a target="_blank" rel="noopener noreferrer" href={cr.linkToReview}>
                      {cr.linkToReview}
                    </a>
                  </p>
                ) : (
                  <p>No code review linked</p>
                )}
                <h2>Review</h2>
                <Form onSubmit={handleSubmit}>
                  <Form.Group inline unstackable>
                    <Form.Field>
                      <label className="showMaxPoints">Points{maxPoints !== null ? `0-${roundPoints(maxPoints)}` : ''}</label>

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
                  <Form.Field>
                    <Button className="ui center floated green button" type="submit">
                      Save
                    </Button>
                    <Link to={`/labtool/browsereviews/${props.selectedInstance.ohid}/${student.id}`} type="Cancel">
                      <Button className="ui center floated button" type="cancel" onClick={pstate.clear}>
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
                      {Object.keys(checkList.list).map(clItemCategory => (
                        <Card className="checklistCard" fluid color="red" key={clItemCategory}>
                          <Card.Content header={clItemCategory} />
                          {checkList.list[clItemCategory].map(clItem => (
                            <Card.Content className="checklistCardRow" key={clItem.id} onClick={toggleCheckbox(clItem.id, props.ownProps.studentInstance, props.ownProps.weekNumber)}>
                              <Form.Field>
                                <Grid>
                                  <Grid.Row style={{ cursor: 'pointer', userSelect: 'none' }}>
                                    <Grid.Column width={3}>
                                      <Icon
                                        size="large"
                                        name={isChecked(checks, clItem.id) ? 'circle check outline' : 'circle outline'}
                                        style={{ color: isChecked(checks, clItem.id) ? 'green' : 'black' }}
                                      />
                                    </Grid.Column>
                                    <Grid.Column width={10}>
                                      <span style={{ flexGrow: 1, textAlign: 'center' }}>{clItem.name}</span>
                                    </Grid.Column>
                                    <Grid.Column width={3}>
                                      <span>{`${clItem.checkedPoints} p / ${clItem.uncheckedPoints} p`}</span>
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
                          <p className="checklistOutputPoints">
                            points: <Points points={checklistPoints} />
                          </p>
                          <input type="hidden" name="points" value={checklistPoints} />
                          <Button type="submit">Copy to review field</Button>
                        </Form>
                      </div>
                    </div>
                  ) : (
                    <p>There is no checklist for this code review.</p>
                  )}
                </Grid.Column>
              ) : (
                <div />
              )}
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
    courseData: state.coursePage,
    weekReview: state.weekReview,
    loading: state.loading,
    errors: Object.values(state.loading.errors)
  }
}

const mapDispatchToProps = {
  getOneCI,
  clearNotifications,
  gradeCodeReview,
  toggleCheckCodeReview,
  restoreChecks,
  resetChecklist,
  coursePageInformation,
  resetLoading,
  addRedirectHook
}

ReviewStudentCodeReview.propTypes = {
  ownProps: PropTypes.object.isRequired,

  courseId: PropTypes.string.isRequired,
  studentInstance: PropTypes.string.isRequired,
  codeReviewNumber: PropTypes.string.isRequired,

  selectedInstance: PropTypes.object.isRequired,
  courseData: PropTypes.object.isRequired,
  weekReview: PropTypes.object.isRequired,
  loading: PropTypes.object.isRequired,
  location: PropTypes.object,

  getOneCI: PropTypes.func.isRequired,
  clearNotifications: PropTypes.func.isRequired,
  gradeCodeReview: PropTypes.func.isRequired,
  toggleCheckCodeReview: PropTypes.func.isRequired,
  restoreChecks: PropTypes.func.isRequired,
  resetChecklist: PropTypes.func.isRequired,
  coursePageInformation: PropTypes.func.isRequired,
  resetLoading: PropTypes.func.isRequired,
  addRedirectHook: PropTypes.func.isRequired,

  errors: PropTypes.array
}

export default withRouter(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(ReviewStudentCodeReview)
)
