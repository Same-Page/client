import React, { useState, useRef, useEffect } from "react"
// import { connect } from "react-redux"
import { useIntl } from "react-intl"
import { Icon } from "antd"
import Body from "./Body"
import Footer from "./Footer"

// import RoomsWrapper from "containers/Home/RoomsWrapper"

function View({
  chatView,
  show,
  room,
  account,
  changeTab,
  blacklist,
  setRoomConnectionStatus
}) {
  const [messages, setMessages] = useState([])
  const playerRef = useRef(null)
  const intl = useIntl()
  const mediaSrc = room && room.src

  const playMedia = src => {
    setShowMedia(true)
    playerRef.current.src(src)
    playerRef.current.play()
  }
  const setPlaylist = src => {
    // setShowMedia(true)
    playerRef.current.src(src)
    // playerRef.current.play()
  }
  const pauseMedia = () => {
    playerRef.current.pause()
  }
  const showMediaInit = !!mediaSrc
  const [showMedia, setShowMedia] = useState(showMediaInit)

  window.spDebug("[View.js] " + chatView)

  useEffect(() => {
    if (mediaSrc) {
      setPlaylist([mediaSrc])
      setShowMedia(true)
    } else {
      setShowMedia(false)
    }
  }, [mediaSrc])
  // Body component is always mounted because of the socket handlers
  return (
    <span>
      <Body
        account={account}
        show={show}
        blacklist={blacklist}
        messages={messages}
        setMessages={setMessages}
        room={room}
        playerRef={playerRef}
        playMedia={playMedia}
        pauseMedia={pauseMedia}
        showMedia={showMedia}
        setShowMedia={setShowMedia}
      />

      {show && room && (
        <Footer
          account={account}
          room={room}
          chatView={chatView}
          setMessages={setMessages}
          setRoomConnectionStatus={setRoomConnectionStatus}
        />
      )}
      {show && !room && (
        <div
          style={{
            width: "100%",
            top: "50%",
            left: "50%",
            textAlign: "center",
            position: "fixed",
            transform: "translate(-50%, -50%)",
            fontSize: "larger"
          }}
        >
          <a
            onClick={() => {
              changeTab("discover")
            }}
          >
            <Icon theme="twoTone" type="compass" />{" "}
            {intl.formatMessage({ id: "discover.room.to.join" })}
          </a>
        </div>
      )}
    </span>
  )
}

export default View
