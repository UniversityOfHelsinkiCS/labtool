import React, { Component } from 'react'
import { Form, Input, Grid, Loader, Container, Header, Button, Label } from 'semantic-ui-react'
import { connect } from 'react-redux'
import { createTag, getAllTags } from '../../services/tags'

export class ManageTags extends React.Component {
  state = {
    loading: false
  }

  componentWillMount() {
    console.log('mounting')
    console.log('this.props: ', this.props)
    console.log('this.props.getAllTags: ', this.props.getAllTags)
    console.log('this.props.createTag: ', this.props.createTag)
    if (this.props.getAllTags) {
      this.props.getAllTags()
    }
  }

  handleSubmit = async e => {
    console.log('olen täällä')
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

  render() {
    console.log('\ntags: ', this.props.tags)
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
              <Form onSubmit={this.handleSubmit}>
                <Form.Group inline>
                  <label style={{ width: '100px', textAlign: 'left' }}>Text</label>
                  <Input type="text" className="form-control1" name="text" placeholder="text" required style={{ minWidth: '30em' }} />
                </Form.Group>

                <Form.Group inline>
                  <label style={{ width: '100px', textAlign: 'left' }}>Color</label>
                  <Input type="text" className="form-control2" name="color" placeholder="color" required style={{ minWidth: '30em' }} />
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
        </div>
      </Container>
    )
  }
}

const mapStateToProps = state => {
  return {
    tags: state.tags
  }
}

const mapDispatchToProps = {
  createTag,
  getAllTags
}

export default connect(mapStateToProps, mapDispatchToProps)(ManageTags)
