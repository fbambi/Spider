const path = require('path')
const fs = require('fs')
const { promisify } = require('util')

const autoBind = require('auto-bind')

const { fsExistsAsync, fsReadAsync } = require('../utils/file')

class Log {
  constructor(options) {
    autoBind(this)

    this.options = options

    this.init()
  }

  init() {
    this.initData()
  }

  initData() {
    const { options } = this
    Object.keys(options).forEach((key) => {
      this[key] = options[key]
    })
    this.date = new Date()
  }

  setTid(tid) {
    this.tid = tid
    return this
  }

  setFloor(floor) {
    this.floor = floor
    return this
  }

  setDate(date) {
    this.date = date
    return this
  }

  get(type) {
    if (type) {
      return this[type]
    }
    const { tid, floor, vote, date, filename } = this

    return {
      tid,
      floor,
      vote,
      filename,
      date: +date,
    }
  }

  save(...params) {

    this._save(params)
      .catch(err => {
        throw err
      })
  }

  async _save() {

    // TODO
    // lock file while write
    // or save stack

    // log filename
    const _YYMMDD = this.date.toJSON().split('T')[0]

    const dst = path.resolve(__dirname, `../log/${_YYMMDD}.json`)
    const exist = await fsExistsAsync(dst)

    let logArr = []
    if (exist) {
      const data = await fsReadAsync(dst, 'utf-8')
      try {
        logArr = JSON.parse(data)
      } catch (err) {
        throw new Error('JSON parse FAILED')
      }
    }

    const { tid, floor, filename, date, vote } = this.get()
    const file = {
      floor,
      vote,
      filename,
    }
    const targetTopic = logArr.find(({ tid: _tid }) => _tid.toString() === tid.toString())

    if (targetTopic) {

      // targetTopic指向logArr中的目标对象
      targetTopic.files.push(file)
    } else {
      logArr.push({
        tid,
        date,
        files: [file],
      })
    }


    promisify(fs.writeFile)(dst, JSON.stringify(logArr))
      .then(() => {
        console.log(`Successfully write: ${dst}`)
      })
      .catch((err) => {
        throw err
      })




  }



}

module.exports = Log
