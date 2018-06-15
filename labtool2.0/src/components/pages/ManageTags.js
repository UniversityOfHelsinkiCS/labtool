import React from 'react'
import { Form, Input, Grid, Container } from 'semantic-ui-react'
import { connect } from 'react-redux'
import { createTag, getAllTags } from '../../services/tags'

export class ManageTags extends React.Component {
  componentWillMount() {
    this.props.getAllTags()
  }

  handleSubmit = async e => {
    try {
      e.preventDefault()

      this.setState({ loading: true })

      const tag = {
        text: e.target.text.value,
        color: e.target.color.value
      }
      await this.props.createTag(tag)
    } catch (error) {
      console.log(error)
    }
  }

  modifyTag = (text, color) => async e => {
    try {
      e.preventDefault()
      document.getElementById('tagText').value = text
      document.getElementById('tagColor').value = color
    } catch (error) {
      console.log(error)
    }
  }

  render() {
    return (
      <Container>
        <div className="sixteen wide column" style={{ textAlignVertical: 'center', textAlign: 'center' }}>
          <h2>Add tags</h2>
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
                  <label style={{ width: '100px', textAlign: 'left' }}>Color</label>
                  <Input type="text" id="tagColor" className="form-control2" name="color" placeholder="tag color" required style={{ minWidth: '30em' }} />
                </Form.Group>
                <Form.Field>
                  <button className="ui left floated blue button" type="submit">
                    {' '}
                    Add
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