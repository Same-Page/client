const fs = require("fs")

const stopword = require("stopword")
const cnTokenizer = require("nodejieba")
const containsChinese = require("contains-chinese")
const siteNames = require("./tag/siteNames.json")
const customStopwords = require("./tag/stopwords.json")

let cnTermSet = null

if (!cnTermSet) {
	console.log("load CN dictionary")
	let tmpArr = []
	const fileNames = fs.readdirSync(__dirname + "/tag/cnNames")

	fileNames.forEach(fileName => {
		console.log(fileName)
		const names = fs
			.readFileSync(__dirname + "/tag/cnNames/" + fileName)
			.toString()
			.split("\n")
			.filter(n => n.length > 1)

		tmpArr = tmpArr.concat(names)
	})
	cnTermSet = new Set(tmpArr)
	tmpArr = null
	console.log(cnTermSet.size)
}

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

function extractKownChineseTerms(input) {
	let foundTerms = []
	// Get all substrings from longest to shortest
	// If longer string is found, do not look for shorter ones
	let i, j
	let res = input
	for (i = 0; i < input.length; i++) {
		for (j = input.length; j > i; j--) {
			const t = input.slice(i, j)
			// console.log(t)
			if (cnTermSet.has(t)) {
				foundTerms.push(t)
				res = res.replace(t, "")
				i = j
				break
				// this ensures shorter tags not created
			}
		}
	}
	return [res, foundTerms]
}
const tagManager = {
	getSameTags: (tagsA, tagsB) => {
		return tagsA.filter(tag => tagsB.includes(tag))
	},
	similarityScore: (inputTags, baseTags) => {
		// Need more sophisticated algorithm to also consider different
		// weights for different words

		// TODO: longer word match should weigh more
		// e.g. 这个杀手不太冷 weigh more than 文艺片
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
		// TODO: write test cases
		let pageTitleLower = pageTitle.toLowerCase()
		pageTitleLower = removeSiteName(pageTitleLower)
		// Add space between Chinese and English
		const pageTitlePatchedWithSpace = insert_spacing(pageTitleLower)
		// Split by space or punctuation marks
		let tokens = pageTitlePatchedWithSpace.split(
			/(?:,|:|：|《|。|》|，|、|．|【|】|\/|~|\||\?|,|゜|-|_|？|！|!|\.|\(|\)|（|）| )+/
		)
		let pageTags = []
		tokens.forEach(token => {
			if (containsChinese(token)) {
				const [t, foundTerms] = extractKownChineseTerms(token)
				if (containsChinese(t)) {
					let cnTokens = cnTokenizer.cut(t)
					pageTags.push(...cnTokens)
				} else {
					pageTags.push(t)
				}
				pageTags.push(...foundTerms)
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
