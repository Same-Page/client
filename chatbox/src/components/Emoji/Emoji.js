import "./Emoji.css"
import "emoji-mart/css/emoji-mart.css"

import React from "react"
import { createIntl } from "react-intl"
import { Picker } from "emoji-mart"

import ClickWrapper from "../OutsideClickDetector"
import msg_zh from "i18n/zh.json"
import msg_en from "i18n/en.json"

const i18nMsg = {
	zh: msg_zh,
	en: msg_en
}
// const { intl } = new IntlProvider(
// 	{ locale: language, messages: messages },
// 	{}
// ).getChildContext()

const intl = createIntl({
	locale: navigator.language,
	messages: i18nMsg[navigator.language.substring(0, 2)]
})

const i18n = {
	search: intl.formatMessage({ id: "search" }),
	// clear: "清除", // Accessible label on "clear" button
	notfound: intl.formatMessage({ id: "not.found" }),
	// skintext: "Choose your default skin tone",
	categories: {
		search: intl.formatMessage({ id: "search.result" }),
		recent: intl.formatMessage({ id: "recently.used" }),
		people: intl.formatMessage({ id: "people" }),
		nature: intl.formatMessage({ id: "nature" }),
		foods: intl.formatMessage({ id: "food" }),
		activity: intl.formatMessage({ id: "activity" }),
		places: intl.formatMessage({ id: "places" }),
		objects: intl.formatMessage({ id: "objects" }),
		symbols: intl.formatMessage({ id: "symbols" }),
		flags: intl.formatMessage({ id: "flags" })
		// custom:
		// "<a href='https://www.weibo.com/u/1736856114' target='_blank'> 欢乐兔</a>"
	},
	categorieslabel: "Emoji categories", // Accessible title for the list of categories
	skintones: {
		1: "Default Skin Tone",
		2: "Light Skin Tone",
		3: "Medium-Light Skin Tone",
		4: "Medium Skin Tone",
		5: "Medium-Dark Skin Tone",
		6: "Dark Skin Tone"
	}
}
// const customEmojis = []
// for (let i = 1; i <= 90; i++) {
//   const imageUrl = `stickers/happy_bun/${i}.gif`
//   customEmojis.push({
//     name: "happy bun " + i,
//     short_names: [`happy_bun_` + i],
//     imageUrl: imageUrl
//   })
// }

function Emoji(props) {
	return (
		<ClickWrapper exceptionClass={props.exceptionClass} close={props.close}>
			<Picker
				i18n={i18n}
				emojiTooltip={true}
				include={["people", "nature", "foods", "activity", "places"]}
				// custom={customEmojis}
				onSelect={props.addEmoji}
				set="apple"
				showPreview={false}
			/>
		</ClickWrapper>
	)
}
export default Emoji
