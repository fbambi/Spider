const path = require('path')
const fs = require('fs')
const { promisify } = require('util')

const autoBind = require('auto-bind')

const TopicPicture = require('../database')

const { fsExistsAsync, fsReadAsync } = require('../utils/file')

const logObj = {}

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

    /*     this._save(params)
          .catch(err => {
            throw err
          }) */

    this.$save()
  }

  printLog() {
    Object.keys(logObj).forEach(tid => {
      console.log('tid: ', tid, '  count: ', logObj[tid])
    })
  }
  $save() {


    const options = this.get()
    const { tid } = options

    TopicPicture.find({ tid }, (err, pictures) => {
      if (err) throw err
      if (pictures.length === 0) {
        // if (logObj[tid]) {
        //   logObj[tid]++
        // } else {
        //   logObj[tid] = 1
        // }
        // this.printLog()
        this.createPicture(options)
      } else {
        // logObj[tid]++
        // console.log('~~~~old', tid)
        // this.printLog()
        this.updatePicture(options)
      }
    })

  }

  updatePicture({ tid, floor, vote, filename }) {

    TopicPicture.update(
      { tid, files: { $elemMatch: { filename: { $ne: filename } } } },
      { $push: { files: { floor, vote, filename } } },
      (err, raw) => {
        if (err) throw err
        console.log(raw)
      }
    )
    return
    TopicPicture.find(
      {
        tid,
        files: {
          $elemMatch: {
            filename,
          }
        }
      },
      (err, [picture]) => {
        if (err) throw err;
        // console.log(`update: filename: ${filename} tid ${tid}`)

        if (picture) {
          console.log('already has img')
          return
        }
        TopicPicture.update({ tid }, { $push: { files: { floor, vote, filename } } }, (err, raw) => {
          if (err) throw err
          console.log(raw)
        })
      })
  }

  createPicture({ tid, floor, filename, date, vote }) {
    TopicPicture.update(
      { tid },
      {
        // $push: { files: { floor, vote, filename } },
        $setOnInsert: {
          date,
          files: [{
            floor,
            vote,
            filename,
          }]
        }
      },
      { upsert: true },
      (err, raw) => {
        if (err) throw err
        console.log(raw)
        const { upserted } = raw
        if (!upserted) {
          this.updatePicture({ tid, floor, filename, date, vote })
        }
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
