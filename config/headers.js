const cookie = require('./cookie')

const headers = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/63.0.3239.132 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
  'Host': 'bbs.ngacn.cc',
  'Upgrade-Insecure-Requests': 1,
  'DNT': 1,
  'Referer': 'http://bbs.ngacn.cc/read.php?tid=13507469&_ff=-7&rand=637',
  'Accept-Language': 'zh-CN, zh; q=0.9, en-US; q=0.8, en; q=0.7, zh-TW; q=0.6',
}

exports.NCHeaders = headers
module.exports = {
  ...headers,
  'Cookie': cookie,
}