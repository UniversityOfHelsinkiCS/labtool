import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { Table, Popup, Icon, Button, Dropdown } from 'semantic-ui-react'
import RepoLink from '../RepoLink'
import { tagStudent, unTagStudent } from '../../services/tags'

export const ProjectInfoCell = ({ studentData, selectedTag, showTagDropdown, tagStudent, unTagStudent, dropDownTags, addFilterTag, changeHiddenTagDropdown, allowModify }) => {
  const addTag = id => async (e, { value }) => {
    if (!value) {
      return
    }
    e.preventDefault()
    const data = {
      studentId: id,
      tagId: value
    }
    await tagStudent(data)
  }

  const removeTag = (id, tag) => e => {
    e.preventDefault()
    const data = {
      studentId: id,
      tagId: tag || selectedTag
    }
    unTagStudent(data)
  }

  return (
    <Table.Cell>
      <span>
        {studentData.projectName}
        <br />
        <RepoLink url={studentData.github} />
        <div>
          {studentData.Tags.map(tag => (
            <span key={tag.id} style={{ float: 'left', marginRight: '0.33em' }}>
              <Button.Group className={'mini'}>
                <Button compact style={{ display: 'inline-block' }} className={`mini ui ${tag.color} button`} onClick={addFilterTag(tag)}>
                  {tag.name}
                </Button>
                {allowModify && (
                  <Button compact icon attached="right" className={`mini ui ${tag.color} button`} style={{ paddingLeft: 0, paddingRight: 0 }} onClick={removeTag(studentData.id, tag.id)}>
                    <Icon name="remove" />
                  </Button>
                )}
              </Button.Group>
            </span>
          ))}
        </div>
        {allowModify && (
          <Popup trigger={<Icon id={'tagModify'} onClick={changeHiddenTagDropdown(studentData.id)} name="add" color="green" style={{ float: 'right', fontSize: '1.25em' }} />} content="Add tag" />
        )}
      </span>
      {allowModify && (
        <div>
          {showTagDropdown === studentData.id ? (
            <div>
              <Dropdown
                id={'tagDropdown'}
                upward={false}
                style={{ float: 'left' }}
                selectOnBlur={false}
                options={dropDownTags}
                onChange={addTag(studentData.id)}
                placeholder="Choose tag"
                fluid
                selection
              />
            </div>
          ) : (
            <div />
          )}
        </div>
      )}
    </Table.Cell>
  )
}

const mapStateToProps = (state, ownProps) => {
  return {
    showTagDropdown: state.coursePageLogic.showTagDropdown,
    selectedTag: state.coursePageLogic.selectedTag,
    studentData: state.coursePage.data.find(student => student.id === ownProps.studentId)
  }
}

const mapDispatchToProps = {
  tagStudent,
  unTagStudent
}

ProjectInfoCell.propTypes = {
  studentData: PropTypes.object.isRequired,
  showTagDropdown: PropTypes.number.isRequired,
  tagStudent: PropTypes.func.isRequired,
  unTagStudent: PropTypes.func.isRequired,
  dropDownTags: PropTypes.array.isRequired,
  changeHiddenTagDropdown: PropTypes.func.isRequired,
  addFilterTag: PropTypes.func.isRequired,
  allowModify: PropTypes.bool.isRequired
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ProjectInfoCell)
