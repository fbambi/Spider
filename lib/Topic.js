const path = require('path')
const url = require('url')

const cheerio = require('cheerio')
const autoBind = require('auto-bind')
const iconv = require('iconv-lite')

const Picture = require('./Picture')
const Analyzer = require('./Analyzer')
const Page = require('./Page')
const request = require('./request')
const headers = require('../config/headers')



class Topic {

  constructor(url, tid) {
    autoBind(this)

    this.url = url
    this.tid = tid

    try {
      this.init()
    } catch (error) {
      throw error
    }
  }

  async init() {
    const { getPageCount, getPageOptions, tid } = this
    const { content } = await this.getHtmlAsync(this.getPageOptions(1))

    const html = iconv.decode(content, 'gbk')

    const pageCount = getPageCount(html)

    for (let i = 1; i <= pageCount; i++) {
      request(getPageOptions(i))
        .then(({ content }) => {
          new Page(iconv.decode(content, 'gbk'), { currentPage: i, tid })
        })
        .catch((err) => {
          throw err
        })
    }
  }

  getPageCount(html) {
    const $ = cheerio.load(html)
    // const pageCountReg = /page=(\d)/

    const script = $('#pagebtop').find('script').html()
    return this.parsePagerCountInScript(script)
  }

  parsePagerCountInScript(script) {

    // 仅单页
    // script为''
    if (!script) {
      return 1
    }

    const func = `;__PAGE[1]`
    const pageCount = eval(`${script}${func}`)
    return pageCount
  }

  getPageOptions(index) {
    return {
      headers,
      ...url.parse(`${this.url}&page=${index}`)
    }
  }

  getHtmlAsync(options) {
    return request(options)
  }

  parseHtml() {
    const { getTitle, getAllVotes, findPictures } = this
    const title = getTitle()
    const votes = getAllVotes()

    const analyzer = new Analyzer({
      title,
      votes,
    })
    this.getFloorPicture(votes)
  }

}

module.exports = Topic