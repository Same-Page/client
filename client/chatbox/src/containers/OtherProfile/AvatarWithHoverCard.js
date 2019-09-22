import React, { useState, useContext } from "react"
import { Avatar } from "antd"
import TabContext from "context/tab-context"

import ProfileCard from "./ProfileCard"
import ProfileMeta from "./ProfileMeta"

import Popper from "@material-ui/core/Popper"

function AvatarWithHoverCard(props) {
  const user = props.user
  const tabContext = useContext(TabContext)
  const [anchorEl, setAnchor] = useState(null)

  const showingCard = Boolean(anchorEl)
  let hideCardTimer = 0
  function hideCard() {
    clearTimeout(hideCardTimer)
    hideCardTimer = setTimeout(() => {
      setAnchor(null)
    }, 100)
  }
  function showCard(el) {
    clearTimeout(hideCardTimer)
    if (el) {
      setAnchor(el)
    }
  }

  return (
    <span>
      <ProfileMeta wait={!showingCard} user={user}>
        <AvatarWrapper
          icon="user"
          className={props.className}
          src={user.avatarSrc}
          size={props.size}
          onClick={e => {
            e.stopPropagation()
            tabContext.selectOtherUser(user)
          }}
          onMouseEnter={e => {
            // console.log("mouse enter avatar")
            showCard(e.currentTarget)
          }}
          onMouseLeave={hideCard}
          showingCard={showingCard}
        />
        <MyPoper
          showCard={showCard}
          hideCard={hideCard}
          showingCard={showingCard}
          anchorEl={anchorEl}
        />
      </ProfileMeta>
    </span>
  )
}

function AvatarWrapper(props) {
  let icon = "user"
  let src = props.src
  if (props.loading && props.showingCard) {
    src = null
    icon = "loading"
  }

  return (
    <Avatar
      icon={icon}
      className={props.className}
      src={src}
      size={props.size}
      onClick={props.onClick}
      onMouseEnter={props.onMouseEnter}
      onMouseLeave={props.onMouseLeave}
    />
  )
}

function MyPoper(props) {
  let visibility = "hidden"
  if (props.loaded) {
    visibility = "visible"
  }
  return (
    <Popper
      style={{ zIndex: 10, visibility: visibility }}
      onMouseEnter={e => {
        props.showCard()
      }}
      onMouseLeave={props.hideCard}
      anchorEl={props.anchorEl}
      open={props.showingCard}
    >
      <ProfileCard {...props} />
    </Popper>
  )
}

export default AvatarWithHoverCard
