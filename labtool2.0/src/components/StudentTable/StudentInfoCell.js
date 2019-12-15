import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { Link } from 'react-router-dom'
import { Table, Popup, Icon } from 'semantic-ui-react'
import { updateStudentProjectInfo } from '../../services/studentinstances'
import { RepoAccessWarning } from '../RepoAccessWarning'

export const StudentInfoCell = ({ ohid, studentData, extraStudentIcon, allowReview, updateStudentProjectInfo }) => (
  <Table.Cell>
    {!studentData.validRegistration && <Popup trigger={<Icon name="warning" color="black" />} content="This student's registration has been marked as mistaken" />}
    {!studentData.dropped && studentData.validRegistration && studentData.repoExists === false && (
      <RepoAccessWarning student={studentData} ohid={ohid} updateStudentProjectInfo={updateStudentProjectInfo} />
    )}
    {allowReview ? (
      <Link to={`/labtool/browsereviews/${ohid}/${studentData.id}`}>
        <Popup
          trigger={
            <span>
              {extraStudentIcon && extraStudentIcon(studentData)}
              {studentData.User.firsts} {studentData.User.lastname}
              <br />({studentData.User.studentNumber})
            </span>
          }
          content={studentData.dropped ? 'Review student (this student has dropped out)' : 'Review student'}
        />
      </Link>
    ) : (
      <span>
        {extraStudentIcon && extraStudentIcon(studentData)}
        {studentData.User.firsts} {studentData.User.lastname}
        <br />({studentData.User.studentNumber})
      </span>
    )}
  </Table.Cell>
)

const mapStateToProps = (state, ownProps) => {
  return {
    ohid: state.selectedInstance.ohid,
    studentData: state.coursePage.data.find(student => student.id === ownProps.studentId)
  }
}

const mapDispatchToProps = {
  updateStudentProjectInfo
}

StudentInfoCell.propTypes = {
  ohid: PropTypes.string.isRequired,
  studentData: PropTypes.object.isRequired,
  extraStudentIcon: PropTypes.func,
  allowReview: PropTypes.bool,
  updateStudentProjectInfo: PropTypes.func
}

export default connect(mapStateToProps, mapDispatchToProps)(StudentInfoCell)
