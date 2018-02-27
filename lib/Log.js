const path = require('path')
const fs = require('fs')
const { promisify } = require('util')

const autoBind = require('auto-bind')

const { fsAccess, fsRead } = require('../utils/file')

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
    const { tid, floor, date, filename } = this

    return {
      tid,
      floor,
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
    const date = this.date.toJSON().split('T')[0]

    const dst = path.resolve(__dirname, `../log/${date}.json`)
    const exist = await fsAccess(dst)


    let logObj = []
    if (exist) {
      const data = await fsRead(dst, 'utf-8')
      try {
        logObj = JSON.parse(data)
      } catch (err) {
        throw new Error('JSON parse FAILED')
      }
    }

    logObj.push(this.get())

    promisify(fs.writeFile)(dst, JSON.stringify(logObj))
      .then(() => {
        console.log(`Successfully write: ${dst}`)
      })
      .catch((err) => {
        console.log(err)
        throw err
      })




  }



}

module.exports = Log
