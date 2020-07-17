import React from 'react'
import PropTypes from 'prop-types'
import { Label } from 'semantic-ui-react'
import { TagLabel } from '../TagLabel'

const TagFilter = ({ dropDownFilterTags, selectedFilterTags, addFilterTag, usedTags }) => {
  return (
    <>
      <span> Tag filters: </span>
      {dropDownFilterTags.length === 0 ? (
        <span>
          <Label>none</Label>
        </span>
      ) : (
        <span className="tagFilter">
          {dropDownFilterTags.map(tag => (
            <span key={tag.id}>
              <TagLabel tag={tag} basic={!selectedFilterTags.find(t => t.id === tag.id)} handleClick={addFilterTag(tag)} disabled={!usedTags.has(tag.id)} />
            </span>
          ))}
        </span>
      )}
    </>
  )
}

TagFilter.propTypes = {
  dropDownFilterTags: PropTypes.array.isRequired,
  selectedFilterTags: PropTypes.array.isRequired,
  addFilterTag: PropTypes.func.isRequired,
  usedTags: PropTypes.object.isRequired
}

export default TagFilter
