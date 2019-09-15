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
    window.addEventListener('scroll', this.updateSticky.bind(this))
    this.updateSticky()
  }
  componentWillUnmount() {
    window.removeEventListener('scroll', this.updateSticky.bind(this))
  }

  maybeResizeBar() {
    if (this.content && this.scrollbar) {
      const oldScrollLeft = this.scrollbar.scrollLeft
      this.scrollbar.style.maxWidth = `${this.content.offsetWidth}px`
      this.scrollbar.children[0].style.width = `${this.content.scrollWidth}px`
      this.scrollbar.children[0].style.height = '1px'
      this.scrollbar.scrollLeft = oldScrollLeft
    }
  }

  updateScrollX(e) {
    const newX = e.target.scrollLeft
    this.maybeResizeBar()
    if (this.content) this.content.scrollLeft = newX
    if (this.scrollbar) this.scrollbar.scrollLeft = newX
  }

  updateSticky() {
    if (this.content && this.scrollbar) {
      const windowTop = document.documentElement.scrollTop
      const windowBottom = windowTop + window.innerHeight
      const contentTop = this.content.offsetTop
      const contentBottom = contentTop + this.content.clientHeight

      const pastTableTop = windowBottom >= contentTop
      const pastTableBottom = windowBottom >= contentBottom

      const makeSticky = pastTableTop && !pastTableBottom
      if (makeSticky) {
        this.scrollbar.style.position = 'fixed'
        this.scrollbar.style.bottom = '0px'
      } else {
        this.scrollbar.style.position = 'relative'
        this.scrollbar.style.bottom = 'none'
      }
    }
  }

  render() {
    return (
      <span>
        <div ref={this.mainElementReady} onScroll={this.updateScrollX.bind(this)} style={{ overflowX: 'hidden' }}>
          {this.props.children}
        </div>
        <div ref={this.scrollBarReady} onScroll={this.updateScrollX.bind(this)} style={{ overflowX: 'scroll', bottom: '0', position: 'sticky' }}>
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
