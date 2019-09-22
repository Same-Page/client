import "./Message.css"

import React, { useState, useContext } from "react"
import { Icon } from "antd"
import AvatarWithHoverCard from "containers/OtherProfile/AvatarWithHoverCard"
import AccountContext from "context/account-context"

function Comment(props) {
  const data = props.data
  const user = {
    id: data.userId,
    name: data.name,
    avatarSrc: data.avatarSrc,
    self: data.self
  }

  const [score, setScore] = useState(data.score)
  const [voted, setVoted] = useState(data.voted)
  const account = useContext(AccountContext).account

  function theme() {
    if (voted) return "twoTone"
    return "outlined"
  }
  return (
    <div style={{ marginTop: 10 }} className={data.self ? "self" : ""}>
      <AvatarWithHoverCard className="sp-comment-message-avatar" user={user} />
      <div className="sp-message-body text">
        <div style={{ marginBottom: 5 }}>
          <span className="sp-comment-message-username">{data.name}</span>
          <span className="sp-comment-message-time">{data.time}</span>
        </div>
        <div>{data.content}</div>
        {!data.noFooter && (
          <div className="sp-comment-message-footer">
            <span>
              <Icon
                theme={theme()}
                onClick={() => {
                  if (!account) {
                    // TODO: show error msg
                    return
                  }
                  setScore(prevScore => {
                    if (voted) return prevScore - 1
                    return prevScore + 1
                  })
                  setVoted(prevState => {
                    return !prevState
                  })
                  props.vote(data.id)
                }}
                type="like"
              />
              <span className="sp-comment-message-score">{score}</span>
            </span>
            <span
              onClick={() => props.reply(data.userId, data.name)}
              className="sp-comment-message-reply"
            >
              回复
            </span>
          </div>
        )}
      </div>
    </div>
  )
}

export default Comment
