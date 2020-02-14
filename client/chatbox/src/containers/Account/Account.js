import React, { useState, useEffect } from "react"
import { Button } from "antd"
import { connect } from "react-redux"

import ResetPassword from "./ResetPassword"
import EditProfile from "./EditProfile"
import Profile from "./Profile"
import Follow from "./Follow"
import Login from "containers/Account/Login"
import { getAccount } from "services/account"
import { setAccount } from "redux/actions"

function Account({ account, setAccount }) {
  const [resettingPassword, setResetPasswordState] = useState(false)
  const [edittingProfile, setEdittingProfileState] = useState(false)
  // showingFollow is for toggling the Follow view
  // showFollowers is for toggling follower vs following
  const [showingFollow, setShowingFollowState] = useState(false)
  const [showFollowers, setShowFollowersState] = useState(false)

  const [loadingAccount, setLoadingAccount] = useState(false)
  useEffect(() => {
    // load account for once if user is logged in or user
    // switch to account tab, otherwise the account info
    // is only loaded when login which becomes stale easily
    if (account) {
      setLoadingAccount(true)
      window.spDebug("refresh account data")
      getAccount()
        .then(resp => {
          setAccount(resp.data)
        })
        .catch(err => {})
        .then(() => {
          setLoadingAccount(false)
        })
    }
  }, [])

  const backToMainPage = () => {
    // called by the back button
    setResetPasswordState(false)
    setEdittingProfileState(false)
    setShowingFollowState(false)
  }

  if (!account) {
    return <Login setAccount={setAccount} />
  }

  return (
    <div>
      {loadingAccount && <Button icon="loading" className="sp-back-btn" />}
      {resettingPassword && <ResetPassword back={backToMainPage} />}
      {showingFollow && (
        <Follow
          account={account}
          showFollowers={showFollowers}
          followingCount={account.followingCount}
          followerCount={account.followerCount}
          back={backToMainPage}
        />
      )}
      {edittingProfile && (
        <EditProfile
          account={account}
          setAccount={setAccount}
          back={backToMainPage}
        />
      )}
      <Profile
        account={account}
        showResetPassword={setResetPasswordState}
        showEditProfile={setEdittingProfileState}
        showFollowings={() => {
          setShowingFollowState(true)
          setShowFollowersState(false)
        }}
        showFollowers={() => {
          setShowingFollowState(true)
          setShowFollowersState(true)
        }}
        setAccount={setAccount}
      />
    </div>
  )
}
const stateToProps = state => {
  return {
    account: state.account
  }
}
export default connect(stateToProps, { setAccount })(Account)
