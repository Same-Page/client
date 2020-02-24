import React, { useState, useEffect } from "react"
import { Button, Radio } from "antd"

import MusicPlayer from "components/MusicPlayer"

import Body from "containers/Chat/Body"
import Footer from "containers/Chat/Footer"
import RoomHeader from "containers/Chat/Header/RoomHeader"
import socketManager from "socket"
const ROOM_TYPE = "media"
function VideoRoom({ back, room, account, viewOtherUser, setRoom }) {
  // const [showHelp, setShowHelp] = useState(false)
  const [messages, setMessages] = useState([])
  const [showUsers, setShowUsers] = useState(false)
  useEffect(() => {
    socketManager.joinRoom(room)
  }, [])
  return (
    <div className="sp-special-tab">
      <Button
        onClick={() => {
          back()
        }}
        style={{
          position: "fixed",
          marginTop: 1,
          marginLeft: 5,
          border: "none",
          fontSize: "large"
        }}
        icon="arrow-left"
      />

      <center className="sp-tab-header">
        {/* <RoomHeader
          disconnectBtnLeft={35}
          account={account}
          viewOtherUser={viewOtherUser}
          chatView={ROOM_TYPE}
          show={true}
          room={room}
          showUsers={showUsers}
          toggleUsers={setShowUsers}
          setRoomConnectionStatus={(roomId, status) => {
            setRoom({ ...room, connected: status })
          }}
        /> */}
        {/* <Radio.Group
          size="small"
          buttonStyle="solid"
          value={loopMode}
          onChange={e => {
            setLoopMode(e.target.value)
          }}
        >
          <Radio.Button value="loopCurrent">循环当前</Radio.Button>
          <Radio.Button value="loopAll">循环列表</Radio.Button>
        </Radio.Group> */}
        {/* <Button
            style={{ border: "none", position: "absolute", right: 0 }}
            onClick={() => {
              setShowHelp(true)
            }}
            size="small"
            icon="question"
          /> */}
      </center>
      <div className="sp-tab-body">
        <MusicPlayer
          sources={[
            {
              src:
                "https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_5mb.mp4"
            }
          ]}
        />
        {/* <div
          style={{
            padding: 20,
            color: "lightgray",
            width: "100%",
            height: "180px",
            fontSize: "10px",
            position: "fixed",
            overflowX: "hidden",
            overflowY: "auto"
          }}
        >
        </div> */}
        <div className="sp-tab-header">
          {/* placeholder for keeping header from being hiden */}
          <div
            style={{
              display: "inline-block"
            }}
          ></div>

          <RoomHeader
            account={account}
            viewOtherUser={viewOtherUser}
            chatView={ROOM_TYPE}
            show={true}
            room={room}
            showUsers={showUsers}
            toggleUsers={setShowUsers}
            setRoomConnectionStatus={(roomId, status) => {
              setRoom({ ...room, connected: status })
            }}
          />
        </div>
        <Body
          height="calc(55% - 114px)"
          account={account}
          show={true}
          messages={messages}
          setMessages={setMessages}
          room={room}
        />

        <Footer
          account={account}
          room={room}
          connected={room.connected}
          chatView="video_room"
          setMessages={setMessages}
        />
      </div>
    </div>
  )
}
export default VideoRoom
