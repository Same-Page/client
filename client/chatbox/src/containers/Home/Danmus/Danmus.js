import React, { useState, useEffect } from "react"
import { Icon } from "antd"

import { getLatestDanmus } from "services/danmu"
import AvatarWithHoverCard from "containers/OtherProfile/AvatarWithHoverCard"

function Danmus(props) {
  const [loading, setLoading] = useState(true)
  const [danmus, setDanmus] = useState([])
  useEffect(() => {
    getLatestDanmus()
      .then(resp => {
        setDanmus(resp.data)
      })
      .catch(err => {})
      .then(() => {
        setLoading(false)
      })
  }, [])
  if (loading)
    return (
      <center>
        <Icon type="loading" />
      </center>
    )

  return danmus.map(danmu => (
    <div className="sp-home-comment" key={danmu.id}>
      <a
        className="sp-comment-url"
        target="_blank"
        rel="noopener noreferrer"
        href={danmu.url}
      >
        {danmu.url}
      </a>
      <div className="sp-comment-body">
        <AvatarWithHoverCard
          className="sp-pointer-cursor"
          size="small"
          user={danmu.user}
        />
        <span className="sp-comment-message">{danmu.content}</span>
      </div>
    </div>
  ))
}

export default Danmus
