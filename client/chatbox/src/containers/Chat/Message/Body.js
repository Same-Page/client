import "./Body.css"

import React, { useState } from "react"
import { Popover, Button, Icon } from "antd"

import socketManager from "socket"
// import Iframe from "components/Iframe"

function isPureEmoji(string) {
  var regex = /(?:[\u2700-\u27bf]|(?:\ud83c[\udde6-\uddff]){2}|[\ud800-\udbff][\udc00-\udfff]|[\u0023-\u0039]\ufe0f?\u20e3|\u3299|\u3297|\u303d|\u3030|\u24c2|\ud83c[\udd70-\udd71]|\ud83c[\udd7e-\udd7f]|\ud83c\udd8e|\ud83c[\udd91-\udd9a]|\ud83c[\udde6-\uddff]|\ud83c[\ude01-\ude02]|\ud83c\ude1a|\ud83c\ude2f|\ud83c[\ude32-\ude3a]|\ud83c[\ude50-\ude51]|\u203c|\u2049|[\u25aa-\u25ab]|\u25b6|\u25c0|[\u25fb-\u25fe]|\u00a9|\u00ae|\u2122|\u2139|\ud83c\udc04|[\u2600-\u26FF]|\u2b05|\u2b06|\u2b07|\u2b1b|\u2b1c|\u2b50|\u2b55|\u231a|\u231b|\u2328|\u23cf|[\u23e9-\u23f3]|[\u23f8-\u23fa]|\ud83c\udccf|\u2934|\u2935|[\u2190-\u21ff])/g

  return string.replace(regex, "") === ""
}
function MessageBody(props) {
  // const [showIframe, setShowIframe] = useState(false)
  const data = props.data.content
  const self = props.data.self
  let content = data.value
  let contentType = data.type

  if (isPureEmoji(content)) {
    // This should be done in backend
    contentType = "emoji"
  }
  let className = "sp-message-body " + contentType
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
        <Icon type="cloud-download" style={{ marginRight: 5 }} />
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
      {contentType === "image" && (
        <div>
          <Button
            onClick={() => {
              window.parent.postMessage(
                {
                  type: "sp-change-bg",
                  data: data.value
                },
                "*"
              )
            }}
          >
            <Icon type="pushpin" />
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
