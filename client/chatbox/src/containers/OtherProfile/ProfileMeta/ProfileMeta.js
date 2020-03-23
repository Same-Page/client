import React, { useState, useEffect } from "react"
import { connect } from "react-redux"

import { getUser } from "services/user"
import followEventHandler from "containers/Account/Follow/event"
import { followUser } from "services/follow"
import { setAccount } from "redux/actions"
function ProfileMeta(props) {
  // Use this container to fetch other user's data
  // it's a wrapper that handles state and api calls
  // but doesn't contain html layout
  const { account, setAccount } = props
  let [user, setUser] = useState(props.user)

  if (props.setUser) {
    user = props.user
    setUser = props.setUser
  }
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
    const newAccountData = { ...account }
    if (follow) {
      newAccountData.followingCount++
    } else {
      newAccountData.followingCount--
    }
    setAccount(newAccountData)
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
        // window.spDebug(resp.data)
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
      account: account,
      loading: loading,
      loaded: loaded,
      user: user,
      followerCount: followerCount,
      following: following,
      followUser: toggleFollow,
      refreshUserInfo: refreshUserInfo
    })
  )
  return <span>{childrenWithProps}</span>
}
const stateToProps = state => {
  return {
    account: state.account
  }
}
export default connect(stateToProps, { setAccount })(ProfileMeta)
