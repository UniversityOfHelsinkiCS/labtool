import React from 'react'
import { Button, Icon } from 'semantic-ui-react'
import PropTypes from 'prop-types'

export const TagLabel = props => {
  const { color, text, handleClick, tag, basic, removeLabel } = props
  const validColors = ['red', 'orange', 'yellow', 'olive', 'green', 'teal', 'blue', 'violet', 'purple', 'pink', 'brown', 'grey', 'black']

  const tagColor = tag ? tag.color : color
  const tagText = tag ? tag.name : text

  const backgroundColor = backgroundColor => {
    return `${validColors.includes(backgroundColor) ? '' : backgroundColor}`
  }

  const borderColor = backgroundColor => {
    if (!basic) return null
    if (validColors.includes(backgroundColor)) return null
    return `1px solid ${backgroundColor}`
  }

  const hexToRgb = hex => {
    hex = '0x' + hex.substring(1, 7)
    let r = (hex >> 16) & 0xff
    let g = (hex >> 8) & 0xff
    let b = hex & 0xff
    return [r, g, b]
  }

  /**
   * If background color is hexcode, use this function to define text color.
   * @param {*} backgroundColor
   */
  const textColor = backgroundColor => {
    if (validColors.includes(backgroundColor)) return null
    if (basic) return 'black'
    const rgb = hexToRgb(backgroundColor)
    const rgbSum = Math.round((parseInt(rgb[0]) * 299 + parseInt(rgb[1]) * 587 + parseInt(rgb[2]) * 114) / 1000)
    return rgbSum > 125 ? 'black' : 'white'
  }

  if (removeLabel) {
    return (
      <Button
        compact
        icon
        attached="right"
        size="mini"
        style={{ paddingLeft: 0, paddingRight: 0, backgroundColor: `${backgroundColor(tagColor)}` }}
        color={validColors.includes(tagColor) ? tagColor : null}
        onClick={handleClick}
      >
        <Icon name="remove" style={{ color: `${textColor(tagColor)}` }} />
      </Button>
    )
  }

  return (
    <Button
      compact
      basic={basic}
      color={validColors.includes(tagColor) ? tagColor : null}
      size="mini"
      style={{
        display: tagText ? 'inline-block' : 'none',
        border: `${borderColor(tagColor)}`,
        backgroundColor: `${backgroundColor(tagColor)}`
      }}
      onClick={handleClick}
    >
      <p style={{ color: `${textColor(tagColor)}` }}>{tagText}</p>
    </Button>
  )
}

TagLabel.propTypes = {
  color: PropTypes.string,
  text: PropTypes.string,
  handleClick: PropTypes.func,
  tag: PropTypes.object,
  basic: PropTypes.bool,
  removeLabel: PropTypes.bool
}
