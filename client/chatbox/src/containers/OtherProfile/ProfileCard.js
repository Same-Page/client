import React from "react"
import { Button, Avatar, Card } from "antd"
const { Meta } = Card

const aboutStyle = {
  display: "inline-block",
  width: "100%",
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
  textAlign: "left",
  marginBottom: 5
}

function ProfileCard(props) {
  const { user, following, followerCount, followUser, directMessage } = props
  const footer = (
    <div>
      {user.about && <div style={aboutStyle}>{user.about}</div>}

      {following && (
        <Button
          icon="user-delete"
          size="small"
          onClick={e => {
            e.stopPropagation()

            followUser(false)
          }}
        >
          取消关注
        </Button>
      )}
      {!following && (
        <Button
          icon="user-add"
          type="primary"
          size="small"
          onClick={e => {
            e.stopPropagation()
            followUser(true)
          }}
        >
          关注
        </Button>
      )}

      <Button
        onClick={e => {
          e.stopPropagation()
          directMessage(user)
        }}
        icon="mail"
        style={{ marginLeft: 10 }}
        size="small"
      >
        私信
      </Button>
    </div>
  )

  const avatar = (
    <AvatarWithFollowerCount
      followerCount={followerCount}
      src={user.avatarSrc}
    />
  )

  return (
    <Card
      onClick={e => {
        e.stopPropagation()
      }}
      size="small"
      style={{ width: 270, overflow: "hidden" }}
    >
      <Meta avatar={avatar} title={user.name} description={footer} />
    </Card>
  )
}

function AvatarWithFollowerCount(props) {
  return (
    <span>
      <Avatar size={48} src={props.src} icon="user" />
      {/* <div>关注者: {props.followerCount}</div> */}
    </span>
  )
}

export default ProfileCard
