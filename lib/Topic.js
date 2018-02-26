
const cheerio = require('cheerio')
const autoBind = require('auto-bind')

const Picture = require('./Picture')
const Analyzer = require('./Analyzer')

class Topic {

  constructor(html) {
    autoBind(this)
    this.html = html
    this.$ = cheerio.load(html)

    this.MAX_POST = 19
    this.picUrlPrefix = 'http://img.ngacn.cc/attachments'

    this.init(this.$)


  }

  init($) {
    const { getTitle, getAllVotes, findPictures, picUrlPrefix } = this
    const title = getTitle($)
    const votes = getAllVotes()

    const analyzer = new Analyzer({
      title,
      votes,
    })

    const result = findPictures(0)

    result.forEach(src => {
      console.log(src)
      const pic = new Picture(`${picUrlPrefix}${src}`)
      pic.save()
    })

  }

  getTitle() {
    const { $ } = this
    return $('#postsubject0').text()
  }

  // 获取点赞数
  getAllVotes() {
    const { MAX_POST, getSingleVotes } = this
    const votes = []

    for (let i = 0; i <= MAX_POST; i++) {
      votes[i] = getSingleVotes(i)
    }

    return votes
  }

  getSingleVotes(index) {
    const { $, parseVotesInScript, MAX_POST } = this

    if (index > MAX_POST) {
      throw new Error('bigger then current page!')
    }

    const script = $(`#postsign${index}`).next().html()

    return parseVotesInScript(script)
  }


  // 解析script标签中的点赞数
  parseVotesInScript(script) {
    // 删楼
    if (!script) {
      return 0
    }

    const leftBrackets = script.indexOf('(')
    const func = `
      var $ = n => n;
      var collect = (...param) => param
      collect`

    // 点赞数为第16个参数，字符串形式
    // 形式如 "0,9,3" ，分别为 "未知,赞,踩"
    const [unknown, up, down] = eval(func + script.slice(leftBrackets))[15].split(',')

    return Math.max(up - down, 0)
  }

  findPictures(index) {
    const { $ } = this
    const content = $(`#postcontent${index}`).text()
    // console.log(content)

    const matchedPictures = content.match(/\[img\]([a-zA-Z0-9_\.\/\-]+)\[\/img\]/g)
    if (!matchedPictures) return []

    // console.log(matchedPictures)

    return matchedPictures.map(str => str.slice(6, -17))
  }


}

module.exports = Topic