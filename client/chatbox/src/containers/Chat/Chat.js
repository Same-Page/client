import React, { useState, useEffect } from "react"
// import { message } from "antd"
import { connect } from "react-redux"

import Header from "./Header"
import View from "./View"
// import Footer from "./Footer"
// import MusicTab from "containers/Music"
import socketManager from "socket"
import { changeChatView, setRoomConnectionStatus } from "redux/actions/chat"
import { viewOtherUser, changeTab } from "redux/actions"
import storageManager from "utils/storage"

function syncRoomsPeriodically() {
  setTimeout(() => {
    socketManager.syncRooms()
    syncRoomsPeriodically()
  }, 10 * 1000)
}
function Chat({
  blacklist,
  account,
  rooms,
  manMadeRoom,
  chatModes,
  activeView,
  changeChatView,
  changeTab,
  viewOtherUser,
  setRoomConnectionStatus
}) {
  // const [mediaDisplay, setMediaDisplay] = useState("none")
  // const [mediaNum, setMediaNum] = useState(0)
  const [showRoomList, setShowRoomList] = useState(false)
  const [noJoinList, setNoJoinList] = useState([])
  const [ready, setReady] = useState(false)
  useEffect(() => {
    storageManager.get("noJoin", noJoin => {
      let autoJoinRooms = rooms
      if (noJoin) {
        setNoJoinList(noJoin)
        autoJoinRooms = rooms.filter(r => {
          return !noJoin.includes(r.id)
        })
      }
      socketManager.autoJoinRooms(autoJoinRooms)
      autoJoinRooms.forEach(r => {
        setRoomConnectionStatus(r.id, "JOINING")
      })
      setReady(true)
    })
    // setTimeout(() => {
    //   // wait a few secs only because if user make chatbox iframe
    //   // display by default, there is race condition that before
    //   // parent finish joining rooms, chatbox is already trying to get
    //   // room chat history, thus get no chat history
    //   socketManager.getRoomInfo()
    // }, 500)

    syncRoomsPeriodically()
  }, [])
  if (!ready) return <span />
  return (
    <div>
      {/* <span style={{ display: mediaDisplay }}>
        <MusicTab
          back={() => {
            setMediaDisplay("none")
          }}
          setMediaNum={setMediaNum}
        />
      </span>
       */}
      <Header
        account={account}
        chatModes={chatModes}
        activeView={activeView}
        changeChatView={changeChatView}
        viewOtherUser={viewOtherUser}
        manMadeRoom={manMadeRoom}
        rooms={rooms}
        changeTab={changeTab}
        setRoomConnectionStatus={setRoomConnectionStatus}
        showRoomList={showRoomList}
        setShowRoomList={setShowRoomList}
        // mediaNum={mediaNum}
        // showMusic={() => {
        //   setMediaDisplay("block")
        // }}
      />
      {/* <MusicPlayer /> */}
      {chatModes.map(mode => {
        let room = rooms.filter(r => {
          return r.type === mode
        })
        if (room.length) {
          room = room[0]
        } else {
          room = null
        }

        return (
          <View
            blacklist={blacklist}
            account={account}
            chatView={mode}
            show={mode === activeView}
            key={mode}
            room={room}
            showRoomList={showRoomList}
            setShowRoomList={setShowRoomList}
            changeTab={changeTab}
            noJoinList={noJoinList}
            setRoomConnectionStatus={setRoomConnectionStatus}
            // displayMusicTab={() => {
            //   setMediaDisplay("block")
            // }}
          />
        )
      })}
    </div>
  )
}

const stateToProps = state => {
  return {
    chatModes: state.chatModes,
    activeView: state.chatView,
    manMadeRoom: state.manMadeRoom,
    rooms: state.rooms,
    account: state.account,
    blacklist: state.blacklist
  }
}

export default connect(stateToProps, {
  changeChatView,
  viewOtherUser,
  changeTab,
  setRoomConnectionStatus
})(Chat)
