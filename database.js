const mongoose = require('mongoose')
const url = 'mongodb://localhost:27017/spider'

const db = mongoose.connection

db.on('error', () => {
  console.error('connection error')
})

db.once('open', () => {
  console.log('connection success')
})

mongoose.connect(url)

const schema = new mongoose.Schema({
  tid: String,
  date: Number,
  files: [{ floor: Number, vote: Number, filename: String }]
})

let pictureModel = mongoose.model('TopicPicture', schema)

module.exports = pictureModel






