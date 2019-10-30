import React from 'react'
import PropTypes from 'prop-types'
import { Button, Card, Icon, Label, Header, Popup } from 'semantic-ui-react'
import { Link } from 'react-router-dom'
import { createCourseIdWithYearAndTerm } from '../../../util/format'

import RepoLink from '../../RepoLink'

export const StudentCard = ({ student, previousParticipations, handleMarkAsDropped }) => (
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
        {previousParticipations.length > 0 ? (
          <div className="hasOther">
            <p style={{ color: 'red' }}>Has taken this course in other periods</p>
            {previousParticipations.map(participation => (
              <Link key={participation.id} to={`/labtool/browsereviews/${participation.ohid}/${participation.courseInstances[0].id}`}>
                <Popup content="click to see the details" trigger={<p>{createCourseIdWithYearAndTerm(participation.ohid, participation.start)}</p>} />
              </Link>
            ))}
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
  previousParticipations: PropTypes.array.isRequired,
  handleMarkAsDropped: PropTypes.func.isRequired
}

export default StudentCard
