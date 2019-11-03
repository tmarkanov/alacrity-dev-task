const db = require('../lib/db')

const up = async () => {
  try {
    await db.query('DROP TABLE IF EXISTS encrypted_data')
    return db.query(`
      CREATE TABLE encrypted_data (
        id text CONSTRAINT primary_key PRIMARY KEY,
        value text NOT NULL,
        iv varchar(32) NOT NULL,
        hash varchar(64) NOT NULL
      )
    `)
  } catch (error) {
    throw new Error(error)
  }
}

if (require.main === module) {
  up()
    .then(() => {
      console.log('Migrated successfully.')
      process.exit(0)
    })
    .catch(error => {
      console.error(`Migration failed, reason:\n${error.message}`)
      process.exit(1)
    })
}

module.exports = { up }
