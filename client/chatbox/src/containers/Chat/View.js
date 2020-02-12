import React, { useState } from "react"
// import { connect } from "react-redux"

import Body from "./Body"
import Footer from "./Footer"

import { getUrl, getDomain } from "utils/url"
import Discover from "containers/Home/Discover"
// import socketManager from "socket"

function View({ chatView, show, manMadeRoom }) {
  const [messages, setMessages] = useState([])
  let roomId = null
  if (chatView === "page") {
    roomId = getUrl()
  } else if (chatView === "site") {
    roomId = getDomain()
  } else {
    if (manMadeRoom) {
      roomId = manMadeRoom.id
    } else {
      if (show) return <Discover />
      else return <span />
    }
  }

  // Body component is always mounted because of the socket handlers
  return (
    <span>
      <Body
        show={show}
        chatView={chatView}
        messages={messages}
        setMessages={setMessages}
        roomId={roomId}
      />
      {show && (
        <Footer roomId={roomId} chatView={chatView} setMessages={setMessages} />
      )}
    </span>
  )
}

export default View
