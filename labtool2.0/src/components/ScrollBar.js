import React from 'react'
import { withRouter } from 'react-router'
import { connect } from 'react-redux'

export class ScrollBar extends React.Component {
  constructor(props) {
    super(props);
    this.scrollbar = React.createRef();
  }

  componentDidMount() {
    if (this.props.scrollable)
      this.props.scrollable.addEventListener("scroll", this.updateScrollX)
  }

  updateScrollX(e) {
    const newX = e.target.scrollLeft
    const scrollbar = this.props.scrollbar.current
    if (this.props.scrollable)
      this.props.scrollable.scrollLeft = newX
    if (scrollbar)
      scrollbar.current.scrollLeft = newX
  }

  render() {
    return (
      <div onScroll={this.updateScrollX} style={{ width: this.props.scrollable.innerWidth + 'px', overflowX: 'scroll' }}>
        <p></p>
      </div>
    )
  }
}

const mapStateToProps = (state, ownProps) => {
  return {
  }
}

const mapDispatchToProps = {
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ScrollBar)
