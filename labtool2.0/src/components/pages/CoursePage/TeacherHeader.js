import React from 'react'
import PropTypes from 'prop-types'
import { Button, Table, Label, Message, Popup } from 'semantic-ui-react'
import { Link } from 'react-router-dom'
import CoursePageHeader from './Header'

/**
 * Returns what teachers should see at the top of this page
 */
export const CoursePageTeacherHeader = props => {
  const { selectedInstance, changeCourseActive, moveToNextWeek } = props
  const isFinalReview = selectedInstance.currentWeek > selectedInstance.weekAmount
  const weekAdvanceEnabled = selectedInstance.currentWeek < selectedInstance.weekAmount + (selectedInstance.finalReview ? 1 : 0)
  const timeNow = new Date()
  const courseStart = selectedInstance ? new Date(selectedInstance.start) : timeNow
  // suggest activations to be enabled for 30 days
  const suggestedActivationStatus = timeNow.getTime() - courseStart.getTime() < (30 * 24 * 60 * 60 * 1000)
  const actualActivationStatus = selectedInstance ? selectedInstance.active : null

  return (
    <div className="TeachersTopView" style={{ textAlignVertical: 'center', textAlign: 'center' }}>
      <CoursePageHeader courseInstance={selectedInstance} />
      {actualActivationStatus !== suggestedActivationStatus &&
        (!actualActivationStatus ? (
          <div>
            <Message compact>
              <Message.Header>The registration is not active on this course.</Message.Header>
            </Message>

            <Button color="green" style={{ marginLeft: '25px' }} onClick={() => changeCourseActive(true)}>
              Activate now
            </Button>
            <br />
          </div>
        ) : (
          <div>
            <Message compact>
              <Message.Header>This course has been going for a while, but registrations are still active.</Message.Header>
            </Message>

            <Button color="green" style={{ marginLeft: '25px' }} onClick={() => changeCourseActive(false)}>
              Disable registration
            </Button>
            <br />
          </div>
        ))}
      <Table>
        <Table.Header>
          <Table.Row>
            <Table.Cell>
              <div>
                {selectedInstance.active === true ? (
                  <Label ribbon style={{ backgroundColor: '#21ba45' }}>
                    Active registration
                  </Label>
                ) : (
                  <div />
                )}
              </div>
            </Table.Cell>
            <Table.Cell>Week amount: {selectedInstance.weekAmount}</Table.Cell>
            <Table.Cell>
              Current week: {isFinalReview ? 'Final Review' : selectedInstance.currentWeek}
              <Popup
                content={weekAdvanceEnabled ? 'Advance course by 1 week' : selectedInstance.finalReview ? 'Already at final review' : 'Already at final week'}
                trigger={
                  <span style={{ marginLeft: '15px' }}>
                    <Button
                      content="Advance"
                      icon={{ name: 'right arrow' }}
                      labelPosition="right"
                      disabled={!weekAdvanceEnabled}
                      onClick={() => moveToNextWeek()}
                      compact
                      size="mini"
                      style={{ cursor: weekAdvanceEnabled ? 'pointer' : 'not-allowed' }}
                    />
                  </span>
                }
              />
            </Table.Cell>
            <Table.Cell>Week max points: {selectedInstance.weekMaxPoints}</Table.Cell>
            <Table.Cell textAlign="right">
              {' '}
              <Link
                to={{
                  pathname: `/labtool/ModifyCourseInstanceCodeReviews/${selectedInstance.ohid}`,
                  state: { cameFromCoursePage: true }
                }}
              >
                <Popup trigger={<Button circular size="tiny" icon={{ name: 'shuffle', size: 'large', color: 'orange' }} />} content="Edit code reviews" position="bottom right" />
              </Link>
              <Link to={`/labtool/ModifyCourseInstancePage/${selectedInstance.ohid}`}>
                <Popup trigger={<Button circular size="tiny" icon={{ name: 'edit', size: 'large', color: 'orange' }} />} content="Edit course" position="top right" />
              </Link>
            </Table.Cell>
          </Table.Row>
        </Table.Header>
      </Table>
    </div>
  )
}

CoursePageTeacherHeader.propTypes = {
  selectedInstance: PropTypes.object.isRequired,
  changeCourseActive: PropTypes.func.isRequired,
  moveToNextWeek: PropTypes.func.isRequired
}

export default CoursePageTeacherHeader
