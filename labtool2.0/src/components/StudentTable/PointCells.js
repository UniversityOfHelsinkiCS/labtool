import React from 'react'
import PropTypes from 'prop-types'
import { Link } from 'react-router-dom'
import { Icon, Popup, Button, Table } from 'semantic-ui-react'
import { connect } from 'react-redux'

import Points from '../Points'

const tableCellLinkStyle = { position: 'absolute', display: 'inline-block', top: 0, left: 0, right: 0, bottom: 0 }
const flexCenter = { display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }

const showNewCommentsNotification = (studentData, week, loggedInUser) => {
  const commentsForWeek = studentData.weeks.find(wk => wk.weekNumber === week).comments
  if (commentsForWeek.length === 0) {
    return false
  }
  const newComments = commentsForWeek.filter(comment => !(comment.isRead || []).includes(loggedInUser.user.id))
  return newComments.length > 0
}

const draftExists = (studentData, weekNumber) => {
  return studentData.weekdrafts && studentData.weekdrafts.filter(draft => draft.weekNumber === weekNumber).length === 1
}

export const PointCells = ({ loggedInUser, selectedInstance, studentData }) => {
  const siId = studentData.id

  const cr =
    studentData.codeReviews &&
    studentData.codeReviews.reduce((a, b) => {
      return { ...a, [b.reviewNumber]: b.points }
    }, {})
  const indents = []
  let i = 0
  let weekPoints = {}
  let finalPoints = undefined
  const shouldReview = !studentData.dropped && studentData.validRegistration

  for (var j = 0; j < studentData.weeks.length; j++) {
    if (studentData.weeks[j].weekNumber === selectedInstance.weekAmount + 1) {
      finalPoints = studentData.weeks[j].points
    } else if (studentData.weeks[j].weekNumber) {
      weekPoints[studentData.weeks[j].weekNumber] = studentData.weeks[j].points
    }
  }
  for (; i < selectedInstance.weekAmount; i++) {
    indents.push(
      <Table.Cell selectable key={'week' + i} textAlign="center" style={{ position: 'relative' }}>
        <Link
          style={(tableCellLinkStyle, flexCenter)}
          key={'week' + i + 'link'}
          to={
            weekPoints[i + 1] === undefined
              ? { pathname: `/labtool/reviewstudent/${selectedInstance.ohid}/${siId}/${i + 1}`, state: { cameFromCoursePage: true } }
              : { pathname: `/labtool/browsereviews/${selectedInstance.ohid}/${siId}`, state: { openAllWeeks: true, jumpToReview: `Week${i + 1}` } }
          }
        >
          <div>
            {weekPoints[i + 1] === undefined ? (
              shouldReview && selectedInstance.currentWeek === i + 1 ? (
                draftExists(studentData, selectedInstance.currentWeek) ? (
                  <Popup trigger={<Button circular color="orange" size="tiny" icon={{ name: 'pause', size: 'large' }} />} content="Continue review from draft" className="reviewDraftButton" />
                ) : (
                  <Popup trigger={<Button circular color="orange" size="tiny" icon={{ name: 'star', size: 'large' }} />} content="Review" className="reviewButton" />
                )
              ) : (
                <p style={flexCenter}>-</p>
              )
            ) : (
              <div>
                <p>
                  <Points points={weekPoints[i + 1]} />
                </p>
                {showNewCommentsNotification(studentData, i + 1, loggedInUser) ? <Popup trigger={<Icon name="comments" size="big" />} content="You have new comments" /> : null}
              </div>
            )}
          </div>
        </Link>
      </Table.Cell>
    )
  }

  const { amountOfCodeReviews } = selectedInstance
  if (amountOfCodeReviews) {
    for (let index = 1; index <= amountOfCodeReviews; index++) {
      const codeReview = studentData.codeReviews ? studentData.codeReviews.find(cr => cr.reviewNumber === index) : null

      indents.push(
        <Table.Cell selectable key={`cr${siId}:${index}`} textAlign="center" style={{ position: 'relative' }}>
          <Link
            className="codeReviewPoints"
            style={{ tableCellLinkStyle, flexCenter }}
            key={'codeReview' + index + 'link'}
            to={{ pathname: `/labtool/browsereviews/${selectedInstance.ohid}/${siId}`, state: { openAllWeeks: true, jumpToReview: codeReview ? `CodeReview${codeReview.reviewNumber}` : undefined } }}
          >
            {shouldReview && selectedInstance.currentCodeReview.includes(index) && codeReview ? (
              codeReview.linkToReview === null && codeReview.points === null ? (
                <Popup
                  position="top center"
                  trigger={<Icon color="grey" size="large" name="hourglass end" fitted />}
                  content="Student has not yet submitted the code review"
                  className="codeReviewNotReady"
                />
              ) : codeReview.points === null ? (
                <Popup trigger={<Button circular color="orange" size="tiny" icon={{ name: 'star', size: 'large' }} />} content="Review" className="codeReviewButton" />
              ) : (
                <p>{cr[index] || cr[index] === 0 ? <Points points={cr[index]} /> : '-'}</p>
              )
            ) : (
              <p>{cr[index] || cr[index] === 0 ? <Points points={cr[index]} /> : '-'}</p>
            )}
          </Link>
        </Table.Cell>
      )
    }
  }

  if (selectedInstance.finalReview) {
    let finalReviewPointsCell = (
      <Table.Cell selectable key="finalReview" textAlign="center" style={{ position: 'relative' }}>
        <Link
          style={(tableCellLinkStyle, flexCenter)}
          key={'finalReviewlink'}
          to={
            finalPoints === undefined
              ? `/labtool/reviewstudent/${selectedInstance.ohid}/${siId}/${i + 1}`
              : { pathname: `/labtool/browsereviews/${selectedInstance.ohid}/${siId}`, state: { openAllWeeks: true, jumpToReview: 'Final' } }
          }
        >
          <div style={{ width: '100%', height: '100%' }}>
            {finalPoints === undefined ? (
              shouldReview && selectedInstance.currentWeek === selectedInstance.weekAmount + 1 ? (
                draftExists(selectedInstance.weekAmount + 1) ? (
                  <Popup trigger={<Button circular color="orange" size="tiny" icon={{ name: 'pause', size: 'large' }} />} content="Continue review from draft" className="reviewDraftButton" />
                ) : (
                  <Popup trigger={<Button circular color="orange" size="tiny" icon={{ name: 'star', size: 'large' }} />} content="Review" className="reviewButton" />
                )
              ) : (
                <p style={flexCenter}>-</p>
              )
            ) : finalPoints === null ? (
              <div>
                <p style={flexCenter}>
                  <Popup trigger={<Icon name="check" size="big" color="grey" />} content="Final review has been given, but without any points" />
                </p>
                {showNewCommentsNotification(studentData, selectedInstance.weekAmount + 1) ? <Popup trigger={<Icon name="comments" size="big" />} content="You have new comments" /> : null}
              </div>
            ) : (
              <div>
                <p style={flexCenter}>
                  <Points points={finalPoints} />
                </p>
                {showNewCommentsNotification(studentData, selectedInstance.weekAmount + 1) ? <Popup trigger={<Icon name="comments" size="big" />} content="You have new comments" /> : null}
              </div>
            )}
          </div>
        </Link>
      </Table.Cell>
    )
    indents.push(finalReviewPointsCell)
  }

  return indents
}

const mapStateToProps = (state, ownProps) => {
  return {
    loggedInUser: state.user,
    selectedInstance: state.selectedInstance,
    studentData: state.coursePage.data.find(student => student.id === ownProps.studentId)
  }
}

PointCells.propTypes = {
  loggedInUser: PropTypes.object.isRequired,
  selectedInstance: PropTypes.object.isRequired,
  studentData: PropTypes.object.isRequired
}

export default connect(mapStateToProps)(PointCells)
