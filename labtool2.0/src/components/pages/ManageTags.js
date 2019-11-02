import React, { useEffect } from 'react'
import PropTypes from 'prop-types'
import { Form, Input, Grid, Container, Button, Loader } from 'semantic-ui-react'
import { connect } from 'react-redux'
import { createTag, getAllTags, removeTag } from '../../services/tags'
import { resetLoading } from '../../reducers/loadingReducer'
import { willCreateNewTag, willModifyExistingTag } from '../../reducers/tagReducer'
import { capitalize } from '../../util/format'
import BackButton from '../BackButton'
import useLegacyState from '../../hooks/legacyState'

export const ManageTags = props => {
  const state = useLegacyState({
    valueText: '',
    valueColor: ''
  })
  const validColors = ['red', 'orange', 'yellow', 'olive', 'green', 'teal', 'blue', 'violet', 'purple', 'pink', 'brown', 'grey', 'black']

  useEffect(() => {
    // run on component mount
    props.resetLoading()
    props.getAllTags()
  }, [])

  const handleSubmit = e => {
    try {
      e.preventDefault()

      props.resetLoading()
      const tag = {
        text: props.tags.modifyTag || state.valueText,
        newText: state.valueText,
        color: state.valueColor
      }

      props.createTag(tag)
      state.valueText = ''
      state.valueColor = ''

      if (props.tags.modifyTag) {
        modifyTag(tag.newText, tag.color)(e)
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
        text: props.tags.modifyTag
      }
      props.removeTag(tag)
      props.willCreateNewTag()
      state.valueText = ''
      state.valueColor = ''
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
    } catch (error) {
      console.error(error)
    }
  }

  const modifyTag = (text, color) => e => {
    try {
      e.preventDefault()
      props.willModifyExistingTag(text)

      state.valueText = text
      state.valueColor = validColors.includes(color) ? color : 'white'
    } catch (error) {
      console.error(error)
    }
  }

  return (
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
                {props.tags.modifyTag ? <h4>Editing tag: {props.tags.modifyTag}</h4> : <h4>You are creating a new tag.</h4>}
                <div>
                  Preview: <button className={`mini ui button ${validColors.includes(state.valueColor) ? state.valueColor : ''}`} style={{ display: state.valueText ? 'inline' : 'none' }}>{state.valueText}</button>
                  <br />
                  <br />
                </div>{' '}
                <Form.Field required inline>
                  <label style={{ width: '100px', textAlign: 'left' }}>Text</label>
                  <Input type="text" value={state.valueText} className="form-control1" name="text" placeholder="Tag name" required style={{ minWidth: '30em' }} onChange={(e, { value }) => state.valueText = value} />
                </Form.Field>
                <Form.Field required inline>
                  <label style={{ width: '100px', textAlign: 'left' }}>Color</label>
                  <select className="ui dropdown" value={state.valueColor} name="color" style={{ minWidth: '30em' }} required  onChange={e => state.valueColor = e.target.value}>
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
          ) : props.tags.tags ? (
            props.tags.tags.map(tag => (
              <button key={tag.id} className={`mini ui ${tag.color} button`} onClick={modifyTag(tag.name, tag.color)}>
                {tag.name}
              </button>
            ))
          ) : (
            <div />
          )}
          <br />
          <br />
        </div>
      </Container>
    </div>
  )
}

const mapStateToProps = (state, ownProps) => {
  return {
    ownProps,
    tags: state.tags,
    loading: state.loading
  }
}

const mapDispatchToProps = {
  createTag,
  removeTag,
  getAllTags,
  resetLoading,
  willCreateNewTag,
  willModifyExistingTag
}

ManageTags.propTypes = {
  tags: PropTypes.object.isRequired,
  loading: PropTypes.object.isRequired,

  createTag: PropTypes.func.isRequired,
  removeTag: PropTypes.func.isRequired,
  getAllTags: PropTypes.func.isRequired,
  resetLoading: PropTypes.func.isRequired,
  willCreateNewTag: PropTypes.func.isRequired,
  willModifyExistingTag: PropTypes.func.isRequired
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ManageTags)
