import "./Snapshot.css"
import React, { Component } from "react"
// import Popup from "reactjs-popup"
// import { Modal, Button } from "antd"
import Dialog from "@material-ui/core/Dialog"
import Button from "@material-ui/core/Button"

import ScreenCapture from "./ScreenCapture"
// import "./index.css";
class Snapshot extends Component {
	state = {
		screenCapture: "",
		open: false,
		title: "gimmeatitle"
	}

	handleScreenCapture = screenCapture => {
		this.setState(
			{
				screenCapture
			},
			() => {
				screenCapture && this.openModal()
			}
		)
	}

	openModal = () => {
		this.setState({ open: true })
	}

	closeModal = () => {
		this.setState({ open: false, screenCapture: "" })
	}

	handleOnChange = e => {
		this.setState({
			[e.target.name]: e.target.value
		})
	}

	handleSave = () => {
		console.log(this.state.title, this.state.screenCapture)
	}

	render() {
		const { screenCapture } = this.state
		console.log(screenCapture)
		return (
			<ScreenCapture onEndCapture={this.handleScreenCapture}>
				{({ onStartCapture }) => (
					<span>
						<Button
							style={{ background: "blue" }}
							onClick={onStartCapture}
						></Button>

						<Dialog
							open={this.state.open}
							// onClose={handleClose}
						>
							<div className="modal">
								<div className="modal__header">
									<button onClick={this.closeModal}>
										&times;
									</button>
								</div>
								<div className="modal__body">
									<div>
										<label>Title</label>
										<input
											type="text"
											onChange={this.handleOnChange}
											name="title"
											value={this.state.title}
										/>
									</div>
									<div className="image__container">
										{screenCapture && (
											<img
												src={screenCapture}
												alt="screen capture"
											/>
										)}
									</div>
								</div>
								<div className="modal__footer">
									<button onClick={this.handleSave}>
										Save
									</button>
									<button onClick={this.closeModal}>
										Cancel
									</button>
								</div>
								{/* {screenCapture && <img src={screenCapture} alt="screen capture" />} */}
							</div>
							{/* </Popup> */}
						</Dialog>
					</span>
				)}
			</ScreenCapture>
		)
	}
}
export default Snapshot
