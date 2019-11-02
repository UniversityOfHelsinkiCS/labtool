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
  const weekAdvanceEnabled = selectedInstance.currentWeek !== selectedInstance.weekAmount

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
              Current week: {selectedInstance.currentWeek}
              <Popup
                content={weekAdvanceEnabled ? 'Advance course by 1 week' : 'Already at final week'}
                trigger={
                  <Icon disabled={!weekAdvanceEnabled} name="right arrow" onClick={() => moveToNextWeek()} style={{ marginLeft: '15px', cursor: weekAdvanceEnabled ? 'pointer' : 'not-allowed' }} />
                }
              />
            </Table.Cell>
            <Table.Cell>Week max points: {selectedInstance.weekMaxPoints}</Table.Cell>
            <Table.Cell textAlign="right">
              {' '}
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
  courseInstance: PropTypes.object.isRequired,
  activateCourse: PropTypes.func.isRequired,
  moveToNextWeek: PropTypes.func.isRequired
}

export default CoursePageTeacherHeader
