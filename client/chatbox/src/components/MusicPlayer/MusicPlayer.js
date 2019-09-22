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
    window.player = this.player
  }

  // destroy player on unmount
  componentWillUnmount() {
    if (this.player) {
      this.player.dispose()
    }
  }

  // wrap the player in a div with a `data-vjs-player` attribute
  // so videojs won't create additional wrapper in the DOM
  // see https://github.com/videojs/video.js/pull/3856
  render() {
    return (
      // <div>
      <div data-vjs-player>
        <video ref={node => (this.videoNode = node)} className="video-js" />
      </div>
      // </div>
    )
  }
}

function Player() {
  const videoJsOptions = {
    autoplay: false,
    dataSetup: { techOrder: ["youtube"] },
    controls: true,
    responsive: true,
    width: "100%"
  }

  return <VideoPlayer {...videoJsOptions} />
}
export default Player
