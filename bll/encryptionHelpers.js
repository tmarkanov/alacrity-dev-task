const crypto = require('crypto')

const algorithm = 'aes-256-ctr'
const hmacAlgorithm = 'sha256'

const encrypt = (value, key) => {
  const iv = crypto.randomBytes(16)
  const cipher = crypto.createCipheriv(algorithm, Buffer.from(key), iv)
  let encrypted = cipher.update(Buffer.from(value))
  encrypted = Buffer.concat([encrypted, cipher.final()]).toString('hex')

  return {
    encryptedValue: encrypted,
    iv: iv.toString('hex')
  }
}

const decrypt = ({ value, iv }, key) => {
  const decipher = crypto.createDecipheriv(algorithm, Buffer.from(key), Buffer.from(iv, 'hex'))
  const decrypted = decipher.update(Buffer.from(value, 'hex'))
  return Buffer.concat([decrypted, decipher.final()]).toString()
}

const generateHash = (key, encryptedValue) => {
  return crypto.createHmac(hmacAlgorithm, key).update(encryptedValue).digest('hex')
}

const validateDecryptionKey = ({ value, hash }, key) => {
  return hash === generateHash(key, value)
}

module.exports = {
  encrypt,
  decrypt,
  generateHash,
  validateDecryptionKey
}
