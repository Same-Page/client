import "antd/dist/antd.css"
import "./iframe.css"

import { Button } from "antd"
import React from "react"
import { storiesOf } from "@storybook/react"

import ChatBody from "containers/Chat/Body"
import CommentBody from "containers/Comment/Body"
import IframeWithSrcInput from "./IframeWithSrcInput"

import chatMessages from "./data/chats"
import comments from "./data/comments"
const ButtonGroup = Button.Group

let onlineUsers = []

function sendMsgToIframe(msg) {
  document.getElementsByTagName("iframe")[0].contentWindow.postMessage(msg, "*")
}
function addOnlineUser() {
  const user = {
    username: "David",
    hasAvatar: true,
    userId: "c8bf1d88-3ed1-cd9d-8baf-9b1eaad183ee"
  }
  if (onlineUsers.length) {
    user.userId = onlineUsers.length
    user.hasAvatar = false
  }
  onlineUsers.push(user)
  sendMsgToIframe(onlineUsers)
}
function removeOnlineUser() {
  onlineUsers.pop()
  sendMsgToIframe(onlineUsers)
}

storiesOf("Same Page", module)
  .add("Test all", () => (
    <div>
      <div>
        Online users &nbsp;
        <ButtonGroup>
          <Button onClick={addOnlineUser}>+</Button>
          <Button onClick={removeOnlineUser}>-</Button>
        </ButtonGroup>
      </div>
      <IframeWithSrcInput />
    </div>
  ))
  .add("Test chat body", () => <ChatBody data={chatMessages} />)
  .add("Test comment body", () => <CommentBody data={comments} />)
