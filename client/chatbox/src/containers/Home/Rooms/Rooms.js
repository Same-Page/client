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
      // <Tooltip
      //   key={roomId}
      //   // overlayStyle={{ maxWidth: 100 }}
      //   title={room.about}
      //   placement="right"
      // >
        <div
          key={roomId}
          title={room.about}
          className="sp-home-chatroom"
          onClick={() => {
            // if (roomId === "lobby") {
            tabContext.changeTab("chat")
            // chatContext.setMode("room")
            chatContext.setRoom(room)
            chatContext.setRealRoom(room)
            storageManager.set("realRoom", room)
            // return
            // }
            // window.open(room.url)
          }}
        >
          {/* <span className="sp-chatroom-metadata">
            <div style={{display: 'inline-flex'}}>
              <span style={{whiteSpace:'nowrap', textOverflow: 'ellipsis', overflow: 'hidden'}}>{room.name}</span>
            </div>
            <br />{" "}
            <span style={{ fontSize: "smaller" }}>{room.userCount}人</span>
          </span> */}
          
            <span style={{marginRight:15}}><Icon type="user" />{room.userCount}</span>{room.about}
        </div>
      // </Tooltip>
    )
  })
}

export default Rooms
