const querystring = require('querystring')
const url = require('url')

const encryptedData = require('../bll/encryptedData')

module.exports = (req, res) => {
  res.setHeader('Content-Type', 'application/json')

  let data = []
  req.on('data', chunk => {
    data.push(chunk)
  })

  req.on('end', async () => {
    try {
      data = JSON.parse(data)

      if (req.headers['content-type'] === 'application/json') {
        const { pathname, query: rawQuery } = url.parse(req.url)
        const query = querystring.parse(rawQuery)
        const route = routes.find(r => r.method === req.method && r.path === pathname)

        if (route) {
          const result = await route.handle({ data, query })
          res.statusCode = 200
          res.end(result)
        } else {
          res.statusCode = 404
          res.end('Not found.')
        }
      } else {
        res.statusCode = 422
        res.end('Unsupported content type.')
      }
    } catch (error) {
      res.statusCode = 422
      res.end(error.message)
    }
  })
}

const routes = [
  {
    method: 'POST',
    path: '/api/encrypted-data',
    handle: encryptedData.create
  },
  {
    method: 'GET',
    path: '/api/encrypted-data',
    handle: encryptedData.read
  }
]
