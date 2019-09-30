import React, { useEffect } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'

export const HorizontalScrollable = props => {
  let content = null
  let scrollbar = null
  let lastWidth = null
  const antibounce = {}

  const mainElementReady = element => {
    content = element
    maybeResizeBar()
  }
  const scrollBarReady = element => {
    scrollbar = element
    maybeResizeBar()
  }
  const onResize = () => {
    maybeResizeBar()
    updateSticky()
  }

  useEffect(() => {
    window.addEventListener('scroll', updateSticky)
    window.addEventListener('resize', onResize)
    onResize()

    return () => {
      window.removeEventListener('scroll', updateSticky)
      window.removeEventListener('resize', onResize)
    }
  }, [])

  const maybeResizeBar = () => {
    if (content && scrollbar && (lastWidth === null || lastWidth !== content.offsetWidth)) {
      // make scrollable range as wide as table itself, but keep the
      // scroll bar width as the viewable width of the table
      const oldScrollLeft = scrollbar.scrollLeft
      scrollbar.style.width = scrollbar.style.maxWidth = `${content.offsetWidth}px`
      scrollbar.children[0].style.width = `${content.scrollWidth}px`
      scrollbar.children[0].style.height = '1px'
      scrollbar.scrollLeft = oldScrollLeft
      scrollbar.style.overflowX = content.scrollWidth > content.offsetWidth ? 'scroll' : 'auto'
      lastWidth = content.offsetWidth
    }
  }

  const updateScrollX = doNotUpdate => e => {
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
    if (antibounce[doNotUpdate]) {
      antibounce[doNotUpdate] = false
      return
    }

    if (doNotUpdate !== 'content' && content) {
      antibounce.content = true
      content.scrollLeft = newX
    }
    if (doNotUpdate !== 'scrollbar' && scrollbar) {
      antibounce.scrollbar = true
      scrollbar.scrollLeft = newX
    }
  }

  const updateSticky = () => {
    if (content && scrollbar) {
      // viewport viewable range of Y: [windowTop, windowBottom[
      const windowTop = document.documentElement.scrollTop
      const windowBottom = windowTop + window.innerHeight

      // top and bottom Y coordinates of table
      const contentTop = content.offsetTop
      const contentBottom = contentTop + content.clientHeight

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
        scrollbar.style.position = 'fixed'
        scrollbar.style.bottom = '0px'
      } else {
        // relative: display where it would be otherwise
        scrollbar.style.position = 'relative'
        scrollbar.style.bottom = 'none'
      }
    }
  }

  return (
    <span>
      <div ref={mainElementReady} onScroll={updateScrollX('content')} style={{ overflowX: 'hidden' }}>
        {props.children}
      </div>
      <div ref={scrollBarReady} onScroll={updateScrollX('scrollbar')} style={{ overflowX: 'scroll', bottom: '0', position: 'sticky' }}>
        <div />
      </div>
    </span>
  )
}

HorizontalScrollable.propTypes = {
  children: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.node), PropTypes.node])
}

export default connect(
  null,
  {}
)(HorizontalScrollable)
