
const fs = require('fs')
const path = require('path')
const http = require('http')
const url = require('url')

const autoBind = require('auto-bind')

const headers = require('../config/headers').NCHeaders
const request = require('./request')
const Log = require('./Log')


class Picture {

  constructor(src, options) {
    autoBind(this)

    this.src = src;
    this.log = new Log(options)
  }

  async save() {
    const { src, download, saveLocal } = this
    let content

    try {
      const result = await download(src)
      content = result.content
    } catch (err) {
      console.log(`请求失败: ${src}`)
      throw err
    }

    const splitArr = src.split('/')
    const filename = splitArr[splitArr.length - 1]

    saveLocal(filename, content)
  }

  // TODO
  // use stream
  download(src) {
    const options = {
      ...headers,
      ...url.parse(src)
    }

    return request(options)
  }

  saveLocal(filename, buf) {
    const dst = path.resolve(__dirname, '../img')
    fs.writeFile(`${dst}\\${filename}`, buf, (err) => {
      if (err) throw err
      console.log(`Successfully Save: ${dst}\\${filename}`)
      this.log.save()
    })
  }
}

module.exports = Picture