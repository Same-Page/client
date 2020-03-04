import "./ProfileCard.css"

import React from "react"
import { useIntl } from "react-intl"
import { Button, Avatar, Card, Row, Col } from "antd"
import { connect } from "react-redux"

import { msgOtherUser } from "redux/actions"

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

function ProfileCard(props) {
  const { user, following, followerCount, followUser, msgOtherUser } = props
  const intl = useIntl()
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
          <Button
            onClick={e => {
              e.stopPropagation()
              // msgOtherUser(user)
            }}
            icon="stop"
            type="danger"
            // style={{ marginLeft: 10 }}
            size="small"
          >
            {intl.formatMessage({ id: "block" })}
          </Button>
        </Col>
        <Col span={12}>
          <Button
            onClick={e => {
              e.stopPropagation()
              // msgOtherUser(user)
            }}
            type="danger"
            icon="flag"
            // style={{ marginLeft: 10 }}
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
      // size="small"
      style={{
        width: 330,
        // background: "#8acbff",
        overflow: "hidden"
      }}
    >
      <Meta avatar={avatar} title={user.name} description={footer} />
    </Card>
  )
}

function AvatarWithFollowerCount(props) {
  return (
    <span>
      <Avatar size={64} src={props.src} icon="user" />
      <div style={{ marginTop: 30 }}>关注者: {props.followerCount}</div>
    </span>
  )
}

export default connect(null, { msgOtherUser })(ProfileCard)
