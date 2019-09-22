import "./Comment.css"

import React from "react"
import { Button, Icon, Input } from "antd"

import axios from "axios"
import moment from "moment"

import urls from "config/urls"
import { getUrl } from "utils/url"
import AccountContext from "context/account-context"
import Header from "./Header"
import Body from "./Body"

const LIMIT = 10

const commentBodyStyle = {
  height: "calc(100% - 100px)",
  overflow: "auto",
  width: "100%",
  position: "fixed",
  background: "#eceff1",
  padding: 10,
  paddingBottom: 30
}

const { TextArea } = Input

class CommentTab extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      loading: false,
      hasMore: true,
      submitting: false,
      comments: [],
      input: "",
      inputFocus: false,
      replyTo: "",
      replyToUserId: ""
    }
    this.inputRef = React.createRef()
    this.bodyRef = React.createRef()
    this.offset = 0
    this.order = "best"
  }
  onFocus = e => {
    this.setState({ inputFocus: true })
  }

  reply = (userId, username) => {
    this.setState({ replyTo: username, replyToUserId: userId })
    this.inputRef.current.focus()
  }

  vote = commentId => {
    const payload = {
      comment_id: commentId
    }
    axios
      .post(urls.dbAPI + "/api/v1/vote_comment", payload)
      .then(res => {})
      .catch(err => {})
      .then(() => {})
  }

  submit = () => {
    const payload = {
      url: getUrl(),
      content: this.state.input,
      reply_to_user_id: this.state.replyToUserId,
      reply_to_user_name: this.state.replyTo
    }

    this.setState({ submitting: true })
    axios
      .post(urls.dbAPI + "/api/v1/post_comment", payload)
      .then(res => {
        let content = this.state.input
        if (this.state.replyTo) {
          content = "@" + this.state.replyTo + " \n" + content
        }
        const account = this.context.account
        const selfMsg = {
          id: Math.random(100), // whatever unique
          userId: account.id,
          avatarSrc: account.avatarSrc,
          name: account.name,
          time: moment().fromNow(),
          content: content,
          self: true,
          noFooter: true // can't support any action since there is no id
          // maybe backend can return id
        }
        this.setState({ comments: [selfMsg].concat(this.state.comments) })
        this.clearInput()
        setTimeout(() => {
          console.debug("[Comment] scroll to top")
          this.bodyRef.current.scrollTop = 0
        }, 500)
      })
      .catch(err => {
        console.error(err)
      })
      .then(() => {
        this.setState({ submitting: false })
      })
  }
  handleInput = e => {
    this.setState({ input: e.target.value })
  }
  clearInput = () => {
    this.setState({
      input: "",
      inputFocus: false,
      replyTo: null,
      replyToUserId: null
    })
  }
  orderBy = val => {
    this.setState({ comments: [], hasMore: true })
    this.offset = 0
    this.order = val
    this.loadComments()
  }
  loadMore = () => {
    this.offset = this.state.comments.length
    this.loadComments()
  }
  loadComments = () => {
    this.setState({ loading: true })
    const payload = {
      url: getUrl(),
      offset: this.offset,
      limit: LIMIT,
      order: this.order
    }
    axios
      .post(urls.dbAPI + "/api/v1/get_comments", payload)
      .then(res => {
        res.data.forEach(comment => {
          comment.time = moment.utc(comment.created).fromNow()
        })
        this.setState({
          comments: this.state.comments.concat(res.data),
          hasMore: res.data.length === LIMIT
        })
      })
      .catch(err => {
        console.error(err)
      })
      .then(() => {
        this.setState({ loading: false })
      })
  }
  componentDidMount() {
    this.loadComments()
  }

  render() {
    let rowNum = 1
    if (this.state.inputFocus) {
      rowNum = 5
    }
    let placeholder = "留言。。。"
    if (this.state.replyTo) {
      placeholder = "@" + this.state.replyTo
    }
    let footer = (
      <center style={{ padding: 10, background: "lightgray" }}>尚未登录</center>
    )
    if (this.context.account) {
      footer = (
        <div>
          <TextArea
            size="large"
            value={this.state.input}
            onFocus={this.onFocus}
            onChange={this.handleInput}
            placeholder={placeholder}
            rows={rowNum}
            ref={this.inputRef}
          />
          {this.state.inputFocus && (
            <div
              style={{
                width: "100%",
                textAlign: "right"
              }}
            >
              <Button onClick={this.clearInput}>取消</Button>
              <Button
                onClick={this.submit}
                style={{ margin: 10 }}
                type="primary"
                loading={this.state.submitting}
              >
                提交
              </Button>
            </div>
          )}
        </div>
      )
    }
    return (
      <div>
        <Header orderBy={this.orderBy} />
        <div ref={this.bodyRef} style={commentBodyStyle}>
          {this.state.loading && this.state.comments.length === 0 && (
            // when no comments loaded, show loading icon
            // if there are comments loaded, loading icon is
            // shown in load more button
            <center>
              <Icon type="loading" />
            </center>
          )}

          <Body
            data={this.state.comments}
            vote={this.vote}
            reply={this.reply}
          />

          {this.state.comments.length >= LIMIT && this.state.hasMore && (
            <center style={{ marginTop: 20 }}>
              {/* 
              If comments length < LIMIT, for sure there
              isn't any more comment, TODO: backend should be 
              able to return if there's more to load.
              For now, just set a noMore flag when backend
              return empty */}
              <Button
                loading={this.state.loading}
                type="primary"
                onClick={this.loadMore}
              >
                加载更多...
              </Button>
            </center>
          )}
        </div>
        <div className="sp-comment-footer">{footer}</div>
      </div>
    )
  }
}

CommentTab.contextType = AccountContext

export default CommentTab
