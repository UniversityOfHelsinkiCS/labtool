import React from 'react'
import { Table } from 'semantic-ui-react'

const CoursePage = ({ name, start, end, week_amount, week_max_points, current_week, handleFieldChange }) => {
    return (
        <div className="CoursePage" style={{ textAlignVertical: 'center', textAlign: 'center', }}>
            <h2>TiraLabra 2018</h2>
            <Table striped celled>
                <Table.Body>
                    <Table.Row key={name}>
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