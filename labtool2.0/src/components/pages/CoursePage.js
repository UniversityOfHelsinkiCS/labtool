import React, { Component } from 'react'
import { Button, Table } from 'semantic-ui-react'
import { Link } from 'react-router-dom'
import { connect } from 'react-redux'

class CoursePage extends Component {
  componentDidMount() {

  }

  render() {
    let renderButton = false
    let projectName
    let githubLink
    let instance = []

    if (this.props.studentInstance) {
      instance = this.props.studentInstance.filter(inst => (inst.courseInstanceId == this.props.selectedInstance.id))
      console.log(instance)
    }



    return (
      //const CoursePage = ({ name, start, end, week_amount, week_max_points, current_week, handleFieldChange }) => {
      <div className="CoursePage" style={{ textAlignVertical: 'center', textAlign: 'center', }}>
        <div class="ui grid">
          <div class="sixteen wide column">
            <h2>{this.props.selectedInstance.name}</h2>

          </div>
          {this.props.coursePage.role === "student" ?
            <div style={{ textAlignVertical: 'center', textAlign: 'center', }}>
              {instance.map(i =>
                <div class="sixteen wide column">
                  <div class="ui grid">
                    <div class="sixteen wide column">
                      <h3>Project name: {i.projectName}</h3>
                      <h3>Github link: <a href={`${i.github}`}>{i.github}</a></h3>
                      <h3> Comments and feedback </h3>
                      <Table celled padded unstackable>
                        <Table.Header>
                          <Table.Row>
                            <Table.HeaderCell>Week</Table.HeaderCell>
                            <Table.HeaderCell>Points</Table.HeaderCell>
                            <Table.HeaderCell>Comment</Table.HeaderCell>
                          </Table.Row>
                        </Table.Header>
                        <Table.Body>
                          <Table.Row>
                            <Table.Cell>1</Table.Cell>
                            <Table.Cell>5</Table.Cell>
                            <Table.Cell>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque ut ultrices sapien. Aliquam neque diam, scelerisque nec metus sit amet, euismod interdum orci. Vivamus eu convallis ex. Etiam faucibus varius lorem in egestas. Pellentesque quis elementum magna, quis sagittis ex. Mauris a sem dignissim, fringilla elit ac, iaculis quam. Ut ut lacus sit amet massa blandit tincidunt. Mauris mattis tempor nibh, fermentum interdum massa placerat tempor.</Table.Cell>
                          </Table.Row>
                          <Table.Row>
                            <Table.Cell>2</Table.Cell>
                            <Table.Cell>2</Table.Cell>
                            <Table.Cell>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque ut ultrices sapien. Aliquam neque diam, scelerisque nec metus sit amet, euismod interdum orci. Vivamus eu convallis ex. Etiam faucibus varius lorem in egestas. Pellentesque quis elementum magna, quis sagittis ex. Mauris a sem dignissim, fringilla elit ac, iaculis quam. Ut ut lacus sit amet massa blandit tincidunt. Mauris mattis tempor nibh, fermentum interdum massa placerat tempor.</Table.Cell>
                          </Table.Row>
                          <Table.Row>
                            <Table.Cell>3</Table.Cell>
                            <Table.Cell>0</Table.Cell>
                            <Table.Cell>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque ut ultrices sapien. Aliquam neque diam, scelerisque nec metus sit amet, euismod interdum orci. Vivamus eu convallis ex. Etiam faucibus varius lorem in egestas. Pellentesque quis elementum magna, quis sagittis ex. Mauris a sem dignissim, fringilla elit ac, iaculis quam. Ut ut lacus sit amet massa blandit tincidunt. Mauris mattis tempor nibh, fermentum interdum massa placerat tempor.</Table.Cell>
                          </Table.Row>
                          <Table.Row>
                            <Table.Cell>4</Table.Cell>
                            <Table.Cell>4</Table.Cell>
                            <Table.Cell>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque ut ultrices sapien. Aliquam neque diam, scelerisque nec metus sit amet, euismod interdum orci. Vivamus eu convallis ex. Etiam faucibus varius lorem in egestas. Pellentesque quis elementum magna, quis sagittis ex. Mauris a sem dignissim, fringilla elit ac, iaculis quam. Ut ut lacus sit amet massa blandit tincidunt. Mauris mattis tempor nibh, fermentum interdum massa placerat tempor.</Table.Cell>
                          </Table.Row>
                          <Table.Row>
                            <Table.Cell>5</Table.Cell>
                            <Table.Cell>4.5</Table.Cell>
                            <Table.Cell>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque ut ultrices sapien. Aliquam neque diam, scelerisque nec metus sit amet, euismod interdum orci. Vivamus eu convallis ex. Etiam faucibus varius lorem in egestas. Pellentesque quis elementum magna, quis sagittis ex. Mauris a sem dignissim, fringilla elit ac, iaculis quam. Ut ut lacus sit amet massa blandit tincidunt. Mauris mattis tempor nibh, fermentum interdum massa placerat tempor.</Table.Cell>
                          </Table.Row>
                        </Table.Body>
                      </Table>
                    </div>
                  </div>
                </div>
              )}
              <div class="sixteen wide column">
                <Link to={`/labtool/courseregistration/${this.props.selectedInstance.ohid}`}>  <Button>Register</Button></Link>
              </div>


            </div>
            :
            <div style={{ textAlignVertical: 'center', textAlign: 'center', }}>
              <div class="sixteen wide column">
                  <div class="sixteen wide column">
                    <Table celled center >
                      <Table.Header>
                        <Table.Row>
                          <Table.HeaderCell>Active: {JSON.stringify(this.props.selectedInstance.active)}</Table.HeaderCell>
                          <Table.HeaderCell>Week amount: {this.props.selectedInstance.weekAmount}</Table.HeaderCell>
                          <Table.HeaderCell>Current week: {this.props.selectedInstance.currentWeek}</Table.HeaderCell>
                          <Table.HeaderCell>Week maxpoints: {this.props.selectedInstance.weekMaxPoints}</Table.HeaderCell>
                        </Table.Row>
                      </Table.Header>
                    </Table>

                    <h3> Students </h3>
                    <Table celled unstackable>
                      <Table.Header>
                        <Table.Row>
                          <Table.HeaderCell>Name</Table.HeaderCell>
                          <Table.HeaderCell> Github </Table.HeaderCell>
                          <Table.HeaderCell>Week 1</Table.HeaderCell>
                          <Table.HeaderCell>Week 2</Table.HeaderCell>
                          <Table.HeaderCell>Week 3</Table.HeaderCell>
                          <Table.HeaderCell>Week 4</Table.HeaderCell>
                          <Table.HeaderCell>Week 5</Table.HeaderCell>
                          <Table.HeaderCell>Review</Table.HeaderCell>
                        </Table.Row>
                      </Table.Header>
                      <Table.Body>
                        <Table.Row >
                          <Table.Cell>Maija Meikäläinen  </Table.Cell>
                          <Table.Cell>Name and link</Table.Cell>
                          <Table.Cell>4</Table.Cell>
                          <Table.Cell>2</Table.Cell>
                          <Table.Cell>1</Table.Cell>
                          <Table.Cell>0</Table.Cell>
                          <Table.Cell>4</Table.Cell>
                          <Table.Cell><Button circular color='orange' size="tiny" icon="large black edit"></Button></Table.Cell>
                        </Table.Row>
                        <Table.Row>
                          <Table.Cell>Toivo Untonen </Table.Cell>
                          <Table.Cell>Name and link</Table.Cell>
                          <Table.Cell>1</Table.Cell>
                          <Table.Cell>3</Table.Cell>
                          <Table.Cell>2</Table.Cell>
                          <Table.Cell>5</Table.Cell>
                          <Table.Cell>4.5</Table.Cell>
                          <Table.Cell><Button circular color='orange' size="tiny" icon="large black edit"></Button></Table.Cell>
                        </Table.Row>
                        <Table.Row>
                          <Table.Cell>Joonatan Järvinen </Table.Cell>
                          <Table.Cell>Name and link</Table.Cell>
                          <Table.Cell>4</Table.Cell>
                          <Table.Cell>0</Table.Cell>
                          <Table.Cell>4</Table.Cell>
                          <Table.Cell>5 </Table.Cell>
                          <Table.Cell>1.5</Table.Cell>
                          <Table.Cell><Button circular color='orange' size="tiny" icon="edit black large" ></Button></Table.Cell>
                        </Table.Row>
                      </Table.Body>
                    </Table>
                  </div>
                </div>
              </div>
          }

        </div >
      </div>


    )
  }
}

const mapStateToProps = (state) => {
  return {
    user: state.user,
    studentInstance: state.studentInstance,
    teacherInstance: state.teacherInstance,
    selectedInstance: state.selectedInstance,
    coursePage: state.coursePage
  }
}



export default connect(mapStateToProps, {})(CoursePage)