import React from 'react'
import { Button, Form, Grid, Card, Icon, Popup } from 'semantic-ui-react'
import PropTypes from 'prop-types'
import { Points } from '../../Points'

export const ReviewStudentChecklist = props => {
  const { showOutput, checklist, checks, isChecked, toggleCheckbox, checklistOutput, checklistPoints, copyChecklistOutput, kind } = props

  const showCheck = clItem => clItem.prerequisite === null || isChecked(checks, clItem.prerequisite)
  const showCategory = category => checklist.list[category].some(showCheck)

  return checklist && checks !== undefined ? (
    <Grid.Column>
      <h2>Checklist</h2>
      {checklist ? (
        <div className="checklist">
          {Object.keys(checklist.list)
            .filter(showCategory)
            .map(clItemCategory => (
              <Card className="checklistCard" fluid color="red" key={clItemCategory}>
                <Card.Content header={clItemCategory} />
                {checklist.list[clItemCategory].filter(showCheck).map(clItem => (
                  <Card.Content className="checklistCardRow" key={clItem.id} onClick={toggleCheckbox(clItem.id)}>
                    <Form.Field>
                      <Grid>
                        <Grid.Row style={{ cursor: 'pointer', userSelect: 'none' }}>
                          <Grid.Column width={3}>
                            <Icon size="large" name={isChecked(checks, clItem.id) ? 'circle check outline' : 'circle outline'} style={{ color: isChecked(checks, clItem.id) ? 'green' : 'black' }} />
                          </Grid.Column>
                          <Grid.Column width={10}>
                            <span style={{ flexGrow: 1, textAlign: 'center' }}>{clItem.name}</span>
                          </Grid.Column>
                          <Grid.Column width={3}>
                            {!clItem.minimumRequirement ? (
                              <span>{`${clItem.checkedPoints} p / ${clItem.uncheckedPoints} p`}</span>
                            ) : (
                              <>
                                <Popup
                                  trigger={<Icon name="thumb tack" color="blue" size="big" />}
                                  content={`This is a minimum requirement that is met when ${clItem.minimumRequirementMetIf ? 'checked' : 'not checked'}; if not met, the final grade will drop by ${
                                    clItem.minimumRequirementGradePenalty
                                  }`}
                                />
                                Requirement
                              </>
                            )}
                          </Grid.Column>
                        </Grid.Row>
                      </Grid>
                    </Form.Field>
                  </Card.Content>
                ))}
              </Card>
            ))}
          <div>
            <Form className="checklistOutput" onSubmit={copyChecklistOutput}>
              {showOutput && <Form.TextArea className="checklistOutputText" name="text" value={checklistOutput} style={{ width: '100%', height: '250px' }} />}
              <p className="checklistOutputPoints">
                points: <Points points={checklistPoints} />
              </p>
              <input type="hidden" name="points" value={checklistPoints} />
              <Button type="submit">{showOutput ? 'Copy to review fields' : 'Copy to review field'}</Button>
            </Form>
          </div>
        </div>
      ) : (
        <p>There is no checklist for this {kind}.</p>
      )}
    </Grid.Column>
  ) : (
    <div />
  )
}
ReviewStudentChecklist.propTypes = {
  showOutput: PropTypes.bool.isRequired,
  checklist: PropTypes.object,
  checks: PropTypes.object,
  checklistOutput: PropTypes.string,
  checklistPoints: PropTypes.number,

  kind: PropTypes.string.isRequired,
  isChecked: PropTypes.func.isRequired,
  toggleCheckbox: PropTypes.func.isRequired,
  copyChecklistOutput: PropTypes.func.isRequired
}

export default ReviewStudentChecklist
