import React from 'react'
import { Form, Input, Grid, Container, Button, Loader } from 'semantic-ui-react'
import { connect } from 'react-redux'
import { createTag, getAllTags, removeTag } from '../../services/tags'
import { resetLoading } from '../../reducers/loadingReducer'
import { willCreateNewTag, willModifyExistingTag } from '../../reducers/tagReducer'
import { capitalize } from '../../util/format'

export class ManageTags extends React.Component {
  constructor(props) {
    super(props)

    // list of colors from https://semantic-ui.com/usage/theming.html#sitewide-defaults
    this.validColors = ['red', 'orange', 'yellow', 'olive', 'green', 'teal', 'blue', 'violet', 'purple', 'pink', 'brown', 'grey', 'black']
  }

  componentWillMount = async () => {
    await this.props.resetLoading()
    this.props.getAllTags()
  }

  handleSubmit = e => {
    try {
      e.preventDefault()

      this.props.resetLoading()
      const tag = {
        text: this.props.tags.modifyTag || e.target.text.value,
        newText: e.target.text.value,
        color: e.target.color.value
      }

      this.props.createTag(tag)
      document.getElementById('tagText').value = ''
      document.getElementById('tagColor').value = ''

      if (this.props.tags.modifyTag) {
        this.modifyTag(tag.newText, tag.color)(e)
      } else {
        this.createNewTag(e)
      }
      this.updateTagPreview()
    } catch (error) {
      console.error(error)
    }
  }

  removeTag = e => {
    try {
      if (!window.confirm('Are you sure?')) {
        return
      }

      e.preventDefault()

      this.props.resetLoading()

      const tag = {
        text: this.props.tags.modifyTag
      }
      this.props.removeTag(tag)
      this.props.willCreateNewTag()
      document.getElementById('tagText').value = ''
      document.getElementById('tagColor').value = ''
      this.updateTagPreview()
    } catch (error) {
      console.error(error)
    }
  }

  createNewTag = e => {
    try {
      e.preventDefault()
      this.props.willCreateNewTag()

      document.getElementById('tagText').value = ''
      document.getElementById('tagColor').value = ''
      this.updateTagPreview()
    } catch (error) {
      console.error(error)
    }
  }

  modifyTag = (text, color) => e => {
    try {
      e.preventDefault()
      this.props.willModifyExistingTag(text)

      document.getElementById('tagText').value = text
      document.getElementById('tagColor').value = this.validColors.includes(color) ? color : 'white'
      this.updateTagPreview()
    } catch (error) {
      console.error(error)
    }
  }

  updateTagPreview = () => {
    const tagPreview = document.getElementById('tagPreview')
    const newText = document.getElementById('tagText').value
    const newColor = document.getElementById('tagColor').value

    tagPreview.style.display = newText ? 'inline' : 'none'
    tagPreview.textContent = newText
    tagPreview.className = this.validColors.includes(newColor) ? 'mini ui button ' + newColor : 'mini ui button'
  }

  render() {
    return (
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
              <Form key="createOrModify" onSubmit={this.handleSubmit}>
                {this.props.tags.modifyTag ? <h4>Editing tag: {this.props.tags.modifyTag}</h4> : <h4>You are creating a new tag.</h4>}
                <div>
                  Preview: <button id="tagPreview" className={`mini ui button`} style={{ display: 'none' }} />
                  <br />
                  <br />
                </div>{' '}
                <Form.Field required inline>
                  <label style={{ width: '100px', textAlign: 'left' }}>Text</label>
                  <Input type="text" id="tagText" className="form-control1" name="text" placeholder="Tag name" required style={{ minWidth: '30em' }} onChange={this.updateTagPreview} />
                </Form.Field>
                <Form.Field inline>
                  <label style={{ width: '100px', textAlign: 'left' }}>Color</label>
                  <select className="ui dropdown" id="tagColor" name="color" style={{ minWidth: '30em' }} required onChange={this.updateTagPreview}>
                    <option value="" disabled selected>
                      Select a tag color
                    </option>
                    <option value="white">White</option>
                    {this.validColors.map(color => (
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
                  {this.props.tags.modifyTag && (
                    <Button className="ui left floated blue button" onClick={this.removeTag}>
                      {' '}
                      Remove
                    </Button>
                  )}
                </Form.Field>
              </Form>
            </Grid.Row>
          </Grid>
          <h2>Click a tag below to edit</h2>
          <button className={`mini ui button`} onClick={this.createNewTag}>
            I want to create a new tag
          </button>
          <br />
          <br />
          {this.props.loading.loading ? (
            <Loader active />
          ) : this.props.tags.tags ? (
            this.props.tags.tags.map(tag => (
              <button key={tag.id} className={`mini ui ${tag.color} button`} onClick={this.modifyTag(tag.name, tag.color)}>
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

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ManageTags)
