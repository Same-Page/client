import React, { useEffect, useRef } from "react"
import moment from "moment"
// import { connect } from "react-redux"

import Message from "./Message"
import socketManager from "socket/socket"
import spDebug from "config/logger"

const chatBodyStyle = {
  height: "calc(100% - 107px)",
  overflowY: "auto",
  overflowX: "hidden",
  width: "100%",
  position: "fixed",
  background: "#f6f9fc",
  padding: 10,
  paddingBottom: 50,
  scrollBehavior: "smooth"
}
const bodyMaskStyle = {
  height: "100%",
  width: "100%",
  position: "fixed",
  background: "black",
  opacity: 0,
  marginTop: -10,
  marginLeft: -10,
  zIndex: 10
  // pointerEvents: "none" // still allow scrolling
}
const AUTO_SCROLL_TRESHOLD_DISTANCE = 300

// function isMedia(msg) {
//   return msg.type === "audio" || msg.type === "video"
// }

function ChatBody({ height, account, show, messages, setMessages, room }) {
  if (!room) {
    return <span />
    // console.error("no roomId, should not render ChatBody")
  }
  const roomId = room.id
  spDebug("[ChatBody] " + roomId)

  const msgNum = messages.length
  const bodyRef = useRef(null)
  const suffixCb = name => {
    return name + "_" + roomId
  }
  const bodyStyle = { ...chatBodyStyle }
  const maskStyle = { ...bodyMaskStyle }
  if (!room.connected) {
    maskStyle.opacity = 0.5
  }
  if (room.background) {
    bodyStyle.backgroundImage = `url('${room.background}')`
    bodyStyle.backgroundSize = "cover"
  }
  if (height) {
    bodyStyle.height = height
  }
  // const chatMsgCallbackName = "display_new_message_" + chatView
  useEffect(() => {
    scrollToBottomIfNearBottom(10)
  }, [msgNum])
  useEffect(() => {
    scrollToBottom(10)
  }, [show])
  useEffect(() => {
    // clear room message when room change (only for man made rooms)
    setMessages([])
  }, [roomId])
  useEffect(() => {
    // TODO: seems no need to remove socket handler when account state change
    if (!account) {
      console.warn("[Body.js] no account, won't register socket events")
      return
    }
    if (!roomId) {
      return
    }
    window.spDebug("[Body.js] register socket events " + roomId)
    socketManager.addHandler(
      "chat message",
      suffixCb("display_new_message"),
      data => {
        if (data.roomId !== roomId) return
        data.self = data.user.id.toString() === account.id.toString()
        data.time = moment()
        spDebug("[chatbox] chat message")
        setMessages(prevMessages => {
          // update own message
          let i = 0
          for (; i < prevMessages.length; i++) {
            if (prevMessages[i].id.toString() === data.id.toString()) {
              break
            }
          }
          if (i < prevMessages.length) {
            // if found existing message, update it
            const messages = [...prevMessages]
            messages[i] = data
            return messages
          }

          return [...prevMessages, data]
        })
        if (!data.self) {
          let timeout = 10
          scrollToBottomIfNearBottom(timeout)
        }
      }
    )
    socketManager.addHandler(
      "room info",
      suffixCb("display_recent_messages"),
      roomDict => {
        if (roomId in roomDict) {
          const room = roomDict[roomId]
          if (room.chatHistory) {
            room.chatHistory.forEach(msg => {
              msg.self = msg.user.id.toString() === account.id.toString()
              msg.time = moment.utc(msg.timestamp)
            })
            setMessages(room.chatHistory)
            scrollToBottom(20)
          }
          //  else {
          //   socketManager.getRoomInfo([roomId])
          // }
        }
      }
    )

    return () => {
      // window.spDebug("[Body.js] unregister socket events")
      socketManager.removeHandler(
        "chat message",
        suffixCb("display_new_message")
      )
      socketManager.removeHandler(
        "room info",
        suffixCb("display_recent_messages")
      )
    }
  }, [account, roomId])
  // useEffect(() => {
  //   // Find media messages and pass to playlist
  //   // TODO: better to use a playlist context
  //   // rather than window.setPlaylist
  //   let mediaIndex = 0
  //   messages.forEach(msg => {
  //     if (isMedia(msg)) {
  //       msg.mediaIndex = mediaIndex
  //       mediaIndex++
  //     }
  //   })
  //   window.setPlaylist(messages.filter(isMedia))
  // }, [messages])
  const imageLoadedCb = () => {
    scrollToBottomIfNearBottom(10)
  }
  const scrollToBottomIfNearBottom = timeout => {
    const bodyDiv = bodyRef.current
    if (!bodyDiv) return
    if (
      bodyDiv.scrollHeight - bodyDiv.scrollTop - bodyDiv.offsetHeight <
      AUTO_SCROLL_TRESHOLD_DISTANCE
    ) {
      scrollToBottom(timeout)
    }
  }
  const scrollToBottom = timeout => {
    const bodyDiv = bodyRef.current
    if (!bodyDiv) return
    timeout = timeout || 100

    setTimeout(() => {
      bodyDiv.scrollTop = bodyDiv.scrollHeight
    }, timeout)
  }

  let res = []
  let lastMsg = null

  messages.forEach(msg => {
    // If same user is talking, no need to show user's avatar again
    let showUser = true
    // If it's been more than 5 mins since last msg
    let showTimestamp = false
    let timeDisplay = null

    if (lastMsg) {
      if (lastMsg.user.id.toString() === msg.user.id.toString())
        showUser = false
      if (msg.time.diff(lastMsg.time) > 5 * 60 * 1000) {
        showTimestamp = true
        showUser = true
      }
    } else {
      showTimestamp = true
      showUser = true
    }

    if (showTimestamp) {
      if (moment().diff(msg.time) > 24 * 60 * 60 * 1000)
        timeDisplay = msg.time.local().format("MMMDo HH:mm")
      else timeDisplay = msg.time.local().format("HH:mm")
    }

    res.push(
      <Message
        showMenu={true}
        // showMenu={account && (account.isMod || msg.self)}
        withHoverCard={true}
        key={msg.id}
        data={msg}
        showUser={showUser}
        timeDisplay={timeDisplay}
        // displayMusicTab={props.displayMusicTab}
        imageLoadedCb={imageLoadedCb}
      />
    )
    lastMsg = msg
  })

  return (
    <span>
      {show && (
        <div ref={bodyRef} style={bodyStyle}>
          {!room.connected && <div style={maskStyle}>Offline</div>}
          {res}
        </div>
      )}
    </span>
  )
}
export default ChatBody
// const stateToProps = (state, props) => {
//   return { show: state.chatView === props.chatView }
// }

// export default connect(stateToProps)(ChatBody)
