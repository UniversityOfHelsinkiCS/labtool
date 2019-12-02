import React from 'react'
import PropTypes from 'prop-types'
import { Header, Segment, List } from 'semantic-ui-react'

const MissingMinimumRequirements = ({ selectedInstance, studentInstance, currentWeekChecks }) => {
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

  const missingMinimumRequirements = [...studentInstance.weeks, { checks: !!currentWeekChecks ? currentWeekChecks : {} }]
    .map(week =>
      Object.entries(week.checks)
        .filter(([id, checked]) => !checked && minimumRequirements.has(Number(id)))
        .map(([id]) => Number(id))
    )
    .flat()
    .map(id => minimumRequirements.get(id))
    .sort((a, b) => a.week - b.week)

  if (missingMinimumRequirements.length === 0) {
    return null
  }

  return (
    <Segment align="left" style={{ marginTop: 20 }}>
      <Header as="h3">Missing minimum requirements</Header>
      <List bulleted>
        {missingMinimumRequirements.map(missingMinimumRequirement => (
          <List.Item key={missingMinimumRequirement.id}>{`${missingMinimumRequirement.name}: ${missingMinimumRequirement.textWhenOff} (${
            missingMinimumRequirement.week > selectedInstance.weekAmount ? 'final review' : `week ${missingMinimumRequirement.week}`
          })`}</List.Item>
        ))}
      </List>
      <br />
      <p>
        Maximum grade: <strong>{Math.max(1, 5 - missingMinimumRequirements.length)}</strong>
      </p>
    </Segment>
  )
}

MissingMinimumRequirements.propTypes = {
  selectedInstance: PropTypes.object,
  studentInstance: PropTypes.object,
  currentWeekChecks: PropTypes.object
}

export default MissingMinimumRequirements
