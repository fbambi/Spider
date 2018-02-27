

const { include, exclude } = require('../config/keyWord.js')

class Analyzer {


  constructor({ title, votes }) {
    this.title = title
    this.votes = votes

  }

  valueable(...args) {
    const { analyzeTitle, title, votes } = this
    let isValueable = false
    isValueable = analyzeTitle(title)

    return isValueable
  }

  analyzeTitle(title) {
    // console.log(title)

    return include.some(word => title.includes(word))

  }




}

module.exports = Analyzer
