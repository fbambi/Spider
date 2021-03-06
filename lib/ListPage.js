const url = require('url')

const cheerio = require('cheerio')
const autoBind = require('auto-bind')
const iconv = require('iconv-lite')


const request = require('./request')
const Topic = require('./Topic')
const Analyzer = require('./Analyzer')
const headers = require('../config/headers')

const indexPage = 'http://bbs.ngacn.cc/thread.php?fid=-7'
const postUrlPrefix = 'http://bbs.ngacn.cc'
const PAGES_COUNT = 10



class ListPage {

  constructor() {
    autoBind(this)

    this.queryAllPages()
  }

  getPageOption(index) {
    return {
      headers,
      ...(url.parse(indexPage + '&page=' + index))
    }
  }

  async queryAllPages() {
    const { querySinglePage, getPageOption } = this

    let index = 1;
    const result = []
    while (index <= PAGES_COUNT) {
      index++

      querySinglePage(getPageOption(index))
        .then((lists) => {
          lists.forEach(({ title, replyCount, link, tid }) => {
            // console.log(title)
            const analyzer = new Analyzer({ title })
            const valueable = analyzer.valueable()
            if (valueable) {

              const options = {
                headers,
                ...url.parse(`${postUrlPrefix}${link}`)
              }
              console.log(`检测到匹配主题: ${title}`)
              console.log(`${postUrlPrefix}${link}`)

              new Topic(`${postUrlPrefix}${link}`, tid)
            }
          })

        })
        .catch(err => {
          console.log(err)
        })

    }


  }

  querySinglePage(options) {

    return new Promise(async (resolve, reject) => {
      const result = await request(options)
      if (result instanceof Error) {
        reject(result)
      }

      resolve(this.parseListPage(iconv.decode(result.content, 'gbk')))

    })

  }

  parseListPage(html) {
    const $ = cheerio.load(html)

    const list = $('.forumbox').filter('table').find('tbody')
    const self = this;

    // 在 map 调用的方法中，可能返回 null
    // cheerio 在调用 get 方法时把 null 已排除 null
    // 因此不用单独 filter
    const ToipicList = list
      .map(function (index, element) {
        return self.parseListTopic($(element))
      })
      .get()


    return ToipicList
  }

  parseListTopic(element) {

    const replyCount = element.find('.c1').find('a').text()

    const titleElement = element.find('.c2').find('a').filter('.topic')
    const title = titleElement.text()
    const link = titleElement.attr('href')

    // 冲水
    if (link === 'javascript:void(0)') {
      return null
    }

    let tid = link.match(/tid=(\d+)/)[1]

    const authorElement = element.find('.c3').find('.author')
    const author = authorElement.text() + authorElement.find('b').text()
    const authorLink = authorElement.attr('href')
    let uid

    try {
      uid = authorLink.match(/uid=(\d+)/)[1]

      // 匿名
    } catch (error) {
      uid = 'anonymous'
    }


    // TODO
    // 发帖时间动态加载
    const create = authorElement.next().attr('title')


    return {
      title,
      link,
      tid,
      author,
      uid,
      reply: replyCount,
      // create
    }

  }


}

module.exports = ListPage