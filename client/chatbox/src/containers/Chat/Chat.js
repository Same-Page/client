import React, { useEffect } from "react"
// import { message } from "antd"
import { connect } from "react-redux"

import Header from "./Header"
import View from "./View"
// import Footer from "./Footer"
// import MusicTab from "containers/Music"
import socketManager from "socket"
import { changeChatView, setRoomConnectionStatus } from "redux/actions/chat"
import { viewOtherUser, changeTab } from "redux/actions"

function Chat({
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

  useEffect(() => {
    // console.log(rooms)
    // const roomIds = rooms.map(r => {
    //   return r.id
    // })
    socketManager.getRoomInfo()
    // socketManager.addHandler("login success", "query_room_info", users => {
    //   // socketManager.sendEvent("get room info")
    // })
    // socketManager.addHandler("private message", "pm_notification", data => {
    //   // console.log(data)
    //   const sender = data.user
    //   const msg = `收到来自${sender.name}的私信`
    //   message.info(msg)
    //   storageManager.set("unread", true)
    // })
    // socketManager.addHandler(
    //   "invitation sent",
    //   "invitation_sent_notification",
    //   data => {
    //     const msg = `邀请成功发送给${data.receiverCount}人`
    //     message.success(msg)
    //   }
    // )
    // return () => {
    //   socketManager.removeHandler("login success", "query_room_info")
    //   socketManager.removeHandler("private message", "pm_notification")
    //   socketManager.removeHandler(
    //     "invitation sent",
    //     "invitation_sent_notification"
    //   )
    // }
  }, [])

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
        // mediaNum={mediaNum}
        // showMusic={() => {
        //   setMediaDisplay("block")
        // }}
      />
      {chatModes.map(mode => {
        let room = rooms.filter(r => {
          return r.type === mode
        })
        if (room.length) {
          room = room[0]
        } else {
          room = manMadeRoom
        }

        return (
          <View
            account={account}
            chatView={mode}
            show={mode === activeView}
            key={mode}
            room={room}
            rooms={rooms}

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
    account: state.account
  }
}

export default connect(stateToProps, {
  changeChatView,
  viewOtherUser,
  changeTab,
  setRoomConnectionStatus
})(Chat)
