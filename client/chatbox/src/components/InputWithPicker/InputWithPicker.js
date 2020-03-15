import "./InputWithPicker.css"

import { useIntl } from "react-intl"

import React, { useState, useRef, useEffect } from "react"
import { Button, Input, Icon, Upload } from "antd"
import urls from "config/urls"
import Emoji from "../Emoji"
import axios from "axios"
import Snapshot from "components/Snapshot"

const uploadUrl = `${urls.dbAPI}/api/v1/chat_upload`

function InputWithPicker(props) {
  const [input, setInput] = useState("")
  const [uploading, setUploading] = useState(false)
  const intl = useIntl()
  const inputRef = useRef()
  // show emoji is one step slower than will show emoji
  // so that we can show a loading icon
  const [showEmoji, setShowEmoji] = useState(false)
  const [willShowEmoji, setWillShowEmoji] = useState(false)

  const sending = props.sending
  const autoFocus = props.autoFocus || false

  const uploadProps = {
    name: "file",
    action: uploadUrl,
    customRequest: options => {
      const data = new FormData()
      data.append("file", options.file)
      const fileName = options.file.name || "no-file-name"
      setUploading(true)
      axios
        .post(options.action, data)
        .then(resp => {
          const payload = {
            fileName: fileName,
            url: resp.data.url,
            type: "file"
          }
          props.send(payload)
        })
        .catch(err => {
          console.error(err)
        })
        .then(() => {
          setUploading(false)
        })
    },
    showUploadList: false,
    onChange(info) {
      // if (info.file.status !== "uploading") {
      //   console.log(info.file, info.fileList)
      // }
      // if (info.file.status === "done") {
      //   message.success(`${info.file.name} file uploaded successfully`)
      // } else if (info.file.status === "error") {
      //   message.error(`${info.file.name} file upload failed.`)
      // }
    }
  }

  useEffect(() => {
    if (autoFocus) {
      inputRef.current.focus()
    }
  }, [sending, autoFocus])

  useEffect(() => {
    setShowEmoji(willShowEmoji)
  }, [willShowEmoji])

  const handleKeyDown = e => {
    if (e.key === "Enter") {
      setWillShowEmoji(false)
      const payload = {
        text: input,
        type: "text"
      }
      const shouldClear = props.send(payload)
      if (shouldClear) {
        setInput("")
      }
    }
  }
  const addEmoji = emoji => {
    if (emoji.custom) {
      const payload = {
        text: emoji.imageUrl,
        type: "text"
      }
      props.send(payload)
      setWillShowEmoji(false)
    } else {
      setInput(input => {
        return input + emoji.native
      })
    }
    inputRef.current.focus()
  }
  const handleChange = e => {
    setInput(e.target.value)
  }

  const addonBefore = (
    <span>
      <Button
        className="emojiOpener"
        onClick={e => {
          setWillShowEmoji(prevState => {
            setWillShowEmoji(!prevState)
          })
        }}
        icon="smile"
      />
      <Upload {...uploadProps} disabled={uploading}>
        <Button icon="upload" loading={uploading} />
      </Upload>
      <Snapshot />
    </span>
  )

  return (
    <div className="sp-input-with-picker">
      {willShowEmoji && <Icon style={{ margin: 10 }} type="loading" />}
      {showEmoji && (
        <Emoji
          addEmoji={addEmoji}
          exceptionClass="emojiOpener"
          close={() => {
            setWillShowEmoji(false)
          }}
        />
      )}
      <Input
        ref={inputRef}
        size="large"
        onKeyDown={handleKeyDown}
        value={input}
        addonBefore={addonBefore}
        addonAfter={props.addonAfter}
        onChange={handleChange}
        disabled={sending}
        placeholder={
          sending
            ? intl.formatMessage({ id: "sending" })
            : intl.formatMessage({ id: "input.here" })
        }
      />
    </div>
  )
}

export default InputWithPicker
