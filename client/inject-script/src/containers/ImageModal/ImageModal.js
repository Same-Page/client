import "./ImageModal.css"
import React, { useState, useEffect } from "react"
import Dialog from "@material-ui/core/Dialog"

function SimpleDialog(props) {
  return (
    <Dialog
      className="sp-image-modal"
      aria-labelledby="simple-dialog-title"
      {...props}
    />
  )
}
export default function SimpleDialogDemo() {
  const [open, setOpen] = useState(false)
  const [imgSrc, setImgSrc] = useState()
  const handleIframeMessage = e => {
    if (!e || !e.data) return
    if (e.data.imgSrc) {
      setImgSrc(e.data.imgSrc)
      setOpen(true)
    }
  }

  const handleClose = value => {
    setOpen(false)
  }

  useEffect(() => {
    window.addEventListener("message", handleIframeMessage, false)
    return () => {
      window.removeEventListener("message", handleIframeMessage, false)
    }
  }, [handleIframeMessage])

  return (
    <div>
      <SimpleDialog open={open} onClose={handleClose}>
        <img alt={imgSrc} src={imgSrc} />
      </SimpleDialog>
    </div>
  )
}
