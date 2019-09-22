import React, { useState } from "react"
import { Popover, Button } from "antd"

function Users(props) {
  // const users = props.users || []
  const [visible, setVisibility] = useState(false)

  return (
    <Popover
      content={<a onClick={() => setVisibility(false)}>Close</a>}
      title="Title"
      visible={visible}
      onVisibleChange={setVisibility}
      trigger="click"
    >
      <Button icon="like" />
    </Popover>
  )
}

export default Users
