import React from 'react'
import { connect } from 'react-redux'

export class HorizontalScrollable extends React.Component {
  constructor(props) {
    super(props)
    this.content = null
    this.scrollbar = null

    this.mainElementReady = element => {
      this.content = element
      this.maybeResizeBar()
    }
    this.scrollBarReady = element => {
      this.scrollbar = element
      this.maybeResizeBar()
    }
  }

  componentDidMount() {
    window.addEventListener('scroll', this.updateSticky)
    window.addEventListener('resize', this.onResize)
    this.onResize()
  }
  componentWillUnmount() {
    window.removeEventListener('scroll', this.updateSticky)
    window.removeEventListener('resize', this.onResize)
  }

  onResize = () => {
    this.maybeResizeBar()
    this.updateSticky()
  }

  maybeResizeBar = () => {
    if (this.content && this.scrollbar && this.content.offsetWidth !== this.scrollbar.style.width) {
      // make scrollable range as wide as table itself, but keep the
      // scroll bar width as the viewable width of the table
      const oldScrollLeft = this.scrollbar.scrollLeft
      this.scrollbar.style.width = this.scrollbar.style.maxWidth = `${this.content.offsetWidth}px`
      this.scrollbar.children[0].style.width = `${this.content.scrollWidth}px`
      this.scrollbar.children[0].style.height = '1px'
      this.scrollbar.scrollLeft = oldScrollLeft
      this.scrollbar.style.overflowX = this.content.scrollWidth > this.content.offsetWidth ? 'scroll' : 'auto'
    }
  }

  updateScrollX = e => {
    // synchronize scroll positions
    const newX = e.target.scrollLeft
    if (this.content) this.content.scrollLeft = newX
    if (this.scrollbar) this.scrollbar.scrollLeft = newX
  }

  updateSticky = () => {
    if (this.content && this.scrollbar) {
      // viewport viewable range of Y: [windowTop, windowBottom[
      const windowTop = document.documentElement.scrollTop
      const windowBottom = windowTop + window.innerHeight

      // top and bottom Y coordinates of table
      const contentTop = this.content.offsetTop
      const contentBottom = contentTop + this.content.clientHeight

      // the table is visible on or above the viewport?
      const pastTableTop = windowBottom >= contentTop
      // the scroll bar is below the viewport?
      const pastTableBottom = windowBottom >= contentBottom

      // we want to display the scroll bar on the screen if
      //   1. the table is visible on or above the viewport (pastTableTop)
      //   2. the scroll bar is *not* below the viewport (!pastTableBottom)
      const makeSticky = pastTableTop && !pastTableBottom
      if (makeSticky) {
        // sticky: fix to bottom of viewport
        this.scrollbar.style.position = 'fixed'
        this.scrollbar.style.bottom = '0px'
      } else {
        // relative: display where it would be otherwise
        this.scrollbar.style.position = 'relative'
        this.scrollbar.style.bottom = 'none'
      }
    }
  }

  render() {
    return (
      <span>
        <div ref={this.mainElementReady} onScroll={this.updateScrollX} style={{ overflowX: 'hidden' }}>
          {this.props.children}
        </div>
        <div ref={this.scrollBarReady} onScroll={this.updateScrollX} style={{ overflowX: 'scroll', bottom: '0', position: 'sticky' }}>
          <div />
        </div>
      </span>
    )
  }
}

export default connect(
  null,
  {}
)(HorizontalScrollable)
