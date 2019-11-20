import React from 'react'
import PropTypes from 'prop-types'
import { Button, Table, Label, Message, Icon, Popup } from 'semantic-ui-react'
import { Link } from 'react-router-dom'
import CoursePageHeader from './Header'

/**
 * Returns what teachers should see at the top of this page
 */
export const CoursePageTeacherHeader = props => {
  const { selectedInstance, courseInstance, activateCourse, moveToNextWeek } = props
  const isFinalReview = selectedInstance.currentWeek > selectedInstance.weekAmount
  const weekAdvanceEnabled = selectedInstance.currentWeek < selectedInstance.weekAmount + (selectedInstance.finalReview ? 1 : 0)

  return (
    <div className="TeachersTopView" style={{ textAlignVertical: 'center', textAlign: 'center' }}>
      <CoursePageHeader courseInstance={selectedInstance} />
      {courseInstance &&
        courseInstance.active !== true &&
        (!selectedInstance.active && (
          <div>
            <Message compact>
              <Message.Header>The registration is not active on this course.</Message.Header>
            </Message>

            <Button color="green" style={{ marginLeft: '25px' }} onClick={() => activateCourse()}>
              Activate now
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
              <Link to={{
                pathname: `/labtool/ModifyCourseInstanceCodeReviews/${selectedInstance.ohid}`,
                state: { cameFromCoursePage: true }
              }}>
                <Popup trigger={<Button circular size="tiny" icon={{ name: 'shuffle', size: 'large', color: 'orange' }} />} content="Edit code reviews" />
              </Link>
              <Link to={`/labtool/ModifyCourseInstancePage/${selectedInstance.ohid}`}>
                <Popup trigger={<Button circular size="tiny" icon={{ name: 'edit', size: 'large', color: 'orange' }} />} content="Edit course" />
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
  courseInstance: PropTypes.oneOfType([PropTypes.array, PropTypes.object]),
  activateCourse: PropTypes.func.isRequired,
  moveToNextWeek: PropTypes.func.isRequired
}

export default CoursePageTeacherHeader
