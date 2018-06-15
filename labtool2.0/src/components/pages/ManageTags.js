import React, { Component } from 'react'
import { Form, Input, Grid, Loader, Container, Header, Button, Label } from 'semantic-ui-react'
import { connect } from 'react-redux'
import { createTag, getAllTags } from '../../services/tags'

export class ManageTags extends React.Component {
  componentWillMount() {
    this.props.getAllTags()
  }

  handleSubmit = async e => {
    console.log('olen täällä')
    try {
      e.preventDefault()

      this.setState({ loading: true })

      const tag = {
        text: e.target.text.value,
        newText: e.target.newText.value,
        color: e.target.color.value
      }
      await this.props.createTag(tag)
    } catch (error) {
      console.log(error)
    }
  }

  removeTag = async e => {
    console.log('removing tag')
    try {
      e.preventDefault()

      this.setState({ loading: true })

      const tag = {
        text: e.target.text.value
      }
      await this.props.removeTag(tag)
    } catch (error) {
      console.log(error)
    }
  }

  modifyTag = (text, color) => async e => {
    try {
      e.preventDefault()

      console.log('text: ', document.getElementById('tagText'))
      document.getElementById('tagText').placeholder = text
      document.getElementById('tagColor').placeholder = color
    } catch (error) {
      console.log(error)
    }
  }

  render() {
    console.log('\ntags: ', this.props.tags)
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
                <Form.Group inline>
                  <label style={{ width: '100px', textAlign: 'left' }}>Text</label>
                  <Input type="text" id="tagText" className="form-control1" name="text" placeholder="tag name" required style={{ minWidth: '30em' }} />
                </Form.Group>
                <Form.Group inline>
                  <label style={{ width: '100px', textAlign: 'left' }}>New text</label>
                  <Input type="text" id="tagTextNew" className="form-control2" name="newText" placeholder="(optional)" required style={{ minWidth: '30em' }} />
                </Form.Group>
                <Form.Group inline>
                  <label style={{ width: '100px', textAlign: 'left' }}>Color</label>
                  <Input type="text" id="tagColor" className="form-control3" name="color" placeholder="tag color" required style={{ minWidth: '30em' }} />
                </Form.Group>
                <Form.Field>
                  <button className="ui left floated blue button" type="submit">
                    {' '}
                    Add or modify
                  </button>
                  <button className="ui left floated blue button" onClick={this.removeTag}>
                    {' '}
                    Remove
                  </button>
                </Form.Field>
              </Form>
            </Grid.Row>
          </Grid>
          <br />
          {this.props.tags && this.props.tags.tags ? (
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
    tags: state.tags
  }
}

const mapDispatchToProps = {
  createTag,
  getAllTags
}

export default connect(mapStateToProps, mapDispatchToProps)(ManageTags)
