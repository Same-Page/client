import "./Emoji.css"
import "emoji-mart/css/emoji-mart.css"

import React from "react"
import { Picker } from "emoji-mart"

import ClickWrapper from "../OutsideClickDetector"

const i18n = {
  search: "搜索",
  clear: "清除", // Accessible label on "clear" button
  notfound: "没找到",
  skintext: "Choose your default skin tone",
  categories: {
    search: "搜索结果",
    recent: "常用",
    people: "笑脸",
    nature: "动植物",
    foods: "吃喝",
    activity: "活动",
    places: "旅游",
    objects: "东西",
    symbols: "象征",
    flags: "旗子"
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
