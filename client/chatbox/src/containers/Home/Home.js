import "./Home.css"
import React, { useState, useEffect } from "react"

import { Collapse, Modal, Button } from "antd"

import Danmus from "./Danmus"
import Comments from "./Comments"
import Users from "./Users"
import Rooms from "./Rooms"
import CreateRoomForm from "./CreateRoom"
import { getPopularRooms } from "services/room"

const Panel = Collapse.Panel

function Home(props) {
  const [showCreateRoomModal, setShowCreateRoomModal] = useState(false)
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
  const title = (
    <span>
      创建房间<span style={{ color: "gray" }}>（需60积分）</span>
    </span>
  )
  return (
    <div>
      <Modal
        title={title}
        visible={showCreateRoomModal}
        onCancel={() => {
          setShowCreateRoomModal(false)
        }}
        footer={null}
      >
        <CreateRoomForm
          back={() => {
            setShowCreateRoomModal(false)
          }}
          loadRooms={loadRooms}
        />
      </Modal>
      <Collapse
        bordered={false}
        className="sp-special-tab"
        defaultActiveKey={["hot-chatrooms"]}
        // defaultActiveKey={["latest-comments"]}
        onChange={key => {}}
      >
        <Panel header="房间列表" key="hot-chatrooms">
          <Button
            style={{ marginLeft: 5, marginBottom: 15 }}
            type="primary"
            icon="plus"
            onClick={() => {
              setShowCreateRoomModal(true)
            }}
          >
            创建房间
          </Button>
          <div className="sp-hot-chatrooms-wrapper">
            <Rooms rooms={rooms} loading={loadingRooms} />
          </div>
        </Panel>

        <Panel header="最新网页留言" key="latest-comments">
          <Comments />
        </Panel>
        <Panel header="最新视频弹幕" key="latest-danmus">
          <Danmus />
        </Panel>
        <Panel header="新用户" key="new-users">
          <Users />
        </Panel>
      </Collapse>
    </div>
  )
}

export default Home
