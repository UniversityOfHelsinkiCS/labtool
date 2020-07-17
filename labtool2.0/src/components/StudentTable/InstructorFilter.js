import React from 'react'
import PropTypes from 'prop-types'
import { Dropdown } from 'semantic-ui-react'

// calculate the length of the longest text in a drop down
const getBiggestWidthInDropdown = dropdownList => {
  if (dropdownList.length === 0) {
    return 3
  }
  const lengths = dropdownList.map(dp => dp.text.length)
  return lengths.reduce((longest, comp) => (longest > comp ? longest : comp))
}

const InstructorFilter = ({ dropDownFilterTeachers, changeFilterAssistant, defaultValue }) => (
  <span>
    <span>Filter by instructor: </span>
    <Dropdown
      scrolling
      options={dropDownFilterTeachers}
      onChange={changeFilterAssistant}
      placeholder="Select Teacher"
      defaultValue={defaultValue}
      selection
      style={{ width: `${getBiggestWidthInDropdown(dropDownFilterTeachers)}em` }}
    />
  </span>
)

InstructorFilter.propTypes = {
  dropDownFilterTeachers: PropTypes.array.isRequired,
  changeFilterAssistant: PropTypes.func.isRequired,
  defaultValue: PropTypes.number.isRequired
}

export default InstructorFilter
