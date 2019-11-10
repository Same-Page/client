import "./Home.css"
import React, { useState, useEffect } from "react"

import { Icon } from "antd"

import Rooms from "./Rooms"
import { getPopularRooms } from "services/room"

function Discover(props) {
  const [rooms, setRooms] = useState([])
  const [loadingRooms, setLoadingRooms] = useState(true)

  const loadRooms = () => {
    getPopularRooms()
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
    <div className="sp-special-tab">
      <div style={{ margin: 20, marginTop: 10 }}>
        <center>
          <h3>热门房间</h3>
          {loadingRooms && <Icon type="loading" />}
        </center>
        <div className="sp-hot-chatrooms-wrapper">
          <Rooms rooms={rooms} />
        </div>
      </div>
    </div>
  )
}

export default Discover
