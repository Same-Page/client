import React, { forwardRef } from "react"
import ImageUploader from "react-images-upload"
import "./AvatarUploader.css"
import { injectIntl } from "react-intl"

class App extends React.Component {
  constructor(props) {
    super(props)
    this.state = { pictures: [] }
    this.onDrop = this.onDrop.bind(this)
  }

  onDrop(picture) {
    // console.log(picture)
    this.setState({
      pictures: picture
    })
    this.props.setFile(picture[0])
  }

  render() {
    // this lib isn't easy to customize at all
    // had to use class to toggle upload button!
    let alreadySelectedImageClassName = ""
    if (this.state.pictures.length) {
      alreadySelectedImageClassName = "sp-selected-avatar"
    }

    return (
      <ImageUploader
        className={alreadySelectedImageClassName}
        singleImage={true}
        buttonClassName="ant-btn"
        withPreview={true}
        withIcon={false}
        withLabel={false}
        buttonText={this.props.intl.formatMessage({ id: "choose.image" })}
        fileTypeError={this.props.intl.formatMessage({
          id: "unsupported.file.type"
        })}
        fileSizeError={this.props.intl.formatMessage({ id: "file.too.big" })}
        onChange={this.onDrop}
        label={
          this.props.intl.formatMessage({ id: "file.must.smaller.than" }) +
          "2MB"
        }
        imgExtension={[".jpg", ".jpeg", ".png", ".gif"]}
        maxFileSize={5242880}
      />
    )
  }
}

const IntlWrapper = injectIntl(App)
export default forwardRef((props, ref) => (
  <IntlWrapper {...props} innerRef={ref}></IntlWrapper>
))
