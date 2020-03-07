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
  noJoinList
}) {
  const [messages, setMessages] = useState([])
  const playerRef = useRef(null)
  const intl = useIntl()

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
  const showMediaInit = room && room.src
  const [showMedia, setShowMedia] = useState(showMediaInit)

  window.spDebug("[View.js] " + chatView)

  useEffect(() => {
    if (room && room.src) {
      setPlaylist([room.src])
      setShowMedia(true)
    } else {
      setShowMedia(false)
    }
  }, [room])
  // Body component is always mounted because of the socket handlers
  return (
    <span>
      <Body
        account={account}
        show={show}
        blacklist={blacklist}
        // chatView={chatView}
        messages={messages}
        setMessages={setMessages}
        room={room}
        playerRef={playerRef}
        playMedia={playMedia}
        pauseMedia={pauseMedia}
        showMedia={showMedia}
        setShowMedia={setShowMedia}
        // mediaSources={[mediaSrc]}
      />
      {/* {show && chatView === "room" && (showRoomList || !room) && (
        <RoomsWrapper setShowRoomList={setShowRoomList} />
      )} */}
      {show && room && (
        <Footer
          account={account}
          room={room}
          connected={room.connected}
          chatView={chatView}
          setMessages={setMessages}
          noJoinList={noJoinList}
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
