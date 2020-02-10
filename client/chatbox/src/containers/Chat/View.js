import React, { useState } from "react"
// import { connect } from "react-redux"

import Body from "./Body"
import Footer from "./Footer"

import { getUrl, getDomain } from "utils/url"
// import socketManager from "socket"

function View(props) {
  const [messages, setMessages] = useState(props.data || [])
  const { chatView, activeView } = props
  const show = chatView === activeView
  let roomId = props.roomId
  if (chatView === "page") {
    roomId = getUrl()
  }
  if (chatView === "site") {
    roomId = getDomain()
  }

  //   console.log("roomId" + roomId)
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
