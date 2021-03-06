import React, { useState } from "react"
import { Button, Avatar, Icon, Row, Col, message } from "antd"
import { useIntl } from "react-intl"
import { connect } from "react-redux"

import { msgOtherUser } from "redux/actions"
import socketManager from "socket"
import storageManager from "utils/storage"

// import { blockUser, unblockUser, thankUser } from "services/user"
import { blockUser, unblockUser } from "services/user"
const avatarStyle = {
  // margin: "auto",
  // marginTop: 20,
  display: "block",
  width: "100%",
  height: "auto",
  borderRadius: 0
}

const aboutStyle = {
  display: "inline-block",
  minWidth: 200,
  maxWidth: 350,
  marginLeft: 30,
  marginRight: 30,
  borderBottom: "1px solid lightgray",
  textAlign: "left",
  overflow: "auto",
  maxHeight: 72,
  padding: 5,
  paddingLeft: 10,
  paddingRight: 10,
  wordBreak: "break-word"
}

function ProfileBody(props) {
  const {
    account,
    msgOtherUser,
    loading,
    loaded,
    user,
    following,
    followerCount,
    followUser,
    blacklist
  } = props
  const intl = useIntl()
  // const [thanking, setThanking] = useState(false)
  const [toggleBlocking, setToggleBlocking] = useState(false)

  const blacklisted =
    blacklist.filter(u => {
      return u.id === user.id
    }).length > 0
  // const self = account && account.id.toString() === user.id.toString()
  return (
    <div>
      <Avatar
        shape="square"
        style={avatarStyle}
        // size={128}
        src={user.avatarSrc}
        icon="user"
      />
      {loading && (
        <Icon
          style={{
            margin: "auto",
            display: "block",
            // position: "absolute",
            // right: 12,
            // top: 12,
            marginTop: 30,
            border: "none"
          }}
          type="loading"
        />
      )}
      {loaded && !loading && (
        <span>
          <div style={{ width: 200, margin: "auto", marginTop: 30 }}>
            <Row gutter={50} style={{ textAlign: "center" }}>
              <Col span={12}>
                ID
                <br />
                <b>{user.numId}</b>
              </Col>
              <Col style={{ textAlign: "center" }} span={12}>
                {intl.formatMessage({ id: "credit" })} <br />
                <b>{user.credit}</b>
              </Col>
            </Row>
            <Row gutter={50} style={{ marginTop: 10, textAlign: "center" }}>
              <Col span={12}>
                {intl.formatMessage({ id: "follower" })}
                <br /> <b>{user.followerCount}</b>
              </Col>
              <Col span={12}>
                <span
                  className="sp-follow-stats"
                  onClick={() => {
                    props.showRooms()
                  }}
                >
                  {intl.formatMessage({ id: "room" })}
                  <br /> <b>{user.rooms.length}</b>
                </span>
              </Col>
            </Row>
          </div>
          <br />
          <center>
            <div style={aboutStyle}>{user.about}</div>{" "}
          </center>

          <div style={{ marginTop: 30, marginBottom: 30 }}>
            {/* {!self && (
                <Button
                  loading={thanking}
                  onClick={() => {
                    setThanking(true)
                    thankUser(user.id)
                      .then(resp => {
                        message.success(        intl.formatMessage({ id: "success" })
                        )
                        window.spDebug(account)
                        const newAccountData = { ...account }
                        newAccountData.credit = resp.data.credit
                        window.spDebug(newAccountData)
                        accountContext.setAccount(newAccountData)
                      })
                      .catch(err => {})
                      .then(() => {
                        setThanking(false)
                      })
                  }}
                  title="每小时可以点一次赞，自己和对方同时增加积分"
                  icon="like"
                  style={{ margin: 10 }}
                  size="large"
                >
                          {intl.formatMessage({ id: "vote.up" })}

                </Button>
              )} */}
            <div style={{ maxWidth: 250, margin: "auto", textAlign: "center" }}>
              <Row type="flex" justify="center">
                <Col span={12}>
                  {following && (
                    <Button
                      icon="user-delete"
                      // style={{ margin: 10 }}
                      size="large"
                      onClick={() => {
                        followUser(false)
                      }}
                    >
                      {intl.formatMessage({ id: "unfollow" })}
                    </Button>
                  )}
                  {!following && (
                    <Button
                      type="primary"
                      icon="user-add"
                      // style={{ margin: 10 }}
                      size="large"
                      onClick={() => {
                        followUser(true)
                      }}
                    >
                      {intl.formatMessage({ id: "follow" })}
                    </Button>
                  )}
                </Col>
                <Col span={12}>
                  <Button
                    onClick={() => {
                      msgOtherUser(user)
                    }}
                    icon="mail"
                    // style={{ margin: 10 }}
                    size="large"
                  >
                    {intl.formatMessage({ id: "send.mail" })}
                  </Button>
                </Col>
              </Row>
              <br />
              <Row type="flex" justify="center">
                <Col span={12}>
                  {!blacklisted && (
                    <Button
                      onClick={() => {
                        storageManager.set("blacklist", [...blacklist, user])
                      }}
                      type="danger"
                      icon="stop"
                      size="large"
                    >
                      {intl.formatMessage({ id: "block" })}
                    </Button>
                  )}

                  {blacklisted && (
                    <Button
                      onClick={e => {
                        storageManager.set(
                          "blacklist",
                          blacklist.filter(u => {
                            return u.id !== user.id
                          })
                        )
                      }}
                      icon="check"
                      size="large"
                    >
                      {intl.formatMessage({ id: "unblock" })}
                    </Button>
                  )}
                </Col>
                <Col span={12}>
                  <Button
                    onClick={() => {
                      message.success(intl.formatMessage({ id: "success" }))
                      // msgOtherUser(user)
                    }}
                    type="danger"
                    icon="flag"
                    // style={{ margin: 10 }}
                    size="large"
                  >
                    {intl.formatMessage({ id: "report" })}
                  </Button>
                </Col>
              </Row>
            </div>
            {account && account.isMod && (
              <div style={{ marginTop: 20 }}>
                {!user.isBanned && (
                  <Button
                    type="danger"
                    loading={toggleBlocking}
                    onClick={() => {
                      socketManager.sendEvent("kick user", {
                        userId: user.id
                      })
                      setToggleBlocking(true)
                      blockUser(user.id)
                        .then(() => {
                          message.success("封禁成功!")
                          props.refreshUserInfo()
                        })
                        .catch(() => {})
                        .then(() => {
                          setToggleBlocking(false)
                        })
                    }}
                  >
                    封禁三天
                  </Button>
                )}
                {user.isBanned && (
                  <Button
                    loading={toggleBlocking}
                    // type="danger"
                    onClick={() => {
                      setToggleBlocking(true)
                      unblockUser(user.id)
                        .then(() => {
                          message.success("解封成功!")
                          props.refreshUserInfo()
                        })
                        .catch(() => {})
                        .then(() => {
                          setToggleBlocking(false)
                        })
                    }}
                  >
                    解封
                  </Button>
                )}
              </div>
            )}
          </div>
        </span>
      )}
    </div>
  )
}
const stateToProps = state => {
  return {
    blacklist: state.blacklist
  }
}

export default connect(stateToProps, { msgOtherUser })(ProfileBody)
