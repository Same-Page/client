const stopword = require('stopword')
const cnTokenizer = require("nodejieba")
const containsChinese = require('contains-chinese')

function insert_spacing(str) {
    //将汉字与英文、数字、下划线之间添加一个空格
    var p1=/([A-Za-z_])([\u4e00-\u9fa5]+)/gi;
    var p2=/([\u4e00-\u9fa5]+)([A-Za-z_])/gi;
    return str.replace(p1, "$1 $2").replace(p2, "$1 $2")
  }
const tagManager = {

    similarityScore: (inputTags, baseTags) => {
        let matchCount = 0
        inputTags.forEach((tag)=>{
          if (baseTags.includes(tag)) {
            matchCount ++;
          }
        })
        return matchCount / inputTags.length
    },
    getTags: (pageTitle) => {
        const pageTitleLower = pageTitle.toLowerCase()
        const pageTitlePatchedWithSpace = insert_spacing(pageTitleLower)
        let tokens = pageTitlePatchedWithSpace.split(/(?:,|:|：|《|。|》|，|\?|,|-|？|！|!|\.| )+/) 
        let pageTags = []
        tokens.forEach((token) => {
          if (containsChinese(token)) {
            let cnTokens = cnTokenizer.cut(token)
            pageTags.push(...cnTokens)
          } else {
            pageTags.push(token)
          }
        })
        pageTags = stopword.removeStopwords(pageTags)
        const customStopwords = ['', 'google', 'baidu', 'search', 'amazon', 'com', 'cn']
        pageTags = pageTags.filter( (tag) => !customStopwords.includes(tag) )    
        console.log(pageTags)
        return pageTags
    }

}
module.exports = tagManager
