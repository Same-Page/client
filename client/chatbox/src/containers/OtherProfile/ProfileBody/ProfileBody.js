import React, { useState, useContext } from "react"
import { Button, Avatar, Icon, Row, Col, message } from "antd"

import AccountContext from "context/account-context"

import socketManager from "socket"
import { blockUser, unblockUser, thankUser } from "services/user"
const avatarStyle = {
  margin: "auto",
  marginTop: 20,
  display: "block"
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
    directMessage,
    loading,
    loaded,
    user,
    following,
    followerCount,
    followUser
  } = props
  const [thanking, setThanking] = useState(false)
  const [toggleBlocking, setToggleBlocking] = useState(false)
  const accountContext = useContext(AccountContext)
  const account = accountContext.account
  const self = account && account.id.toString() === user.id.toString()
  return (
    <div>
      <Avatar style={avatarStyle} size={128} src={user.avatarSrc} icon="user" />
      <center style={{ margin: 20, fontSize: "large", fontWeight: "bold" }}>
        {user.name}
        {loading && (
          <Icon
            style={{
              display: "block",
              marginTop: 10,
              border: "none"
            }}
            type="loading"
          />
        )}
      </center>
      {loaded && !loading && (
        <span>
          <Row gutter={50} style={{ textAlign: "center" }}>
            <Col style={{ textAlign: "right" }} span={12}>
              ID: {user.numId}
            </Col>
            <Col style={{ textAlign: "left" }} span={12}>
              关注者: {followerCount}
            </Col>
          </Row>
          <br />
          <center>
            <div style={aboutStyle}>{user.about}</div>
            <div style={{ marginTop: 30, marginBottom: 30 }}>
              {!self && (
                <Button
                  loading={thanking}
                  onClick={() => {
                    setThanking(true)
                    thankUser(user.id)
                      .then(resp => {
                        message.success("点赞成功!")
                        console.log(account)
                        const newAccountData = { ...account }
                        newAccountData.credit = resp.data.credit
                        console.log(newAccountData)
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
                  赞
                </Button>
              )}
              {following && (
                <Button
                  icon="user-delete"
                  style={{ margin: 10 }}
                  size="large"
                  onClick={() => {
                    followUser(false)
                  }}
                >
                  取消关注
                </Button>
              )}
              {!following && (
                <Button
                  type="primary"
                  icon="user-add"
                  style={{ margin: 10 }}
                  size="large"
                  onClick={() => {
                    followUser(true)
                  }}
                >
                  关注
                </Button>
              )}

              <Button
                onClick={() => {
                  directMessage(user)
                }}
                icon="mail"
                style={{ margin: 10 }}
                size="large"
              >
                私信
              </Button>
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
          </center>
        </span>
      )}
    </div>
  )
}

export default ProfileBody
