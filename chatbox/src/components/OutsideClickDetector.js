import React from "react"

class OutsideAlerter extends React.Component {
  constructor(props) {
    super(props)

    this.setWrapperRef = this.setWrapperRef.bind(this)
    this.handleClickOutside = this.handleClickOutside.bind(this)
  }

  componentDidMount() {
    document.addEventListener("mousedown", this.handleClickOutside)
  }

  componentWillUnmount() {
    document.removeEventListener("mousedown", this.handleClickOutside)
  }

  /**
   * Set the wrapper ref
   */
  setWrapperRef(node) {
    this.wrapperRef = node
  }

  /**
   * Alert if clicked on outside of element
   */
  handleClickOutside(event) {
    // console.log(event.target.className)
    if (
      event.target.className &&
      event.target.className.indexOf &&
      event.target.className.indexOf(this.props.exceptionClass) > -1
    )
      return
    if (this.wrapperRef && !this.wrapperRef.contains(event.target)) {
      this.props.close()
      event.isOutsideClick = true
    }
  }

  render() {
    return <div ref={this.setWrapperRef}>{this.props.children}</div>
  }
}

export default OutsideAlerter
