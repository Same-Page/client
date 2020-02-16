import React, { useState, useEffect } from "react"
import { Modal, Switch, Button } from "antd"
import { useIntl } from "react-intl"
import { connect } from "react-redux"

import storageManager from "utils/storage"
import socketManager from "socket"
import { setRoomConnectionStatus } from "redux/actions/chat"
function RoomInfo({
  account,
  rooms,
  room,
  setShowHelp,
  setRoomConnectionStatus
}) {
  const [join, setJoin] = useState(true)
  const intl = useIntl()

  useEffect(() => {
    storageManager.get("noJoin", noJoin => {
      if (noJoin && noJoin.includes(room.id)) {
        setJoin(false)
      }
    })
  }, [])
  let helpContent,
    helpTitle = ""

  if (room.type === "room") {
    helpTitle = room.name
    helpContent = (
      <div>
        <h4>{intl.formatMessage({ id: "room.about" })}</h4>
        {room.about}
        <br />
        <br />
        {room.owner && room.owner.avatarSrc && (
          <div>
            <h4>{intl.formatMessage({ id: "room.owner" })}</h4>
            <div>
              {/* <Avatar
              // icon={icon}
              // className={props.className}
              src={room.owner.avatarSrc}
              size="large"
              style={{ cursor: "pointer", marginRight: 10 }}
              onClick={() => {
                setShowHelp(false)
                props.viewOtherUser(room.owner)
              }}
            /> */}
              {room.owner.name}
            </div>
          </div>
        )}
      </div>
    )
  }
  if (room.type === "site") {
    helpTitle = "同网站聊天"
    helpContent = (
      <div>
        <h4>{intl.formatMessage({ id: "room.about" })}</h4>
        和其他也在{room.id}的用户聊天。
      </div>
    )
  }
  if (room.type === "page") {
    helpTitle = "同网页聊天"
    helpContent = (
      <div>
        <h4>{intl.formatMessage({ id: "room.about" })}</h4>
        和其他也在{room.id}的用户聊天。
      </div>
    )
  }
  // if (mode === "tags") {
  //   helpTitle = intl.formatMessage({ id: "room" }) + " " + room.id
  //   helpContent = (
  //     <div>
  //       {/* <p>浏览相似内容的用户会进入该聊天室</p> */}
  //       <p>{intl.formatMessage({ id: "keywords.of.room" })}</p>
  //       <b>{room.tags && room.tags.join(", ")}</b>
  //       {(!room.tags || !room.tags.length) && (
  //         <span>{intl.formatMessage({ id: "no.keyword" })}</span>
  //       )}
  //     </div>
  //   )
  // }
  return (
    <Modal
      title={helpTitle}
      visible={true}
      onCancel={() => {
        setShowHelp(false)
      }}
      wrapClassName="sp-modal"
      footer={null}
      bodyStyle={{ maxHeight: "calc(100% - 55px)", overflowY: "auto" }}
    >
      <h4>
        {intl.formatMessage({ id: "auto.join" })}
        {"    "}&nbsp;&nbsp;&nbsp;
        <Switch
          checked={join}
          onChange={joining => {
            setJoin(joining)
            storageManager.get("noJoin", noJoin => {
              noJoin = noJoin || []
              if (joining) {
                noJoin = noJoin.filter(n => {
                  return n !== room.id
                })
              } else {
                noJoin.push(room.id)
              }
              noJoin = [...new Set(noJoin)]
              storageManager.set("noJoin", noJoin)
              // Join or leave room is decided by noJoin filter
            })
          }}
        />{" "}
      </h4>

      <br />
      {helpContent}
      <a
        className="yiyelink"
        target="_blank"
        rel="noopener noreferrer"
        href="https://yiyechat.com"
      >
        {intl.formatMessage({ id: "sp" })}
      </a>
    </Modal>
  )
}

export default connect(null, { setRoomConnectionStatus })(RoomInfo)
