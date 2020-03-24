import "./Home.css"
import { useIntl } from "react-intl"
import React, { useState, useEffect } from "react"
import { Icon, Modal, Button } from "antd"

import Rooms from "./Rooms"
import CreateRoomForm from "./CreateRoom"

import { getPopularRooms } from "services/room"

function RoomsWrapper(props) {
  const intl = useIntl()
  const [rooms, setRooms] = useState([])
  const [loadingRooms, setLoadingRooms] = useState(true)
  const [showCreateRoomModal, setShowCreateRoomModal] = useState(false)

  const loadRooms = () => {
    getPopularRooms("room")
      .then(resp => {
        resp.data.forEach(r => {
          r.type = "room"
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
    <div className="sp-inbox-tab">
      <div
        style={{ padding: 10, paddingLeft: 20, paddingRight: 20 }}
        className="sp-tab-body"
      >
        <Button
          style={{ marginLeft: 0, marginBottom: 20, width: "100%" }}
          type="primary"
          icon="plus"
          onClick={() => {
            setShowCreateRoomModal(true)
          }}
        >
          {intl.formatMessage({ id: "create.room" })}
        </Button>
        <center>{loadingRooms && <Icon type="loading" />}</center>

        <Rooms setShowRoomList={props.setShowRoomList} rooms={rooms} />
      </div>

      <Modal
        transitionName="none"
        wrapClassName="sp-modal"
        bodyStyle={{
          paddingBottom: 0,
          maxHeight: "calc(100% - 35px)",
          overflowY: "auto"
        }}
        title={intl.formatMessage({ id: "create.room" })}
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
    </div>
  )
}

export default RoomsWrapper
