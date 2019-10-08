import React, { useEffect } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { getOneCI, modifyOneCI } from '../../services/courseInstance'
import { coursePageInformation } from '../../services/courseInstance'
import { bulkinsertCodeReviews, removeOneCodeReview } from '../../services/codeReview'
import {
  filterStatesByTags,
  filterByReview,
  initOneReview,
  initOrRemoveRandom,
  initCheckbox,
  initAllCheckboxes,
  randomAssign,
  codeReviewReset,
  selectDropdown,
  toggleCreate,
  createStates,
  restoreData
} from '../../reducers/codeReviewReducer'
import { filterByTag } from '../../reducers/coursePageLogicReducer'
import { clearNotifications, showNotification } from '../../reducers/notificationReducer'
import { Button, Table, Checkbox, Loader, Dropdown, Label, Popup, Icon, Message } from 'semantic-ui-react'
import { resetLoading } from '../../reducers/loadingReducer'
import { usePersistedState } from '../../hooks/persistedState'
import { createDropdownTags } from '../../util/dropdown'
import { getAllTags } from '../../services/tags'

import BackButton from '../BackButton'
import ConfirmationModal from './ConfirmationModal'

export const ModifyCourseInstanceReview = props => {
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

  const initOrRemoveRandom = id => {
    return async () => {
      await props.initCheckbox(id)
      props.initOrRemoveRandom(id)
    }
  }

  const selectAllCheckboxes = () => {
    return () => {
      let studentTags = []
      let allCheckboxes = {}
      let selectedTags = []
      let unassignedStudentsAsIds = []

      if (props.codeReviewLogic.filterActive) {
        unassignedStudentsAsIds = props.courseData.data.filter(student => isAssignedToReview(student, props.codeReviewLogic.selectedDropdown)).map(student => student.id)
      }

      props.coursePageLogic.filterByTag.forEach(st => selectedTags.push(st.name))

      if (selectedTags.length) {
        props.courseData.data.forEach(student => {
          studentTags = student.Tags.filter(st => selectedTags.includes(st.name))
          if (unassignedStudentsAsIds.length) {
            studentTags = studentTags.filter(st => unassignedStudentsAsIds.includes(st.StudentTag.studentInstanceId))
          }
          if (studentTags.length) {
            allCheckboxes[student.id] = true
          }
          studentTags = []
        })
      } else if (unassignedStudentsAsIds.length) {
        unassignedStudentsAsIds.forEach(studentId => (allCheckboxes[studentId] = true))
      } else {
        props.courseData.data.forEach(student => (allCheckboxes[student.id] = true))
      }

      let randoms = Object.keys(allCheckboxes).map(student => parseInt(student, 10))
      props.initAllCheckboxes({ data: allCheckboxes, ids: randoms })
    }
  }

  const clearAllCheckboxes = () => {
    return () => {
      props.initAllCheckboxes({ data: [], ids: [] })
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

  const changeFilterTag = async (e, data) => {
    const { value } = data
    const tag = props.tags.tags.find(tag => tag.id === value)
    await props.filterByTag(tag)
    props.filterStatesByTags({ tags: props.coursePageLogic.filterByTag, students: props.courseData.data })
  }

  const addFilterTag = tag => {
    return async () => {
      await props.filterByTag(tag)
      props.filterStatesByTags({ tags: props.coursePageLogic.filterByTag, students: props.courseData.data })
    }
  }

  const hasFilteringTags = (studentTagsData, filteringTags) => {
    let studentInstanceTagIds = studentTagsData.map(tag => tag.id)
    let filteringTagIds = filteringTags.map(tag => tag.id)
    for (let i = 0; i < filteringTagIds.length; i++) {
      if (!studentInstanceTagIds.includes(filteringTagIds[i])) {
        return false
      }
    }
    return true
  }

  const assignRandomly = reviewNumber => {
    if (props.codeReviewLogic.selectedDropdown === null) {
      return () => props.showNotification({ message: 'Please select a code review first!', error: true })
    }
    return () => {
      props.codeReviewLogic.randomizedCodeReview.length > 1
        ? props.randomAssign({ reviewNumber: reviewNumber })
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
      return null
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

  const showProjectInfo = data => {
    return (
      <div>
        <p>
          {data.projectName}
          <br />
          <a href={data.github} target="_blank" rel="noopener noreferrer">
            {data.github}
          </a>
        </p>
        {data.Tags.map(tag => (
          <div key={tag.id}>
            <Button compact floated="left" className={`mini ui ${tag.color} button`} onClick={addFilterTag(tag)}>
              {tag.name}
            </Button>
          </div>
        ))}
      </div>
    )
  }

  const showCurrentReview = data => {
    if (!props.codeReviewLogic.selectedDropdown) {
      return null
    }

    const currentReviewee = <p style={{ display: 'inline' }}>Current riview: {getCurrentReviewer(props.codeReviewLogic.selectedDropdown, data.id)}</p>
    if (!data.codeReviews.find(cr => cr.reviewNumber === props.codeReviewLogic.selectedDropdown)) {
      return <div>{currentReviewee}</div>
    }
    if (data.codeReviews.find(cr => cr.reviewNumber === props.codeReviewLogic.selectedDropdown).points) {
      return (
        <div>
          {currentReviewee}
          <Popup content="Cannot remove a graded code review" trigger={<Icon id="tag" name="window close" size="large" color="red" style={{ float: 'right' }} />} />
        </div>
      )
    }
    return (
      <div>
        {currentReviewee}
        <ConfirmationModal canRemove={true} data={data} getCurrentReviewer={getCurrentReviewer} removeOne={removeOne} selectedDropdown={props.codeReviewLogic.selectedDropdown} />
      </div>
    )
  }

  const showRevieweeDropdown = data => {
    if (!props.codeReviewLogic.selectedDropdown) {
      return null
    }
    return (
      <select
        className="toReviewDropdown"
        value={props.codeReviewLogic.currentSelections[props.codeReviewLogic.selectedDropdown][data.id]}
        onChange={addCodeReview(props.codeReviewLogic.selectedDropdown, data.id)}
      >
        {props.dropdownUsers
          .filter(d => d.value !== data.id)
          .map(d => (
            <option key={d.value} value={d.value}>
              {d.text}
            </option>
          ))}
      </select>
    )
  }

  if (props.loading.loading) {
    return <Loader active />
  }

  let dropDownTags = []
  dropDownTags = createDropdownTags(props.tags.tags, dropDownTags)

  // calculate the length of the longest text in a drop down
  const getBiggestWidthInDropdown = dropdownList => {
    if (dropdownList.length === 0) {
      return 3
    }
    const lengths = dropdownList.map(dp => dp.text.length)
    return lengths.reduce((longest, comp) => (longest > comp ? longest : comp), lengths[0])
  }

  return (
    <div className="ModifyCourseInstanceCodeReviews" style={{ textAlignVertical: 'center', textAlign: 'center' }}>
      <div className="ui grid">
        <BackButton preset="modifyCIPage" cleanup={pstate.clear} />
        <div className="sixteen wide column">
          <h2>{props.selectedInstance.name}</h2> <br />
        </div>
        <div>
          {props.codeReviewLogic.selectedDropdown === null ? (
            <Button disabled toggle compact className={`tiny ui button`} active={props.codeReviewLogic.filterActive} onClick={filterUnassigned(props.codeReviewLogic.selectedDropdown)}>
              Show unassigned students
            </Button>
          ) : (
            <Button toggle compact className={`tiny ui button`} active={props.codeReviewLogic.filterActive} onClick={filterUnassigned(props.codeReviewLogic.selectedDropdown)}>
              Show unassigned students
            </Button>
          )}
        </div>
        <span> Add filtering tag: </span>
        <Dropdown scrolling options={dropDownTags} onChange={changeFilterTag} placeholder="Select Tag" value="" selection style={{ width: `${getBiggestWidthInDropdown(dropDownTags)}em` }} />
        {props.coursePageLogic.filterByTag.length > 0 ? (
          <div>
            <span> Tag filters: </span>
            {props.coursePageLogic.filterByTag.map(tag => (
              <span key={tag.id}>
                <Button compact className={`mini ui ${tag.color} button`} onClick={addFilterTag(tag)}>
                  {tag.name}
                </Button>
              </span>
            ))}
          </div>
        ) : (
          <div>
            Tag filters: <Label>none</Label>
          </div>
        )}
        {showVisibilityReminder()}
        <Table celled>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell>
                {' '}
                <Button compact size="mini" onClick={selectAllCheckboxes()}>
                  All
                </Button>
                <Button compact size="mini" onClick={clearAllCheckboxes()}>
                  None
                </Button>
              </Table.HeaderCell>
              <Table.HeaderCell>Reviewer</Table.HeaderCell>
              <Table.HeaderCell>Project Info</Table.HeaderCell>
              <Table.HeaderCell key={1}>
                <div style={{ display: 'flex' }}>
                  <Dropdown
                    onChange={createDropdown()}
                    defaultValue={props.codeReviewLogic.selectedDropdown}
                    noResultsMessage={'Try another search.'}
                    placeholder={Object.keys(props.dropdownCodeReviews).length > 0 ? 'Select code review' : 'No code reviews'}
                    fluid
                    options={props.dropdownCodeReviews}
                  />
                </div>
              </Table.HeaderCell>
              <Table.HeaderCell>
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
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {props.courseData.data !== undefined
              ? props.courseData.data
                  .filter(data => {
                    return !data.dropped
                  })
                  .filter(data => {
                    return props.coursePageLogic.filterByTag.length === 0 || hasFilteringTags(data.Tags, props.coursePageLogic.filterByTag)
                  })
                  .filter(data => {
                    return props.codeReviewLogic.filterByReview === 0 || isAssignedToReview(data, props.codeReviewLogic.selectedDropdown)
                  })
                  .map(data => (
                    <Table.Row key={data.id}>
                      <Table.Cell>
                        {props.codeReviewLogic.checkBoxStates[data.id] === true ? (
                          <Checkbox checked onChange={initOrRemoveRandom(data.id)} />
                        ) : (
                          <Checkbox checked={false} onChange={initOrRemoveRandom(data.id)} />
                        )}
                      </Table.Cell>
                      <Table.Cell>
                        {data.User.firsts} {data.User.lastname}
                      </Table.Cell>
                      <Table.Cell>{showProjectInfo(data)}</Table.Cell>
                      <Table.Cell>
                        <div>{showCurrentReview(data)}</div>
                        <div>{showRevieweeDropdown(data)}</div>
                      </Table.Cell>
                      <Table.Cell>
                        {props.codeReviewLogic.showCreate ? (
                          <select className="toReviewDropdown" onChange={addCodeReview('create', data.id)}>
                            {props.dropdownUsers.map(d =>
                              d.value !== data.id ? (
                                props.codeReviewLogic.currentSelections['create'][data.id] === d.value ? (
                                  <option selected="selected" key={d.value} value={d.value}>
                                    {d.text}
                                  </option>
                                ) : (
                                  <option key={d.value} value={d.value}>
                                    {d.text}
                                  </option>
                                )
                              ) : null
                            )}
                            ))
                          </select>
                        ) : null}
                      </Table.Cell>
                    </Table.Row>
                  ))
              : null}
          </Table.Body>
          <Table.Footer>
            <Table.Row>
              <Table.HeaderCell>
                <Button compact size="mini" onClick={selectAllCheckboxes()}>
                  All
                </Button>
                <Button compact size="mini" onClick={clearAllCheckboxes()}>
                  None
                </Button>
              </Table.HeaderCell>
              <Table.HeaderCell />
              <Table.HeaderCell />
              <Table.HeaderCell>
                <Button compact onClick={assignRandomly(props.codeReviewLogic.selectedDropdown)} size="small" style={{ float: 'left' }}>
                  Assign selected randomly
                </Button>
                <Button compact size="small" style={{ float: 'right' }} onClick={handleSubmit(props.codeReviewLogic.selectedDropdown)}>
                  Save
                </Button>
              </Table.HeaderCell>
              <Table.HeaderCell style={{ display: props.codeReviewLogic.showCreate ? '' : 'none' }}>
                <Button compact onClick={assignRandomly('create')} size="small" style={{ float: 'left' }}>
                  Assign selected randomly
                </Button>
                <Button compact size="small" style={{ float: 'right' }} onClick={handleSubmit('create')}>
                  Create and Save
                </Button>
              </Table.HeaderCell>
            </Table.Row>
          </Table.Footer>
        </Table>
      </div>
    </div>
  )
}

export const userHelper = data => {
  let users = []
  if (data) {
    users.push({
      value: null,
      text: 'Select student'
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
  initOrRemoveRandom,
  initCheckbox,
  initAllCheckboxes,
  bulkinsertCodeReviews,
  randomAssign,
  codeReviewReset,
  filterByTag,
  resetLoading,
  selectDropdown,
  toggleCreate,
  createStates,
  restoreData,
  filterStatesByTags,
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
  modifyOneCI: PropTypes.func.isRequired,
  clearNotifications: PropTypes.func.isRequired,
  coursePageInformation: PropTypes.func.isRequired,
  initOneReview: PropTypes.func.isRequired,
  initOrRemoveRandom: PropTypes.func.isRequired,
  initCheckbox: PropTypes.func.isRequired,
  initAllCheckboxes: PropTypes.func.isRequired,
  bulkinsertCodeReviews: PropTypes.func.isRequired,
  randomAssign: PropTypes.func.isRequired,
  codeReviewReset: PropTypes.func.isRequired,
  filterByTag: PropTypes.func.isRequired,
  resetLoading: PropTypes.func.isRequired,
  selectDropdown: PropTypes.func.isRequired,
  toggleCreate: PropTypes.func.isRequired,
  createStates: PropTypes.func.isRequired,
  restoreData: PropTypes.func.isRequired,
  filterStatesByTags: PropTypes.func.isRequired,
  filterByReview: PropTypes.func.isRequired,
  showNotification: PropTypes.func.isRequired,
  removeOneCodeReview: PropTypes.func.isRequired,
  getAllTags: PropTypes.func.isRequired
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ModifyCourseInstanceReview)
