import React, { useEffect } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { Header, Input, Label, Button, Popup, Card, Dropdown, Loader, Icon, Checkbox, Radio } from 'semantic-ui-react'
import { showNotification } from '../../reducers/notificationReducer'
import { resetLoading, addRedirectHook } from '../../reducers/loadingReducer'
import { createChecklist, getOneChecklist } from '../../services/checklist'
import { getOneCI, getAllCI } from '../../services/courseInstance'
import {
  resetChecklist,
  changeField,
  restoreChecklist,
  addTopic,
  addRow,
  removeTopic,
  removeRow,
  moveTopicUp,
  moveRowUp,
  moveTopicDown,
  moveRowDown,
  castPointsToNumber,
  applyCategoryPrerequisite
} from '../../reducers/checklistReducer'
import './CreateChecklist.css'
import { usePersistedState } from '../../hooks/persistedState'
import { sortCoursesByName } from '../../util/sort'

import BackButton from '../BackButton'
import JsonEdit from '../JsonEdit'
import DocumentTitle from '../DocumentTitle'
import Error from '../Error'
import { Points } from '../Points'

export const CreateChecklist = props => {
  const state = usePersistedState(`CreateChecklist_${props.courseId}`, {
    current: undefined, // tracks value of checklist dropdown.
    copyCourse: undefined, // tracks value of copy from another course dropdown.
    copyWeek: undefined, // tracks value of copy from another week dropdown. (misnomer: can also be a code review)
    topicName: '', // tracks value inputted into topic creation dialog box.
    rowName: '', // tracks value inputted into row creation dialog box.
    openAdd: '', // which addForm is currently open. '' denotes no open addForms. Only one addForm can be open at one time.
    courseDropdowns: [], // Dropdown options to show for copying checklist.
    copyWeekDropdowns: [], // Dropdown options to show for copying from another week.
    categoryPrerequisites: {},
    checklistData: null,
    maximumPoints: '',
    generation: 0,
    canSave: false
  })

  useEffect(() => {
    // run on component mount
    props.resetLoading()

    if (state.checklistData) {
      props.restoreChecklist(state.checklistData, state.maximumPoints)
    } else {
      props.resetChecklist()
    }
    props.getOneCI(props.courseId)
    props.getAllCI()
  }, [])

  useEffect(() => {
    state.courseDropdowns = createCourseDropdowns()
    state.copyWeekDropdowns = createCopyWeekDropdowns()
  }, [state.current])

  useEffect(() => {
    state.checklistData = props.checklist.data
  }, [props.checklist])

  const parseChecklistValue = value => {
    if (!value) {
      return { error: true }
    }

    if (value.startsWith('week')) {
      const number = Number(value.slice(4), 10)
      if (!number) {
        return { error: true }
      }
      return { kind: 'week', number }
    } else if (value == 'codeReview') {
      return { kind: 'codeReview', number: null }
    } else {
      return { error: true }
    }
  }

  const getRowId = row => row.id || row.tempId

  const validateChecklistPrerequisites = data => {
    const items = {}
    Object.keys(data).map(category => {
      items[category] = {}
      data[category].forEach(item => {
        if (item.id !== undefined) {
          items[category][item.id] = item
        } else {
          items[category][item.tempId] = item
        }
      })
    })

    return Object.keys(data).every(category => {
      return data[category].every(item => {
        if (!item.prerequisite) {
          return true
        }
        if (!items[category][item.prerequisite]) {
          return false
        }

        // try to find a loop
        const visited = []
        let curItem = item
        while (curItem.prerequisite) {
          const curId = getRowId(curItem)
          if (visited.includes(curId)) {
            return false
          }
          visited.push(curId)
          curItem = items[category][curItem.prerequisite]
        }

        return true
      })
    })
  }

  // Make api call to save checklist to database.
  const handleSubmit = async e => {
    e.preventDefault()
    const data = {
      courseInstanceId: props.selectedInstance.id,
      checklist: props.checklist.data,
      maxPoints: Number(state.maximumPoints)
    }

    const { error, kind, number } = parseChecklistValue(state.current)
    if (error) {
      props.showNotification({
        message: 'Select a week or code review!',
        error: true
      })
      return
    }

    if (!validateChecklistPrerequisites(data.checklist)) {
      props.showNotification({
        message: 'Your prerequisites are invalid; they either form a loop or point outside this checklist.',
        error: true
      })
      return
    }

    if (kind === 'week') {
      const weeks = props.selectedInstance.weekAmount
      const checklists = props.selectedInstance.finalReview ? weeks + 1 : weeks
      if (number <= 0 || number > checklists) {
        props.showNotification({
          message: 'Invalid week.',
          error: true
        })
        return
      }
      data.week = number
      data.forCodeReview = false
    } else if (kind === 'codeReview') {
      data.forCodeReview = true
    }

    try {
      props.createChecklist(data)
      state.generation = state.generation + 1
      state.canSave = false
    } catch (e) {
      props.showNotification({
        message: 'Could not parse JSON.',
        error: true
      })
    }
  }

  const changeWeek = async (e, { value }) => {
    const newCurrent = value
    const newCurrentObj = parseChecklistValue(newCurrent)
    if (newCurrentObj.error) {
      return
    }
    let copyCourse
    if (state.copyCourse) {
      if (newCurrentObj.kind === 'week') {
        if (newCurrentObj.number > props.selectedInstance.weekAmount) {
          copyCourse = props.courses.find(course => course.id === state.copyCourse).finalReview ? state.copyCourse : null
        } else {
          copyCourse = props.courses.find(course => course.id === state.copyCourse).weekAmount >= newCurrentObj.number ? state.copyCourse : null
        }
      } else if (newCurrentObj.kind === 'codeReview') {
        if (newCurrentObj.number > props.selectedInstance.amountOfCodeReviews) {
          copyCourse = null
        } else {
          copyCourse = props.courses.find(course => course.id === state.copyCourse).amountOfCodeReviews >= newCurrentObj.number ? state.copyCourse : null
        }
      }
    } else {
      copyCourse = null
    }
    state.maximumPoints = ''
    state.current = newCurrent
    state.copyCourse = copyCourse
    state.categoryPrerequisites = {}
    if (state.copyWeek === newCurrent) {
      state.copyWeek = null
    }
    state.courseDropdowns = createCourseDropdowns()
    state.copyWeekDropdowns = createCopyWeekDropdowns()
    loadChecklist(newCurrent)
  }

  useEffect(() => {
    // get maximum points from the checklist if not already in persistent state
    const hasMaxPoints = props.checklist.maxPoints !== '' && props.checklist.maxPoints !== undefined
    state.maximumPoints = state.maximumPoints || (hasMaxPoints ? '' + props.checklist.maxPoints : '')
  }, [props.checklist.maxPoints])

  const changeCopyCourse = async (e, { value }) => {
    state.copyCourse = value
    if (value) {
      state.copyWeek = null
    }
  }
  const changeCopyWeek = async (e, { value }) => {
    state.copyWeek = value
    if (value) {
      state.copyCourse = null
    }
  }

  const changeField = (key, name, field) => async (_, data) => {
    props.changeField({
      key,
      name,
      field,
      value: data.type === 'checkbox' ? data.checked : data.value
    })
    state.canSave = true
  }

  const changeFieldNumber = (key, name, field) => async (_, data) => {
    props.changeField({
      key,
      name,
      field,
      value: Number(data.value)
    })
    state.canSave = true
  }

  const changeFieldValue = (key, name, field, value) => () => {
    props.changeField({
      key,
      name,
      field,
      value
    })
    state.canSave = true
  }

  const applyCategoryPrerequisite = key => (_, data) => {
    props.applyCategoryPrerequisite(key, data.value)
    state.categoryPrerequisites = { ...state.categoryPrerequisites, [key]: data.value }
    state.canSave = true
  }

  // Make api call to receive checklist from database.
  const loadChecklist = async current => {
    const obj = parseChecklistValue(current)
    const data = { courseInstanceId: props.selectedInstance.id }
    if (obj.error) {
      return
    } else if (obj.kind === 'week') {
      data.week = obj.number
      data.forCodeReview = false
    } else if (obj.kind === 'codeReview') {
      data.forCodeReview = true
    }
    state.generation = state.generation + 1
    state.canSave = false
    props.getOneChecklist(data)
  }

  const copyChecklist = async () => {
    if (state.copyCourse) {
      const obj = parseChecklistValue(state.current)
      if (obj.error) {
        return
      }

      state.canSave = true
      const data = {
        courseInstanceId: state.copyCourse,
        copying: true
      }
      if (obj.kind === 'week') {
        const week = obj.number > props.selectedInstance.weekAmount ? props.courses.find(course => course.id === state.copyCourse).weekAmount + 1 : obj.number
        data.week = week
        data.forCodeReview = false
      } else if (obj.kind === 'codeReview') {
        data.forCodeReview = true
      }
      props.getOneChecklist(data)
    } else if (state.copyWeek) {
      const obj = parseChecklistValue(state.copyWeek)
      if (obj.error) {
        return
      }

      state.canSave = true
      const data = {
        courseInstanceId: props.selectedInstance.id,
        copying: true
      }
      if (obj.kind === 'week') {
        data.week = obj.number
        data.forCodeReview = false
      } else if (obj.kind === 'codeReview') {
        data.forCodeReview = true
      }
      props.getOneChecklist(data)
    }
  }

  const validateChecklist = checklist => {
    return (
      (!!checklist.week || !!checklist.forCodeReview) &&
      !!checklist.list &&
      Object.keys(checklist.list).every(listKey => {
        return (
          typeof listKey === 'string' &&
          Object.values(checklist.list[listKey]).every(row => {
            return row.name !== null && row.textWhenOn !== null && row.textWhenOff !== null && row.checkedPoints !== null && row.uncheckedPoints !== null
          })
        )
      }) &&
      validateChecklistPrerequisites(checklist.list)
    )
  }

  const importChecklist = checklistForWeek => {
    const data = { list: checklistForWeek }
    const index = {}
    const obj = parseChecklistValue(state.current)
    if (obj.kind === 'week') {
      index.week = obj.number
      index.forCodeReview = false
    } else if (obj.kind === 'codeReview') {
      index.forCodeReview = true
    }
    if (validateChecklist({ ...index, ...data })) {
      try {
        props.addRedirectHook({
          hook: 'CHECKLIST_CREATE_'
        })
        props.createChecklist({
          courseInstanceId: props.selectedInstance.id,
          ...index,
          checklist: checklistForWeek,
          maxPoints: Number(state.maximumPoints)
        })
        state.checklistData = checklistForWeek
        state.canSave = false
      } catch (e) {
        props.showNotification({
          message: 'Could not save JSON.',
          error: true
        })
      }
    } else {
      props.showNotification({
        message: 'Invalid checklist.',
        error: true
      })
    }
  }

  /**
   * First call opens a dialog box.
   * Subsequent call actually adds the new topic.
   */
  const newTopic = async e => {
    e.preventDefault()
    if (state.openAdd !== 'newTopic') {
      state.openAdd = 'newTopic'
      return
    }
    if (state.topicName === '') {
      props.showNotification({
        message: 'Topic name cannot be blank.',
        error: true
      })
      return
    }
    props.addTopic({
      key: state.topicName
    })
    state.topicName = ''
    state.openAdd = ''
    state.canSave = true
  }

  /**
   * First call opens a dialog box.
   * Subsequent call actually adds the new row.
   */
  const newRow = key => async e => {
    e.preventDefault()
    if (state.openAdd !== key) {
      state.openAdd = key
      return
    }
    if (state.rowName === '') {
      props.showNotification({
        message: 'Checkbox name cannot be blank.',
        error: true
      })
      return
    }
    props.addRow({
      key,
      name: state.rowName,
      prerequisite: state.categoryPrerequisites[key] || null
    })
    state.rowName = ''
    state.openAdd = 'newTopic'
    state.canSave = true
  }

  const changeTopicName = async e => {
    state.topicName = e.target.value
  }

  const changeRowName = async e => {
    state.rowName = e.target.value
  }

  const changeMaximumPoints = async e => {
    state.maximumPoints = e.target.value
    state.canSave = true
  }

  const getMaximumPointsForWeek = () => {
    if (state.maximumPoints !== '') {
      return Number(state.maximumPoints)
    }
    return props.selectedInstance.weekMaxPoints
  }

  const removeTopic = key => async () => {
    props.removeTopic({
      key
    })
    state.canSave = true
  }

  const moveTopicUp = key => async () => {
    props.moveTopicUp({
      key
    })
    state.canSave = true
  }

  const moveTopicDown = key => async () => {
    props.moveTopicDown({
      key
    })
    state.canSave = true
  }

  const removeRow = (key, name) => async () => {
    props.removeRow({
      key,
      name
    })
    state.canSave = true
  }

  const moveRowUp = (key, name) => async () => {
    props.moveRowUp({
      key,
      name
    })
    state.canSave = true
  }

  const moveRowDown = (key, name) => async () => {
    props.moveRowDown({
      key,
      name
    })
    state.canSave = true
  }

  const cancelAdd = async () => {
    state.openAdd = ''
  }

  const castPointsToNumber = (key, name) => async () => {
    props.castPointsToNumber({
      key,
      name
    })
  }

  const weekFilter = (number, courses) => {
    return courses.filter(course => number <= course.weekAmount)
  }
  const codeReviewFilter = (number, courses) => {
    return courses.filter(course => number <= course.amountOfCodeReviews)
  }
  const finalFilter = courses => {
    return courses.filter(course => course.finalReview)
  }

  const createCourseDropdowns = () => {
    if (!props.courses || !props.selectedInstance || !Object.keys(props.courses).length) return []
    const obj = parseChecklistValue(state.current)
    const courses =
      obj.kind === 'codeReview' ? codeReviewFilter(obj.number, props.courses) : obj.number > props.selectedInstance.weekAmount ? finalFilter(props.courses) : weekFilter(obj.number, props.courses)
    const options = sortCoursesByName(courses)
      .filter(course => props.selectedInstance.id !== course.id)
      .map(course => {
        return {
          value: course.id,
          text: `${course.name} (${course.europeanStart})`
        }
      })
    return options
  }

  const createCopyWeekDropdowns = () => {
    return props.weekDropdowns.filter(option => option.value !== state.current)
  }

  const getPrerequisiteDropdown = key => {
    const checks = [
      {
        key: null,
        text: '(none)',
        value: null
      }
    ]

    props.checklist.data[key].forEach(check => {
      checks.push({
        key: getRowId(check),
        text: check.name,
        value: getRowId(check)
      })
    })

    return checks
  }

  const renderChecklist = kind => {
    let maxPoints = 0
    let colorIndex = 0
    const checklistJsx = Object.keys(props.checklist.data || {}).map((key, keyIndex, keyArray) => {
      let bestPoints = 0
      props.checklist.data[key].forEach(row => {
        if (!row.minimumRequirement) {
          const greaterPoints = row.checkedPoints > row.uncheckedPoints ? row.checkedPoints : row.uncheckedPoints
          bestPoints += Number(greaterPoints)
        }
      })
      maxPoints += bestPoints
      colorIndex++
      return (
        <Card fluid color="red" key={key} style={colorIndex % 2 === 0 ? { backgroundColor: '#F2F2F2' } : null}>
          <Card.Content>
            <Header size="huge" color="brown">
              {key}{' '}
              <Button className="deleteButton" type="button" color="red" size="tiny" onClick={removeTopic(key)}>
                <div className="deleteButtonText">Delete topic</div>
              </Button>
              <Button className="moveButton" disabled={keyIndex >= keyArray.length - 1} circular icon="arrow circle down" type="button" color="blue" onClick={moveTopicDown(key)} />
              <Button className="moveButton" disabled={keyIndex === 0} circular icon="arrow circle up" type="button" color="blue" onClick={moveTopicUp(key)} />
            </Header>
            <div>
              <p>
                Total points for this section:{' '}
                <strong className="bestPointsNumber">
                  <Points points={bestPoints} />
                </strong>
                {bestPoints < 0 ? (
                  <span>
                    {' '}
                    <Popup className="bestpointsIcon" trigger={<Icon name="delete" color="red" size="large" />} content="This topic will always award negative points." />
                  </span>
                ) : (
                  <span />
                )}
              </p>
            </div>
            <div className="prerequisiteCategory" style={{ marginTop: '1em' }}>
              Set a prerequisite for all checks in this category:{' '}
              <Dropdown
                className="prerequisiteCategoryDropdown"
                placeholder="Select prerequisite..."
                selection
                value={state.categoryPrerequisites[key]}
                onChange={applyCategoryPrerequisite(key)}
                options={getPrerequisiteDropdown(key)}
              />
            </div>
          </Card.Content>
          {props.checklist.data[key].map((row, index, arr) => (
            <Card.Content key={row.name}>
              <Header>
                {row.name}{' '}
                <Button className="deleteButton" type="button" color="red" size="tiny" onClick={removeRow(key, row.name)}>
                  <div className="deleteButtonText">Delete checkbox</div>
                </Button>
                <Button className="moveButtonLarge" disabled={index >= arr.length - 1} circular icon="arrow circle down" type="button" color="blue" onClick={moveRowDown(key, row.name)} />
                <Button className="moveButtonLarge" disabled={index === 0} circular icon="arrow circle up" type="button" color="blue" onClick={moveRowUp(key, row.name)} />
              </Header>
              <div className="checkTextRow">
                <div className="checkedLabel">
                  <Label basic>Checked</Label>
                </div>
                <Input
                  className="numberField"
                  label="Points"
                  type="number"
                  step="0.01"
                  value={row.checkedPoints}
                  disabled={row.minimumRequirement}
                  onChange={changeField(key, row.name, 'checkedPoints')}
                  onBlur={castPointsToNumber(key, row.name)}
                />
                <span style={{ flexGrow: 100 }}>
                  <Input fluid className="textField" label="Text" type="text" value={row.textWhenOn} onChange={changeField(key, row.name, 'textWhenOn')} />
                </span>
              </div>
              <div className="checkTextRow">
                <div className="checkedLabel">
                  <Label basic>Unchecked</Label>
                </div>
                <Input
                  className="numberField"
                  label="Points"
                  type="number"
                  step="0.01"
                  value={row.uncheckedPoints}
                  disabled={row.minimumRequirement}
                  onChange={changeField(key, row.name, 'uncheckedPoints')}
                  onBlur={castPointsToNumber(key, row.name)}
                />
                <span style={{ flexGrow: 100 }}>
                  <Input fluid className="textField" label="Text" type="text" value={row.textWhenOff} onChange={changeField(key, row.name, 'textWhenOff')} />
                </span>
              </div>
              {kind !== 'codeReview' && (
                <div className="minimumRequirement" style={{ marginTop: '1em' }}>
                  <Checkbox label="Minimum requirement" checked={row.minimumRequirement} onChange={changeField(key, row.name, 'minimumRequirement')}></Checkbox>, which should be{' '}
                  <Radio
                    label="checked"
                    name={`minimumRequirementMetIf_${key}_${getRowId(row)}`}
                    value={true}
                    disabled={!row.minimumRequirement}
                    checked={row.minimumRequirementMetIf === true}
                    onChange={changeFieldValue(key, row.name, 'minimumRequirementMetIf', true)}
                  />{' '}
                  <Radio
                    label="unchecked"
                    name={`minimumRequirementMetIf_${key}_${getRowId(row)}`}
                    value={false}
                    disabled={!row.minimumRequirement}
                    checked={row.minimumRequirementMetIf === false}
                    onChange={changeFieldValue(key, row.name, 'minimumRequirementMetIf', false)}
                  />
                  , or else grade will drop by{' '}
                  <Input
                    className="minimumRequirementGradePenalty"
                    type="number"
                    step="1"
                    min="0"
                    max="5"
                    style={{ width: '60px' }}
                    disabled={!row.minimumRequirement}
                    value={row.minimumRequirementGradePenalty}
                    onChange={changeFieldNumber(key, row.name, 'minimumRequirementGradePenalty')}
                  />
                </div>
              )}
              <div className="prerequisite" style={{ marginTop: '1em' }}>
                <Label>Prerequisite</Label>
                <Dropdown
                  className="prerequisiteDropdown"
                  placeholder="(none)"
                  selection
                  value={row.prerequisite || null}
                  onChange={changeField(key, row.name, 'prerequisite')}
                  options={getPrerequisiteDropdown(key).filter(check => check.value !== row.id)}
                />
                <Popup trigger={<Icon name="help circle" />} content="If a prerequisite is set, the prerequisite must be checked in order for this checkbox to be checkable." />
              </div>
            </Card.Content>
          ))}
          <Card.Content>
            <form className="addForm" onSubmit={newRow(key)}>
              {/*This, like all other addForms is here to funnel both the button press 
                as well as a user pressing enter into the same function.*/}
              {<Button type="submit" content="Add new checkbox" color="yellow" icon="plus" labelPosition="left" />}
              {state.openAdd === key ? (
                <div>
                  <Label>Name</Label>
                  <Input className="newRowNameInput" type="text" value={state.rowName} onChange={changeRowName} />
                  <Button type="submit">Save</Button>
                  <Button type="button" onClick={cancelAdd}>
                    Cancel
                  </Button>
                </div>
              ) : (
                <div />
              )}
            </form>
          </Card.Content>
        </Card>
      )
    })
    return {
      checklistJsx,
      maxPoints
    }
  }

  if (props.loading && props.loading.redirect) {
    window.location.reload(true)
  }

  if (props.errors && props.errors.length > 0) {
    return <Error errors={props.errors.map(error => `${error.response.data} (${error.response.status} ${error.response.statusText})`)} />
  }

  const hasSelectedWeek = state.current !== undefined && state.current !== null
  const currentObj = parseChecklistValue(state.current)
  const { checklistJsx, maxPoints } = props.loading.loading ? { checklistJsx: null, maxPoints: null } : renderChecklist(currentObj.kind)
  return (
    <>
      <DocumentTitle title={`Checklists - ${props.selectedInstance.name}`} />
      <div className="CreateChecklist">
        <BackButton preset="modifyCIPage" cleanup={state.clear} />
        <Header>{props.selectedInstance.name}</Header>
        <div className="editForm">
          <div className="topOptions">
            <Dropdown id="weekDropdown" placeholder="Select Checklist" selection value={state.current} onChange={changeWeek} options={props.weekDropdowns} />
            <div className="copyForm">
              <Button type="button" onClick={copyChecklist} disabled={!hasSelectedWeek || (!state.copyCourse && !state.copyWeek)}>
                Copy checklist
              </Button>
              <Dropdown
                className="weekDropdown"
                disabled={!hasSelectedWeek}
                placeholder="...from another week"
                selection
                value={state.copyWeek}
                onChange={changeCopyWeek}
                options={state.copyWeekDropdowns}
              />{' '}
              <Dropdown
                className="courseDropdown"
                disabled={!hasSelectedWeek}
                placeholder="...from another course"
                selection
                value={state.copyCourse}
                onChange={changeCopyCourse}
                options={state.courseDropdowns}
              />
            </div>
            {hasSelectedWeek ? (
              <div className="jsonButtons">
                <JsonEdit onImport={importChecklist} initialData={props.checklist.data} generation={state.generation} downloadName={`${props.selectedInstance.ohid}_${state.current}.json`} />
              </div>
            ) : (
              <div />
            )}
          </div>
          {props.loading.loading ? (
            <Loader active />
          ) : hasSelectedWeek ? (
            <div>
              <form onSubmit={handleSubmit}>
                <Button className="saveButton" type="submit" color="green" size="large" disabled={!state.canSave}>
                  <div className="saveButtonText">Save</div>
                </Button>
                <br />
                <br />
              </form>
              <div>
                {checklistJsx /* This block of jsx is defined in renderChecklist */}
                <form className="addForm" onSubmit={newTopic}>
                  {<Button type="submit" content="Add new topic" icon="add" size="large" labelPosition="left" />}
                  {state.openAdd === 'newTopic' ? (
                    <div>
                      <Label>Name</Label>
                      <Input className="newTopicNameInput" type="text" value={state.topicName} onChange={changeTopicName} />
                      <Button type="submit">Save</Button>
                      <Button type="button" onClick={cancelAdd}>
                        Cancel
                      </Button>
                    </div>
                  ) : (
                    <div />
                  )}
                </form>
              </div>

              {props.selectedInstance.finalReviewHasPoints || currentObj.kind !== 'week' || currentObj.number < props.selectedInstance.weekAmount + 1 ? (
                <>
                  {currentObj.kind === 'codeReview' && <strong>You need to specify custom maximum points for code reviews in order for the maximum points to be visible to students.</strong>}
                  <Card className="maxPointsCard">
                    <Card.Content>
                      <p>
                        Total points of the checklist:{' '}
                        <strong className="totalPointsOfChecklist">
                          <Points points={maxPoints} />
                        </strong>
                        {currentObj.kind === 'week' && currentObj.number <= props.selectedInstance.weekAmount ? (
                          <span>
                            {' '}
                            {maxPoints === (state.maximumPoints !== '' ? Number(state.maximumPoints) : props.selectedInstance.weekMaxPoints) ? (
                              <Popup className="maxPointsIcon" trigger={<Icon name="check" size="large" color="green" />} content="The total points match the maximum points for this week." />
                            ) : (
                              <Popup className="maxPointsIcon" trigger={<Icon name="delete" size="large" color="red" />} content="The total points don't match the maximum points for this week." />
                            )}
                          </span>
                        ) : (
                          <span />
                        )}
                      </p>
                    </Card.Content>
                    <Card.Content>
                      <p className="maxPointsForWeek">
                        Maximum points for this review:{' '}
                        <strong>
                          {currentObj.kind === 'codeReview' ? state.maximumPoints === '' ? '' : <Points points={Number(state.maximumPoints)} /> : <Points points={getMaximumPointsForWeek()} />}
                        </strong>
                      </p>
                    </Card.Content>
                  </Card>
                  <div>
                    <Label>Define maximum points yourself</Label>
                    <Input className="maxPointsInput" type="number" step="0.01" style={{ width: '100px' }} value={state.maximumPoints} onChange={changeMaximumPoints} />
                    <Popup
                      className="infoText"
                      trigger={<Icon name="question circle" />}
                      content={
                        currentObj.kind === 'week'
                          ? `The points you define here will be the maximum points for this review. If no value is given, the maximum points for this review 
                    will stay the same as the defaulted weekly points which is ${props.selectedInstance.weekMaxPoints}`
                          : 'You need to specify max points for this code review so that the max points can be visible to students'
                      }
                    />
                  </div>
                </>
              ) : (
                <p>Points have been disabled for the final review from the course settings.</p>
              )}
              <form onSubmit={handleSubmit}>
                {/*This is a form with a single button instead of just a button because it doesn't work 
                (doesn't call the function) as just a button with onClick.*/}
                <Button className="saveButton" type="submit" color="green" size="large" disabled={!state.canSave}>
                  <div className="saveButtonText">Save</div>
                </Button>
                <br />
                <br />
              </form>
            </div>
          ) : (
            <div />
          )}
        </div>
      </div>
    </>
  )
}

