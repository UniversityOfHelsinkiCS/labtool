import React from 'react'
import PropTypes from 'prop-types'
import { Icon, Accordion, Form, Input, Button, Popup } from 'semantic-ui-react'
import { Link } from 'react-router-dom'
import { roundPoints } from '../../util/format'
import { reviewTitleStyle } from './reviewTitleStyle'
import { Points } from '../Points'
import { reviewedRepository } from '../../util/reviewedRepository'
import { safeHref } from '../../util/links'

// The project a code review was done against (#1132), with a warning when the student has changed
// their repository since.
const ReviewedProject = ({ codeReview, reviewee }) => {
  const { repository, current, changed } = reviewedRepository(codeReview, reviewee.github)
  return (
    <p>
      <strong>Project to review:</strong> {reviewee.projectName} <br />
      <strong>GitHub:</strong>{' '}
      <a href={repository} target="_blank" rel="noopener noreferrer">
        {repository}
      </a>
      {changed && (
        <span className="repositoryChanged" style={{ display: 'block', color: '#c55a11' }}>
          The student has changed their repository since; it is now{' '}
          <a href={current} target="_blank" rel="noopener noreferrer">
            {current}
          </a>
        </span>
      )}
    </p>
  )
}

ReviewedProject.propTypes = {
  codeReview: PropTypes.object.isRequired,
  reviewee: PropTypes.object.isRequired
}

export const WeekReviewCodeReview = props => {
  const {
    index,
    cr,
    selectedInstance,
    studentInstance,
    openWeeks,
    isTeacher,
    courseData,
    coursePageLogic,
    getMaximumPointsForCodeReview,
    handleClickWeek,
    gradeCodeReview,
    handleAddingIssueLink
  } = props
  const i = index

  const doOpen = openWeeks[i] || (!isTeacher && cr.points === null)
  const hasChecklist = selectedInstance.checklists.find(checkl => checkl.forCodeReview)
  const maxPoints = getMaximumPointsForCodeReview()

  return (
    <Accordion key={`codereview${i}`} fluid styled id={`reviewCodeReview${cr.reviewNumber}`}>
      {' '}
      <Accordion.Title
        className="codeReview reviewTitle"
        style={reviewTitleStyle}
        active={doOpen}
        index={i}
        onClick={handleClickWeek}
      >
        <Icon name="dropdown" /> Code Review {cr.reviewNumber}{' '}
        {cr.points !== null
          ? `, points ${roundPoints(cr.points)}${maxPoints !== null ? ` / ${roundPoints(maxPoints)}` : ''}`
          : ''}
      </Accordion.Title>
      <Accordion.Content active={doOpen}>
        {isTeacher ? (
          <>
            {cr.toReview ? (
              <ReviewedProject
                codeReview={cr}
                reviewee={courseData.data.find(data => data.id === cr.toReview)}
              />
            ) : (
              <p>
                <span>This student is assigned a repo that doesn&#39;t belong to this course to review</span>
                <br />
                <strong>GitHub:</strong>{' '}
                <a href={safeHref(cr.repoToReview)} target="_blank" rel="noopener noreferrer">
                  {cr.repoToReview}
                </a>
              </p>
            )}
            <strong>Code review:</strong>{' '}
            {cr.linkToReview ? (
              <a href={cr.linkToReview} target="_blank" rel="noopener noreferrer">
                {cr.linkToReview}
              </a>
            ) : (
              'No review linked yet'
            )}
            {cr.points !== null ? (
              <h4>
                <Points points={cr.points} /> points
              </h4>
            ) : (
              <h4>Not graded yet</h4>
            )}
            {hasChecklist ? (
              <>
                <Link
                  to={`/labtool/reviewstudentcr/${selectedInstance.ohid}/${studentInstance}/${cr.reviewNumber}`}
                >
                  <Popup
                    trigger={
                      <Button
                        circular
                        color="orange"
                        size="tiny"
                        icon={{ name: 'edit', color: 'black', size: 'large' }}
                      />
                    }
                    content={cr.points !== null ? 'Edit review' : 'Review'}
                  />
                </Link>
              </>
            ) : (
              <Form onSubmit={gradeCodeReview(cr.reviewNumber, studentInstance)}>
                <label>Points </label>
                <Input
                  name="points"
                  defaultValue={cr.points ? cr.points : ''}
                  type="number"
                  step="0.01"
                  style={{ width: '100px' }}
                />
                <Input type="submit" value="Grade" />
              </Form>
            )}
          </>
        ) : (
          <>
            <strong>Points: </strong>{' '}
            {cr.points !== null
              ? `${roundPoints(cr.points)}${maxPoints !== null ? ` / ${roundPoints(maxPoints)}` : ''}`
              : 'Not graded yet'}
            <br />
            <strong>GitHub: </strong>
            <a
              href={safeHref(cr.toReview.github || cr.repoToReview)}
              target="_blank"
              rel="noopener noreferrer"
            >
              {cr.toReview.github || cr.repoToReview}
            </a>
            <br /> <br />
            {cr.linkToReview ? (
              <div>
                <strong>Your review: </strong>
                <a href={cr.linkToReview} target="_blank" rel="noopener noreferrer">
                  {cr.linkToReview}
                </a>
              </div>
            ) : (
              <div />
            )}
            {coursePageLogic.showCodeReviews.indexOf(cr.reviewNumber) !== -1 ? (
              <div>
                {cr.linkToReview ? (
                  <div />
                ) : (
                  <div>
                    <strong>Link your review here:</strong> <br />
                    <Form onSubmit={handleAddingIssueLink(cr.reviewNumber, courseData.data.id)}>
                      <Form.Group inline>
                        <Input
                          type="text"
                          name="reviewLink"
                          icon="github"
                          required={true}
                          iconPosition="left"
                          style={{ minWidth: '25em' }}
                          placeholder="https://github.com/account/repo/issues/number"
                          className="form-control1"
                        />
                      </Form.Group>
                      <Form.Group>
                        <Button compact type="submit" color="blue" style={{ marginLeft: '0.5em' }}>
                          Submit
                        </Button>
                      </Form.Group>
                    </Form>
                  </div>
                )}
              </div>
            ) : (
              <p />
            )}
          </>
        )}
      </Accordion.Content>
    </Accordion>
  )
}

WeekReviewCodeReview.propTypes = {
  index: PropTypes.number.isRequired,
  openWeeks: PropTypes.object.isRequired,
  cr: PropTypes.object.isRequired,
  isTeacher: PropTypes.bool,
  studentInstance: PropTypes.string,
  selectedInstance: PropTypes.object.isRequired,
  courseData: PropTypes.object.isRequired,
  coursePageLogic: PropTypes.object.isRequired,
  courseId: PropTypes.string.isRequired,

  getMaximumPointsForCodeReview: PropTypes.func.isRequired,
  handleClickWeek: PropTypes.func.isRequired,
  gradeCodeReview: PropTypes.func.isRequired,
  handleAddingIssueLink: PropTypes.func.isRequired
}

export default WeekReviewCodeReview
