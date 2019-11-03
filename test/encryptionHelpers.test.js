const assert = require('assert')
const crypto = require('crypto')

const encryptionHelpers = require('../bll/encryptionHelpers')

const algorithm = 'aes-256-ctr'
const hmacAlgorithm = 'sha256'

const value = 'test'
const key = 'RcLjTjjGwStEPYucpj5QbFnCNVkeqSfo'
const otherKey = 'ZLTiWsYgGBGPY1bGYzzs40yc4yOx1TPg'
const iv = crypto.randomBytes(16)

describe('encryptionHelpers', function () {
  describe('encrypt', function () {
    it('should return encrypted value and initialization vector', function () {
      const { encryptedValue, iv } = encryptionHelpers.encrypt(value, key)

      const decipher = crypto.createDecipheriv(algorithm, Buffer.from(key), Buffer.from(iv, 'hex'))
      const decrypted = decipher.update(Buffer.from(encryptedValue, 'hex'))
      const decryptedValue = Buffer.concat([decrypted, decipher.final()]).toString()

      assert.equal(decryptedValue, value)
    })

    it('should raise when key length is not 32 characters', function () {
      assert.throws(() => encryptionHelpers.encrypt(value, key.slice(1)))
      assert.throws(() => encryptionHelpers.encrypt(value, key + '1'))
    })
  })

  describe('decrypt', function () {
    it('should return decrypted value with correct decryption key', function () {
      const cipher = crypto.createCipheriv(algorithm, Buffer.from(key), iv)
      let encrypted = cipher.update(Buffer.from(value))
      encrypted = Buffer.concat([encrypted, cipher.final()]).toString('hex')

      assert.equal(encryptionHelpers.decrypt({ value: encrypted, iv }, key), value)
    })

    it('should not return decrypted value with incorrect decryption key', function () {
      const cipher = crypto.createCipheriv(algorithm, Buffer.from(key), iv)
      let encrypted = cipher.update(Buffer.from(value))
      encrypted = Buffer.concat([encrypted, cipher.final()]).toString('hex')

      assert.notEqual(encryptionHelpers.decrypt({ value: encrypted, iv }, otherKey), value)
    })

    it('should raise when key length is not 32 characters', function () {
      assert.throws(() => encryptionHelpers.decrypt({ value, iv }, key.slice(1)))
      assert.throws(() => encryptionHelpers.decrypt({ value, iv }, key + '1'))
    })
  })

  describe('generateHash', function () {
    it('should generate a 64-character hash', function () {
      const hash = encryptionHelpers.generateHash(key, 'anything')
      assert.equal(typeof hash, 'string')
      assert.equal(hash.length, 64)
    })
  })

  describe('validateDecryptionKey', function () {
    it('should return true if the same key-value pair was used to create hash', function () {
      const hash = crypto.createHmac(hmacAlgorithm, key).update(value).digest('hex')
      assert.equal(encryptionHelpers.validateDecryptionKey({ value, hash }, key), true)
    })

    it('should return false if a different key-value pair was used to create hash', function () {
      const hash = crypto.createHmac(hmacAlgorithm, otherKey).update(value).digest('hex')
      assert.equal(encryptionHelpers.validateDecryptionKey({ value, hash }, key), false)
    })
  })
})
