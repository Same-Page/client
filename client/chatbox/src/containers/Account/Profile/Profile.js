import "./Profile.css"
import { useIntl } from "react-intl"

import React, { useState } from "react"
import { Avatar, Button, Row, Col } from "antd"
import storageManager from "utils/storage"

import { logout } from "services/account"

const avatarStyle = {
  display: "block",
  width: "100%",
  height: "auto",
  borderRadius: 0
}
const ProfileBodyStyle = {
  height: "calc(100% - 40px)",
  overflowY: "auto",
  overflowX: "hidden",
  width: "100%",
  position: "fixed",
  // background: "rgb(249, 249, 249)",
  // padding: 50,
  // paddingTop: 10,
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
  const intl = useIntl()

  return (
    <div style={ProfileBodyStyle}>
      <div className="sp-tab-header">{account.name}</div>

      <Avatar
        style={avatarStyle}
        // size={128}
        shape="square"
        src={account.avatarSrc}
        icon="user"
      />
      {/* <center style={{ margin: 20, fontSize: "large", fontWeight: "bold" }}>
        {account.name}
      </center> */}
      <div style={{ width: 200, margin: "auto", marginTop: 30 }}>
        <Row gutter={50} style={{ textAlign: "center" }}>
          <Col style={{ textAlign: "center" }} span={12}>
            ID <br />
            <b>{account.numId}</b>
          </Col>
          <Col style={{ textAlign: "center" }} span={12}>
            {intl.formatMessage({ id: "credit" })} <br />
            <b>{account.credit}</b>
          </Col>
        </Row>
        <Row gutter={50} style={{ marginTop: 10, textAlign: "center" }}>
          <Col style={{ textAlign: "center" }} span={12}>
            <span className="sp-follow-stats" onClick={props.showFollowings}>
              {intl.formatMessage({ id: "following" })}
              <br /> <b>{account.followingCount}</b>
            </span>
          </Col>
          <Col style={{ textAlign: "center" }} span={12}>
            <span className="sp-follow-stats" onClick={props.showFollowers}>
              {intl.formatMessage({ id: "follower" })}
              <br /> <b>{account.followerCount}</b>
            </span>
          </Col>
        </Row>
      </div>
      <br />
      <center>
        <div style={aboutStyle}>{account.about}</div>
        <div style={{ marginTop: 30 }}>
          <Button
            type="primary"
            icon="edit"
            style={{ margin: 10 }}
            // size="large"
            onClick={props.showEditProfile}
          >
            {intl.formatMessage({ id: "update.profile" })}
          </Button>
        </div>
        <Button onClick={props.showResetPassword} style={{ margin: 10 }}>
          {intl.formatMessage({ id: "change.password" })}
        </Button>
        <Button
          onClick={() => {
            setLoggingOut(true)

            logout()
              .then(res => {
                window.spDebug("logout success")
              })
              .catch(err => {
                console.error(err)
              })
              .then(() => {
                setLoggingOut(false)
                storageManager.set("account", null)
              })
          }}
          loading={loggingOut}
          type="danger"
          style={{ margin: 10 }}
        >
          {intl.formatMessage({ id: "logout" })}
        </Button>
      </center>
    </div>
  )
}

export default Profile
