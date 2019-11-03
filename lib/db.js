const { Pool, Client } = require('pg')

const pool = new Pool({
  host: 'localhost',
  database: process.env.NODE_ENV === 'test' ? 'encrypted_storage_test' : 'encrypted_storage_dev',
  port: 5432,
  user: 'alacrity',
  password: 'alacrity'
})

module.exports = {
  query: (text, params, callback) => {
    return pool.query(text, params, callback)
  }
}
