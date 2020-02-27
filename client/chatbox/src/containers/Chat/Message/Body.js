import "./Body.css"

import React, { useState } from "react"
import { Popover, Button, Icon } from "antd"

import socketManager from "socket"
// import Iframe from "components/Iframe"
function MessageBody(props) {
  // const [showIframe, setShowIframe] = useState(false)
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
  if (contentType === "media") {
    const src = {
      src: content
    }
    if (content.includes("youtube.com") || content.includes("youtu.be")) {
      src.type = "video/youtube"
    }
    content = (
      <div
        className="sp-message-media"
        onClick={() => {
          props.playMedia(src)
          // if (window.player) {
          //   window.playMedia(src)
          // } else {
          //   console.error("no player")
          // }
        }}
      >
        <span>
          <Icon theme="twoTone" style={{ marginRight: 5 }} type="play-circle" />
          {content}
        </span>
      </div>
    )
  }
  if (contentType === "url") {
    // const invitationData = data.metadata
    // const purposeStr = invitationData.purpose === "chat" ? "聊天邀请" : "求助"
    // const iconType =
    //   invitationData.purpose === "chat" ? "message" : "question-circle"
    // const iconType = "link"
    content = (
      <div
      // title="点击打开网页"
      // className={"sp-invitation-" + invitationData.purpose}
      >
        <Icon style={{ marginRight: 5, color: "#1890ff" }} type="link" />

        <a
          onClick={() => {
            props.setIframeUrl(data.iframe_url || data.url)
            // setShowIframe(s => {
            //   return !s
            // })
          }}
        >
          {data.title}
        </a>
        {/* <a target="_blank" rel="noopener noreferrer" href={data.url}>
          <Icon style={{ marginLeft: 5, color: "black" }} type={iconType} />
        </a> */}
      </div>
    )
  }
  const popoverContent = (
    <div>
      <Button
        onClick={() => {
          socketManager.sendEvent("delete message", { messageId: data.id })
        }}
      >
        {/* <a */}

        {/* // style={{ border: "none" }}
      // icon="delete"
      > */}
        <Icon type="delete" />
      </Button>
      {contentType === "media" && (
        <div>
          <Button>
            <a
              // style={{ color: "white" }}
              target="_blank"
              rel="noopener noreferrer"
              href={data.value}
            >
              <Icon type="link" />
            </a>
          </Button>
        </div>
      )}

      {contentType === "url" && (
        <div>
          <Button>
            <a target="_blank" rel="noopener noreferrer" href={data.url}>
              <Icon type="link" />
            </a>
          </Button>
        </div>
      )}
    </div>
  )
  const popoverPlacement = self ? "left" : "right"
  let contentWrapper = <div className={className}>{content}</div>
  if (props.showMenu) {
    contentWrapper = (
      <Popover
        overlayClassName="sp-message-menu"
        placement={popoverPlacement}
        content={popoverContent}
        trigger="hover"
      >
        {contentWrapper}
      </Popover>
    )
  }

  return (
    <div>
      {contentWrapper}
      {/* {contentType === "url" && (
        <Iframe
          // title={" "}
          show={showIframe}
          setShow={setShowIframe}
          url={data.iframe_url || data.raw_url || data.url}
        />
      )} */}
    </div>
  )
}

export default MessageBody
