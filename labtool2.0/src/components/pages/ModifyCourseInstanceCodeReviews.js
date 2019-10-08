import React, { useEffect } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { Link } from 'react-router-dom'
import { getOneCI } from '../../services/courseInstance'
import { coursePageInformation } from '../../services/courseInstance'
import { bulkinsertCodeReviews, removeOneCodeReview } from '../../services/codeReview'
import {
  filterByReview,
  initOneReview,
  randomAssign,
  codeReviewReset,
  selectDropdown,
  toggleCreate,
  createStates,
  restoreData
} from '../../reducers/codeReviewReducer'
import { filterByTag } from '../../reducers/coursePageLogicReducer'
import { clearNotifications, showNotification } from '../../reducers/notificationReducer'
import { Button, Table, Loader, Dropdown, Popup, Modal, Icon } from 'semantic-ui-react'
import Notification from '../../components/pages/Notification'
import StudentTable from '../StudentTable'
import { resetLoading } from '../../reducers/loadingReducer'
import useLegacyState from '../../hooks/legacyState'
import { usePersistedState } from '../../hooks/persistedState'
import { getAllTags } from '../../services/tags'

import BackButton from '../BackButton'

export const ModifyCourseInstanceReview = props => {
  const state = useLegacyState({
    open: {}
  })
  const pstate = usePersistedState('ModifyCourseInstanceCodeReviews', {
    codeReviewData: null
  })

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
      props.createStates(props.selectedInstance.amountOfCodeReviews)
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
    } catch (error) {
      props.showNotification({ message: 'Select a code review!', error: true })
    }
  }

  const addCodeReview = (reviewRound, id) => {
    return e => {
      const toReviewId = parseInt(e.target.value, 10)
      const crData = {
        round: reviewRound,
        reviewer: id,
        toReview: toReviewId
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
    return () => {
      Object.keys(props.coursePageLogic.selectedStudents).length > 1
        ? props.randomAssign({ reviewNumber: reviewNumber }, props.coursePageLogic.selectedStudents)
        : props.showNotification({ message: 'Select at least two persons to randomize!', error: true })
    }
  }

  const getCurrentReviewer = (codeReviewRound, id) => {
    let reviewer = props.courseData.data.find(studentId => studentId.id === id)
    let reviewInstance = reviewer.codeReviews.find(cd => cd.reviewNumber === codeReviewRound && cd.studentInstanceId === id)
    if (!reviewInstance) {
      return 'None'
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
          toggleModal(id)
          return
        }
        props.removeOneCodeReview({ reviewer: cr.studentInstanceId, codeReviewRound: cr.reviewNumber })
        toggleModal(id)
      } catch (e) {
        console.error(e)
      }
    }
  }

  const toggleModal = id => {
    let s = state.open
    s[id] = !s[id]
    state.open = s
  }

  const VisibilityReminder = () =>
    props.selectedInstance.currentCodeReview && props.codeReviewLogic.selectedDropdown ? (
      props.selectedInstance.currentCodeReview.findIndex(cr => cr === props.codeReviewLogic.selectedDropdown) === -1 ? (
        <Popup
          trigger={<Icon name="eye" size="large" color="red" />}
          content={
            <span>
              <span>This code review is currently not visible to students. You can make it visible on the </span>
              <Link to={`/labtool/ModifyCourseInstancePage/${props.selectedInstance.ohid}`}>course editing page</Link>
              <span>.</span>
            </span>
          }
          hoverable
        />
      ) : null
    ) : null

  const makeCodeReviewSelectorHeader = () => (
    <Table.HeaderCell key="selectorHeader">
      <div style={{ display: 'flex' }}>
        <VisibilityReminder />
        <Dropdown
          onChange={createDropdown()}
          defaultValue={props.codeReviewLogic.selectedDropdown}
          noResultsMessage={'Try another search.'}
          placeholder={Object.keys(props.dropdownCodeReviews).length > 0 ? 'SELECT A CODE REVIEW HERE!' : 'No code reviews'}
          fluid
          options={props.dropdownCodeReviews}
        />
      </div>
    </Table.HeaderCell>
  )

  const makeCodeReviewSelectorCell = data => (
    <Table.Cell key="CodeReviewSelector">
      {props.codeReviewLogic.selectedDropdown ? (
        <div>
          <p>
            Current review: {getCurrentReviewer(props.codeReviewLogic.selectedDropdown, data.id)}
            {data.codeReviews.find(cr => cr.reviewNumber === props.codeReviewLogic.selectedDropdown) ? (
              !data.codeReviews.find(cr => cr.reviewNumber === props.codeReviewLogic.selectedDropdown).points ? (
                <Modal
                  size="tiny"
                  open={state.open[data.id]}
                  onClose={() => toggleModal(data.id)}
                  trigger={
                    <Popup
                      trigger={<Icon id="tag" onClick={() => toggleModal(data.id)} name="window close" size="large" color="red" style={{ float: 'right' }} />}
                      content="Remove code review"
                    />
                  }
                >
                  <Modal.Content image>
                    <Modal.Description>
                      <p>Do you wish to remove the following code review:</p>
                      <p>
                        {data.User.firsts} {data.User.lastname} reviewing {getCurrentReviewer(props.codeReviewLogic.selectedDropdown, data.id)}
                      </p>
                    </Modal.Description>
                  </Modal.Content>
                  <Modal.Actions>
                    <Button negative icon="close" labelPosition="right" color="red" content="No" onClick={() => toggleModal(data.id)} />
                    <Button positive icon="checkmark" labelPosition="right" content="Yes" onClick={removeOne(data.id)} />
                  </Modal.Actions>
                </Modal>
              ) : (
                <Modal
                  size="tiny"
                  open={state.open[data.id]}
                  onClose={() => toggleModal(data.id)}
                  trigger={
                    <Popup
                      trigger={<Icon id="tag" onClick={() => toggleModal(data.id)} name="window close" size="large" color="red" style={{ float: 'right' }} />}
                      content="Remove code review"
                    />
                  }
                >
                  <Modal.Content image>
                    <Modal.Description>
                      <p>Can not remove a code review that is graded.</p>
                      <p> Grade: {data.codeReviews.find(cr => cr.reviewNumber === props.codeReviewLogic.selectedDropdown).points} points</p>
                    </Modal.Description>
                  </Modal.Content>
                  <Modal.Actions>
                    <Button positive icon="checkmark" labelPosition="right" color="green" content="Ok" onClick={() => toggleModal(data.id)} />
                  </Modal.Actions>
                </Modal>
              )
            ) : null}
          </p>
          <select
            className="toReviewDropdown"
            onChange={addCodeReview(props.codeReviewLogic.selectedDropdown, data.id)}
            value={props.codeReviewLogic.currentSelections[props.codeReviewLogic.selectedDropdown][data.id]}
          >
            {props.dropdownUsers.map(d =>
              d.value !== data.id ? (
                <option key={d.value} value={d.value}>
                  {d.text}
                </option>
              ) : null
            )}
          </select>
        </div>
      ) : null}
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
        <Button size="tiny" onClick={() => toggleCreate()} compact>
          +
        </Button>
      )}
    </Table.HeaderCell>
  )

  const makeCodeReviewCreatorCell = data => (
    <Table.Cell key="CodeReviewCreator">
      {props.codeReviewLogic.showCreate ? (
        <select className="toReviewDropdown" onChange={addCodeReview('create', data.id)} value={props.codeReviewLogic.currentSelections['create'][data.id]}>
          {props.dropdownUsers.map(d =>
            d.value !== data.id ? (
              <option key={d.value} value={d.value}>
                {d.text}
              </option>
            ) : null
          )}
        </select>
      ) : <div />}
    </Table.Cell>
  )

  const makeCodeReviewCreatorFooter = () => (
    <Table.HeaderCell singleLine key="creatorFooter">
      {props.codeReviewLogic.showCreate ? (
        <span>
          <Button compact onClick={assignRandomly('create')} size="small" style={{ float: 'left' }}>
            Assign selected randomly
          </Button>
          <Button compact size="small" style={{ float: 'right' }} onClick={handleSubmit('create')}>
            Create
          </Button>
        </span>
      ) : null}
    </Table.HeaderCell>
  )

  const makeFilterButton = () => (
    props.codeReviewLogic.selectedDropdown === null ? (
      <Button key="CodeReviewUnassignedStudents" disabled toggle compact className={`tiny ui button`} active={props.codeReviewLogic.filterActive} onClick={filterUnassigned(props.codeReviewLogic.selectedDropdown)}>
        Show unassigned students
      </Button>
    ) : (
      <Button key="CodeReviewUnassignedStudents" toggle compact className={`tiny ui button`} active={props.codeReviewLogic.filterActive} onClick={filterUnassigned(props.codeReviewLogic.selectedDropdown)}>
        Show unassigned students
      </Button>
    )
  )

  if (props.loading.loading) {
    return <Loader active />
  }

  const unassignedFilter = data => props.codeReviewLogic.filterByReview === 0 || isAssignedToReview(data, props.codeReviewLogic.selectedDropdown)

  return (
    <div className="ModifyCourseInstanceCodeReviews" style={{ textAlignVertical: 'center', textAlign: 'center' }}>
      <div style={{ overflowX: 'auto', overflowY: 'hidden' }}>
        <BackButton preset="modifyCIPage" cleanup={pstate.clear} />
        <div className="sixteen wide column">
          <h2>{props.selectedInstance.name}</h2> <br />
        </div>

        <StudentTable
          rowClassName="CodeReviewStudentRow"
          extraButtons={[makeFilterButton]}
          columns={['select',
          [makeCodeReviewSelectorHeader, makeCodeReviewSelectorCell, makeCodeReviewSelectorFooter],
          [makeCodeReviewCreatorHeader, makeCodeReviewCreatorCell, makeCodeReviewCreatorFooter]]}
          showFooter={true}
          allowModify={false}
          selectedInstance={props.selectedInstance}
          studentInstances={props.courseData.data.filter(studentInstance => !studentInstance.dropped && unassignedFilter(studentInstance))}
          coursePageLogic={props.coursePageLogic}
          tags={props.tags}
        />
      </div>
      <Notification />
    </div>
  )
}

