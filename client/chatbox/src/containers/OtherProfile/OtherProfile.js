import React from "react"
import { Button } from "antd"

import ProfileMeta from "./ProfileMeta"
import PrfileBody from "./ProfileBody"

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
        onClick={() => props.selectOtherUser()}
        className="sp-back-btn"
        icon="arrow-left"
      />
      <ProfileMeta user={user}>
        <PrfileBody directMessage={props.directMessage} />
      </ProfileMeta>
    </div>
  )
}

export default OtherProfile
