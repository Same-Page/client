import React from "react"
import { connect } from "react-redux"
import { useIntl } from "react-intl"

import { Avatar } from "antd"
import { viewOtherUser } from "redux/actions/"

const usersStyle = {
  whiteSpace: "normal",
  textAlign: "center",
  background: "white",
  position: "fixed",
  zIndex: 10,
  marginTop: -1, //to hide above border-botom
  left: 0,
  width: "100%",
  overflow: "auto",
  maxHeight: "50%",
  padding: 5,
  paddingTop: 10,
  borderBottom: "1px solid lightgray"
}

function Users({ users, viewOtherUser, blacklist }) {
  const intl = useIntl()

  users = (users || []).map(user => {
    const blacklisted = blacklist.find(b => {
      return b.id.toString() === user.id.toString()
    })
    let username = user.name
    let avatar = (
      <Avatar
        title={username}
        size={64}
        shape="square"
        icon="user"
        src={user.avatarSrc}
      />
    )

    if (blacklisted) {
      username = intl.formatMessage({ id: "blocked" })

      avatar = (
        <Avatar
          title={username}
          size={64}
          shape="square"
          icon="user"
          // src={user.avatarSrc}
        />
      )
    }

    return (
      <div
        className="sp-online-user"
        onClick={() => viewOtherUser(user)}
        key={user.id}
      >
        {avatar}

        <div className="sp-online-user-username">{username}</div>
      </div>
    )
  })

  return <div style={usersStyle}>{users}</div>
}
const stateToProps = state => {
  return { blacklist: state.blacklist }
}
export default connect(stateToProps, { viewOtherUser })(Users)
