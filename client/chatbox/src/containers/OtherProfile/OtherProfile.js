import React from "react"
import { Button } from "antd"
import { connect } from "react-redux"

import ProfileMeta from "./ProfileMeta"
import PrfileBody from "./ProfileBody"
import { viewOtherUser } from "redux/actions"

function OtherProfile(props) {
  if (!props.data) return <span />

  const user = {
    avatarSrc: props.data.avatarSrc,
    name: props.data.name,
    id: props.data.userId || props.data.id
  }

  return (
    <div className="sp-special-tab">
      <Button
        onClick={() => props.viewOtherUser(null)}
        className="sp-back-btn"
        icon="arrow-left"
      />
      <ProfileMeta user={user}>
        <PrfileBody />
      </ProfileMeta>
    </div>
  )
}

export default connect(null, { viewOtherUser })(OtherProfile)
