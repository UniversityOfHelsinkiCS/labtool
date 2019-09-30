import React, { useEffect } from 'react'
import PropTypes from 'prop-types'
import { Form, Input, Grid, Container, Button, Loader } from 'semantic-ui-react'
import { connect } from 'react-redux'
import { createTag, getAllTags, removeTag } from '../../services/tags'
import { resetLoading } from '../../reducers/loadingReducer'
import { willCreateNewTag, willModifyExistingTag } from '../../reducers/tagReducer'
import { capitalize } from '../../util/format'

import BackButton from '../BackButton'

export const ManageTags = props => {
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
        text: props.tags.modifyTag || e.target.text.value,
        newText: e.target.text.value,
        color: e.target.color.value
      }

      props.createTag(tag)
      document.getElementById('tagText').value = ''
      document.getElementById('tagColor').value = ''

      if (props.tags.modifyTag) {
        modifyTag(tag.newText, tag.color)(e)
      } else {
        createNewTag(e)
      }
      updateTagPreview()
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
      document.getElementById('tagText').value = ''
      document.getElementById('tagColor').value = ''
      updateTagPreview()
    } catch (error) {
      console.error(error)
    }
  }

  const createNewTag = e => {
    try {
      e.preventDefault()
      props.willCreateNewTag()

      document.getElementById('tagText').value = ''
      document.getElementById('tagColor').value = ''
      updateTagPreview()
    } catch (error) {
      console.error(error)
    }
  }

  const modifyTag = (text, color) => e => {
    try {
      e.preventDefault()
      props.willModifyExistingTag(text)

      document.getElementById('tagText').value = text
      document.getElementById('tagColor').value = validColors.includes(color) ? color : 'white'
      updateTagPreview()
    } catch (error) {
      console.error(error)
    }
  }

  const updateTagPreview = () => {
    const tagPreview = document.getElementById('tagPreview')
    const newText = document.getElementById('tagText').value
    const newColor = document.getElementById('tagColor').value

    tagPreview.style.display = newText ? 'inline' : 'none'
    tagPreview.textContent = newText
    tagPreview.className = validColors.includes(newColor) ? 'mini ui button ' + newColor : 'mini ui button'
  }

  return (
    <Container>
      <BackButton preset="modifyCIPage" />
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
                Preview: <button id="tagPreview" className={`mini ui button`} style={{ display: 'none' }} />
                <br />
                <br />
              </div>{' '}
              <Form.Field required inline>
                <label style={{ width: '100px', textAlign: 'left' }}>Text</label>
                <Input type="text" id="tagText" className="form-control1" name="text" placeholder="Tag name" required style={{ minWidth: '30em' }} onChange={updateTagPreview} />
              </Form.Field>
              <Form.Field required inline>
                <label style={{ width: '100px', textAlign: 'left' }}>Color</label>
                <select defaultValue="" className="ui dropdown" id="tagColor" name="color" style={{ minWidth: '30em' }} required onChange={updateTagPreview}>
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
