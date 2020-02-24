import "./Home.css"
import { useIntl } from "react-intl"
import React, { useState, useEffect } from "react"
import { Icon } from "antd"

import { getPopularRooms } from "services/room"
import VideoRoom from "./VideoRoom"

function Discover({ account, viewOtherUser }) {
  // room joined isn't put to redux state, any problem?
  const intl = useIntl()
  const [loadingRooms, setLoadingRooms] = useState(true)
  const [rooms, setRooms] = useState([])
  const [room, setRoom] = useState()
  // const setRoom = (r)=>{
  //   // input is room info from server
  //   // need to return room from redux state
  //   _setRoom(r)
  // }
  const loadRooms = () => {
    getPopularRooms()
      .then(resp => {
        // resp.data.forEach(r => {
        //   r.type = "room"
        // })

        const mockRooms = [
          {
            id: "video-room",
            type: "media",
            name: "放映厅",
            src:
              "https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_5mb.mp4"
          },
          {
            id: "music-room",
            type: "media",
            name: "音悦台"
          },
          {
            id: "joke-room",
            type: "text",
            name: "冷笑话"
          }
        ]
        setRooms(mockRooms)
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
                setRoom(r)
              }}
              className="sp-discover-entry"
            >
              {r.name}
            </div>
          ))}

          <br />
          <br />
          {!loadingRooms && <div style={{ float: "right" }}>WIP...</div>}
        </div>
      </div>
      {room && room.type == "media" && (
        <VideoRoom
          room={room}
          setRoom={setRoom}
          account={account}
          back={() => {
            setRoom(null)
          }}
        />
      )}
    </span>
  )
}

export default Discover
