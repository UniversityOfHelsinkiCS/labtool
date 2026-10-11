import React, { useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { Button, Loader } from 'semantic-ui-react'
import { getOneCI, coursePageInformation } from '../../services/courseInstance'
import { getChangeLog } from '../../services/changeLog'
import { resetLoading } from '../../reducers/loadingReducer'
import ChangeHistory from '../ChangeHistory'
import BackButton from '../BackButton'
import DocumentTitle from '../DocumentTitle'

const FILTERS = [
  { key: 'all', text: 'All', kinds: null },
  { key: 'week', text: 'Week reviews', kinds: ['week_review'] },
  { key: 'codeReview', text: 'Code reviews', kinds: ['code_review_grade'] },
  { key: 'repository', text: 'Repository', kinds: ['repository'] }
]

/**
 * All recorded changes of one student's grading and repository (#1129, #1132), for course staff.
 */
export const StudentChangeHistory = props => {
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    props.resetLoading()
    props.getOneCI(props.courseId)
    props.coursePageInformation(props.courseId)
    props.getChangeLog(props.studentInstance)
  }, [])

  const { courseData, selectedInstance } = props
  if (props.loading.loading || !Array.isArray(courseData.data)) {
    return <Loader active />
  }
  const student = courseData.data.find(s => s.id === Number(props.studentInstance))
  const name = student ? `${student.User.firsts} ${student.User.lastname}` : 'Student'

  const subjectOf = entry => {
    if (entry.kind === 'repository') return 'Repository'
    if (entry.kind === 'code_review_grade') return `Code review ${entry.number}`
    return entry.number > selectedInstance.weekAmount ? 'Final review' : `Week ${entry.number}`
  }
  const { kinds } = FILTERS.find(f => f.key === filter)
  const entries = kinds ? props.changeLog.filter(entry => kinds.includes(entry.kind)) : props.changeLog

  return (
    <div className="StudentChangeHistory" style={{ maxWidth: '900px', margin: '0 auto' }}>
      <DocumentTitle title={`Change history - ${name}`} />
      <BackButton preset="coursePage" />
      <h2>Change history: {name}</h2>
      {student && (
        <p>
          {selectedInstance.name} · {student.projectName}
        </p>
      )}
      <Button.Group size="small" className="changeHistoryFilters">
        {FILTERS.map(f => (
          <Button key={f.key} type="button" active={filter === f.key} onClick={() => setFilter(f.key)}>
            {f.text}
          </Button>
        ))}
      </Button.Group>
      <ChangeHistory title={`${entries.length} recorded changes`} entries={entries} subjectOf={subjectOf} />
    </div>
  )
}

StudentChangeHistory.propTypes = {
  courseId: PropTypes.string.isRequired,
  studentInstance: PropTypes.string.isRequired,

  courseData: PropTypes.object.isRequired,
  selectedInstance: PropTypes.object.isRequired,
  changeLog: PropTypes.array.isRequired,
  loading: PropTypes.object.isRequired,

  getOneCI: PropTypes.func.isRequired,
  coursePageInformation: PropTypes.func.isRequired,
  getChangeLog: PropTypes.func.isRequired,
  resetLoading: PropTypes.func.isRequired
}

const mapStateToProps = state => ({
  courseData: state.coursePage,
  selectedInstance: state.selectedInstance,
  changeLog: state.changeLog.entries,
  loading: state.loading
})

export default connect(mapStateToProps, { getOneCI, coursePageInformation, getChangeLog, resetLoading })(
  StudentChangeHistory
)
