import React from 'react'
import PropTypes from 'prop-types'
import { Button, Card, Icon, Label, Header, Popup } from 'semantic-ui-react'
import { Link } from 'react-router-dom'
import { createCourseIdWithYearAndTerm } from '../../../util/format'

import RepoLink from '../../RepoLink'

export const StudentCard = ({ student, otherParticipations, handleMarkAsDropped, teacherInstance }) => (
  <Card key={student.id} fluid color="yellow" className="studentCard">
    <Card.Content>
      <Header as="h2">
        {student.User.firsts} {student.User.lastname} ({student.User.studentNumber})
        {student.dropped && (
          <Label style={{ marginTop: 5, float: 'right' }}>
            <Icon name="warning sign" color="red" />
            Has dropped course
          </Label>
        )}
        <Header.Subheader>
          <a href={`mailto:${student.User.email}`}>{student.User.email}</a>
        </Header.Subheader>
      </Header>
      <div style={{ display: 'inline-block' }}>
        {student.projectName}: <RepoLink url={student.github} />
        <br />
        {otherParticipations.length > 0 ? (
          <div className="hasOther">
            <p style={{ color: 'red' }}>Has taken this course in other periods</p>
            {otherParticipations.map(participation =>
              teacherInstance.find(course => course.id === participation.id) ? (
                //show link to participation if the teacher/assistant has been the instructor in that course, otherwise only text
                <Link key={participation.id} to={`/labtool/browsereviews/${participation.ohid}/${participation.courseInstances[0].id}`}>
                  <Popup content="click to see the details" trigger={<p>{createCourseIdWithYearAndTerm(participation.ohid, participation.start)}</p>} />
                </Link>
              ) : (
                <p className="noAccess" key={participation.id}>
                  {createCourseIdWithYearAndTerm(participation.ohid, participation.start)}
                </p>
              )
            )}
          </div>
        ) : (
          <p className="noOther">Has no other participation in this course</p>
        )}
      </div>
      {
        <Button color="red" style={{ float: 'right' }} onClick={() => handleMarkAsDropped(!student.dropped)}>
          {student.dropped ? 'Mark as non-dropped' : 'Mark as dropped'}
        </Button>
      }
    </Card.Content>
  </Card>
)

StudentCard.propTypes = {
  student: PropTypes.object.isRequired,
  teacherInstance: PropTypes.object.isRequired,
  otherParticipations: PropTypes.array.isRequired,
  handleMarkAsDropped: PropTypes.func.isRequired
}

export default StudentCard
