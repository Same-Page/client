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
  setIframeUrl,
  messageDetail,
  setMessageDetail
}) {
  const resizableStyle = {}
  if (!show) {
    resizableStyle.display = "none"
  }
  const resizableRef = useRef()
  useEffect(() => {
    if (resizableRef && resizableRef.current) {
      window.foo = resizableRef.current
      resizableRef.current.addEventListener("click", e => {
        console.log(e)
        if (e && e.target && e.target.tagName.toUpperCase() === "IMG") {
          e.preventDefault()
          window.parent.postMessage({ imgSrc: e.target.src }, "*")
        }
        return false
      })
    }
  }, [])
  return (
    <Resizable
      handleClasses={{ bottom: "sp-resizable-bottom-handle" }}
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
      <span ref={resizableRef}>
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
        {(iframeUrl || messageDetail) && (
          <span>
            <span
              className="resizable-close"
              onClick={() => {
                setIframeUrl(null)
                setMessageDetail(null)
              }}
            >
              <Button>X</Button>
            </span>
            {iframeUrl && (
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
            )}
            {messageDetail && (
              <div
                className="sp-message-detail-html"
                dangerouslySetInnerHTML={{ __html: messageDetail }}
              ></div>
            )}
          </span>
        )}
      </span>
    </Resizable>
  )
}
export default ResizableMedia
