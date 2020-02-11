import React, { useEffect } from "react"
import { message } from "antd"
import { connect } from "react-redux"

import Header from "./Header"
import View from "./View"
// import Footer from "./Footer"
// import MusicTab from "containers/Music"
import socketManager from "socket"
import storageManager from "utils/storage"
import { changeChatView } from "redux/actions/chat"
import { viewOtherUser } from "redux/actions"
import { getUrl, getDomain } from "utils/url"

function Chat(props) {
  // const [mediaDisplay, setMediaDisplay] = useState("none")
  // const [mediaNum, setMediaNum] = useState(0)

  useEffect(() => {
    const roomIds = props.chatModes.map(mode => {
      if (mode === "site") {
        return getDomain()
      }
      if (mode === "page") {
        return getUrl()
      }
      return "lobby"
    })
    socketManager.sendEvent({
      action: "room",
      data: {
        rooms: roomIds
      }
    })
    socketManager.addHandler("login success", "query_room_info", users => {
      // socketManager.sendEvent("get room info")
    })
    socketManager.addHandler("private message", "pm_notification", data => {
      // console.log(data)
      const sender = data.user
      const msg = `收到来自${sender.name}的私信`
      message.info(msg)
      storageManager.set("unread", true)
    })
    socketManager.addHandler(
      "invitation sent",
      "invitation_sent_notification",
      data => {
        const msg = `邀请成功发送给${data.receiverCount}人`
        message.success(msg)
      }
    )
    return () => {
      socketManager.removeHandler("login success", "query_room_info")
      socketManager.removeHandler("private message", "pm_notification")
      socketManager.removeHandler(
        "invitation sent",
        "invitation_sent_notification"
      )
    }
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
        chatModes={props.chatModes}
        activeView={props.activeView}
        changeChatView={props.changeChatView}
        viewOtherUser={props.viewOtherUser}
        // mediaNum={mediaNum}
        // showMusic={() => {
        //   setMediaDisplay("block")
        // }}
      />
      {props.chatModes.map((mode, i) => (
        <View
          chatView={mode}
          activeView={props.activeView}
          key={mode}
          // displayMusicTab={() => {
          //   setMediaDisplay("block")
          // }}
        />
      ))}
    </div>
  )
}

const stateToProps = state => {
  return { chatModes: state.chatModes, activeView: state.chatView }
}

export default connect(stateToProps, { changeChatView, viewOtherUser })(Chat)
