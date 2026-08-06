import React from 'react'
import PropTypes from 'prop-types'
import { Button, Table, Popup } from 'semantic-ui-react'
import { Link } from 'react-router-dom'
import { HorizontalScrollable } from '../../HorizontalScrollable'
import { formatCourseName } from '../../../util/format'

export const AdminCourseList = ({ courses }) => {
  if (!Array.isArray(courses)) {
    return <div />
  }

  return (
    <HorizontalScrollable>
      <Table singleLine color="yellow" style={{ overflowX: 'visible' }}>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell colSpan="1">Course ID</Table.HeaderCell>
            <Table.HeaderCell colSpan="1">Course name</Table.HeaderCell>
            <Table.HeaderCell colSpan="1">Course start date</Table.HeaderCell>
            <Table.HeaderCell colSpan="2"> </Table.HeaderCell>
          </Table.Row>
        </Table.Header>

        <Table.Body>
          {courses.map(instance => (
            <Table.Row key={instance.id}>
              <Table.Cell>{instance.shorterId} </Table.Cell>
              <Table.Cell>
                <strong>{formatCourseName(instance.name, instance.ohid, instance.start)}</strong>
              </Table.Cell>

              <Table.Cell> {instance.europeanStart} </Table.Cell>
              <Table.Cell textAlign="center">
                <Popup
                  trigger={
                    <Button
                      circular
                      size="tiny"
                      icon={{ name: 'edit', size: 'large', color: 'orange' }}
                      as={Link}
                      to={{
                        pathname: `/labtool/ModifyCourseInstanceStaff/${instance.ohid}`,
                        state: { fromAdmin: true }
                      }}
                    />
                  }
                  position="top right"
                  content="Manage instructors for this course"
                />
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table>
    </HorizontalScrollable>
  )
}

AdminCourseList.propTypes = {
  courses: PropTypes.oneOfType([PropTypes.array, PropTypes.object])
}

export default AdminCourseList
