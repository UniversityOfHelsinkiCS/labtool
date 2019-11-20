import React, { useEffect } from 'react'
import PropTypes from 'prop-types'
import { Form, Input, Grid, Container, Button, Loader, Checkbox, Dropdown } from 'semantic-ui-react'
import { connect } from 'react-redux'
import { createTag, getAllTags, removeTag } from '../../services/tags'
import { resetLoading } from '../../reducers/loadingReducer'
import { willCreateNewTag, willModifyExistingTag } from '../../reducers/tagReducer'
import { capitalize } from '../../util/format'
import { getAllCI } from '../../services/courseInstance'
import BackButton from '../BackButton'
import useLegacyState from '../../hooks/legacyState'
import { sortCoursesByName } from '../../util/sort'
import { showNotification } from '../../reducers/notificationReducer'
import DocumentTitle from '../DocumentTitle'

export const ManageTags = props => {
  const state = useLegacyState({
    valueText: '',
    valueColor: '',
    valueGlobal: false,
    copyCourse: null,
    courseDropdowns: []
  })
  const validColors = ['red', 'orange', 'yellow', 'olive', 'green', 'teal', 'blue', 'violet', 'purple', 'pink', 'brown', 'grey', 'black']

  useEffect(() => {
    // run on component mount
    props.resetLoading()
    props.getAllTags()
    props.getAllCI()
  }, [])

  useEffect(() => {
    state.courseDropdowns = createCourseDropdowns()
  }, [props.courses])

  const handleSubmit = e => {
    try {
      e.preventDefault()

      props.resetLoading()
      const tag = {
        id: props.tags.modifyTag,
        text: state.valueText,
        color: state.valueColor,
        courseInstanceId: state.valueGlobal ? null : props.selectedInstance.id
      }

      props.createTag(tag)
      state.valueText = ''
      state.valueColor = ''
      state.valueGlobal = false

      if (props.tags.modifyTag) {
        modifyTag(props.tags.modifyTag, tag.text, tag.color, tag.courseInstanceId === null)(e)
      } else {
        createNewTag(e)
      }
    } catch (error) {
      console.error(error)
    }
  }

  const removeTag = e => {
    try {
      if (!window.confirm('Are you sure?')) {
        return
      }

      e.preventDefault()

      props.resetLoading()

      const tag = {
        id: props.tags.modifyTag
      }
      props.removeTag(tag)
      props.willCreateNewTag()
      state.valueText = ''
      state.valueColor = ''
      state.valueGlobal = false
    } catch (error) {
      console.error(error)
    }
  }

  const createNewTag = e => {
    try {
      e.preventDefault()
      props.willCreateNewTag()

      state.valueText = ''
      state.valueColor = ''
      state.valueGlobal = false
    } catch (error) {
      console.error(error)
    }
  }

  const modifyTag = (id, text, color, global) => e => {
    try {
      e.preventDefault()
      props.willModifyExistingTag(id)

      state.valueText = text
      state.valueColor = validColors.includes(color) ? color : 'white'
      state.valueGlobal = global
    } catch (error) {
      console.error(error)
    }
  }

  const createCourseDropdowns = () => {
    if (!props.courses || !props.selectedInstance || !Object.keys(props.courses).length) return []
    const options = sortCoursesByName(props.courses)
      .filter(course => props.selectedInstance.id !== course.id)
      .map(course => {
        return {
          value: course.id,
          text: `${course.name} (${course.europeanStart})`
        }
      })
    return options
  }

  const courseTags = (props.tags.tags || []).filter(tag => tag.courseInstanceId === props.selectedInstance.id)
  const globalTags = (props.tags.tags || []).filter(tag => tag.courseInstanceId === null)

  const copyCourseTags = () => {
    const courseTagNames = courseTags.map(tag => tag.name)
    const importableTags = props.tags.tags.filter(tag => tag.courseInstanceId === state.copyCourse && !courseTagNames.includes(tag.name))
    if (importableTags.length > 0) {
      props.resetLoading()
    } else {
      props.showNotification({ message: 'No tags to copy', error: false })
      return
    }
    importableTags.forEach(tag => {
      props.createTag({
        text: tag.name,
        color: tag.color,
        id: null,
        courseInstanceId: props.selectedInstance.id
      })
    })
  }

  const editTag = (props.tags.tags || []).find(tag => tag.id === props.tags.modifyTag)
  if (props.tags.tags && props.tags.modifyTag && !editTag) {
    props.willCreateNewTag()
    return <div />
  }

  return (
    <>
      <DocumentTitle title={`Tags - ${props.selectedInstance.name}`} />
      <div>
        <BackButton preset="modifyCIPage" />
        <Container>
          <div className="sixteen wide column" style={{ textAlignVertical: 'center', textAlign: 'center' }}>
            <h2>Add, modify or remove tags</h2>
            <p />
          </div>
          <div
            className="Add tag"
            style={{
              textAlignVertical: 'center',
              textAlign: 'center'
            }}
          >
            <Grid>
              <Grid.Row centered>
                <Form key="createOrModify" onSubmit={handleSubmit}>
                  {props.tags.modifyTag ? <h4>Editing tag: {editTag.name}</h4> : <h4>You are creating a new tag.</h4>}
                  <div>
                    Preview:{' '}
                    <button className={`mini ui button ${validColors.includes(state.valueColor) ? state.valueColor : ''}`} style={{ display: state.valueText ? 'inline' : 'none' }}>
                      {state.valueText}
                    </button>
                    <br />
                    <br />
                  </div>{' '}
                  <Form.Field required inline>
                    <label style={{ width: '100px', textAlign: 'left' }}>Text</label>
                    <Input
                      type="text"
                      value={state.valueText}
                      className="form-control1"
                      name="text"
                      placeholder="Tag name"
                      required
                      style={{ minWidth: '30em' }}
                      onChange={(e, { value }) => (state.valueText = value)}
                    />
                  </Form.Field>
                  <Form.Field required inline>
                    <label style={{ width: '100px', textAlign: 'left' }}>Color</label>
                    <select className="ui dropdown" value={state.valueColor} name="color" style={{ minWidth: '30em' }} required onChange={e => (state.valueColor = e.target.value)}>
                      <option value="" disabled>
                        Select a tag color
                      </option>
                      <option value="white">White</option>
                      {validColors.map(color => (
                        <option key={color} value={color}>
                          {capitalize(color)}
                        </option>
                      ))}
                    </select>
                  </Form.Field>
                  <Form.Field inline>
                    <label style={{ width: '100px', textAlign: 'left' }}>Global?</label>
                    <Checkbox
                      checked={state.valueGlobal}
                      name="global"
                      label="This tag will be available in all courses"
                      style={{ minWidth: '30em' }}
                      onChange={(e, { checked }) => (state.valueGlobal = checked)}
                    />
                  </Form.Field>
                  <Form.Field>
                    <Button className="ui left floated blue button" type="submit">
                      {' '}
                      Save
                    </Button>
                    {props.tags.modifyTag && (
                      <Button className="ui left floated blue button" onClick={removeTag}>
                        {' '}
                        Remove
                      </Button>
                    )}
                  </Form.Field>
                </Form>
              </Grid.Row>
            </Grid>
            <h2>Click a tag below to edit</h2>
            <button className={`mini ui button`} onClick={createNewTag}>
              I want to create a new tag
            </button>
            <br />
            <br />
            {props.loading.loading ? (
              <Loader active />
            ) : props.tags.tags && props.tags.tags.length ? (
              <>
                {courseTags.length ? (
                  <div>
                    <h2>Course tags</h2>
                    {courseTags.map(tag => (
                      <button key={tag.id} className={`mini ui ${tag.color} button`} onClick={modifyTag(tag.id, tag.name, tag.color, tag.courseInstanceId === null)}>
                        {tag.name}
                      </button>
                    ))}
                    <br />
                    <br />
                  </div>
                ) : globalTags.length ? (
                  <div>
                    <i>Tip: To convert a global tag into a course tag, select a global tag below, uncheck the &quot;global&quot; box and save.</i>
                    <br />
                    <br />
                  </div>
                ) : (
                  <span />
                )}
                {globalTags.length ? (
                  <div>
                    <h2>Global tags</h2>
                    {globalTags.map(tag => (
                      <button key={tag.id} className={`mini ui ${tag.color} button`} onClick={modifyTag(tag.id, tag.name, tag.color, tag.courseInstanceId === null)}>
                        {tag.name}
                      </button>
                    ))}
                    <br />
                    <br />
                  </div>
                ) : (
                  <span />
                )}
              </>
            ) : (
              <div />
            )}
            <br />
            <br />
            <h2>Copy course tags from another course</h2>
            <Dropdown
              className="courseDropdown"
              disabled={state.courseDropdowns.length < 1}
              placeholder={state.courseDropdowns.length < 1 ? 'No other courses' : 'Select course to copy from'}
              selection
              value={state.copyCourse}
              onChange={(e, { value }) => (state.copyCourse = value)}
              options={state.courseDropdowns}
            />{' '}
            <Button type="button" onClick={copyCourseTags} disabled={!state.copyCourse}>
              Copy course tags
            </Button>
          </div>
        </Container>
      </div>
    </>
  )
}

const mapStateToProps = (state, ownProps) => {
  return {
    ownProps,
    tags: state.tags,
    loading: state.loading,
    selectedInstance: state.selectedInstance,
    courses: state.courseInstance
  }
}

const mapDispatchToProps = {
  createTag,
  removeTag,
  getAllTags,
  resetLoading,
  willCreateNewTag,
  willModifyExistingTag,
  getAllCI,
  showNotification
}

ManageTags.propTypes = {
  tags: PropTypes.object.isRequired,
  loading: PropTypes.object.isRequired,
  selectedInstance: PropTypes.object.isRequired,
  courses: PropTypes.oneOfType([PropTypes.array, PropTypes.object]),

  createTag: PropTypes.func.isRequired,
  removeTag: PropTypes.func.isRequired,
  getAllTags: PropTypes.func.isRequired,
  resetLoading: PropTypes.func.isRequired,
  willCreateNewTag: PropTypes.func.isRequired,
  willModifyExistingTag: PropTypes.func.isRequired,
  getAllCI: PropTypes.func.isRequired,
  showNotification: PropTypes.func.isRequired
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ManageTags)
