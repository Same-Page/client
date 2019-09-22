import "./Users.css"

import React, { useState, useEffect } from "react"
import { Icon } from "antd"

import { getLatestUsers } from "services/user"
import AvatarWithHoverCard from "containers/OtherProfile/AvatarWithHoverCard"

function Users(props) {
  const [loading, setLoading] = useState(true)

  const [users, setUsers] = useState([])
  useEffect(() => {
    getLatestUsers()
      .then(resp => {
        setUsers(resp.data)
      })
      .catch(err => {})
      .then(() => {
        setLoading(false)
      })
  }, [])
  if (loading)
    return (
      <center>
        <Icon type="loading" />
      </center>
    )
  return users.map(user => (
    <div className="sp-home-users" key={user.id}>
      <div>
        <AvatarWithHoverCard className="sp-pointer-cursor" user={user} />
        <span className="sp-username">{user.name}</span>
      </div>
    </div>
  ))
}

export default Users
