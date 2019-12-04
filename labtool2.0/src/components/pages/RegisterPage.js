import React, { useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import { Form, Input, Grid, Loader } from 'semantic-ui-react'
import { Link } from 'react-router-dom'
import { connect } from 'react-redux'
import { createStudentCourses, updateStudentProjectInfo } from '../../services/studentinstances'
import { resetLoading, addRedirectHook } from '../../reducers/loadingReducer'
import { Redirect } from 'react-router'
import { getOneCI, coursePageInformation } from '../../services/courseInstance'
import useDebounce from '../../hooks/useDebounce'
import useGithubRepo from '../../hooks/useGithubRepo'
import { GitHubRepoWarning } from './RegisterPage/GitHubRepoWarning'
import DocumentTitle from '../DocumentTitle'
import Error from '../Error'

/**
 * The page user uses to register to a course AS A STUDENT
 */

export const RegisterPage = props => {
  const [repo, setRepo] = useState()
  const [foundExisting, setFoundExisting] = useState(false)
  const [projectName, setProjectName] = useState('')
  const [projectLink, setProjectLink] = useState('https://github.com')
  const debouncedRepo = useDebounce(repo, 500)
  const { githubRepo, error: githubRepoError } = useGithubRepo(debouncedRepo)

  useEffect(() => {
    // run on component mount
    props.resetLoading()
    props.getOneCI(props.courseId)
    props.coursePageInformation(props.courseId)
  }, [])

  useEffect(() => {
    const existing = getExistingData()
    if (!foundExisting && existing.projectLink && !repo) {
      setFoundExisting(true)
      setProjectName(existing.projectName)
      updateRepo(existing.projectLink)
    }
  }, [props.coursePage])

  const getExistingData = () => {
    let projectName = null
    let projectLink = null

    if (props.coursePage && props.coursePage.data) {
      projectName = props.coursePage.data.projectName
      projectLink = props.coursePage.data.github
    }

    return { projectName, projectLink }
  }

  const updateRepo = value => {
    setProjectLink(value)
    const repoLink = value.replace(/^https?:\/\//, '')
    if (repoLink.startsWith('github.com/')) {
      setRepo(repoLink.substring(11).replace(/\/$/, ''))
    } else {
      setRepo(null)
    }
  }

  const handleSubmit = async e => {
    try {
      e.preventDefault()
      const data = {
        // Trim leading and trailing whitespace for accessibility (copy & paste content etc).
        projectName: projectName.trim(),
        github: projectLink.trim(),
        ohid: props.selectedInstance.ohid,
        repoExists: repo !== null ? !githubRepoError : null
      }
      if (props.coursePage && props.coursePage.data !== null) {
        props.addRedirectHook({
          hook: 'STUDENT_PROJECT_INFO_UPDATE_'
        })
        await props.updateStudentProjectInfo(data)
      } else {
        props.addRedirectHook({
          hook: 'STUDENT_COURSE_CREATE_ONE_'
        })
        await props.createStudentCourses(data, props.selectedInstance.ohid)
      }
    } catch (error) {
      console.error(error)
    }
  }

  if (props.loading.redirect) {
    return <Redirect to={`/labtool/courses/${props.selectedInstance.ohid}`} />
  }

  if (props.errors && props.errors.length > 0) {
    return <Error errors={props.errors.map(error => `${error.response.data} (${error.response.status} ${error.response.statusText})`)} />
  }

  return (
    <>
      <DocumentTitle title="Register" />
      <div
        className="RegisterPage"
        style={{
          textAlignVertical: 'center',
          textAlign: 'center'
        }}
      >
        <Loader active={props.loading.loading} inline="centered" />
        <Grid>
          <Grid.Row centered>
            {props.coursePage && props.coursePage.data !== null ? (
              <div>
                <h3>Update your info for {props.selectedInstance.name}</h3>
              </div>
            ) : (
              <div>
                <h3>Register for {props.selectedInstance.name}</h3>
              </div>
            )}
          </Grid.Row>
        </Grid>

        <Grid>
          <Grid.Row centered>
            <Form onSubmit={handleSubmit} className="Register">
              <Form.Group inline>
                <label style={{ width: '100px', textAlign: 'left' }}>Project name</label>
                <Input
                  icon="rocket"
                  iconPosition="left"
                  type="text"
                  className="form-control1"
                  name="projectName"
                  placeholder="MyProjectName"
                  value={projectName}
                  onChange={(e, { value }) => setProjectName(value)}
                  required
                  style={{ minWidth: '30em' }}
                />
              </Form.Group>

              <Form.Group inline>
                <label style={{ width: '100px', textAlign: 'left' }}>GitHub link</label>
                <Input
                  icon="github"
                  iconPosition="left"
                  type="url"
                  className="form-control2"
                  name="github"
                  value={projectLink}
                  onChange={(e, { value }) => updateRepo(value)}
                  required
                  style={{ minWidth: '30em' }}
                />
              </Form.Group>

              {githubRepoError && <GitHubRepoWarning githubRepo={githubRepo} />}

              <Form.Field>
                <button className="ui left floated blue button" type="submit">
                  {' '}
                  Submit
                </button>
                <Link to={`/labtool/courses/${props.selectedInstance.ohid}`}>
                  {' '}
                  <button className="ui right floated button" type="Cancel">
                    Cancel
                  </button>
                </Link>
              </Form.Field>
            </Form>
          </Grid.Row>
        </Grid>
      </div>
    </>
  )
}

const mapStateToProps = (state, ownProps) => {
  return {
    coursePage: state.coursePage,
    selectedInstance: state.selectedInstance,
    courseId: ownProps.courseId,
    loading: state.loading,
    errors: Object.values(state.loading.errors)
  }
}

const mapDispatchToProps = {
  createStudentCourses,
  updateStudentProjectInfo,
  getOneCI,
  coursePageInformation,
  resetLoading,
  addRedirectHook
}

RegisterPage.propTypes = {
  courseId: PropTypes.string.isRequired,

  coursePage: PropTypes.object.isRequired,
  selectedInstance: PropTypes.object.isRequired,
  loading: PropTypes.object.isRequired,

  createStudentCourses: PropTypes.func.isRequired,
  updateStudentProjectInfo: PropTypes.func.isRequired,
  getOneCI: PropTypes.func.isRequired,
  coursePageInformation: PropTypes.func.isRequired,
  resetLoading: PropTypes.func.isRequired,
  addRedirectHook: PropTypes.func.isRequired,

  errors: PropTypes.array
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(RegisterPage)