const createWeekDropdowns = selectedInstance => {
  if (!selectedInstance) return []
  const options = []
  for (let week = 1; week <= selectedInstance.weekAmount; ++week) {
    options.push({
      value: `week${week}`,
      text: `Week ${week}`
    })
  }
  options.push({
    value: 'codeReview',
    text: 'Code Review'
  })
  if (selectedInstance.finalReview) {
    options.push({
      value: `week${selectedInstance.weekAmount + 1}`,
      text: 'Final Review'
    })
  }
  return options
}

const mapStateToProps = (state, ownProps) => {
  const selectedInstance = Array.isArray(state.courseInstance) ? state.courseInstance.find(course => course.ohid === ownProps.courseId) : state.courseInstance
  return {
    selectedInstance: selectedInstance || {},
    weekDropdowns: createWeekDropdowns(selectedInstance),
    checklist: state.checklist,
    courses: state.courseInstance,
    loading: state.loading,
    errors: Object.values(state.loading.errors)
  }
}

const mapDispatchToProps = {
  showNotification,
  resetLoading,
  addRedirectHook,
  createChecklist,
  getOneCI,
  getAllCI,
  getOneChecklist,
  resetChecklist,
  restoreChecklist,
  changeField,
  applyCategoryPrerequisite,
  addTopic,
  addRow,
  removeTopic,
  removeRow,
  moveTopicUp,
  moveRowUp,
  moveTopicDown,
  moveRowDown,
  castPointsToNumber
}

