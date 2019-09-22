import "./Room.css"

import React, { useContext } from "react"
import { Icon, Tooltip } from "antd"

import TabContext from "context/tab-context"
import ChatContext from "context/chat-context"
import storageManager from "utils/storage"

function Rooms(props) {
  const tabContext = useContext(TabContext)
  const chatContext = useContext(ChatContext)

  if (props.loading)
    return (
      <center>
        <Icon type="loading" />
      </center>
    )
  return props.rooms.map(room => {
    let roomId = room.id
    return (
      <Tooltip
        key={roomId}
        overlayStyle={{ maxWidth: 100 }}
        title={room.about}
        placement="bottom"
      >
        <center
          className="sp-home-chatroom"
          onClick={() => {
            // if (roomId === "lobby") {
            tabContext.changeTab("chat")
            chatContext.setMode("room")
            chatContext.setRoom(room)
            chatContext.setRealRoom(room)
            storageManager.set("realRoom", room)
            // return
            // }
            // window.open(room.url)
          }}
        >
          <span className="sp-chatroom-metadata">
            {room.name}
            <br />{" "}
            <span style={{ fontSize: "smaller" }}>{room.userCount}人</span>
          </span>
        </center>
      </Tooltip>
    )
  })
}

export default Rooms
