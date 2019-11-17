import React from "react"
import { Form, Icon, Input, Button, message } from "antd"
import { injectIntl } from "react-intl"

import { login, register } from "services/account"
import storageManager from "utils/storage"
import AccountContext from "context/account-context"

class NormalLoginForm extends React.Component {
	constructor(props) {
		super(props)
		this.state = {
			loading: false,
			// registration code may be moved into
			// dedicated file in the future
			registering: false
		}
	}

	componentDidMount() {
		storageManager.get("login", values => {
			if (values) {
				window.spDebug("found login in storage")
				this.props.form.setFieldsValue({
					userId: values.userId,
					password: values.password
				})
				if (this.context.autoLogin) {
					this.loginUser(values)
					window.spDebug("auto login")
				}
			} else {
				window.spDebug("no login found in storage, register now")
				const password = Math.random()
					.toString(36)
					.slice(-8)
				this.setState({ registering: true })
				register(password)
					.then(resp => {
						this.setState({ registering: false })
						const account = resp.data
						this.props.setAccount(account)
						storageManager.set("login", {
							userId: account.numId,
							password: password
						})
						message.success(
							this.props.intl.formatMessage({ id: "register.success" })
						)
					})
					.catch(err => {
						this.setState({ registering: false })
						// TODO: put specific error message in each .catch
						// Only use global axios interceptor when backend
						// return prepared error message
						// message.error("注册失败，请刷新重试")
					})
					.then(() => {})
			}
			this.context.stopAutoLogin()
		})
	}

	loginUser = values => {
		this.setState({ loading: true })
		login(values.userId, values.password)
			.then(res => {
				window.spDebug(res.data)
				const account = res.data
				this.setState({ loading: false })
				this.props.setAccount(account)
				storageManager.set("login", values)
			})
			.catch(err => {
				console.error(err)
				this.setState({ loading: false })
			})
			.then(() => {
				// can't change state here because if succeed
				// component will be unmounted before we set loading
				// to be false
				// this.setState({ loading: false })
			})
	}

	handleSubmit = e => {
		e.preventDefault()
		this.props.form.validateFields((err, values) => {
			window.spDebug("Received values of form: ", values)
			if (!err) {
				this.loginUser(values)
			}
		})
	}

	render() {
		if (this.state.registering) {
			return (
				<div className="sp-special-tab">
					<center style={{ marginTop: "50%" }}>注册中...</center>
				</div>
			)
		}
		const { getFieldDecorator } = this.props.form
		return (
			<div className="sp-special-tab">
				<Form
					style={{ width: "70%", margin: "auto", marginTop: 100 }}
					onSubmit={this.handleSubmit}
					className="login-form"
				>
					<Form.Item>
						{getFieldDecorator("userId", {
							rules: [
								{
									required: true,
									message: this.props.intl.formatMessage({ id: "required" })
								}
							]
						})(
							<Input
								prefix={
									<Icon type="user" style={{ color: "rgba(0,0,0,.25)" }} />
								}
								placeholder="ID"
							/>
						)}
					</Form.Item>
					<Form.Item>
						{getFieldDecorator("password", {
							rules: [
								{
									required: true,
									message: this.props.intl.formatMessage({ id: "required" })
								}
							]
						})(
							<Input
								prefix={
									<Icon type="lock" style={{ color: "rgba(0,0,0,.25)" }} />
								}
								type="password"
								placeholder={this.props.intl.formatMessage({ id: "password" })}
							/>
						)}
					</Form.Item>
					<Form.Item>
						<Button
							type="primary"
							htmlType="submit"
							className="login-form-button"
							style={{ marginRight: 10 }}
							loading={this.state.loading}
						>
							{this.props.intl.formatMessage({ id: "login" })}
						</Button>
						{/* 或
            {
              // eslint-disable-next-line
              <a>注册</a>
            } */}
					</Form.Item>
				</Form>
			</div>
		)
	}
}
NormalLoginForm.contextType = AccountContext

const WrappedNormalLoginForm = Form.create({ name: "normal_login" })(
	NormalLoginForm
)

export default injectIntl(WrappedNormalLoginForm)
