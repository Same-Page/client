import React from "react"

import { Form, Input, Button, message } from "antd"

import AvatarUploader from "./AvatarUploader"
import { updateUser } from "services/user"

// const { Option } = Select
let avatarFile = null
class EditProfileForm extends React.Component {
  state = {
    submitting: false
  }

  handleSubmit = e => {
    e.preventDefault()
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        // console.log("Received values of form: ", values)
        // console.log(avatarFile)
        values.avatar = avatarFile
        this.setState({ submitting: true })

        updateUser(values)
          .then(resp => {
            message.success("更新成功！")
            this.props.setAccount(resp.data)
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
    const account = this.props.account

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
      <div className="sp-special-tab">
        <Button
          onClick={this.props.back}
          style={{
            position: "fixed",
            marginTop: 5,
            marginLeft: 5,
            border: "none",
            fontSize: "large"
          }}
          icon="arrow-left"
        />
        <center>
          <h3 style={{ marginTop: 50, marginBottom: 30 }}>修改资料</h3>
        </center>{" "}
        <Form
          style={{ width: "70%", margin: "auto" }}
          {...formItemLayout}
          onSubmit={this.handleSubmit}
        >
          <Form.Item label="上传头像">
            {getFieldDecorator("upload", {
              valuePropName: "fileList",
              getValueFromEvent: () => {
                return avatarFile
              }
            })(
              <AvatarUploader
                setFile={file => {
                  avatarFile = file
                }}
              />
            )}
          </Form.Item>
          <Form.Item label={<span>用户名</span>}>
            {getFieldDecorator("name", {
              rules: [
                {
                  message: "用户名不能为空",
                  whitespace: true
                },
                {
                  max: 12,
                  message: "用户名最多12个字符"
                },
                {
                  min: 1,
                  message: "用户名最少一个字符"
                }
              ],
              initialValue: account.name
            })(<Input />)}
          </Form.Item>
          {/* 
          <Form.Item label="性别">
            {getFieldDecorator("gender", {
              rules: [{ required: false, message: "请选择你的性别!" }]
            })(
              <Select
              // onChange={this.handleSelectChange}
              >
                <Option value="male">男</Option>
                <Option value="female">女</Option>
                <Option value="other">其他</Option>
              </Select>
            )}
          </Form.Item> */}
          <Form.Item label={<span>个人简介</span>}>
            {getFieldDecorator("about", {
              initialValue: account.about
            })(<Input.TextArea />)}
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
      </div>
    )
  }
}

const WrappedEditProfileForm = Form.create({ name: "edit-profile" })(
  EditProfileForm
)

export default WrappedEditProfileForm
