
const http = require('http')
const iconv = require('iconv-lite')


const request = (options) => {
  return new Promise(function (resolve, reject) {
    http.get(options, (res) => {
      const { statusCode, headers, body } = res

      const chunks = []
      res.on('data', (chunk) => {
        chunks.push(chunk)
      })

      res.on('end', () => {
        const content = Buffer.concat(chunks)
        const html = iconv.decode(content, 'gbk')
        // console.log(html)
        // console.log(statusCode)
        if (statusCode === 200) {
          resolve({ res, content })
        } else {
          reject(new Error('network error'))
        }
      })

    })
  })
}

module.exports = request
