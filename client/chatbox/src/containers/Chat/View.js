import React, { useState } from "react"
// import { connect } from "react-redux"

import Body from "./Body"
import Footer from "./Footer"

import Discover from "containers/Home/Discover"

function View({ chatView, show, room, rooms, account }) {
  const [messages, setMessages] = useState([])
  window.spDebug("[View.js] " + chatView)
  if (chatView === "room") {
    if (!room) {
      return <Discover />
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
        room={room}
      />
      {show && (
        <Footer
          account={account}
          roomId={room.id}
          rooms={rooms}
          connected={room.connected}
          chatView={chatView}
          setMessages={setMessages}
        />
      )}
    </span>
  )
}

export default View
