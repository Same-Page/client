import "./Playlist.css"
import React, { useState, useEffect } from "react"
import moment from "moment"

import AvatarWithHoverCard from "containers/OtherProfile/AvatarWithHoverCard"

function Playlist(props) {
  const [playlist, setPlaylist] = useState([])
  const [index, setIndex] = useState()
  const setMediaNum = props.setMediaNum
  const loopMode = props.loopMode
  useEffect(() => {
    window.playNextMedia = () => {
      setIndex(curIndex => {
        if (playlist.length === 0) {
          return curIndex
        }
        let newIndex = curIndex
        if (loopMode === "loopAll") {
          newIndex = (curIndex + 1) % playlist.length
        }
        window.playMessage(playlist[newIndex])
        return newIndex
      })
    }
    return () => {
      window.playNext = null
    }
  }, [playlist, loopMode])

  useEffect(() => {
    window.setPlaylist = items => {
      // console.log(items)
      setPlaylist(items)
      setMediaNum(items.length)
    }
    window.playMessage = msg => {
      setIndex(msg.mediaIndex)
      window.player.src({ type: msg.mediaType, src: msg.mediaSrc })
      window.player.play()
    }
    window.player.on("ended", data => {
      console.debug("play ended")
      window.playNextMedia()
    })
    window.player.on("error", data => {
      // this can cause infinite loop
      // TODO: better way to handle this so we can still
      // continue next song?
      // console.error("play error, play next")
      console.error(data)
      // window.playNextMedia()
    })

    return () => {
      window.setPlaylist = null
      window.playMessage = null
      window.player.on("ended", () => {})
    }
  }, [setMediaNum])

  if (playlist.length === 0) {
    return <center style={{ fontSize: 10 }}>当前聊天室没有多媒体资源</center>
  }

  return playlist.map((msg, i) => {
    let timeDisplay = msg.time.local().format("A HH:mm")
    if (moment().diff(msg.time) > 24 * 60 * 60 * 1000)
      timeDisplay = msg.time.local().format("MMMDo A HH:mm")

    let className = "sp-playlist-item"
    if (i === index) {
      className += " selected"
    }
    return (
      <div
        onClick={() => {
          // window.player.playlist.currentItem(i)
          // setIndex(i)
          window.playMessage(msg)
        }}
        className={className}
        key={msg.time.valueOf()}
      >
        <AvatarWithHoverCard
          className="sp-chat-message-avatar"
          size="small"
          user={msg.user}
        />
        <span title={"发送于" + timeDisplay}>{msg.content}</span>
      </div>
    )
  })
}

export default Playlist
