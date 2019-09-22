import React, { useState, useEffect } from "react"
import { message } from "antd"
import Header from "./Header"
import Body from "./Body"
import Footer from "./Footer"
import MusicTab from "containers/Music"
import socketManager from "socket"
import storageManager from "utils/storage"

function Chat(props) {
  const [mediaDisplay, setMediaDisplay] = useState("none")
  const [mediaNum, setMediaNum] = useState(0)

  useEffect(() => {
    // Ask parent about room info when mounted
    socketManager.sendEvent("get room info")

    socketManager.addHandler("login success", "query_room_info", users => {
      socketManager.sendEvent("get room info")
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
      <span style={{ display: mediaDisplay }}>
        <MusicTab
          back={() => {
            setMediaDisplay("none")
          }}
          setMediaNum={setMediaNum}
        />
      </span>
      <Header
        mediaNum={mediaNum}
        showMusic={() => {
          setMediaDisplay("block")
        }}
      />
      <Body
        displayMusicTab={() => {
          setMediaDisplay("block")
        }}
      />
      <Footer />
    </div>
  )
}

export default Chat
