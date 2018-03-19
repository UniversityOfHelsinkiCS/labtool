import React from 'react'
import { Table } from 'semantic-ui-react'

const CoursePage = ({ name, start, end, week_amount, week_max_points, current_week, handleFieldChange }) => {
    return (
        <div className="CoursePage" style={{ textAlignVertical: 'center', textAlign: 'center', }}>
            <h2>TiraLabra 2018</h2>
            <Table striped celled size="small">
                <Table.Header>
                    <Table.Row>
                        <Table.HeaderCell>Name</Table.HeaderCell>
                        <Table.HeaderCell>Week 1</Table.HeaderCell>
                        <Table.HeaderCell>Week 2</Table.HeaderCell>
                        <Table.HeaderCell>Week 3</Table.HeaderCell>
                        <Table.HeaderCell>Week 4</Table.HeaderCell>
                        <Table.HeaderCell>Week 5</Table.HeaderCell>
                    </Table.Row>
                </Table.Header>
                <Table.Body>
                    <Table.Row key={name}>
                        <Table.Cell>
                            <p> pekka </p>
                        </Table.Cell>
                        <Table.Cell>
                            <p> aa </p>
                        </Table.Cell>
                        <Table.Cell>
                            <p> aa </p>
                        </Table.Cell>
                        <Table.Cell>
                            <p> aa </p>
                        </Table.Cell>
                        <Table.Cell>
                            <p> aab </p>
                        </Table.Cell>
                    </Table.Row>

                </Table.Body>

            </Table>

        </div >

    )
}

export default CoursePage