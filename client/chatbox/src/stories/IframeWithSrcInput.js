import React, { useState } from "react"
import { Button, Input } from "antd"

const Search = Input.Search

function IframeWithSrcInput(props) {
  const defaultUrl = "https://www.baidu.com/"
  const [srcUrl, setSrcUrl] = useState(defaultUrl)
  return (
    <div>
      <div>
        <Search
          style={{ marginTop: 10, maxWidth: 500 }}
          defaultValue={defaultUrl}
          onSearch={url => {
            setSrcUrl(url)
          }}
          placeholder="enter url..."
          enterButton="Update"
        />
      </div>

      <iframe
        className="sp-chatbox-iframe"
        src={`http://localhost:3000?${srcUrl}`}
      />
    </div>
  )
}
export default IframeWithSrcInput
