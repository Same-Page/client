import "./Iframe.css"

import React from "react"
import { Modal } from "antd"

function Iframe({ title, url, show, setShow }) {
  return (
    <Modal
      closable={false}
      wrapClassName="sp-iframe-modal"
      bodyStyle={{
        padding: 0,
        width: "100%",
        height: "100%"
        // maxHeight: "calc(100% - 10px)",
        // overflowY: "auto"
      }}
      title={title}
      visible={show}
      onCancel={() => {
        setShow(false)
      }}
      footer={null}
    >
      <iframe style={{ height: "100%", width: "100%" }} src={url} />
    </Modal>
  )
}

export default Iframe
