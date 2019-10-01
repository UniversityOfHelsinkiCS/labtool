import React from 'react'
import { connect } from 'react-redux'

export class HorizontalScrollable extends React.Component {
  constructor(props) {
    super(props)
    this.content = null
    this.scrollbar = null
    this.lastWidth = null
    this.antibounce = {}

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
    if (this.content && this.scrollbar && (this.lastWidth === null || this.lastWidth !== this.content.offsetWidth)) {
      // make scrollable range as wide as table itself, but keep the
      // scroll bar width as the viewable width of the table
      const oldScrollLeft = this.scrollbar.scrollLeft
      this.scrollbar.style.width = this.scrollbar.style.maxWidth = `${this.content.offsetWidth}px`
      this.scrollbar.children[0].style.width = `${this.content.scrollWidth}px`
      this.scrollbar.children[0].style.height = '1px'
      this.scrollbar.scrollLeft = oldScrollLeft
      this.scrollbar.style.overflowX = this.content.scrollWidth > this.content.offsetWidth ? 'scroll' : 'auto'
      this.lastWidth = this.content.offsetWidth
    }
  }

  updateScrollX = doNotUpdate => e => {
    // synchronize scroll positions
    const newX = e.target.scrollLeft

    /*
    antibounce.
    this is to prevent from "bouncing" back and forth. for example:

    1. scroll the scrollbar. onscroll is called for the scrollbar.
    2. to synchronize, we cause the content to scroll.
    3. onscroll is called for content. we now scroll the scrollbar instead.

    this is bad, because setting scrollLeft also removes any "velocity"
    the scroll bar has, meaning that mouse wheel scrolling or scrolling by
    clicking the scroll bar will stop almost immediately, scrolling only a
    small distance.

    by preventing bouncing of the event, we let either scroll freely at a time.
    */
    if (this.antibounce[doNotUpdate]) {
      this.antibounce[doNotUpdate] = false
      return
    }

    if (doNotUpdate !== 'content' && this.content) {
      this.antibounce.content = true
      this.content.style.marginLeft = `-${newX}px`
    }
    if (doNotUpdate !== 'scrollbar' && this.scrollbar) {
      this.antibounce.scrollbar = true
      this.scrollbar.scrollLeft = newX
    }
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
    // marginBottom, paddingBottom hack adds unused "overflowable" space
    return (
      <div style={{ overflowX: 'hidden', marginBottom: '-200vh', paddingBottom: '200vh' }}>
        <div ref={this.mainElementReady} onScroll={this.updateScrollX('content')} style={{ overflowX: 'visible', overflowY: 'visible' }}>
          {this.props.children}
        </div>
        <div ref={this.scrollBarReady} onScroll={this.updateScrollX('scrollbar')} style={{ overflowX: 'scroll', bottom: '0', position: 'sticky' }}>
          <div />
        </div>
      </div>
    )
  }
}

export default connect(
  null,
  {}
)(HorizontalScrollable)
