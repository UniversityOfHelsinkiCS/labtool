import React, { useEffect } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { getOneCI, modifyOneCI } from '../../services/courseInstance'
import { coursePageInformation } from '../../services/courseInstance'
import { bulkinsertCodeReviews, removeOneCodeReview } from '../../services/codeReview'
import { filterByReview, initOneReview, randomAssign, codeReviewReset, selectDropdown, toggleCreate, createStates, restoreData } from '../../reducers/codeReviewReducer'
import { clearNotifications, showNotification } from '../../reducers/notificationReducer'
import { Button, Table, Loader, Dropdown, Popup, Icon, Message } from 'semantic-ui-react'
import StudentTable from '../StudentTable'
import { resetLoading } from '../../reducers/loadingReducer'
import { usePersistedState } from '../../hooks/persistedState'
import { getAllTags } from '../../services/tags'
import { objectKeyFilter } from '../../util/objectKeyFilter'
import { getGithubRepo } from '../../util/github'

import BackButton from '../BackButton'
import ConfirmationModal from '../ConfirmationModal'
import RevieweeDropdown from '../RevieweeDropdown'
import RepoLink from '../RepoLink'
import IssuesDisabledWarning from '../IssuesDisabledWarning'
import { updateStudentProjectInfo, massUpdateStudentProjectInfo } from '../../services/studentinstances'

