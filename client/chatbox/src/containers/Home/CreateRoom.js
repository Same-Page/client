import React from "react"

import { Form, Input, Button, message } from "antd"
import { createRoom } from "services/room"
// const { Option } = Select
class CreateRoomForm extends React.Component {
  state = {
    submitting: false
  }
  handleSubmit = e => {
    e.preventDefault()
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        console.log("Received values of form: ", values)
        if (!(values.name && values.about)) {
          message.error("必须填写房间名与介绍")
          return
        }
        this.setState({ submitting: true })

        createRoom(values)
          .then(resp => {
            message.success("创建成功！")
            this.props.back()
            this.props.loadRooms()
            // reload all rooms
          })
          .catch(err => {})
          .then(() => {
            this.setState({ submitting: false })
          })
      }
    })
  }

  render() {
    const { getFieldDecorator } = this.props.form

    const formItemLayout = {
      labelCol: {
        xs: { span: 24 },
        sm: { span: 8 }
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 16 }
      }
    }
    const tailFormItemLayout = {
      wrapperCol: {
        xs: {
          span: 24,
          offset: 0
        },
        sm: {
          span: 16,
          offset: 8
        }
      }
    }
    return (
      <Form
        style={{ width: "90%", margin: "auto" }}
        {...formItemLayout}
        onSubmit={this.handleSubmit}
      >
        <Form.Item label={<span>房间名</span>}>
          {getFieldDecorator("name", {
            rules: [
              {
                message: "房间名不能为空",
                whitespace: true
              },
              {
                max: 12,
                message: "房间名最多12个字符"
              },
              {
                min: 1,
                message: "房间名最少1个字符"
              }
            ]
            // initialValue: account.name
          })(<Input />)}
        </Form.Item>

        <Form.Item label={<span>房间介绍</span>}>
          {getFieldDecorator("about", {
            // initialValue: account.about
          })(<Input.TextArea placeholder="该房间特定的话题与聊天规则。。。" />)}
        </Form.Item>
        <Form.Item {...tailFormItemLayout}>
          <Button
            size="large"
            style={{ marginRight: 20 }}
            onClick={this.props.back}
          >
            取消
          </Button>
          <Button
            loading={this.state.submitting}
            type="primary"
            size="large"
            htmlType="submit"
          >
            保存
          </Button>
        </Form.Item>
      </Form>
    )
  }
}

const WrappedCreateRoomForm = Form.create({ name: "create-room" })(
  CreateRoomForm
)

export default WrappedCreateRoomForm
