const http = require('http')

const router = require('./lib/router')

const hostname = '127.0.0.1'
const port = 3000

http
  .createServer(router)
  .listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`)
  })
