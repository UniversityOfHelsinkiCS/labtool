import React, { useEffect } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'

export const HorizontalScrollable = props => {
  let container = null
  let content = null
  let scrollbar = null
  const antibounce = {}
  let iconUpdateTimer = null

  const isMobile = () => {
    return window.matchMedia('(max-width: 768px)').matches
  }

  const onKeyDownScroll = e => {
    if (!scrollbar) {
      return
    }

    const targetElement = scrollbar.children[0]

    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
      // forward key event to target element to trigger scroll
      // tabIndex necessary for focus, which is necessary for key events
      targetElement.tabIndex = 0
      targetElement.focus()
      targetElement.dispatchEvent(new KeyboardEvent('keydown', { key: e.key }))
    }
  }

  const mainElementReady = element => {
    if (content) {
      // remove listener from outgoing element
      content.children[0].removeEventListener('keydown', onKeyDownScroll)
    }
    content = element
    if (content) {
      content.style.position = 'relative'
      // tabIndex necessary for focus, which is necessary for key events
      content.children[0].tabIndex = 0
      // add listener to incoming element
      content.children[0].addEventListener('keydown', onKeyDownScroll)
    }
    resizeBar()
  }
  const scrollBarReady = element => {
    scrollbar = element
    resizeBar()
    updateSticky()
  }
  const containerReady = element => {
    container = element
  }
  const onResize = () => {
    resizeBar()
    updateSticky()

    setTimeout(() => resizeBar(), 100)
  }

  useEffect(() => {
    window.addEventListener('scroll', updateSticky)
    window.addEventListener('resize', onResize)
    document.documentElement.addEventListener('resize', onResize)
    onResize()

    return () => {
      window.removeEventListener('scroll', updateSticky)
      window.removeEventListener('resize', onResize)
      document.documentElement.removeEventListener('resize', onResize)
    }
  })

  const resizeBar = () => {
    if (container && content && scrollbar) {
      const viewWidth = container.offsetWidth
      const contentWidth = content.scrollWidth
      // make scrollable range as wide as table itself, but keep the
      // scroll bar width as the viewable width of the table
      const oldScrollLeft = scrollbar.scrollLeft

      scrollbar.style.width = scrollbar.style.maxWidth = `${viewWidth}px`
      scrollbar.children[0].style.width = `${contentWidth}px`
      scrollbar.children[0].style.height = '1px'

      scrollbar.style.overflowX = contentWidth > viewWidth ? 'scroll' : 'auto'
      scrollbar.scrollLeft = oldScrollLeft
      setContentScroll(scrollbar.scrollLeft)
    }
  }

  const setContentScroll = x => {
    // use translateX because a repaint is way faster than a reflow caused by using .left
    window.requestAnimationFrame(() => (content ? content.style.transform = `translateX(-${x}px)` : null))
  }

  const iconRefresh = () => {
    // pick one icon in the table and mess with it to force an update
    const icon = document.querySelector('.horizontalScrollableParent .icon')
    const display = icon.style.display
    const frobulate = (() => {})

    icon.style.display = 'none'
    frobulate(icon.offsetHeight)
    icon.style.display = display
    frobulate(icon.offsetHeight)
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
      setContentScroll(newX)
    }
    if (doNotUpdate !== 'scrollbar' && scrollbar) {
      antibounce.scrollbar = true
      scrollbar.scrollLeft = newX
    }
    
    // try updating icons. on Chrome, they wouldn't move when using transforms
    // use debouncing to prevent performance issues
    if (iconUpdateTimer) {
      clearTimeout(iconUpdateTimer)
    }
    iconUpdateTimer = setTimeout(iconRefresh, 50)
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
        scrollbar.style.zIndex = '1000'
      } else {
        // relative: display where it would be otherwise
        scrollbar.style.position = 'relative'
        scrollbar.style.bottom = 'none'
        scrollbar.style.zIndex = 'auto'
      }
    }
  }

  // on mobile, we can flick scroll, so rely on native scrolling
  if (isMobile()) {
    return <div style={{ overflowX: 'scroll', overflowY: 'visible' }}>{props.children}</div>
  }

  // marginBottom, paddingBottom hack adds unused "overflowable" space
  // this causes issues in Firefox (it shows up as scrollable), so
  // the parent page should define overflowY: hidden and add some extra
  // <br />s to the bottom
  return (
    <div className="horizontalScrollableParent" ref={containerReady} style={{ overflow: 'hidden', boxSizing: 'border-box', marginBottom: '-50vh', paddingBottom: '50vh' }}>
      <div ref={mainElementReady} onScroll={updateScrollX('content')} style={{ overflowX: 'visible', overflowY: 'visible' }}>
        {props.children}
      </div>
      <div ref={scrollBarReady} onScroll={updateScrollX('scrollbar')} style={{ overflowX: 'scroll', bottom: '0', position: 'sticky' }}>
        <div />
      </div>
    </div>
  )
}

HorizontalScrollable.propTypes = {
  children: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.node), PropTypes.node])
}

export default connect(
  null,
  {}
)(HorizontalScrollable)
