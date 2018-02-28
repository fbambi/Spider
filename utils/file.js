
const fs = require('fs')
const { promisify } = require('util')

exports.fsExistsAsync = async (...params) => {
  try {
    result = await promisify(fs.access)(...params)
    return true
  } catch (err) {
    return false
  }
}

exports.fsReadAsync = async (...params) => {
  try {
    result = await promisify(fs.readFile)(...params)
    return result
  } catch (err) {
    throw err
  }
}

