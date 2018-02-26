
const fs = require('fs')
const path = require('path')
const http = require('http')
const url = require('url')

const request = require('./request')
const headers = require('../config/headers').NCHeaders

class Picture {

  constructor(src) {

    this.src = src;
    this.options = headers
  }

  async save() {
    const { src, download, saveLocal } = this
    let content

    try {
      const result = await download(src)
      content = result.content
    } catch (err) {
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
    })
  }
}

module.exports = Picture