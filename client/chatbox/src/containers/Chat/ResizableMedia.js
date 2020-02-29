import React, { useEffect, useRef, useState } from "react"

import { Resizable } from "re-resizable"

import MusicPlayer from "components/MusicPlayer"
import { Button } from "antd"

function ResizableMedia({
  show,
  showMedia,
  setShowMedia,
  resizableHeight,
  setResizableHeight,
  pauseMedia,
  playerRef,
  mediaSources,
  iframeUrl,
  setIframeUrl
}) {
  const resizableStyle = {}
  if (!show) {
    resizableStyle.display = "none"
  }
  return (
    <Resizable
      style={resizableStyle}
      size={{
        width: "100%",
        height: resizableHeight
      }}
      enable={{
        top: true,
        right: false,
        bottom: true,
        left: false,
        topRight: false,
        bottomRight: false,
        bottomLeft: false,
        topLeft: false
      }}
      defaultSize={{
        width: "100%",
        height: resizableHeight
      }}
      minHeight={30}
      //   bounds={bodyRef}
      onResize={(e, dir, elm, delta) => {
        setResizableHeight(elm.clientHeight)
      }}
    >
      <span style={{ display: showMedia ? "unset" : "none" }}>
        <MusicPlayer
          // show={showMedia}
          closePlayer={() => {
            pauseMedia()
            setShowMedia(false)
          }}
          playerRef={playerRef}
          sources={mediaSources}
        />
      </span>
      {iframeUrl && (
        <span>
          <iframe
            style={{
              background: "#d9d9d9",
              height: "100%",
              width: "100%",
              border: "none",
              borderBottom: "1px solid lightgray"
            }}
            src={iframeUrl}
          />
          <span
            className="resizable-close"
            onClick={() => {
              setIframeUrl(null)
            }}
          >
            <Button>X</Button>
          </span>
        </span>
      )}
    </Resizable>
  )
}
export default ResizableMedia
