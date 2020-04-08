import "./Body.css"

import React, { useEffect, useRef, useState } from "react"
import moment from "moment"
// import { connect } from "react-redux"

import Message from "./Message"
import socketManager from "socket/socket"
import spDebug from "config/logger"
import ResizableMedia from "./ResizableMedia"

const chatBodyStyle = {
  height: "calc(100% - 114px)",
  overflowY: "auto",
  overflowX: "hidden",
  width: "100%",
  position: "fixed",
  background: "rgb(243, 243, 243)",
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
const VIDEO_DEFAULT_HEIGHT = 200
const IFRAME_DEFAULT_HEIGHT = 270
// function isMedia(msg) {
//   return msg.type === "audio" || msg.type === "video"
// }

function ChatBody({
  blacklist,
  account,
  show,
  messages,
  setMessages,
  room,
  playMedia,
  pauseMedia,
  playerRef,
  showMedia,
  setShowMedia,
  mediaSources
}) {
  if (!room) {
    return <span />
    // console.error("no roomId, should not render ChatBody")
  }
  const roomId = room.id
  spDebug("[ChatBody] " + roomId)

  // spDebug(mediaSources)
  const resizableDefaultHeight = showMedia
    ? VIDEO_DEFAULT_HEIGHT
    : IFRAME_DEFAULT_HEIGHT
  const [resizableHeight, setResizableHeight] = useState(resizableDefaultHeight)
  const [iframeUrl, setIframeUrl] = useState()
  const [messageDetail, setMessageDetail] = useState()
  const msgNum = messages.length
  const bodyRef = useRef(null)
  const suffixCb = name => {
    return name + "_" + roomId
  }
  const showResizable = show && (showMedia || iframeUrl || messageDetail)
  const bodyStyle = { ...chatBodyStyle }
  const maskStyle = { ...bodyMaskStyle }
  if (room.connectionStatus !== "CONNECTED") {
    maskStyle.opacity = 0.5
  }

  let heightDelta = 114
  if (showResizable) {
    heightDelta += resizableHeight
  }

  bodyStyle.height = `calc(100% - ${heightDelta}px)`
  if (room.background) {
    bodyStyle.backgroundImage = `url('${room.background}')`
    bodyStyle.backgroundSize = "cover"
  }
  // if (height) {
  //   bodyStyle.height = height
  // }
  // const chatMsgCallbackName = "display_new_message_" + chatView
  useEffect(() => {
    scrollToBottomIfNearBottom(10)
  }, [msgNum])
  useEffect(() => {
    scrollToBottom(10)
  }, [show])
  useEffect(() => {
    if (showMedia) {
      setIframeUrl(null)
      setMessageDetail(null)
      setResizableHeight(VIDEO_DEFAULT_HEIGHT)
    }
  }, [showMedia])
  useEffect(() => {
    if (iframeUrl) {
      setShowMedia(false)
      setMessageDetail(null)
      pauseMedia()
      setResizableHeight(IFRAME_DEFAULT_HEIGHT)
    }
  }, [iframeUrl])
  useEffect(() => {
    if (messageDetail) {
      setShowMedia(false)
      setIframeUrl(null)
      pauseMedia()
      setResizableHeight(IFRAME_DEFAULT_HEIGHT)
    }
  }, [messageDetail])
  useEffect(() => {
    setShowMedia(false)
    pauseMedia()
    setIframeUrl(null)
    setMessageDetail(null)
    // clear room message when room change (only for man made rooms)
    setMessages([])
    // console.log("roomId")
    // console.log(roomId)
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
      "delete message",
      suffixCb("delete_message"),
      data => {
        if (data.roomId !== roomId) return

        spDebug("[chatbox] delete message")
        setMessages(prevMessages => {
          return prevMessages.filter(m => {
            return m.id !== data.messageId
          })
        })
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
    const blacklisted =
      blacklist.filter(u => {
        return u.id === msg.user.id
      }).length > 0
    if (blacklisted) {
      // spDebug(`[Body.js] blacklisted user ${data.user.name} talking`)
      return
    }
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
        room={room}
        showUser={showUser}
        timeDisplay={timeDisplay}
        // displayMusicTab={props.displayMusicTab}
        imageLoadedCb={imageLoadedCb}
        playMedia={src => {
          playMedia(src)
          setShowMedia(true)
        }}
        setIframeUrl={setIframeUrl}
        setMessageDetail={setMessageDetail}
      />
    )
    lastMsg = msg
  })

  return (
    <span>
      <ResizableMedia
        show={showResizable}
        showMedia={showMedia}
        setShowMedia={setShowMedia}
        resizableHeight={resizableHeight}
        setResizableHeight={setResizableHeight}
        pauseMedia={pauseMedia}
        playerRef={playerRef}
        mediaSources={mediaSources}
        iframeUrl={iframeUrl}
        setIframeUrl={setIframeUrl}
        messageDetail={messageDetail}
        setMessageDetail={setMessageDetail}
      />

      {/* {show && ( */}
      <div
        ref={bodyRef}
        style={{ ...bodyStyle, display: show ? "block" : "none" }}
      >
        {room.connectionStatus !== "CONNECTED" && (
          <div style={maskStyle}>Offline</div>
        )}
        {res}
      </div>
      {/* )} */}
    </span>
  )
}
export default ChatBody
// const stateToProps = (state, props) => {
//   return { show: state.chatView === props.chatView }
// }

// export default connect(stateToProps)(ChatBody)
