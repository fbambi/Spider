
const http = require('http')
const url = require('url')
const iconv = require('iconv-lite')


const headers = require('./config/headers')
const Topic = require('./lib/Topic')
const ListPage = require('./lib/ListPage')
const request = require('./lib/request')

const opts = {
  headers,
}

let target = 'http://bbs.ngacn.cc/read.php?tid=13540101'

target = 'http://bbs.ngacn.cc/read.php?tid=13545244'

const options = {
  ...opts,
  ...(url.parse(target))
}



let condition = true;

condition = false

if (condition) {
  request(options)
    .then(({ res, content }) => {
      const html = iconv.decode(content, 'gbk')
      console.log(html)
    })
    .catch((err) => {
      console.log(err)
    })
} else {
  const listpage = new ListPage()
}




