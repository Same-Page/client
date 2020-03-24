import React, { useState } from "react"
import { Button } from "antd"
// import { connect } from "react-redux"

import ProfileMeta from "./ProfileMeta"
import PrfileBody from "./ProfileBody"
// import { viewOtherUser } from "redux/actions"
import Discover from "containers/Home/Discover"

function OtherProfile({ otherUser, viewOtherUser }) {
  if (!otherUser) return <span />

  const [showRooms, setShowRooms] = useState(false)
  const [user, setUser] = useState({
    avatarSrc: otherUser.avatarSrc,
    name: otherUser.name,
    id: otherUser.userId || otherUser.id // TODO
  })

  return (
    <span>
      <div className="sp-special-tab">
        {showRooms && (
          // special tab inside special tab
          // it ensure the rooms tab is in the fornt
          <div className="sp-special-tab">
            <Discover
              zIndex={10}
              user={user}
              showCreateRoomBtn={false}
              back={() => {
                setShowRooms(false)
              }}
            />
          </div>
        )}
        {/* {!showRooms && ( */}
        <div>
          <Button
            onClick={() => viewOtherUser(null)}
            className="sp-back-btn"
            icon="arrow-left"
          />
          <div className="sp-tab-header">{user.name}</div>
          <div className="sp-tab-body">
            <ProfileMeta user={user} setUser={setUser}>
              <PrfileBody
                // show={!showRooms}
                showRooms={() => {
                  setShowRooms(true)
                }}
              />
            </ProfileMeta>
          </div>
        </div>
        {/* )} */}
      </div>
    </span>
  )
}

// export default connect(null, { viewOtherUser })(OtherProfile)
export default OtherProfile
