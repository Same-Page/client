import "./ProfileCard.css"

import React from "react"
import { useIntl } from "react-intl"
import { Button, Avatar, Card, Row, Col, message } from "antd"
import { connect } from "react-redux"

import { msgOtherUser } from "redux/actions"
import storageManager from "utils/storage"

const { Meta } = Card

const aboutStyle = {
  display: "inline-block",
  width: "100%",
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
  textAlign: "left",
  marginBottom: 5,
  minHeight: 30
}

function ProfileCard({
  user,
  following,
  followerCount,
  followUser,
  msgOtherUser,
  blacklist
}) {
  const intl = useIntl()
  const blacklisted =
    blacklist.filter(u => {
      return u.id === user.id
    }).length > 0
  const footer = (
    <div>
      <div style={aboutStyle}>{user.about}</div>

      <Row type="flex" justify="center">
        <Col span={12}>
          {following && (
            <Button
              icon="user-delete"
              size="small"
              onClick={e => {
                e.stopPropagation()

                followUser(false)
              }}
            >
              {intl.formatMessage({ id: "unfollow" })}
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
              {intl.formatMessage({ id: "follow" })}
            </Button>
          )}
        </Col>

        <Col span={12}>
          <Button
            onClick={e => {
              e.stopPropagation()
              msgOtherUser(user)
            }}
            icon="mail"
            // style={{ marginLeft: 10 }}
            size="small"
          >
            {intl.formatMessage({ id: "send.mail" })}
          </Button>
        </Col>
      </Row>

      <Row style={{ marginTop: 10 }} type="flex" justify="center">
        <Col span={12}>
          {!blacklisted && (
            <Button
              onClick={e => {
                e.stopPropagation()
                storageManager.set("blacklist", [...blacklist, user])
              }}
              icon="stop"
              type="danger"
              // style={{ marginLeft: 10 }}
              size="small"
            >
              {intl.formatMessage({ id: "block" })}
            </Button>
          )}
          {blacklisted && (
            <Button
              onClick={e => {
                e.stopPropagation()
                storageManager.set(
                  "blacklist",
                  blacklist.filter(u => {
                    return u.id !== user.id
                  })
                )
              }}
              icon="check"
              size="small"
            >
              {intl.formatMessage({ id: "unblock" })}
            </Button>
          )}
        </Col>
        <Col span={12}>
          <Button
            onClick={e => {
              e.stopPropagation()
              message.success(intl.formatMessage({ id: "success" }))
            }}
            type="danger"
            icon="flag"
            size="small"
          >
            {intl.formatMessage({ id: "report" })}
          </Button>
        </Col>
      </Row>
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
      style={{
        width: 295,
        paddingTop: 15,
        paddingBottom: 15,
        // background: "#8acbff",
        overflow: "hidden"
      }}
    >
      <Meta avatar={avatar} title={user.name} description={footer} />
    </Card>
  )
}

function AvatarWithFollowerCount(props) {
  const intl = useIntl()
  return (
    <span>
      <Avatar size={64} src={props.src} icon="user" />
      <div style={{ marginTop: 30 }}>
        {intl.formatMessage({ id: "follower" })}: {props.followerCount}
      </div>
    </span>
  )
}

const stateToProps = state => {
  return {
    blacklist: state.blacklist
  }
}

export default connect(stateToProps, { msgOtherUser })(ProfileCard)
