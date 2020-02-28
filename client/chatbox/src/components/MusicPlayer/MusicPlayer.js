import "video.js/dist/video-js.css"
import "./MusicPlayer.css"
import React from "react"
import videojs from "video.js"
// import "videojs-playlist"
import "videojs-youtube"
import "videojs-flash"

class VideoPlayer extends React.Component {
  componentDidMount() {
    // instantiate Video.js
    this.player = videojs(this.videoNode, this.props, function onPlayerReady() {
      // console.log("onPlayerReady", this)
    })
    // this.props.setPlayer(this.player)
    this.props.playerRef.current = this.player

    var myButton = this.player.controlBar.addChild("button")
    // There are many functions available for button component
    // like below mentioned in this docs
    // https://docs.videojs.com/button.
    // You can set attributes and clasess as well.

    // Getting html DOM
    var myButtonDom = myButton.el()
    // Since now you have the html dom element
    // you can add click events

    // Now I am setting the text as you needed.
    myButtonDom.innerHTML = "X"
    myButtonDom.className = "vjs-play-control media-close-button"
    myButtonDom.onclick = this.props.closePlayer

    // window.player = this.player
    // window.playMedia = src => {
    //   window.player.src(src)
    //   window.player.play()
    // }

    // var player = videojs("myvideo")
  }

  // destroy player on unmount
  componentWillUnmount() {
    if (this.player) {
      this.player.dispose()
      // this.props.setPlayer(null)
      this.props.playerRef.current = null
      // window.player = null
    }
  }

  // wrap the player in a div with a `data-vjs-player` attribute
  // so videojs won't create additional wrapper in the DOM
  // see https://github.com/videojs/video.js/pull/3856
  render() {
    let className = "video-js"
    // if (!this.props.show) {
    //   className += " hide-player"
    // }
    return (
      // <div>
      <div data-vjs-player>
        <video ref={node => (this.videoNode = node)} className={className} />
      </div>
      // </div>
    )
  }
}

function Player(props) {
  // console.log(props.sources)
  const videoJsOptions = {
    autoplay: false,
    dataSetup: { techOrder: ["youtube"] },
    controls: true,
    responsive: true,
    width: "100%",
    // src:
    //   "https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_5mb.mp4"
    ...props
  }

  return <VideoPlayer {...videoJsOptions} />
}
export default Player
