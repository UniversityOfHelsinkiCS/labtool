import React from 'react'
import PropTypes from 'prop-types'
import { Header, Segment, List } from 'semantic-ui-react'
import '../util/arrayFlatPolyfill'

const MissingMinimumRequirements = ({ selectedInstance, studentInstance, currentWeekChecks, showOnlyCurrentWeek, showMaximumGrade, onlyShowWeek }) => {
  const minimumRequirements = selectedInstance.checklists.reduce((map, checklist) => {
    Object.values(checklist.list).forEach(checklistCategory => {
      checklistCategory.forEach(checklistItem => {
        if (checklistItem.minimumRequirement) {
          map.set(checklistItem.id, { ...checklistItem, week: checklist.week })
        }
      })
    })
    return map
  }, new Map())

  const showWeek = week => !onlyShowWeek || week.weekNumber === onlyShowWeek

  const missingMinimumRequirementIds = [
    ...new Set(
      [...(showOnlyCurrentWeek ? [] : studentInstance.weeks.filter(showWeek)), { checks: currentWeekChecks ? currentWeekChecks : {} }]
        .map(week =>
          Object.entries(week.checks)
            .filter(([id, checked]) => minimumRequirements.has(Number(id)) && checked !== minimumRequirements.get(Number(id)).minimumRequirementMetIf)
            .map(([id]) => Number(id))
        )
        .flat()
    )
  ]

  if (missingMinimumRequirementIds.length === 0) {
    return null
  }

  const missingMinimumRequirements = missingMinimumRequirementIds.map(id => minimumRequirements.get(id)).sort((a, b) => a.week - b.week)

  const maximumGrade = Math.max(1, 5 - missingMinimumRequirements.reduce((a, b) => a + b.minimumRequirementGradePenalty, 0))

  return (
    <Segment align="left" style={{ marginTop: 20 }}>
      <Header as="h3">Missing minimum requirements</Header>
      <List bulleted>
        {missingMinimumRequirements.map(missingMinimumRequirement => (
          <List.Item key={missingMinimumRequirement.id}>{`${missingMinimumRequirement.name}: ${
            missingMinimumRequirement.minimumRequirementMetIf ? missingMinimumRequirement.textWhenOff : missingMinimumRequirement.textWhenOn
          }${!showOnlyCurrentWeek && !onlyShowWeek ? ` (${missingMinimumRequirement.week > selectedInstance.weekAmount ? 'final review' : `week ${missingMinimumRequirement.week}`})` : ''}`}</List.Item>
        ))}
      </List>
      <>
        <br />
        {showMaximumGrade ? (
          <p>
            Maximum grade: <strong>{maximumGrade}</strong>
          </p>
        ) : (
          selectedInstance.finalReview && maximumGrade < 5 && <p>If these requirements are not met by the time of the final review, they will have an effect on the final grade.</p>
        )}
      </>
    </Segment>
  )
}

MissingMinimumRequirements.propTypes = {
  selectedInstance: PropTypes.object,
  studentInstance: PropTypes.object,
  currentWeekChecks: PropTypes.object,
  onlyShowWeek: PropTypes.number,
  showOnlyCurrentWeek: PropTypes.bool,
  showMaximumGrade: PropTypes.bool
}

export default MissingMinimumRequirements
