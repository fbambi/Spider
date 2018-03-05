
const fs = require('fs')
const path = require('path')
const http = require('http')
const url = require('url')
const { promisify } = require('util')

const autoBind = require('auto-bind')

const headers = require('../config/headers').NCHeaders
const request = require('./request')
const Log = require('./Log')
const TopicPicture = require('../database')


class Picture {

  constructor(src, options) {
    autoBind(this)

    this.src = src
    this.options = options
    this.filename = options.filename
    this.log = new Log(options)
  }

  async checkExist() {
    const { tid, filename } = this.options
    try {
      const result = await TopicPicture.find({ tid, 'files.filename': filename })
      if (result.length === 0) {
        return false
      }
      return true
    } catch (err) {
      throw err
    }
  }

  async save() {
    const { src, filename, download, saveLocal, checkExist } = this

    if (await checkExist()) {
      console.log(`No need to save: ${filename}`)
      return
    }

    try {
      const dst = path.resolve(__dirname, '../img', filename)
      const { content } = await download(src)
      saveLocal(dst, content)
    } catch (err) {
      console.log(`请求失败: ${src}`)
      throw err
    }

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

  async saveLocal(dst, buf) {
    fs.writeFile(dst, buf, (err) => {
      if (err) throw err
      console.log(`Successfully Save: ${dst}`)
      this.log.save()
    })
  }
}




module.exports = Picture