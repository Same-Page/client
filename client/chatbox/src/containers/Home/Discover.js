import "./Home.css"
import { useIntl } from "react-intl"
import React, { useState, useEffect } from "react"

import { Icon, Modal, Button } from "antd"

import { connect } from "react-redux"
import CreateRoomForm from "./CreateRoom"
import { getRooms } from "services/room"
import {
  setDiscoveryRoom,
  joinManMadeRoom,
  setRoomConnectionStatus
} from "redux/actions/chat"
// import VideoRoom from "./VideoRoom"
import socketManager from "socket"
const roomColorCache = {}
function getRandomRolor(roomId) {
  if (roomId in roomColorCache) {
    return roomColorCache[roomId]
  }
  var letters = "0123456789".split("")
  var color = "#"
  for (var i = 0; i < 6; i++) {
    color += letters[Math.round(Math.random() * 10)]
  }
  roomColorCache[roomId] = color
  return color
}
const title = (
  <span>
    创建房间<span style={{ color: "gray" }}>（需10积分）</span>
  </span>
)
function Discover({
  joinManMadeRoom,
  setRoomConnectionStatus,
  back,
  showCreateRoomBtn,
  user,
  activeTab
}) {
  // room joined isn't put to redux state, any problem?
  const intl = useIntl()
  const [loadingRooms, setLoadingRooms] = useState(false)
  // rooms here mean room list returned from backend
  // do not confuse with state.rooms
  const [rooms, setRooms] = useState([])
  const [showCreateRoomModal, setShowCreateRoomModal] = useState(false)
  let headerTitle = intl.formatMessage({ id: "roomlist" })
  // if (user) {
  //   headerTitle =
  //     user.name +
  //     intl.formatMessage({ id: "possessive" }) +
  //     intl.formatMessage({ id: "roomlist" })
  // }
  const loadRooms = () => {
    setLoadingRooms(true)
    // setRooms([])
    const params = {}
    if (user) {
      params["userId"] = user.numId
    }
    getRooms(params)
      .then(resp => {
        resp.data.sort((a, b) => {
          return b.userCount - a.userCount
        })
        setRooms(resp.data)
      })
      .catch(err => {})
      .then(() => {
        setLoadingRooms(false)
      })
  }

  useEffect(() => {
    console.log(activeTab)
    if (activeTab === "discover" || user) {
      loadRooms()
    }
  }, [user, activeTab])

  return (
    <span>
      <div>
        <div className="sp-tab-header">
          {back && (
            <Button
              onClick={back}
              size="small"
              className="sp-back-btn"
              icon="arrow-left"
            />
          )}
          {!back && loadingRooms && (
            <Button size="small" className="sp-back-btn" icon="loading" />
          )}
          {!back && !loadingRooms && (
            <Button
              size="small"
              icon="reload"
              onClick={loadRooms}
              className="sp-back-btn"
            />
          )}
          <span>{headerTitle}</span>
          {showCreateRoomBtn && (
            <span style={{ position: "absolute", right: 10 }}>
              <Button
                type="primary"
                icon="plus"
                size="small"
                onClick={() => {
                  setShowCreateRoomModal(true)
                }}
              >
                创建房间
              </Button>
            </span>
          )}
        </div>
        <div
          style={{
            padding: 0,
            // paddingLeft: 20,
            // paddingRight: 20,
            background: "#e6d8d8"
            // backgroundImage: "linear-gradient(#e6f7ff, #40a9ff)"
          }}
          className="sp-tab-body discovery"
        >
          {back && loadingRooms && (
            <Icon
              style={{
                margin: "auto",
                marginTop: 30,
                marginBottom: 30,
                display: "block"

                // position: "absolute",
                // left: 20
              }}
              type="loading"
            />
          )}
          {!loadingRooms && rooms.length === 0 && (
            <center style={{ margin: 20 }}>
              {intl.formatMessage({ id: "empty" })}
            </center>
          )}

          {rooms.map(r => {
            let color = r.color
            if (!color) {
              color = getRandomRolor(r.id)
              r.color = color
            }
            const style = {
              backgroundColor: color
              // "#" + Math.floor(Math.random() * 3777215).toString(16)
            }
            if (r.cover) {
              style.backgroundImage = `url('${r.cover}')`
            }
            // const randomColor = Math.floor(Math.random()*16777215).toString(16);

            // else {
            //   style.backgroundColor = "#acacac"
            // }
            return (
              <div
                title={r.about}
                key={r.id}
                onClick={() => {
                  joinManMadeRoom(r)
                  // setDiscoveryRoom(r)
                  socketManager.joinRoom(r)

                  setRoomConnectionStatus(r.id, "JOINING")
                }}
                className="sp-discover-entry"
                style={style}
              >
                <div className="sp-room-wrapper">
                  <b>{r.name}</b>
                  <br />
                  <Icon style={{ marginRight: 3 }} type="team" />
                  {r.userCount}
                  <br />
                  <b>
                    {r.media && (
                      <Icon
                        type="play-circle"
                        theme="filled"
                        style={{ marginRight: 3 }}
                      />
                    )}
                    {r.title}
                  </b>
                </div>
              </div>
            )
          })}

          <br />
          <br />
          {/* {!loadingRooms && <div style={{ float: "right" }}>WIP...</div>} */}
        </div>
      </div>
      {/* {room && (
        <VideoRoom
          room={room}
          account={account}
          back={() => {
            setDiscoveryRoom(null)
            socketManager.leaveRoom(room)
          }}
        />
      )} */}
      <Modal
        transitionName="none"
        title={title}
        visible={showCreateRoomModal}
        onCancel={() => {
          setShowCreateRoomModal(false)
        }}
        footer={null}
        wrapClassName="sp-modal"
      >
        <CreateRoomForm
          back={() => {
            setShowCreateRoomModal(false)
          }}
          afterUpdateCb={loadRooms}
        />
      </Modal>
    </span>
  )
}

// export default Discover
const stateToProps = state => {
  // const rooms = state.rooms.filter(r => {
  //   return r.type === "discovery"
  // })
  // let room = null
  // if (rooms.length === 1) {
  //   room = { ...rooms[0] }
  // }
  return {
    // room: room,
    activeTab: state.tab
  }
}

export default connect(stateToProps, {
  // setDiscoveryRoom,
  joinManMadeRoom,
  setRoomConnectionStatus
})(Discover)
