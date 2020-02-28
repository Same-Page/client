import React, { useState, useRef } from "react"
// import { connect } from "react-redux"

import Body from "./Body"
import Footer from "./Footer"

import RoomsWrapper from "containers/Home/RoomsWrapper"

function View({
  chatView,
  show,
  room,
  account,
  showRoomList,
  setShowRoomList
}) {
  const [messages, setMessages] = useState([])
  const playerRef = useRef(null)
  const playMedia = src => {
    setShowMedia(true)
    playerRef.current.src(src)
    playerRef.current.play()
  }
  const pauseMedia = () => {
    playerRef.current.pause()
  }
  const showMediaInit = room && room.src
  const [showMedia, setShowMedia] = useState(showMediaInit)
  const mediaSrc = room && room.src
  window.spDebug("[View.js] " + chatView)

  // Body component is always mounted because of the socket handlers
  return (
    <span>
      <Body
        account={account}
        show={show}
        // chatView={chatView}
        messages={messages}
        setMessages={setMessages}
        room={room}
        playerRef={playerRef}
        playMedia={playMedia}
        pauseMedia={pauseMedia}
        showMedia={showMedia}
        setShowMedia={setShowMedia}
        mediaSources={[mediaSrc]}
      />
      {show && chatView === "room" && (showRoomList || !room) && (
        <RoomsWrapper setShowRoomList={setShowRoomList} />
      )}
      {show && room && (
        <Footer
          account={account}
          room={room}
          connected={room.connected}
          chatView={chatView}
          setMessages={setMessages}
        />
      )}
    </span>
  )
}

export default View
