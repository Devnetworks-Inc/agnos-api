import crypto from 'crypto'
const algorithm: string = process.env.CRYPTO_ALGO || ''
const secret: string = process.env.CRYPTO_SECRET || ''
const key = crypto.scryptSync(secret, 'salt', 24)

const iv = Buffer.alloc(16, 0)

export const encrypt = (toBeEncrypted: string) => {
    const cipher = crypto.createCipheriv(algorithm, key, iv)
    const encrypted = cipher.update(toBeEncrypted, 'utf8', 'hex') + cipher.final('hex')
    return encrypted
}

export const decrypt = (encrypted: string) => {
    const decipher = crypto.createDecipheriv(algorithm, key, iv)
    const decrypted = decipher.update(encrypted, 'hex', 'utf8') + decipher.final('utf8')
    return decrypted
}
