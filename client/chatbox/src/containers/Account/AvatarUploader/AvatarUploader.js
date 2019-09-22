import React from "react"
import ImageUploader from "react-images-upload"
import "./AvatarUploader.css"

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
        buttonText="选择图片"
        fileTypeError="文件类型不支持"
        fileSizeError="图片太大"
        onChange={this.onDrop}
        label="图片必须小于2MB"
        imgExtension={[".jpg", ".jpeg", ".png", ".gif"]}
        maxFileSize={5242880}
      />
    )
  }
}

export default App