export const userHelper = data => {
  let users = []
  if (data) {
    users.push({
      value: null,
      text: 'Select student to be reviewed'
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
  clearNotifications,
  coursePageInformation,
  initOneReview,
  bulkinsertCodeReviews,
  randomAssign,
  codeReviewReset,
  filterByTag,
  resetLoading,
  selectDropdown,
  toggleCreate,
  createStates,
  restoreData,
  filterByReview,
  showNotification,
  removeOneCodeReview,
  getAllTags
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
  clearNotifications: PropTypes.func.isRequired,
  coursePageInformation: PropTypes.func.isRequired,
  initOneReview: PropTypes.func.isRequired,
  bulkinsertCodeReviews: PropTypes.func.isRequired,
  randomAssign: PropTypes.func.isRequired,
  codeReviewReset: PropTypes.func.isRequired,
  filterByTag: PropTypes.func.isRequired,
  resetLoading: PropTypes.func.isRequired,
  selectDropdown: PropTypes.func.isRequired,
  toggleCreate: PropTypes.func.isRequired,
  createStates: PropTypes.func.isRequired,
  restoreData: PropTypes.func.isRequired,
  filterByReview: PropTypes.func.isRequired,
  showNotification: PropTypes.func.isRequired,
  removeOneCodeReview: PropTypes.func.isRequired,
  getAllTags: PropTypes.func.isRequired
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ModifyCourseInstanceReview)
