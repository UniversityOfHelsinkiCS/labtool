import React from 'react'
import PropTypes from 'prop-types'
import { Icon, Accordion, Form, Input, Button } from 'semantic-ui-react'

export const WeekReviewCodeReview = props => {
  const { index, cr, studentInstance, openWeeks, isTeacher, courseData, coursePageLogic, handleClickWeek, gradeCodeReview, handleAddingIssueLink } = props
  const i = index

  const doOpen = openWeeks[i] || (!isTeacher && cr.points === null)

  return (
    <Accordion key={`codereview${i}`} fluid styled id={`review${i - 1}`}>
      {' '}
      <Accordion.Title className="codeReview" active={doOpen} index={i} onClick={handleClickWeek}>
        <Icon name="dropdown" /> Code Review {cr.reviewNumber} {cr.points !== null ? ', points ' + cr.points : ''}
      </Accordion.Title>
      <Accordion.Content active={doOpen}>
        {isTeacher ? (
          <>
            {cr.toReview ? (
              <p>
                <strong>Project to review:</strong> {courseData.data.find(data => data.id === cr.toReview).projectName} <br />
                <strong>GitHub:</strong>{' '}
                <a href={courseData.data.find(data => data.id === cr.toReview).github} target="_blank" rel="noopener noreferrer">
                  {courseData.data.find(data => data.id === cr.toReview).github}
                </a>
              </p>
            ) : (
              <p>
                <span>This student is assigned a repo that doesn&#39;t belong to this course to review</span>
                <br />
                <strong>GitHub:</strong>{' '}
                <a href={cr.repoToReview} target="_blank" rel="noopener noreferrer">
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
            {cr.points !== null ? <h4>{cr.points} points</h4> : <h4>Not graded yet</h4>}
            <Form onSubmit={gradeCodeReview(cr.reviewNumber, studentInstance)}>
              <label>Points </label>
              <Input name="points" defaultValue={cr.points ? cr.points : ''} type="number" step="0.01" style={{ width: '100px' }} />
              <Input type="submit" value="Grade" />
            </Form>
          </>
        ) : (
          <>
            <strong>Points: </strong> {cr.points !== null ? cr.points : 'Not graded yet'}
            <br />
            <strong>GitHub: </strong>
            <a href={cr.toReview.github || cr.repoToReview} target="_blank" rel="noopener noreferrer">
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
  courseData: PropTypes.object.isRequired,
  coursePageLogic: PropTypes.object.isRequired,
  courseId: PropTypes.string.isRequired,

  handleClickWeek: PropTypes.func.isRequired,
  gradeCodeReview: PropTypes.func.isRequired,
  handleAddingIssueLink: PropTypes.func.isRequired
}

export default WeekReviewCodeReview
