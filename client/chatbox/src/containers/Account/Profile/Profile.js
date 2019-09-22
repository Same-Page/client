import "./Profile.css"

import React, { useState } from "react"
import { Avatar, Button, Row, Col } from "antd"

import { logout } from "services/account"

const avatarStyle = {
  margin: "auto",
  marginTop: 20,
  display: "block"
}
const ProfileBodyStyle = {
  height: "calc(100% - 35px)",
  overflowY: "auto",
  overflowX: "hidden",
  width: "100%",
  position: "fixed",
  // background: "rgb(249, 249, 249)",
  padding: 20,
  paddingTop: 10,
  paddingBottom: 30
}
const aboutStyle = {
  display: "inline-block",
  minWidth: 200,
  maxWidth: 350,
  borderBottom: "1px solid lightgray",
  textAlign: "left",
  overflow: "auto",
  maxHeight: 72,
  padding: 5,
  paddingLeft: 10,
  paddingRight: 10,
  wordBreak: "break-word"
}

function Profile(props) {
  const account = props.account
  const [loggingOut, setLoggingOut] = useState(false)

  return (
    <div style={ProfileBodyStyle}>
      <Avatar
        style={avatarStyle}
        size={128}
        src={account.avatarSrc}
        icon="user"
      />
      <center style={{ margin: 20, fontSize: "large", fontWeight: "bold" }}>
        {account.name}
      </center>
      <Row gutter={50} style={{ textAlign: "center" }}>
        <Col style={{ textAlign: "right" }} span={12}>
          ID: {account.numId}
        </Col>
        <Col style={{ textAlign: "left" }} span={12}>
          积分: {account.credit}
        </Col>
      </Row>
      <Row gutter={50} style={{ textAlign: "center" }}>
        <Col style={{ textAlign: "right" }} span={12}>
          <span className="sp-follow-stats" onClick={props.showFollowings}>
            关注了: {account.followingCount}
          </span>
        </Col>
        <Col style={{ textAlign: "left" }} span={12}>
          <span className="sp-follow-stats" onClick={props.showFollowers}>
            关注者: {account.followerCount}
          </span>
        </Col>
      </Row>
      <br />
      <center>
        <div style={aboutStyle}>{account.about}</div>
        <div style={{ marginTop: 30 }}>
          <Button
            type="primary"
            icon="edit"
            style={{ margin: 10 }}
            size="large"
            onClick={props.showEditProfile}
          >
            修改资料
          </Button>
        </div>
        <Button onClick={props.showResetPassword} style={{ margin: 10 }}>
          更改密码
        </Button>
        <Button
          onClick={() => {
            setLoggingOut(true)

            logout()
              .then(res => {
                console.debug("logout success")
              })
              .catch(err => {
                console.error(err)
              })
              .then(() => {
                setLoggingOut(false)
                props.setAccount(null)
              })
          }}
          loading={loggingOut}
          type="danger"
          style={{ margin: 10 }}
        >
          登出
        </Button>
      </center>
    </div>
  )
}

export default Profile
