import { randomBytes, scrypt as scryptCallback, timingSafeEqual, createHash } from "crypto"

function scryptAsync(password: string, salt: Buffer, keylen: number): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    scryptCallback(password, salt, keylen, { N: 16384, r: 8, p: 1 }, (err, derived) => {
      if (err) reject(err)
      else resolve(derived as Buffer)
    })
  })
}

// Password hashing uses Node's built-in scrypt (no new dependency).
// Stored format: "scrypt$<salt hex>$<hash hex>" (N=16384, r=8, p=1, 64-byte key).

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16)
  const hash = await scryptAsync(password, salt, 64)
  return `scrypt$${salt.toString("hex")}$${hash.toString("hex")}`
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  try {
    const [scheme, saltHex, hashHex] = stored.split("$")
    if (scheme !== "scrypt" || !saltHex || !hashHex) return false
    const salt = Buffer.from(saltHex, "hex")
    const expected = Buffer.from(hashHex, "hex")
    const actual = await scryptAsync(password, salt, 64)
    return actual.length === expected.length && timingSafeEqual(actual, expected)
  } catch {
    return false
  }
}

// Constant-time comparison for the legacy env-var password fallback.
export function safeEqual(a: string, b: string): boolean {
  const hashA = createHash("sha256").update(a).digest()
  const hashB = createHash("sha256").update(b).digest()
  return timingSafeEqual(hashA, hashB)
}

export function sha256(value: string): string {
  return createHash("sha256").update(value).digest("hex")
}

// One-time reset tokens: 32 random bytes, base64url. Only the SHA-256 hash
// is stored in the database; the raw token only ever travels in the email link.
export function newResetToken(): string {
  return randomBytes(32).toString("base64url")
}
