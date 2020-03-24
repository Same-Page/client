import React, { useEffect, useState, useRef } from "react"
import { useIntl } from "react-intl"
import { Avatar, Icon, Radio, Button } from "antd"

function Blacklist({ blacklist, viewOtherUser, back }) {
  const intl = useIntl()
  return (
    <div className="sp-follow-tab">
      <Button
        onClick={() => {
          back()
        }}
        className="sp-back-btn"
        icon="arrow-left"
        size="small"
      />

      <div className="sp-tab-header">
        {" "}
        {intl.formatMessage({ id: "blacklist" })}
      </div>
      <div className="sp-tab-body">
        {blacklist.map(user => (
          <div
            onClick={() => viewOtherUser(user)}
            className="sp-follow-row"
            key={user.id}
          >
            <Avatar icon="user" src={user.avatarSrc} />
            {user.name}
          </div>
        ))}
      </div>
    </div>
  )
}

export default Blacklist
