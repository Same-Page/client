import React from "react"
import { Form, Input, Button, message } from "antd"

import { resetPassword } from "services/account"

class ResetPasswordForm extends React.Component {
  state = {
    confirmDirty: false
  }

  handleSubmit = e => {
    e.preventDefault()
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        resetPassword(values.password)
          .then(() => {
            message.success("更改成功！")
          })
          .catch()
          .then()
        console.log("Received values of form: ", values)
      }
    })
  }

  handleConfirmBlur = e => {
    const value = e.target.value
    this.setState({ confirmDirty: this.state.confirmDirty || !!value })
  }

  compareToFirstPassword = (rule, value, callback) => {
    const form = this.props.form
    if (value && value !== form.getFieldValue("password")) {
      callback("两次输入不一致!")
    } else {
      callback()
    }
  }

  validateToNextPassword = (rule, value, callback) => {
    const form = this.props.form
    if (value && this.state.confirmDirty) {
      form.validateFields(["confirm"], { force: true })
    }
    callback()
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
          <h3 style={{ marginTop: 50, marginBottom: 30 }}>更改密码</h3>
        </center>{" "}
        <Form
          style={{ width: "70%", margin: "auto" }}
          {...formItemLayout}
          onSubmit={this.handleSubmit}
        >
          <Form.Item label="新密码">
            {getFieldDecorator("password", {
              rules: [
                {
                  required: true,
                  message: "Please input your password!"
                },
                {
                  validator: this.validateToNextPassword
                }
              ]
            })(<Input type="password" />)}
          </Form.Item>
          <Form.Item label="确认密码">
            {getFieldDecorator("confirm", {
              rules: [
                {
                  required: true,
                  message: "Please confirm your password!"
                },
                {
                  validator: this.compareToFirstPassword
                }
              ]
            })(<Input type="password" onBlur={this.handleConfirmBlur} />)}
          </Form.Item>

          <Form.Item {...tailFormItemLayout}>
            <Button
              size="large"
              style={{ marginRight: 20 }}
              onClick={this.props.back}
            >
              取消
            </Button>

            <Button size="large" type="primary" htmlType="submit">
              保存
            </Button>
          </Form.Item>
        </Form>
      </div>
    )
  }
}

const WrappedResetPasswordForm = Form.create({ name: "resetPassword" })(
  ResetPasswordForm
)
export default WrappedResetPasswordForm