export const ModifyCourseInstanceReview = props => {
  const pstate = usePersistedState(`ModifyCourseInstanceCodeReviews_${props.courseId}`, {
    codeReviewData: null
  })
  let filterSelected = () => true

  useEffect(() => {
    // run on component mount
    props.resetLoading()
    props.getOneCI(props.courseId)
    props.getAllTags()
    props.coursePageInformation(props.courseId)
    if (pstate.codeReviewData) {
      props.restoreData(pstate.codeReviewData)
    }

    return () => {
      // run on component unmount
      props.codeReviewReset()
    }
  }, [])

  useEffect(() => {
    pstate.codeReviewData = { ...props.codeReviewLogic }
  }, [props.codeReviewLogic])

  const checkStates = () => {
    if (!props.codeReviewLogic.statesCreated) {
      props.createStates(props.selectedInstance.amountOfCodeReviews, props.courseData.data)
    }
  }

  const handleSubmit = reviewNumber => async e => {
    try {
      e.preventDefault()
      let createTrue = false
      if (reviewNumber === 'create') {
        props.toggleCreate()
      }
      const codeReviews = props.codeReviewLogic.codeReviewStates[reviewNumber]
      const courseId = props.selectedInstance.id
      if (reviewNumber === 'create') {
        reviewNumber = props.selectedInstance.amountOfCodeReviews + 1
        createTrue = true
      }

      const data = {
        codeReviews,
        reviewNumber,
        courseId,
        createTrue
      }

      await props.bulkinsertCodeReviews(data)
      //await props.coursePageInformation(props.courseId)
    } catch (error) {
      props.showNotification({ message: 'Select a code review!', error: true })
    }
  }

  const addCodeReview = (reviewRound, id) => {
    return (e, { value }) => {
      let crData = { round: reviewRound, reviewer: id }
      if (Number.isInteger(value)) {
        const toReviewId = parseInt(value, 10)
        crData = {
          ...crData,
          toReview: toReviewId
        }
      } else if (value !== null) {
        if (!value.includes('http')) {
          props.showNotification({ message: 'Your link should start with http/https', error: true })
          return
        }
        if (
          props.courseData.data
            .find(student => student.id === id)
            .codeReviews.filter(cr => cr.reviewNumber < (reviewRound === 'create' ? props.selectedInstance.amountOfCodeReviews + 1 : reviewRound))
            .map(cr => cr.repoToReview)
            .includes(value)
        ) {
          props.showNotification({ message: 'The student has reviewed the same repo before', error: true })
          return
        }
        crData = {
          ...crData,
          repoToReview: value
        }
      }

      props.initOneReview(crData)
    }
  }

  const createDropdown = () => {
    return (e, data) => {
      checkStates()
      props.selectDropdown(data.value)
      if (props.codeReviewLogic.filterActive) {
        props.filterByReview(props.selectDropdown(data.value))
      }
    }
  }

  const toggleCreate = () => {
    checkStates()
    props.toggleCreate()
  }

  const filterUnassigned = review => {
    return async () => {
      if (props.codeReviewLogic.filterByReview === review || props.codeReviewLogic.filterActive) {
        await props.filterByReview(0)
      } else {
        await props.filterByReview(review)
      }
    }
  }

  const isAssignedToReview = (studentData, reviewWeek) => {
    const studentReviewWeeks = studentData.codeReviews.map(review => review.reviewNumber).filter(review => review === reviewWeek)
    return Array.isArray(studentReviewWeeks) && !studentReviewWeeks.length
  }

  const assignRandomly = reviewNumber => {
    if (props.codeReviewLogic.selectedDropdown === null && !props.codeReviewLogic.showCreate) {
      return () => props.showNotification({ message: 'Please select a code review first!', error: true })
    }
    return () => {
      const selected = objectKeyFilter(props.coursePageLogic.selectedStudents, filterSelected)
      Object.keys(selected).length > 1 ? props.randomAssign({ reviewNumber: reviewNumber }, selected) : props.showNotification({ message: 'Select at least two persons to randomize!', error: true })
    }
  }

  const getCurrentReviewee = (codeReviewRound, id) => {
    let reviewer = props.courseData.data.find(studentId => studentId.id === id)
    let reviewInstance = reviewer.codeReviews.find(cd => cd.reviewNumber === codeReviewRound && cd.studentInstanceId === id)
    if (!reviewInstance) {
      return 'None'
    }
    if (reviewInstance.repoToReview) {
      return reviewInstance.repoToReview
    }

    let reviewee = props.dropdownUsers.find(dropDownStudent => dropDownStudent.value === reviewInstance.toReview)
    return reviewee.text
  }

  const removeOne = id => {
    return () => {
      try {
        const user = props.courseData.data.find(u => u.id === id)
        const cr = user.codeReviews.find(cr => cr.reviewNumber === props.codeReviewLogic.selectedDropdown)
        if (cr.points) {
          props.showNotification({ message: `Can't delete a graded code review!`, error: true })
          return
        }
        props.removeOneCodeReview({ reviewer: cr.studentInstanceId, codeReviewRound: cr.reviewNumber })
      } catch (e) {
        console.error(e)
      }
    }
  }

  const handleActivateCr = async crToActivate => {
    try {
      let newCr = props.selectedInstance.currentCodeReview
      newCr = newCr.concat(crToActivate)
      const content = {
        ...props.selectedInstance,
        newCr
      }
      await props.modifyOneCI(content, props.selectedInstance.ohid)
    } catch (error) {
      console.error(error)
    }
  }

  const showVisibilityReminder = () => {
    if (!props.selectedInstance.currentCodeReview || !props.codeReviewLogic.selectedDropdown) {
      if (Object.keys(props.dropdownCodeReviews).length === 0) {
        return (
          <Message className="visibilityReminder" info>
            <span>Please create a new round of code review by clicking the New code review-button.</span>
          </Message>
        )
      }
      return (
        <Message className="visibilityReminder" info>
          <span>Please select a code review or create a new round of code review by clicking the New code review-button.</span>
        </Message>
      )
    }
    if (props.selectedInstance.currentCodeReview.find(cr => cr === props.codeReviewLogic.selectedDropdown)) {
      return null
    }
    return (
      <Message className="visibilityReminder" warning>
        <span>This code review is currently not visible to students.</span>
        <Button color="green" size="small" onClick={() => handleActivateCr(props.codeReviewLogic.selectedDropdown)}>
          Activate the code review
        </Button>
      </Message>
    )
  }

  const bulkCheckIssuesEnabled = selected => {
    const selectedStudents = Object.keys(selected)
      .filter(s => selected[s])
      .map(s => props.courseData.data.find(t => t.id.toString() === s))

    const githubRepoSlugToStudent = selectedStudents.reduce((map, student) => map.set(student.github.replace(/^https?:\/\/github.com\//, ''), student), new Map())

    Promise.all(
      Array.from(githubRepoSlugToStudent.keys()).map(repo => {
        //Ignore nonexisting repos
        return getGithubRepo(repo)
          .result.then(result => result.data)
          .catch(error => (error.response && error.response.status === 404 ? Promise.resolve() : Promise.reject(error)))
      })
    )
      .then(githubRepos => {
        const studentInstances = githubRepos
          .filter(x => !!x)
          .map(githubRepo => {
            return { userId: githubRepoSlugToStudent.get(githubRepo.full_name).userId, issuesDisabled: !githubRepo.has_issues || githubRepo.archived }
          })

        props.massUpdateStudentProjectInfo({ ohid: props.selectedInstance.ohid, studentInstances })
      })
      .catch(() => {
        props.showNotification({ message: 'Failed to fetch data from GitHub API. Most likely you have exceeded GitHub API ratelimit or your Internet connection is down.', error: true })
      })
  }

  const areIssuesDisabledForStudent = student => {
    return student.issuesDisabled
  }

  const disableIssuesDisabledWarning = student => {
    if (window.confirm('Hide this warning? (Perhaps the issues are enabled now?)')) {
      props.updateStudentProjectInfo({ ...student, ohid: props.selectedInstance.ohid, issuesDisabled: false })
    }
  }

  const displayIssuesDisabledIcon = student => {
    if (areIssuesDisabledForStudent(student)) {
      return <IssuesDisabledWarning onClick={() => disableIssuesDisabledWarning(student)} />
    }
    return null
  }

  const showCurrentReview = data => {
    if (!props.codeReviewLogic.selectedDropdown) {
      return null
    }
    const currentReviewee = getCurrentReviewee(props.codeReviewLogic.selectedDropdown, data.id)
    const showCurrentReviewee = currentReviewee.includes('http') ? (
      <p style={{ display: 'inline' }}>
        Current review: <RepoLink url={currentReviewee} />
      </p>
    ) : (
      <p style={{ display: 'inline' }}>Current review: {currentReviewee}</p>
    )
    if (!data.codeReviews.find(cr => cr.reviewNumber === props.codeReviewLogic.selectedDropdown)) {
      return <div>{showCurrentReviewee}</div>
    }
    if (data.codeReviews.find(cr => cr.reviewNumber === props.codeReviewLogic.selectedDropdown).points) {
      return (
        <div>
          {showCurrentReviewee}
          <Popup content="Cannot remove a graded code review" trigger={<Icon id="tag" name="window close" size="large" color="red" style={{ float: 'right' }} />} />
        </div>
      )
    }
    return (
      <div>
        {showCurrentReviewee}
        <ConfirmationModal canRemove={true} data={data} getCurrentReviewee={getCurrentReviewee} removeOne={removeOne} selectedDropdown={props.codeReviewLogic.selectedDropdown} />
      </div>
    )
  }

  const makeStudentFooter = () => {
    const MAXIMUM_CHECK_COUNT = 15
    const selected = objectKeyFilter(props.coursePageLogic.selectedStudents, filterSelected)
    const selectedCount = Object.keys(selected).length
    const issueCheckButton = (
      <Button compact onClick={() => bulkCheckIssuesEnabled(selected)} size="small" disabled={selectedCount < 1 || selectedCount > MAXIMUM_CHECK_COUNT} style={{ float: 'left' }}>
        Check if issues enabled (select max {MAXIMUM_CHECK_COUNT})
      </Button>
    )

    return (
      <Table.HeaderCell singleLine key="selectorFooter">
        {issueCheckButton}
      </Table.HeaderCell>
    )
  }

  const makeCodeReviewSelectorHeader = () => (
    <Table.HeaderCell key="selectorHeader">
      <div style={{ display: 'flex' }}>
        <Dropdown
          onChange={createDropdown()}
          defaultValue={props.codeReviewLogic.selectedDropdown}
          noResultsMessage={'Try another search.'}
          placeholder={Object.keys(props.dropdownCodeReviews).length > 0 ? 'SELECT A CODE REVIEW HERE!' : 'No code reviews'}
          disabled={Object.keys(props.dropdownCodeReviews).length === 0}
          fluid
          options={props.dropdownCodeReviews}
        />
      </div>
    </Table.HeaderCell>
  )

  const makeCodeReviewSelectorCell = data => (
    <Table.Cell key="CodeReviewSelector">
      {showCurrentReview(data)}
      <RevieweeDropdown create={false} dropdownUsers={props.dropdownUsers} studentData={data} codeReviewLogic={props.codeReviewLogic} addCodeReview={addCodeReview} courseData={props.courseData} />
    </Table.Cell>
  )

  const makeCodeReviewSelectorFooter = () => (
    <Table.HeaderCell singleLine key="selectorFooter">
      <Button compact onClick={assignRandomly(props.codeReviewLogic.selectedDropdown)} size="small" style={{ float: 'left' }}>
        Assign selected randomly
      </Button>
      <Button compact size="small" style={{ float: 'right' }} onClick={handleSubmit(props.codeReviewLogic.selectedDropdown)}>
        Save
      </Button>
    </Table.HeaderCell>
  )

  const makeCodeReviewCreatorHeader = () => (
    <Table.HeaderCell key="creatorHeader">
      {props.codeReviewLogic.showCreate ? (
        <div>
          Create new code review ( {props.selectedInstance.amountOfCodeReviews + 1} )
          <Button size="tiny" style={{ float: 'right' }} onClick={() => toggleCreate()} compact>
            Hide
          </Button>
        </div>
      ) : (
        <Popup
          content="Click to create a new round of code review"
          trigger={
            <Button size="tiny" onClick={() => toggleCreate()} compact>
              New code review
            </Button>
          }
          position="top right"
        />
      )}
    </Table.HeaderCell>
  )

  const makeCodeReviewCreatorCell = data => (
    <Table.Cell key="CodeReviewCreator">
      {props.codeReviewLogic.showCreate ? (
        <RevieweeDropdown
          create={true}
          dropdownUsers={props.dropdownUsers}
          studentData={data}
          codeReviewLogic={props.codeReviewLogic}
          addCodeReview={addCodeReview}
          courseData={props.courseData}
          amountOfCodeReviews={props.selectedInstance.amountOfCodeReviews}
        />
      ) : (
        <div />
      )}
    </Table.Cell>
  )

  const makeCodeReviewCreatorFooter = () => (
    <Table.HeaderCell singleLine key="creatorFooter">
      {props.codeReviewLogic.showCreate ? (
        <span>
          <Button compact onClick={assignRandomly('create')} size="small" style={{ float: 'left' }}>
            Assign selected randomly
          </Button>
          <Button compact size="small" style={{ marginLeft: '6em', float: 'right' }} onClick={handleSubmit('create')}>
            Create and save
          </Button>
        </span>
      ) : null}
    </Table.HeaderCell>
  )

  const makeFilterButton = () =>
    props.codeReviewLogic.selectedDropdown === null ? (
      <Button
        key="CodeReviewUnassignedStudents"
        disabled
        toggle
        compact
        className={`tiny ui button`}
        active={props.codeReviewLogic.filterActive}
        onClick={filterUnassigned(props.codeReviewLogic.selectedDropdown)}
      >
        Show unassigned students
      </Button>
    ) : (
      <Button
        key="CodeReviewUnassignedStudents"
        toggle
        compact
        className={`tiny ui button`}
        active={props.codeReviewLogic.filterActive}
        onClick={filterUnassigned(props.codeReviewLogic.selectedDropdown)}
      >
        Show unassigned students
      </Button>
    )

  if (props.loading.loading) {
    return <Loader active />
  }

  const unassignedFilter = data => props.codeReviewLogic.filterByReview === 0 || isAssignedToReview(data, props.codeReviewLogic.selectedDropdown)

  return (
    <>
      <BackButton preset="modifyCIPage" cleanup={pstate.clear} />
      <div className="ModifyCourseInstanceCodeReviews" style={{ textAlignVertical: 'center', textAlign: 'center' }}>
        <div style={{ overflowX: 'auto', overflowY: 'hidden' }}>
          <div className="sixteen wide column">
            <h2>{props.selectedInstance.name}</h2> <br />
          </div>

          {showVisibilityReminder()}
          <br />

          <StudentTable
            extraButtons={[makeFilterButton]}
            columns={[
              'select',
              [makeCodeReviewSelectorHeader, makeCodeReviewSelectorCell, makeCodeReviewSelectorFooter],
              [makeCodeReviewCreatorHeader, makeCodeReviewCreatorCell, makeCodeReviewCreatorFooter]
            ]}
            extraStudentIcon={displayIssuesDisabledIcon}
            studentFooter={makeStudentFooter}
            showFooter={true}
            allowModify={false}
            selectedInstance={props.selectedInstance}
            studentInstances={props.courseData.data.filter(studentInstance => !studentInstance.dropped && unassignedFilter(studentInstance))}
            coursePageLogic={props.coursePageLogic}
            tags={props.tags}
            onFilter={filtered => (filterSelected = id => filtered.includes(Number(id)))}
          />

          <br />
          <br />
          <br />
          <br />
          <br />
          <br />
          <br />
        </div>
      </div>
    </>
  )
}

export const userHelper = data => {
  let users = []
  if (data) {
    users.push({
      value: null,
      text: 'select a student or add a repo link'
    })
    data.map(d =>
      users.push({
        value: d.id,
        text: d.User.firsts + ' ' + d.User.lastname
      })
    )
  }

  return users
}

const codeReviewHelper = data => {
  let codeReviews = []
  let i = 1
  while (i <= data) {
    codeReviews.push({
      value: i,
      text: `Code review ${i}`
    })
    i++
  }
  return codeReviews
}

const mapStateToProps = (state, ownProps) => {
  return {
    courseId: ownProps.courseId,
    courseData: state.coursePage,
    selectedInstance: state.selectedInstance,
    codeReviewLogic: state.codeReviewLogic,
    dropdownUsers: userHelper(state.coursePage.data),
    dropdownCodeReviews: codeReviewHelper(state.selectedInstance.amountOfCodeReviews),
    coursePageLogic: state.coursePageLogic,
    tags: state.tags,
    loading: state.loading
  }
}

const mapDispatchToProps = {
  getOneCI,
  modifyOneCI,
  clearNotifications,
  coursePageInformation,
  initOneReview,
  bulkinsertCodeReviews,
  randomAssign,
  codeReviewReset,
  resetLoading,
  selectDropdown,
  toggleCreate,
  createStates,
  restoreData,
  filterByReview,
  showNotification,
  removeOneCodeReview,
  getAllTags,
  updateStudentProjectInfo,
  massUpdateStudentProjectInfo
}

ModifyCourseInstanceReview.propTypes = {
  courseId: PropTypes.string.isRequired,

  courseData: PropTypes.object.isRequired,
  selectedInstance: PropTypes.object.isRequired,
  codeReviewLogic: PropTypes.object.isRequired,
  dropdownUsers: PropTypes.array,
  dropdownCodeReviews: PropTypes.array,
  coursePageLogic: PropTypes.object.isRequired,
  loading: PropTypes.object.isRequired,
  tags: PropTypes.object.isRequired,

  getOneCI: PropTypes.func.isRequired,
  modifyOneCI: PropTypes.func.isRequired,
  clearNotifications: PropTypes.func.isRequired,
  coursePageInformation: PropTypes.func.isRequired,
  initOneReview: PropTypes.func.isRequired,
  bulkinsertCodeReviews: PropTypes.func.isRequired,
  randomAssign: PropTypes.func.isRequired,
  codeReviewReset: PropTypes.func.isRequired,
  resetLoading: PropTypes.func.isRequired,
  selectDropdown: PropTypes.func.isRequired,
  toggleCreate: PropTypes.func.isRequired,
  createStates: PropTypes.func.isRequired,
  restoreData: PropTypes.func.isRequired,
  filterByReview: PropTypes.func.isRequired,
  showNotification: PropTypes.func.isRequired,
  removeOneCodeReview: PropTypes.func.isRequired,
  getAllTags: PropTypes.func.isRequired,
  updateStudentProjectInfo: PropTypes.func.isRequired,
  massUpdateStudentProjectInfo: PropTypes.func.isRequired
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ModifyCourseInstanceReview)
