import React, { useEffect } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { fakeShibboLogin } from '../../services/login'
import { resetLoading, forceSetLoading } from '../../reducers/loadingReducer'
import { Select, Grid, Loader } from 'semantic-ui-react'
import { users } from '../../util/fakeLoginUsers'

/**
 *  The page used to login
 */

export const FakeLoginPage = props => {
  useEffect(() => {
    // run on component mount
    props.resetLoading()
    props.forceSetLoading({
      value: false
    })
  }, [])

  const handleSubmit = async (e, v) => {
    e.preventDefault()

    const { value } = v
    const user = users.find(x => x.username === value)
    if (!user) {
      return
    }

    const given_names = user.first_names.split(' ')
    let given_name = given_names.find(x => x.charAt(0) === '*') || given_names[0]
    given_name = given_name.replace('*', '')
    const content = {
      uid: user.username,
      employeenumber: '123' + user.student_number,
      mail: user.email,
      schacpersonaluniquecode: 'urn:schac:personalUniqueCode:int:studentID:fake_shibbo:' + user.student_number,
      givenname: given_name,
      sn: user.last_name
    }
    window.localStorage.setItem('fake-shibbo-data', JSON.stringify(content))
    await props.login(content)
  }

  const options = users.filter(x => x.email).map(x => ({ key: x.username, value: x.username, text: x.last_name + ', ' + x.first_names + ' (' + x.username + ')' }))

  return (
    <div className="FakeLoginPage">
      <Loader active={props.loading.loading} inline="centered" />

      <Grid>
        <Grid.Row centered>
          <h3>Select user to log in as</h3>
        </Grid.Row>
      </Grid>

      <Grid>
        <Grid.Row centered>
          <h1>IF THIS IS PRODUCTION, SOMETHING IS TERRIBLY WRONG!!!!!!!!!!!!!!</h1>
        </Grid.Row>
      </Grid>

      <Grid>
        <Grid.Row centered>
          <Select inline onChange={(e, v) => handleSubmit(e, v)} icon="user" options={options} />
        </Grid.Row>
      </Grid>
    </div>
  )
}
const mapStateToProps = state => {
  return {
    user: state.user,
    loading: state.loading
  }
}

const mapDispatchToProps = {
  login: fakeShibboLogin,
  resetLoading,
  forceSetLoading
}

FakeLoginPage.propTypes = {
  user: PropTypes.object.isRequired,
  loading: PropTypes.object.isRequired,

  login: PropTypes.func.isRequired,
  resetLoading: PropTypes.func.isRequired,
  forceSetLoading: PropTypes.func.isRequired
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(FakeLoginPage)
