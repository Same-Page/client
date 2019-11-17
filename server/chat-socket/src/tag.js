const stopword = require("stopword")
const cnTokenizer = require("nodejieba")
const containsChinese = require("contains-chinese")
const siteNames = require("./tag/siteNames.json")
const customStopwords = require("./tag/stopwords.json")

console.log("load cn dict")
cnTokenizer.load({
	userDict: __dirname + "/tag/cnWords.txt"
})

function insert_spacing(str) {
	//将汉字与英文、数字、下划线之间添加一个空格
	var p1 = /([A-Za-z_])([\u4e00-\u9fa5]+)/gi
	var p2 = /([\u4e00-\u9fa5]+)([A-Za-z_])/gi
	return str.replace(p1, "$1 $2").replace(p2, "$1 $2")
}
function removeSiteName(pageTitle) {
	// page title often includes site title like
	// iphone - Google Search
	// Amazon.com: iphone
	// iphone: 哔哩哔哩
	// iphone - Youtube
	// These titles are more harmful than useful when calculating
	// similarity score, therefore we remove these
	// (if care same site or not, we know socket's domain anyways)
	siteNames.forEach(name => {
		pageTitle = pageTitle.replace(name, "")
	})
	return pageTitle
}
const tagManager = {
	getSameTags: (tagsA, tagsB) => {
		return tagsA.filter(tag => tagsB.includes(tag))
	},
	similarityScore: (inputTags, baseTags) => {
		// Need more sophisticated algorithm to also consider different
		// weights for different words
		if (inputTags.length == 0) return 0
		let score = 0
		inputTags.forEach(tag => {
			if (baseTags.includes(tag)) {
				// small numbers are less important
				// E.g. "you have 2 new messages" show up in page title
				if (!isNaN(tag) && tag < 10) {
					score += 0.1
				} else {
					score += 1
				}
			}
		})
		return score / inputTags.length
	},
	getTags: pageTitle => {
		let pageTitleLower = pageTitle.toLowerCase()
		pageTitleLower = removeSiteName(pageTitleLower)
		// Add space between Chinese and English
		const pageTitlePatchedWithSpace = insert_spacing(pageTitleLower)
		// Split by space or punctuation marks
		let tokens = pageTitlePatchedWithSpace.split(
			/(?:,|:|：|《|。|》|，|、|【|】|\/|~|\||\?|,|゜|-|_|？|！|!|\.|\(|\)|（|）| )+/
		)
		let pageTags = []
		tokens.forEach(token => {
			if (containsChinese(token)) {
				let cnTokens = cnTokenizer.cut(token)
				pageTags.push(...cnTokens)
			} else {
				pageTags.push(token)
			}
		})
		pageTags = pageTags.filter(tag => !customStopwords.includes(tag))
		pageTags = stopword.removeStopwords(pageTags)
		pageTags = [...new Set(pageTags)]
		return pageTags
	}
}
module.exports = tagManager
