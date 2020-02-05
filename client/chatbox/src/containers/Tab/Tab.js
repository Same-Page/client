import "antd/dist/antd.css"
import "./Tab.css"
import { useIntl } from "react-intl"
import React, { useState, useEffect } from "react"
import { Tabs, Icon, Tooltip, Badge } from "antd"
import { connect } from "react-redux"

import Chat from "containers/Chat"
import Comment from "containers/Comment"
import Account from "containers/Account"
import OtherProfile from "containers/OtherProfile"
import Inbox from "containers/Inbox"
import Discover from "containers/Home/Discover"

import storageManager from "utils/storage"

import { changeTab, viewOtherUser } from "redux/actions"

const TabPane = Tabs.TabPane

function Tab(props) {
  const intl = useIntl()
  // console.log("render tab")
  const tabList = window.spConfig.tabList || [
    "discover",
    "chat",
    "comment",
    "inbox",
    "profile",
    "close"
  ]
  // const defaultTab = window.spConfig.defaultTab || props.tab
  // const [activeTab, changeTab] = useState(defaultTab)
  // view other's profile
  const [unread, setUnread] = useState(false)
  // view direct message with other
  // const [conversationUser, setCoversationUser] = useState()

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
    <div>
      <div className="card-container">
        <Tabs
          onChange={val => {
            // minimize actually means hide
            // but there will be a small icon to unhide
            if (val === "minimize") {
              window.parent.postMessage("minimize", "*")
              return
            }
            props.changeTab(val)
            // remember last viewed user?
            props.viewOtherUser(null)
          }}
          activeKey={props.tab}
          type="card"
        >
          {tabList.includes("discover") && (
            <TabPane
              tab={
                <Tooltip
                  title={intl.formatMessage({ id: "discover" })}
                  placement="bottom"
                >
                  <Icon type="compass" />
                </Tooltip>
              }
              key="discover"
            >
              <Discover />
            </TabPane>
          )}
          {tabList.includes("chat") && (
            <TabPane
              tab={
                <Tooltip
                  title={intl.formatMessage({ id: "live.chat" })}
                  placement="bottom"
                >
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
                <Tooltip
                  title={intl.formatMessage({ id: "comment" })}
                  placement="bottom"
                >
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
                <Tooltip
                  title={intl.formatMessage({ id: "inbox" })}
                  placement="bottom"
                >
                  <Badge dot={unread} className="sp-new-message-dot">
                    <Icon type="mail" />
                  </Badge>
                </Tooltip>
              }
              key="inbox"
            >
              <Inbox />
            </TabPane>
          )}
          {tabList.includes("profile") && (
            <TabPane
              tab={
                <Tooltip
                  title={intl.formatMessage({ id: "profile" })}
                  placement="bottom"
                >
                  <Icon type="user" />
                </Tooltip>
              }
              key="profile"
            >
              <Account />
            </TabPane>
          )}
          {tabList.includes("close") && (
            <TabPane
              tab={
                <Tooltip
                  title={intl.formatMessage({ id: "close" })}
                  placement="bottom"
                >
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
      <OtherProfile />
    </div>
  )
}

const stateToProps = state => {
  return { tab: state.tab }
}
export default connect(stateToProps, { changeTab, viewOtherUser })(Tab)
