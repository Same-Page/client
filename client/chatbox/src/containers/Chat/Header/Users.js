import React from "react"
import { connect } from "react-redux"

import { Avatar } from "antd"
import { viewOtherUser } from "redux/actions/"

const usersStyle = {
  textAlign: "center",
  background: "white",
  position: "fixed",
  zIndex: 10,
  marginTop: 5,
  left: 0,
  width: "100%",
  overflow: "auto",
  maxHeight: "50%",
  padding: 5,
  paddingTop: 10,
  borderBottom: "1px solid lightgray"
}

function Users(props) {
  const users = (props.users || []).map(user => {
    return (
      <div
        className="sp-online-user"
        onClick={() => props.viewOtherUser(user)}
        key={user.id}
      >
        <Avatar
          title={user.name}
          size={64}
          shape="square"
          icon="user"
          src={user.avatarSrc}
        />
        <div className="sp-online-user-username">{user.name}</div>
      </div>
    )
  })

  return <div style={usersStyle}>{users}</div>
}

export default connect(null, { viewOtherUser })(Users)
