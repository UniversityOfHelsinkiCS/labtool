import React from 'react'
import PropTypes from 'prop-types'
import { Label, Button } from 'semantic-ui-react'

const TagFilter = ({ dropDownFilterTags, selectedFilterTags, addFilterTag }) => (
  <>
    <span> Tag filters: </span>
    {dropDownFilterTags.length === 0 ? (
      <span>
        <Label>none</Label>
      </span>
    ) : (
      <span>
        {dropDownFilterTags.map(tag => (
          <span key={tag.id}>
            <Button compact className={`mini ui ${tag.color} button ${!selectedFilterTags.find(t => t.id === tag.id) ? 'basic' : ''}`} onClick={addFilterTag(tag)}>
              {tag.name}
            </Button>
          </span>
        ))}
      </span>
    )}
  </>
)

TagFilter.propTypes = {
  dropDownFilterTags: PropTypes.array.isRequired,
  selectedFilterTags: PropTypes.array.isRequired,
  addFilterTag: PropTypes.func.isRequired
}

export default TagFilter
