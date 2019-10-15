import React, { useEffect } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { Header, Input, Label, Button, Popup, Card, Dropdown, Loader, Icon } from 'semantic-ui-react'
import { showNotification } from '../../reducers/notificationReducer'
import { resetLoading } from '../../reducers/loadingReducer'
import { createChecklist, getOneChecklist } from '../../services/checklist'
import { getOneCI, getAllCI } from '../../services/courseInstance'
import { resetChecklist, changeField, restoreChecklist, addTopic, addRow, removeTopic, removeRow, castPointsToNumber } from '../../reducers/checklistReducer'
import './CreateChecklist.css'
import { usePersistedState } from '../../hooks/persistedState'

import BackButton from '../BackButton'
import JsonEdit from '../JsonEdit'

export const CreateChecklist = props => {
  const state = usePersistedState('CreateChecklist', {
    week: undefined, // tracks value of week dropdown.
    copyCourse: undefined, // tracks value of course dropdown.
    topicName: '', // tracks value inputted into topic creation dialog box.
    rowName: '', // tracks value inputted into row creation dialog box.
    openAdd: '', // which addForm is currently open. '' denotes no open addForms. Only one addForm can be open at one time.
    courseDropdowns: [], // Dropdown options to show for copying checklist.
    checklistData: null,
    maximumPoints: ''
  })

  useEffect(() => {
    // run on component mount
    props.resetLoading()
    if (state.checklistData) {
      props.restoreChecklist(state.checklistData)
    } else {
      props.resetChecklist()
    }
    props.getAllCI()
  }, [])

  useEffect(() => {
    state.courseDropdowns = createCourseDropdowns()
  }, [state.week])

  useEffect(() => {
    state.checklistData = props.checklist.data
  }, [props.checklist])

  // Make api call to save checklist to database.
  const handleSubmit = async e => {
    e.preventDefault()
    const weeks = props.selectedInstance.weekAmount
    const checklists = props.selectedInstance.finalReview ? weeks + 1 : weeks
    if (state.week <= 0 || state.week > checklists) {
      props.showNotification({
        message: 'Invalid week.',
        error: true
      })
      return
    }
    try {
      props.createChecklist({
        courseInstanceId: props.selectedInstance.id,
        week: state.week,
        checklist: props.checklist.data,
        maxPoints: Number(state.maximumPoints)
      })
    } catch (e) {
      props.showNotification({
        message: 'Could not parse JSON.',
        error: true
      })
    }
  }

  const changeWeek = async (e, { value }) => {
    const week = value
    let copyCourse
    if (state.copyCourse) {
      if (week > props.selectedInstance.weekAmount) {
        copyCourse = props.courses.find(course => course.id === state.copyCourse).finalReview ? state.copyCourse : undefined
      } else {
        copyCourse = props.courses.find(course => course.id === state.copyCourse).weekAmount >= week ? state.copyCourse : undefined
      }
    } else {
      copyCourse = undefined
    }
    state.week = week
    state.copyCourse = copyCourse
    state.courseDropdowns = createCourseDropdowns()
    loadChecklist(week)
  }

  const changeCopyCourse = async (e, { value }) => {
    state.copyCourse = value
  }

  const changeField = (key, name, field) => async e => {
    props.changeField({
      key,
      name,
      field,
      value: e.target.value
    })
  }

  // Make api call to receive checklist from database.
  const loadChecklist = async week => {
    props.getOneChecklist({
      week,
      courseInstanceId: props.selectedInstance.id
    })
  }

  const copyChecklist = async () => {
    if (!state.copyCourse) return
    const week = state.week > props.selectedInstance.weekAmount ? props.courses.find(course => course.id === state.copyCourse).weekAmount + 1 : state.week
    props.getOneChecklist({
      week,
      courseInstanceId: state.copyCourse,
      copying: true
    })
  }

  const validateChecklist = checklist => {
    return (
      !!checklist.week &&
      !!checklist.list &&
      Object.keys(checklist.list).every(listKey => {
        return (
          typeof listKey === 'string' &&
          Object.values(checklist.list[listKey]).every(row => {
            return row.name !== null && row.textWhenOn !== null && row.textWhenOff !== null && row.checkedPoints !== null && row.uncheckedPoints !== null
          })
        )
      })
    )
  }

  const importChecklist = checklistForWeek => {
    if (validateChecklist({ week: state.week, list: checklistForWeek })) {
      try {
        props.createChecklist({
          courseInstanceId: props.selectedInstance.id,
          week: state.week,
          checklist: checklistForWeek
        })
        const checklist = props.checklist
        checklist.data = checklistForWeek
        state.checklist = checklist
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
      name: state.rowName
    })
    state.rowName = ''
    state.openAdd = 'newTopic'
  }

  const changeTopicName = async e => {
    state.topicName = e.target.value
  }

  const changeRowName = async e => {
    state.rowName = e.target.value
  }

  const changeMaximumPoints = async e => {
    state.maximumPoints = e.target.value
  }

  const getMaximumPoints = maximumPoints => {
    if (!state.maximumPoints) {
      return maximumPoints
    }
    return Number(state.maximumPoints)
  }

  const removeTopic = key => async () => {
    props.removeTopic({
      key
    })
  }

  const removeRow = (key, name) => async () => {
    props.removeRow({
      key,
      name
    })
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

  const weekFilter = courses => {
    return courses.filter(course => state.week <= course.weekAmount)
  }
  const finalFilter = courses => {
    return courses.filter(course => course.finalReview)
  }

  const createCourseDropdowns = () => {
    if (!props.courses || !props.selectedInstance || !Object.keys(props.courses).length) return []
    const courses = state.week > props.selectedInstance.weekAmount ? finalFilter(props.courses) : weekFilter(props.courses)
    const options = courses
      .filter(course => props.selectedInstance.id !== course.id)
      .map(course => {
        return {
          value: course.id,
          text: `${course.name} (${course.europeanStart})`
        }
      })
    return options
  }

  const renderChecklist = () => {
    let maxPoints = 0
    const checklistJsx = Object.keys(props.checklist.data || {}).map(key => {
      let bestPoints = 0
      props.checklist.data[key].forEach(row => {
        const greaterPoints = row.checkedPoints > row.uncheckedPoints ? row.checkedPoints : row.uncheckedPoints
        bestPoints += Number(greaterPoints)
      })
      maxPoints += bestPoints
      return (
        <Card fluid color="red" key={key}>
          <Card.Content>
            <Header>
              {key}{' '}
              <Button className="deleteButton" type="button" color="red" size="tiny" onClick={removeTopic(key)}>
                <div className="deleteButtonText">Delete topic</div>
              </Button>
            </Header>
            <div>
              <p>
                Max points: <strong className="bestPointsNumber">{bestPoints}</strong>
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
          </Card.Content>
          {props.checklist.data[key].map(row => (
            <Card.Content key={row.name}>
              <Header>
                {row.name}{' '}
                <Button className="deleteButton" type="button" color="red" size="tiny" onClick={removeRow(key, row.name)}>
                  <div className="deleteButtonText">Delete checkbox</div>
                </Button>
              </Header>
              <div className="formField">
                <Label>Points when checked</Label>
                <Input className="numberField" type="number" step="0.01" value={row.checkedPoints} onChange={changeField(key, row.name, 'checkedPoints')} onBlur={castPointsToNumber(key, row.name)} />
              </div>
              <div className="formField">
                <Label>Text</Label>
                <Input className="textField" type="text" value={row.textWhenOn} onChange={changeField(key, row.name, 'textWhenOn')} />
              </div>
              <div className="formField">
                <Label>Points when unchecked</Label>
                <Input
                  className="numberField"
                  type="number"
                  step="0.01"
                  value={row.uncheckedPoints}
                  onChange={changeField(key, row.name, 'uncheckedPoints')}
                  onBlur={castPointsToNumber(key, row.name)}
                />
              </div>
              <div className="formField">
                <Label>Text</Label>
                <Input className="textField" type="text" value={row.textWhenOff} onChange={changeField(key, row.name, 'textWhenOff')} />
              </div>
            </Card.Content>
          ))}
          <form className="addForm" onSubmit={newRow(key)}>
            {/*This, like all other addForms is here to funnel both the button press 
              as well as a user pressing enter into the same function.*/}
            <Popup trigger={<Button type="submit" circular icon={{ name: 'add' }} />} content="Add new checkbox" />
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
        </Card>
      )
    })
    return {
      checklistJsx,
      maxPoints
    }
  }

  const { checklistJsx, maxPoints } = props.loading.loading ? { checklistJsx: null, maxPoints: null } : renderChecklist()
  return (
    <div className="CreateChecklist">
      <BackButton preset="modifyCIPage" cleanup={state.clear} />
      <Header>{props.selectedInstance.name}</Header>
      <div className="editForm">
        <div className="topOptions">
          <Dropdown id="weekDropdown" placeholder="Select Checklist" selection value={state.week} onChange={changeWeek} options={props.weekDropdowns} />
          <div className="copyForm">
            <Button type="button" onClick={copyChecklist} disabled={!state.copyCourse}>
              Copy
            </Button>
            <Dropdown className="courseDropdown" placeholder="Copy checklist from another course" selection value={state.copyCourse} onChange={changeCopyCourse} options={state.courseDropdowns} />
          </div>
          {state.week !== undefined ? (
            <div className="jsonButtons">
              <JsonEdit onImport={importChecklist} initialData={props.checklist.data} downloadName={`${props.selectedInstance.ohid}_week_${state.week}.json`} />
            </div>
          ) : (
            <div />
          )}
        </div>
        {props.loading.loading ? (
          <Loader active />
        ) : state.week !== undefined ? (
          <div>
            <div>
              {checklistJsx /* This block of jsx is defined in renderChecklist */}
              <form className="addForm" onSubmit={newTopic}>
                <Popup trigger={<Button type="submit" circular icon={{ name: 'add', size: 'large' }} />} content="Add new topic" />
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
            <div>
              <Label>Maximum points</Label>
              <Input className="numberField" type="number" step="0.01" value={state.maximumPoints} onChange={changeMaximumPoints} />
            </div>
            <Card className="maxPointsCard">
              <Card.Content>
                <p>
                  Total max points: <strong className="maxPointsNumber">{getMaximumPoints(maxPoints)}</strong>
                  {state.week > props.selectedInstance.weekAmount ? (
                    <span />
                  ) : (
                    <span>
                      {' '}
                      {props.selectedInstance.weekMaxPoints === getMaximumPoints(maxPoints) ? (
                        <Popup className="maxPointsIcon" trigger={<Icon name="check" size="large" color="green" />} content="The total matches maximum weekly points for this course." />
                      ) : (
                        <Popup className="maxPointsIcon" trigger={<Icon name="delete" size="large" color="red" />} content="The total does not match maximum weekly points for this course." />
                      )}
                    </span>
                  )}
                </p>
              </Card.Content>
            </Card>
            <form onSubmit={handleSubmit}>
              {/*This is a form with a single button instead of just a button because it doesn't work 
                (doesn't call the function) as just a button with onClick.*/}
              <Button className="saveButton" type="submit" color="green" size="large">
                <div className="saveButtonText">Save</div>
              </Button>
            </form>
          </div>
        ) : (
          <div />
        )}
      </div>
    </div>
  )
}

const createWeekDropdowns = selectedInstance => {
  if (!selectedInstance) return []
  const options = []
  let week = 1
  while (week <= selectedInstance.weekAmount) {
    options.push({
      value: week,
      text: `Week ${week}`
    })
    week++
  }
  if (selectedInstance.finalReview) {
    options.push({
      value: week,
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
    loading: state.loading
  }
}

const mapDispatchToProps = {
  showNotification,
  resetLoading,
  createChecklist,
  getOneCI,
  getAllCI,
  getOneChecklist,
  resetChecklist,
  restoreChecklist,
  changeField,
  addTopic,
  addRow,
  removeTopic,
  removeRow,
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
  createChecklist: PropTypes.func.isRequired,
  getOneCI: PropTypes.func.isRequired,
  getAllCI: PropTypes.func.isRequired,
  getOneChecklist: PropTypes.func.isRequired,
  resetChecklist: PropTypes.func.isRequired,
  restoreChecklist: PropTypes.func.isRequired,
  changeField: PropTypes.func.isRequired,
  addTopic: PropTypes.func.isRequired,
  addRow: PropTypes.func.isRequired,
  removeTopic: PropTypes.func.isRequired,
  removeRow: PropTypes.func.isRequired,
  castPointsToNumber: PropTypes.func.isRequired
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(CreateChecklist)
