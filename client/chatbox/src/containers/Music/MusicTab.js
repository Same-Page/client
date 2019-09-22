import React, { useState } from "react"
import { Button, Radio, Modal } from "antd"

import MusicPlayer from "components/MusicPlayer"
import Playlist from "./Playlist"

function MusicTab(props) {
  const [loopMode, setLoopMode] = useState("loopAll")
  const [showHelp, setShowHelp] = useState(false)
  return (
    <div className="sp-special-tab">
      <Button
        onClick={() => {
          props.back()
        }}
        style={{
          position: "fixed",
          marginTop: 1,
          marginLeft: 5,
          border: "none",
          fontSize: "large"
        }}
        icon="arrow-left"
      />

      <center className="sp-tab-header">
        <Radio.Group
          size="small"
          buttonStyle="solid"
          value={loopMode}
          onChange={e => {
            setLoopMode(e.target.value)
          }}
        >
          <Radio.Button value="loopCurrent">循环当前</Radio.Button>
          <Radio.Button value="loopAll">循环列表</Radio.Button>
        </Radio.Group>
        <Button
          style={{ border: "none", position: "absolute", right: 0 }}
          onClick={() => {
            setShowHelp(true)
          }}
          size="small"
          icon="question"
        />
        <Modal
          title="播放器使用指南(Beta)"
          visible={showHelp}
          onCancel={() => {
            setShowHelp(false)
          }}
          wrapClassName="sp-modal"
          footer={null}
          bodyStyle={{ maxHeight: "calc(100% - 55px)", overflowY: "auto" }}
        >
          <h3>分享原始资源</h3>
          <p>
            输入原始的视频或音频文件地址，比如
            <br />
            <span style={{ fontSize: 10 }}>
              https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_5mb.mp4
            </span>
          </p>
          <h4>支持以下视频格式：</h4>
          <ul>
            <li>mp4</li>
            <li>webm</li>
            <li>ogg</li>
            <li>flv</li>
          </ul>
          <h4>支持以下音频格式：</h4>
          <ul>
            <li>mp3</li>
            <li>wav</li>
          </ul>

          <br />
          <h3>分享网站链接</h3>
          <p>
            直接输入含有视频或音频的网页地址，比如
            <br />
            <span style={{ fontSize: 10 }}>
              https://music.163.com/#/song?id=640565
            </span>
            <br />
            <span style={{ fontSize: 10 }}>
              https://www.youtube.com/watch?v=txthoeUhyBI
            </span>
          </p>
          <h4>支持的网站有：</h4>
          <ul>
            <li>Youtube</li>
            <li>网易云音乐</li>
          </ul>
        </Modal>
      </center>
      <div className="sp-tab-body" style={{ background: "#404040" }}>
        <MusicPlayer />
        <div
          style={{
            padding: 20,
            color: "lightgray",
            width: "100%",
            height: "180px",
            fontSize: "10px",
            position: "fixed",
            overflowX: "hidden",
            overflowY: "auto"
          }}
        >
          <center style={{ marginBottom: 10 }}>播放列表</center>
          <Playlist setMediaNum={props.setMediaNum} loopMode={loopMode} />
        </div>
      </div>
    </div>
  )
}

export default MusicTab