CreateChecklist.propTypes = {
  courseId: PropTypes.string.isRequired,

  selectedInstance: PropTypes.object.isRequired,
  weekDropdowns: PropTypes.array,
  checklist: PropTypes.object.isRequired,
  courses: PropTypes.oneOfType([PropTypes.array, PropTypes.object]),
  loading: PropTypes.object.isRequired,

  showNotification: PropTypes.func.isRequired,
  resetLoading: PropTypes.func.isRequired,
  addRedirectHook: PropTypes.func.isRequired,
  createChecklist: PropTypes.func.isRequired,
  getOneCI: PropTypes.func.isRequired,
  getAllCI: PropTypes.func.isRequired,
  getOneChecklist: PropTypes.func.isRequired,
  resetChecklist: PropTypes.func.isRequired,
  restoreChecklist: PropTypes.func.isRequired,
  changeField: PropTypes.func.isRequired,
  applyCategoryPrerequisite: PropTypes.func.isRequired,
  addTopic: PropTypes.func.isRequired,
  addRow: PropTypes.func.isRequired,
  removeTopic: PropTypes.func.isRequired,
  removeRow: PropTypes.func.isRequired,
  moveTopicUp: PropTypes.func.isRequired,
  moveRowUp: PropTypes.func.isRequired,
  moveTopicDown: PropTypes.func.isRequired,
  moveRowDown: PropTypes.func.isRequired,
  castPointsToNumber: PropTypes.func.isRequired,

  errors: PropTypes.array
}

export default connect(mapStateToProps, mapDispatchToProps)(CreateChecklist)
