import React, { useState, useEffect } from "react"
import { Modal, Switch, Avatar } from "antd"
import { useIntl } from "react-intl"
import { connect } from "react-redux"

import storageManager from "utils/storage"
// import socketManager from "socket"
import { setRoomConnectionStatus } from "redux/actions/chat"
import { viewOtherUser } from "redux/actions"
function RoomInfo({
  account,
  rooms,
  room,
  setShowHelp,
  setRoomConnectionStatus,
  viewOtherUser
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
              <Avatar
                // icon={icon}
                // className={props.className}
                src={room.owner.avatarSrc}
                size="large"
                style={{ cursor: "pointer", marginRight: 10 }}
                onClick={() => {
                  setShowHelp(false)
                  viewOtherUser(room.owner)
                }}
              />
              {room.owner.name}
            </div>
          </div>
        )}
      </div>
    )
  }
  if (room.type === "site") {
    helpTitle = intl.formatMessage({ id: "same.site.chat" })
    helpContent = (
      <div>
        <h4>{intl.formatMessage({ id: "room.about" })}</h4>
        {intl.formatMessage({ id: "same.site.chat" })} @{" "}
        <span style={{ color: "#1890ff" }}>{room.id}</span>
      </div>
    )
  }
  if (room.type === "page") {
    helpTitle = intl.formatMessage({ id: "same.page.chat" })
    helpContent = (
      <div>
        <h4>{intl.formatMessage({ id: "room.about" })}</h4>
        {intl.formatMessage({ id: "same.page.chat" })} @{" "}
        <span style={{ color: "#1890ff" }}>{room.id}</span>
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
      <br />
      {room.media && (
        <span>
          <h4>播放列表</h4>
          <ul>
            {room.media.map((m, index) => {
              const url = m["sources"][0]["src"]
              return (
                <li key={url}>
                  <a
                    onClick={() => {
                      window.playMediaFromRoomMediaList(index)
                      setShowHelp(false)
                    }}
                  >
                    {url}
                  </a>
                </li>
              )
            })}
          </ul>
        </span>
      )}
      {/* <a
        className="yiyelink"
        target="_blank"
        rel="noopener noreferrer"
        href="https://yiyechat.com"
      >
        {intl.formatMessage({ id: "sp" })}
      </a> */}
    </Modal>
  )
}

export default connect(null, { setRoomConnectionStatus, viewOtherUser })(
  RoomInfo
)
