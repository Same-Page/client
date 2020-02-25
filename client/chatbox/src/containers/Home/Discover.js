import "./Home.css"
import { useIntl } from "react-intl"
import React, { useState, useEffect } from "react"
import { Icon } from "antd"
import { connect } from "react-redux"

import { getPopularRooms } from "services/room"
import { setDiscoveryRoom } from "redux/actions/chat"
import VideoRoom from "./VideoRoom"
import socketManager from "socket"

function Discover({ account, setDiscoveryRoom, room }) {
  // room joined isn't put to redux state, any problem?
  const intl = useIntl()
  const [loadingRooms, setLoadingRooms] = useState(true)
  // rooms here mean room list returned from backend
  // do not confuse with state.rooms
  const [rooms, setRooms] = useState([])

  const loadRooms = () => {
    getPopularRooms("discovery")
      .then(resp => {
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
      <div className="sp-inbox-tab">
        <center className="sp-tab-header">
          <span
            style={{
              position: "absolute",
              left: 20
            }}
          >
            {loadingRooms && <Icon type="loading" />}
          </span>
          {intl.formatMessage({ id: "discover" })}
        </center>
        <div
          style={{ padding: 10, paddingLeft: 20, paddingRight: 20 }}
          className="sp-tab-body"
        >
          {rooms.map(r => (
            <div
              key={r.id}
              onClick={() => {
                setDiscoveryRoom(r)
                socketManager.joinRoom(r)
              }}
              className="sp-discover-entry"
            >
              {r.name}&nbsp;
              <br />
              <Icon type="team" />
              {r.userCount}
              <br />
              <p>{r.about}</p>
            </div>
          ))}

          <br />
          <br />
          {!loadingRooms && <div style={{ float: "right" }}>WIP...</div>}
        </div>
      </div>
      {room && (
        <VideoRoom
          room={room}
          account={account}
          back={() => {
            setDiscoveryRoom(null)
            socketManager.leaveRoom(room)
          }}
        />
      )}
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
export default connect(stateToProps, { setDiscoveryRoom })(Discover)
