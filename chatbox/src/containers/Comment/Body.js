import React from "react"

import Message from "./Message"

function CommentBody(props) {
  const data = props.data || []
  // let index = 0
  let comments = data.map(comment => {
    return (
      <Message
        vote={props.vote}
        reply={props.reply}
        // key={index++}
        key={comment.id}
        data={comment}
      />
    )
  })
  if (!comments.length) {
    comments = <center>没有评论</center>
  }

  return <div>{comments}</div>
}

export default CommentBody
