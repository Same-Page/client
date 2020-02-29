import "./Home.css"
import { useIntl } from "react-intl"
import React, { useState, useEffect } from "react"
import { Icon } from "antd"
import { connect } from "react-redux"

import { getPopularRooms } from "services/room"
import { setDiscoveryRoom, joinManMadeRoom } from "redux/actions/chat"
// import VideoRoom from "./VideoRoom"
import socketManager from "socket"
function getRandomRolor() {
  var letters = "0123456789".split("")
  var color = "#"
  for (var i = 0; i < 6; i++) {
    color += letters[Math.round(Math.random() * 10)]
  }
  return color
}
function Discover({ account, setDiscoveryRoom, room, joinManMadeRoom }) {
  // room joined isn't put to redux state, any problem?
  const intl = useIntl()
  const [loadingRooms, setLoadingRooms] = useState(true)
  // rooms here mean room list returned from backend
  // do not confuse with state.rooms
  const [rooms, setRooms] = useState([])

  const loadRooms = () => {
    getPopularRooms("room")
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
    loadRooms()
  }, [])

  return (
    <span>
      <div>
        <div className="sp-tab-header">
          <span
            style={{
              position: "absolute",
              left: 20
            }}
          >
            {loadingRooms && <Icon type="loading" />}
          </span>
          {intl.formatMessage({ id: "fixed.rooms" })}
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
          {rooms.map(r => {
            const style = {
              backgroundColor: getRandomRolor()
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
                }}
                className="sp-discover-entry"
                style={style}
              >
                <div>
                  {r.name}&nbsp;
                  <br />
                  <Icon style={{ marginRight: 3 }} type="team" />
                  {r.userCount}
                  <br />
                  <br />
                  <b>
                    {r.src && (
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
    </span>
  )
}

// export default Discover
const stateToProps = state => {
  const rooms = state.rooms.filter(r => {
    return r.type === "discovery"
  })
  let room = null
  if (rooms.length === 1) {
    room = { ...rooms[0] }
  }
  return {
    room: room
  }
}

export default connect(stateToProps, { setDiscoveryRoom, joinManMadeRoom })(
  Discover
)
