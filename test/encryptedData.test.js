const assert = require('assert')
const crypto = require('crypto')

const db = require('../lib/db')
const encryptedData = require ('../bll/encryptedData')
const initialMigration = require('../migrations/initialMigration')

const id = 'test'
const value = { a: 'asd' }
const encryption_key = 'RcLjTjjGwStEPYucpj5QbFnCNVkeqSfo'
const otherKey = 'ZLTiWsYgGBGPY1bGYzzs40yc4yOx1TPg'

describe('encryptionData', function () {
  before(function () {
    return initialMigration.up()
  })

  describe('create', function () {
    it('should save encrypted value into DB', async function () {
      const result = await encryptedData.create({ data: { id, encryption_key, value } })
      assert.equal(result, 'OK')

      const { rows: [record] } = await db.query('SELECT * FROM encrypted_data WHERE id = $1', [id])
      assert.equal(typeof record.value, 'string')
      assert.notEqual(record.value, value)
      assert.equal(typeof record.iv, 'string')
      assert.equal(record.iv.length, 32)
      assert.equal(typeof record.hash, 'string')
      assert.equal(record.hash.length, 64)
    })

    it('should update a record if record with given id already exists', async function () {
      const { rows: rowsBefore } = await db.query('SELECT * FROM encrypted_data WHERE id = $1', [id])
      assert.equal(rowsBefore.length, 1)

      const result = await encryptedData.create({ data: { id, encryption_key, value } })
      assert.equal(result, 'OK')

      const { rows: rowsAfter } = await db.query('SELECT * FROM encrypted_data WHERE id = $1', [id])
      assert.equal(rowsAfter.length, 1)

      assert.notEqual(rowsBefore[0].value, rowsAfter[0].value)
      assert.notEqual(rowsBefore[0].iv, rowsAfter[0].iv)
      assert.notEqual(rowsBefore[0].hash, rowsAfter[0].hash)
    })
  })

  describe('read', function () {
    it('returns multiple results when given id with *, skipping rows with key mismatch', async function () {
      const value2 = 'test2'
      const value3 = 'test3'
      await encryptedData.create({ data: { id: 'test2', encryption_key, value: value2 } })
      await encryptedData.create({ data: { id: 'test3', encryption_key: otherKey, value: value3 } })
      await encryptedData.create({ data: { id: 'other', encryption_key, value } })

      const json = await encryptedData.read({ query: { id: 'test*', decryption_key: encryption_key } })

      const results = JSON.parse(json)
      assert.equal(results.length, 2)
      assert.deepEqual(results[0], value)
      assert.deepEqual(results[1], value2)
    })

    it('returns a single result when given id without *', async function () {
      const json = await encryptedData.read({ query: { id, decryption_key: encryption_key } })

      const results = JSON.parse(json)
      assert.equal(results.length, 1)
      assert.deepEqual(results[0], value)
    })

    it('returns an empty array on invalid decryption key', async function () {
      const json = await encryptedData.read({ query: { id, decryption_key: otherKey } })

      const results = JSON.parse(json)
      assert.equal(results.length, 0)
    })

  })
})
