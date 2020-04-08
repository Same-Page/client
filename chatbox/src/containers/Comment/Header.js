import React from "react"
import { Select } from "antd"
const Option = Select.Option

function CommentHeader(props) {
  return (
    <center className="sp-tab-header">
      {/* <span style={{marginLeft:10}}>网页留言</span> */}
      {/* <span style={{ position: "absolute", right: 10 }}> */}
      <Select onChange={props.orderBy} size="small" defaultValue="best">
        <Option value="newest">按时间排序</Option>
        <Option value="best">按好评排序</Option>
      </Select>
      {/* </span> */}
    </center>
  )
}
export default CommentHeader
