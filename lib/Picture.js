
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
const { fsExistsAsync } = require('../utils/file')


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
    const result = await TopicPicture.find({ tid, 'files.filename': filename },
      /*      (err, pictures) => {
            console.log('------ check exists -------')
            if (err) {
              console.log(err)
            } else {
              console.log(pictures[0].files)
            }
          } */
    )
    console.log('-----')
    console.log(result)
  }

  async save() {
    const { src, filename, download, saveLocal, } = this
    const dst = path.resolve(__dirname, '../img', filename)

    // this.checkExist()

    if (await fsExistsAsync(dst)) {
      console.log(`No need to save: ${dst}`)
      return
    }

    let content

    try {
      const result = await download(src)
      content = result.content
    } catch (err) {
      console.log(`请求失败: ${src}`)
      throw err
    }

    saveLocal(dst, content)
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