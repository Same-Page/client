import React, { useState, useEffect, useContext } from "react"

import { getUser } from "services/user"
import AccountContext from "context/account-context"
import TabContext from "context/tab-context"
import followEventHandler from "containers/Account/Follow/event"
import { followUser } from "services/follow"

function ProfileMeta(props) {
  // Use this container to fetch other user's data
  // it's a wrapper that handles state and api calls
  // but doesn't contain html layout

  const accountContext = useContext(AccountContext)
  const tabContext = useContext(TabContext)

  const [user, setUser] = useState(props.user)
  const [followerCount, setFollowerCount] = useState("")
  const [following, setFollowing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [loaded, setLoaded] = useState(false)
  // If receive a wait, won't start fetching right away
  // e.g. hover card
  const wait = Boolean(props.wait)

  function updateAccountFollowing(follow) {
    // context.account needs to know about
    // following number has changed
    const newAccountData = { ...accountContext.account }
    if (follow) {
      newAccountData.followingCount++
    } else {
      newAccountData.followingCount--
    }
    accountContext.setAccount(newAccountData)
  }

  function toggleFollow(follow) {
    setFollowing(follow)
    if (follow) {
      setFollowerCount(followerCount + 1)
    } else {
      setFollowerCount(followerCount - 1)
    }

    followUser(user.id)
      .then(resp => {
        updateAccountFollowing(follow)
        followEventHandler.follow(follow, user)
      })
      .catch(err => {
        console.error(err)
      })
      .then(() => {})
  }

  function refreshUserInfo() {
    setLoading(true)
    getUser(user.id)
      .then(resp => {
        // console.debug(resp.data)
        const userData = resp.data
        setLoaded(true)
        setUser(userData)
        setFollowing(userData.following)
        setFollowerCount(userData.followerCount)
      })
      .catch(err => {
        console.error(err)
      })
      .then(() => {
        // console.log("done loading")
        setLoading(false)
      })
  }
  useEffect(() => {
    if (wait || loaded) return
    refreshUserInfo()
  }, [wait, loaded])

  const childrenWithProps = React.Children.map(props.children, child =>
    React.cloneElement(child, {
      ...child.props,
      loading: loading,
      loaded: loaded,
      user: user,
      followerCount: followerCount,
      following: following,
      followUser: toggleFollow,
      directMessage: tabContext.directMessage,
      refreshUserInfo: refreshUserInfo
    })
  )
  return <span>{childrenWithProps}</span>
}

export default ProfileMeta
