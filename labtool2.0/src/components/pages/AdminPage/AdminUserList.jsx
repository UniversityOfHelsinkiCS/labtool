import React from 'react'
import PropTypes from 'prop-types'
import { Button, Label, Table } from 'semantic-ui-react'
import { sortUsersBySysopLastname } from '../../../util/sort'

export const AdminUserList = ({ me, users, updateOtherUser }) => {
  const setAdmin = (userId, name, newAdmin) => () => {
    const message = `Are you sure you want to ${newAdmin ? 'grant admin rights to' : 'remove admin rights from'} ${name}?`
    if (window.confirm(message)) {
      const selfInflicted = userId === me.user.id
      if (selfInflicted && !newAdmin && !window.confirm('You probably do NOT want to remove admin rights from yourself. Are you really sure?')) {
        return
      }
      updateOtherUser({ id: userId, sysop: newAdmin })
    }
  }
  const sortedUsers = sortUsersBySysopLastname(users)

  return (
    <Table singleLine color="yellow" fixed>
      <Table.Header>
        <Table.Row>
          <Table.HeaderCell>Name</Table.HeaderCell>
          <Table.HeaderCell>Status</Table.HeaderCell>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {sortedUsers.map(user => (
          <Table.Row key={user.id}>
            <Table.Cell>
              {user.firsts} {user.lastname}
              <br />
              <a href={`mailto:${user.email}`}>{user.email}</a>
            </Table.Cell>
            <Table.Cell>
              {user.teacher && (
                <Label color="orange" horizontal>
                  Teacher
                </Label>
              )}
              {user.sysop ? (
                <div>
                  <Label color="orange" horizontal>
                    Admin
                  </Label>
                  <Button onClick={setAdmin(user.id, `${user.firsts} ${user.lastname}`, false)} size="tiny" color="green">
                    Remove admin
                  </Button>
                </div>
              ) : (
                <div>
                  <Label horizontal>Not admin</Label>
                  <Button onClick={setAdmin(user.id, `${user.firsts} ${user.lastname}`, true)} size="tiny" color="green">
                    Make admin
                  </Button>
                </div>
              )}
            </Table.Cell>
          </Table.Row>
        ))}
      </Table.Body>
    </Table>
  )
}

AdminUserList.propTypes = {
  me: PropTypes.object.isRequired,
  users: PropTypes.array.isRequired,
  updateOtherUser: PropTypes.func.isRequired
}

export default AdminUserList
