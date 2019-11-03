const db = require('../lib/db')
const encryptionHelpers = require('./encryptionHelpers')

module.exports = {
  create: async ({ data: { id, encryption_key, value } }) => {
    const { encryptedValue, iv } = encryptionHelpers.encrypt(JSON.stringify(value), encryption_key)
    const hash = encryptionHelpers.generateHash(encryption_key, encryptedValue)

    await db.query(`
      INSERT INTO encrypted_data VALUES ($1, $2, $3, $4)
      ON CONFLICT (id)
      DO UPDATE SET value = $2, iv = $3, hash = $4
    `, [id, encryptedValue, iv, hash])

    return 'OK'
  },

  read: async ({ query: { id, decryption_key } }) => {
    let query
    if (id.includes('*')) {
      id = id.replace('*', '%')
      query = 'SELECT * FROM encrypted_data WHERE id LIKE $1'
    } else {
      query = 'SELECT * FROM encrypted_data WHERE id = $1'
    }

    const { rows } = await db.query(query, [id])
    const results = rows.reduce((acc, row) => {
      if (encryptionHelpers.validateDecryptionKey(row, decryption_key)) {
        acc.push(JSON.parse(encryptionHelpers.decrypt(row, decryption_key)))
      } else {
        console.error(`Decryption key mismatch for id ${row.id}.`)
      }
      return acc
    }, [])

    return JSON.stringify(results)
  }
}
