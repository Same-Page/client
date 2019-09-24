import "antd/dist/antd.css"
import "./Tab.css"

import React, { useState, useEffect } from "react"
import { Tabs, Icon, Tooltip, Badge } from "antd"

import Chat from "containers/Chat"
import Comment from "containers/Comment"
import Account from "containers/Account"
import OtherProfile from "containers/OtherProfile"
import Inbox from "containers/Inbox"
import Discover from "containers/Home/Discover"

import TabContext from "context/tab-context"
import storageManager from "utils/storage"

const TabPane = Tabs.TabPane

function Tab(props) {
  // console.log("render tab")
  const tabList = window.spConfig.tabList || [
    "discover",
    "chat",
    "comment",
    "inbox",
    "profile",
    "close"
  ]
  const defaultTab = window.spConfig.defaultTab || props.tab
  const [activeTab, changeTab] = useState(defaultTab)
  // view other's profile
  const [other, selectOtherUser] = useState()
  const [unread, setUnread] = useState(false)
  // view direct message with other
  const [conversationUser, setCoversationUser] = useState()
  function directMessage(user) {
    selectOtherUser(null)
    changeTab("inbox")
    setCoversationUser(user)
  }

  useEffect(() => {
    storageManager.addEventListener("unread", unread => {
      setUnread(unread)
    })
    storageManager.get("unread", unread => {
      if (unread) {
        setUnread(true)
      }
    })
  }, [])

  return (
    <TabContext.Provider
      value={{
        selectOtherUser: selectOtherUser,
        changeTab: changeTab,
        activeTab: activeTab,
        directMessage: directMessage
      }}
    >
      <div className="card-container">
        <Tabs
          onChange={val => {
            // minimize actually means hide
            // but there will be a small icon to unhide
            if (val === "minimize") {
              window.parent.postMessage("minimize", "*")
              return
            }
            changeTab(val)
            selectOtherUser(null)
          }}
          activeKey={activeTab}
          type="card"
        >
          {tabList.includes("discover") && (
            <TabPane
              tab={
                <Tooltip title="发现" placement="bottom">
                  <Icon type="compass" />
                </Tooltip>
              }
              key="home"
            >
              <Discover />
            </TabPane>
          )}
          {tabList.includes("chat") && (
            <TabPane
              tab={
                <Tooltip title="实时聊天" placement="bottom">
                  <Icon type="message" />
                </Tooltip>
              }
              key="chat"
              forceRender={true}
            >
              <Chat />
            </TabPane>
          )}
          {tabList.includes("comment") && (
            <TabPane
              tab={
                <Tooltip title="网页留言" placement="bottom">
                  <Icon type="form" />
                </Tooltip>
              }
              key="comment"
            >
              <Comment />
            </TabPane>
          )}
          {tabList.includes("inbox") && (
            <TabPane
              tab={
                <Tooltip title="收件箱" placement="bottom">
                  <Badge dot={unread} className="sp-new-message-dot">
                    <Icon type="mail" />
                  </Badge>
                </Tooltip>
              }
              key="inbox"
            >
              <Inbox user={conversationUser} setUser={setCoversationUser} />
            </TabPane>
          )}
          {tabList.includes("profile") && (
            <TabPane
              tab={
                <Tooltip title="个人信息" placement="bottom">
                  <Icon type="user" />
                </Tooltip>
              }
              key="account"
            >
              <Account />
            </TabPane>
          )}
          {tabList.includes("close") && (
            <TabPane
              tab={
                <Tooltip title="隐藏聊天盒" placement="bottom">
                  <Icon type="close" />
                </Tooltip>
              }
              key="minimize"
            >
              <span>shoud not see this!</span>
            </TabPane>
          )}
        </Tabs>
      </div>
      <OtherProfile data={other} selectOtherUser={selectOtherUser} />
    </TabContext.Provider>
  )
}

export default Tab
