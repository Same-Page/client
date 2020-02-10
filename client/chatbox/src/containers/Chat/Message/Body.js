import "./Body.css"

import React from "react"
import { Popover, Button, Icon } from "antd"

import socketManager from "socket"

function MessageBody(props) {
  const data = props.data.content
  const self = props.data.self
  let content = data.value
  let contentType = data.type
  let className = "sp-message-body " + data.type
  if (contentType === "sticker") {
    let imgSrc = content
    content = <img alt={imgSrc} src={imgSrc} />
  }
  if (contentType === "image") {
    let imgSrc = content
    content = (
      <img
        onClick={() => {
          window.spDebug("click on image")
          window.parent.postMessage({ imgSrc: imgSrc }, "*")
        }}
        onLoad={() => {
          props.imageLoadedCb()
        }}
        className="sp-message-image"
        alt={""}
        src={imgSrc}
      />
    )
  }
  if (contentType === "file") {
    content = (
      <a href={data.url} rel="noopener noreferrer" target="_blank" download>
        {data.fileName}
      </a>
    )
  }
  if (contentType === "video" || contentType === "audio") {
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
  if (contentType === "url") {
    // const invitationData = data.metadata
    // const purposeStr = invitationData.purpose === "chat" ? "聊天邀请" : "求助"
    // const iconType =
    //   invitationData.purpose === "chat" ? "message" : "question-circle"
    const iconType = "link"
    content = (
      <div
        title="点击打开网页"
        // className={"sp-invitation-" + invitationData.purpose}
      >
        <a target="_blank" rel="noopener noreferrer" href={data.url}>
          <Icon style={{ marginRight: 5 }} type={iconType} />
          {/* {purposeStr}  */}
          {data.title}
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
  const popoverPlacement = self ? "left" : "right"
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
