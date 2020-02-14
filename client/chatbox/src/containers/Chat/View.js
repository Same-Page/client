import React, { useState } from "react"
// import { connect } from "react-redux"

import Body from "./Body"
import Footer from "./Footer"

import Discover from "containers/Home/Discover"

function View({ chatView, show, room, account }) {
  const [messages, setMessages] = useState([])
  if (chatView === "room") {
    if (show) {
      if (!room) {
        return <Discover />
      }
    } else {
      return <span />
    }
  }
  const roomId = room.id
  // Body component is always mounted because of the socket handlers
  return (
    <span>
      <Body
        account={account}
        show={show}
        chatView={chatView}
        messages={messages}
        setMessages={setMessages}
        roomId={roomId}
      />
      {show && (
        <Footer
          account={account}
          roomId={roomId}
          chatView={chatView}
          setMessages={setMessages}
        />
      )}
    </span>
  )
}

export default View
