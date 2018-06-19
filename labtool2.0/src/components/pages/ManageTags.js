import React from 'react'
import { Form, Input, Grid, Container, Button, Loader } from 'semantic-ui-react'
import { connect } from 'react-redux'
import { createTag, getAllTags, removeTag } from '../../services/tags'
import { resetLoading } from '../../reducers/loadingReducer'

export class ManageTags extends React.Component {

  componentWillMount = async () => {
    await this.props.resetLoading()
    this.props.getAllTags()
  }

  handleSubmit = async e => {
    try {
      e.preventDefault()

      this.setState({ loading: true })

      const tag = {
        text: e.target.text.value,
        newText: e.target.newText.value || '',
        color: e.target.color.value
      }
      await this.props.createTag(tag)
      document.getElementById('tagText').value = ''
      document.getElementById('tagTextNew').value = ''
      document.getElementById('tagColor').value = ''
    } catch (error) {
      console.log(error)
    }
  }

  addTag = async e => {
    try {
      e.preventDefault()

      this.setState({ loading: true })

      const tag = {
        text: document.getElementById('tagText').value,
        newText: document.getElementById('tagText').value,
        color: document.getElementById('tagColor').value
      }
      await this.props.createTag(tag)
    } catch (error) {
      console.log(error)
    }
  }

  removeTag = async e => {
    try {
      var txt
      if (!window.confirm('Are you sure?')) {
        return
      }

      e.preventDefault()

      this.setState({ loading: true })

      const tag = {
        text: document.getElementById('tagText').value
      }
      await this.props.removeTag(tag)
      document.getElementById('tagText').value = ''
      document.getElementById('tagTextNew').value = ''
      document.getElementById('tagColor').value = ''
    } catch (error) {
      console.log(error)
    }
  }

  modifyTag = (text, color) => async e => {
    try {
      e.preventDefault()

      document.getElementById('tagText').value = text
      document.getElementById('tagTextNew').value = text
      document.getElementById('tagColor').value = color
    } catch (error) {
      console.log(error)
    }
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
                {' '}
                <Form.Field required inline>
                  <label style={{ width: '100px', textAlign: 'left' }}>Text</label>
                  <Input type="text" id="tagText" className="form-control1" name="text" placeholder="tag name" required style={{ minWidth: '30em' }} />
                </Form.Field>
                <Form.Field inline>
                  <label style={{ width: '100px', textAlign: 'left' }}>New text</label>
                  <Input type="text" id="tagTextNew" className="form-control2" name="newText" defaultValue="" placeholder="(optional)" required style={{ minWidth: '30em' }} />
                </Form.Field>
                <Form.Field inline>
                  <label style={{ width: '100px', textAlign: 'left' }}>Color</label>
                  <Input type="text" id="tagColor" className="form-control3" name="color" placeholder="tag color" required style={{ minWidth: '30em' }} />
                </Form.Field>
                <Form.Field>
                  <Button className="ui left floated blue button" onClick={this.addTag}>
                    {' '}
                    Add
                  </Button>
                  <Button className="ui left floated blue button" type="submit">
                    {' '}
                    Modify
                  </Button>
                  <Button className="ui left floated blue button" onClick={this.removeTag}>
                    {' '}
                    Remove
                  </Button>
                </Form.Field>
              </Form>
            </Grid.Row>
          </Grid>
          <h2>Current tags (click us)</h2>
          <br />
          {this.props.loading.loading ? (
            <Loader active />
          ) : (
            this.props.tags.tags.map(tag => (
              <button key={tag.id} className={`mini ui ${tag.color} button`} onClick={this.modifyTag(tag.name, tag.color)}>
                {tag.name}
              </button>
            ))
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
  resetLoading
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ManageTags)
