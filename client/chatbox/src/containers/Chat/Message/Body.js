import "./Body.css"

import React from "react"
import { Popover, Button, Icon } from "antd"

import socketManager from "socket"

function MessageBody(props) {
  const data = props.data
  let content = data.content
  let className = "sp-message-body " + data.type
  if (data.type === "sticker") {
    let imgSrc = content
    content = <img alt={imgSrc} src={imgSrc} />
  }
  if (data.type === "image") {
    let imgSrc = content
    content = (
      <img
        onClick={() => {
          console.debug("click on image")
          window.parent.postMessage({ imgSrc: imgSrc }, "*")
        }}
        className="sp-message-image"
        alt={imgSrc}
        src={imgSrc}
      />
    )
  }
  if (data.type === "video" || data.type === "audio") {
    content = (
      <div
        onClick={() => {
          window.playMessage(data)
          props.displayMusicTab()
        }}
        className="sp-message-media"
      >
        {content}
      </div>
    )
  }
  if (data.type === "invite") {
    const invitationData = data.metadata
    const purposeStr = invitationData.purpose === "chat" ? "聊天邀请" : "求助"
    const iconType =
      invitationData.purpose === "chat" ? "message" : "question-circle"
    content = (
      <div
        title="点击打开邀请者所在网页"
        className={"sp-invitation-" + invitationData.purpose}
      >
        <a
          target="_blank"
          rel="noopener noreferrer"
          href={invitationData.pageUrl}
        >
          <Icon theme="filled" style={{ marginRight: 5 }} type={iconType} />
          {purposeStr} {invitationData.pageTitle}
        </a>
      </div>
    )
  }
  const popoverContent = (
    <Button
      onClick={() => {
        socketManager.sendEvent("delete message", { messageId: data.id })
      }}
      style={{ border: "none" }}
      icon="delete"
    />
  )
  const popoverPlacement = data.self ? "left" : "right"
  if (props.showMenu) {
    return (
      <Popover
        overlayClassName="sp-message-menu"
        placement={popoverPlacement}
        content={popoverContent}
        trigger="hover"
      >
        <div className={className}>{content}</div>
      </Popover>
    )
  }
  let extra = null
  // console.log(data)
  // if (window.roomId !== data.roomId) {
  //   extra = (
  //     <p style={{ color: "gray", fontSize: "smaller", margin: 2 }}>
  //       来自网页聊天室
  //     </p>
  //   )
  // }
  return (
    <div>
      <div className={className}>{content}</div>
      {extra}
    </div>
  )
}

export default MessageBody
