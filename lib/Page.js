const path = require('path')

const cheerio = require('cheerio')
const autoBind = require('auto-bind')

const Picture = require('./Picture')
const Analyzer = require('./Analyzer')

const picUrlPrefix = 'http://img.ngacn.cc/attachments'

const POST_PER_PAGE = 20

class Page {

  constructor(html, { currentPage, tid }) {
    autoBind(this)

    this.html = html
    this.currentPage = currentPage
    this.tid = tid

    this.$ = cheerio.load(html)

    try{
      this.init()

    }catch(err){
      console.log(err)

    }
  }

  init() {
    const { getTitle, getAllVotes, findPictures } = this
    const title = getTitle()
    const votes = getAllVotes()

    const analyzer = new Analyzer({
      title,
      votes,
    })
    this.getFloorPicture(votes)
  }

  // 根据规则决定是否查找楼层图片
  getFloorPicture(votes) {
    const { downloadPictureOfFloor } = this
    const postNumber = votes.length

    votes.forEach((vote, index) => {
      // @rule_1:
      // 最后回复楼层大于该层2层 且 点赞数大于5
      // @rule_2:
      // 点赞数大于10
      if ((postNumber - 1 - index > 2 && vote > 5) || vote > 10) {
        downloadPictureOfFloor(index, { vote })
      }
    })
  }

  downloadPictureOfFloor(floor, { vote }) {
    const { findPictures, tid } = this
    const result = findPictures(floor)

    console.log('find pictures: ',result.length)

    result.forEach(src => {
      const pic = new Picture(`${picUrlPrefix}${src}`, { filename: path.basename(src), floor, tid, vote })
      pic.save()
    })
  }

  getTitle() {
    const { $ } = this
    return $('#postsubject0').text()
  }

  // 获取第一页全部点赞数
  getAllVotes() {
    const { currentPage, getSingleVotes } = this
    const votes = []

    const startFloor = (currentPage - 1) * POST_PER_PAGE
    const endFloor = currentPage * POST_PER_PAGE - 1

    for (let i = startFloor; i <= endFloor; i++) {
      votes[i] = getSingleVotes(i)
    }

    return votes
  }

  // 获取单楼层点赞数
  getSingleVotes(index) {
    const { $, parseVotesInScript, MAX_POST } = this

    const script = $(`#postsign${index}`).next().html()

    return parseVotesInScript(script)
  }


  /**
   * 解析script标签中的点赞数
   * @param {string} script
   * 
   * @example
   * commonui.postArg.proc( 0,
   * $('postcontainer0'),$('postsubject0'),$('postcontent0'),$('postsign0'),$('posterinfo0'),$('postInfo0'),$('postBtnPos0'),
   * null,null,0,512,
   * null,'3243449',1519546228,'0,9,3','683',
   * '','','','',null,0 )
   */
  parseVotesInScript(script) {
    // 删楼
    if (!script) {
      return 0
    }

    const leftBrackets = script.indexOf('(')

    // 以自定义collect函数替换commonui.postArg.proc
    const func = `
      var $ = n => n;
      var collect = (...param) => param
      collect`

    // 点赞数为第16个参数，字符串形式
    // 形式如 "0,9,3" ，分别为 "未知,赞,踩"
    const [__unknown, up, down] = eval(func + script.slice(leftBrackets))[15].split(',')

    return Math.max(up - down, 0)
  }

  findPictures(index) {
    const { $ } = this
    const content = $(`#postcontent${index}`).text()
    // console.log(content)

    const imgReg = /\[img\]([a-zA-Z0-9_\.\/\-]+)\[\/img\]/g
    const matchedPictures = content.match(imgReg)
    if (!matchedPictures) return []

    // console.log(matchedPictures)

    const srcReg = /\.(\/[a-zA-Z0-9\-\/_]+\.(jpg|jpeg|gif|png|bmp))/
    try{  
      return matchedPictures.map(str => str.match(srcReg)[1])
    }catch(err){
      console.log(err)
      console.log(matchedPictures)
    }
  }


}

module.exports = Page