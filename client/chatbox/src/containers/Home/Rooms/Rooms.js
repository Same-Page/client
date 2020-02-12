import "./Room.css"

import React from "react"
import { Icon } from "antd"
import { connect } from "react-redux"

import storageManager from "utils/storage"
import { joinManMadeRoom } from "redux/actions/chat"
function Rooms({ loading, rooms, joinManMadeRoom }) {
  if (loading)
    return (
      <center>
        <Icon type="loading" />
      </center>
    )
  return rooms.map(room => {
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
          joinManMadeRoom(room)
          // chatContext.setMode("room")
          // chatContext.setRoom(room)
          // chatContext.setRealRoom(room)
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

        <span style={{ marginRight: 15, display: "inline-block", width: 25 }}>
          <Icon type="user" />
          {room.userCount}
        </span>
        {room.name}
      </div>
      // </Tooltip>
    )
  })
}

export default connect(null, { joinManMadeRoom })(Rooms)
