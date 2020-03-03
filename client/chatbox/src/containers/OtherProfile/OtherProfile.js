import React from "react"
import { Button } from "antd"
// import { connect } from "react-redux"

import ProfileMeta from "./ProfileMeta"
import PrfileBody from "./ProfileBody"
// import { viewOtherUser } from "redux/actions"

function OtherProfile({ otherUser, viewOtherUser }) {
  if (!otherUser) return <span />

  const user = {
    avatarSrc: otherUser.avatarSrc,
    name: otherUser.name,
    id: otherUser.userId || otherUser.id // TODO
  }

  return (
    <div className="sp-special-tab">
      <Button
        onClick={() => viewOtherUser(null)}
        className="sp-back-btn"
        icon="arrow-left"
      />
      <div className="sp-tab-header">{user.name}</div>
      <ProfileMeta user={user}>
        <PrfileBody />
      </ProfileMeta>
    </div>
  )
}

// export default connect(null, { viewOtherUser })(OtherProfile)
export default OtherProfile
