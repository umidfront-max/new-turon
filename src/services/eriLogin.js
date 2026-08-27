/*
  ERI Login xizmati — ICRYPTER asosidagi backend.
  Hujjat: http://192.168.14.186/eri-login/docs

  POST /login-pfx  { pfx_b64, password }  ->  { success, message, user_id, has_face, certificate }
  Foydalanuvchi JSHSHIR kiritmaydi: u kalit ichidagi sertifikatdan olinadi.
*/

// manzil .env orqali almashtiriladi (VITE_ERI_URL), aks holda ish serveri
const BASE = (import.meta.env?.VITE_ERI_URL || 'http://192.168.14.186/eri-login').replace(/\/+$/, '')

// Yuz bosqichi bilan to'liq oqimni boshqaruvchi darvoza (challenge -> yuz -> JWT)
const GATEWAY = (import.meta.env?.VITE_GATEWAY_URL || 'http://192.168.14.186/auth-gateway').replace(/\/+$/, '')

const TIMEOUT = 30000
const MAX_PFX = 512 * 1024 // .pfx odatda bir necha KB, 512 KB dan oshmaydi

export class EriError extends Error {
  /**
   * @param {string} key i18n kaliti (login.eri.errors.*)
   * @param {string} [detail] serverdan kelgan matn — bo'lsa shu ko'rsatiladi
   */
  constructor(key, detail) {
    super(detail || key)
    this.key = key
    this.detail = detail || ''
  }
}

/** Faylni base64 ga o'giradi (data: prefiksisiz). */
export function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onerror = () => reject(new EriError('read'))
    reader.onload = () => {
      const result = String(reader.result || '')
      const comma = result.indexOf(',')
      resolve(comma >= 0 ? result.slice(comma + 1) : result)
    }
    reader.readAsDataURL(file)
  })
}

/** Har bir urinish uchun audit identifikatori. */
function auditId() {
  try {
    if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID()
  } catch { /* eski brauzer */ }
  return `cb-${Date.now().toString(36)}`
}

async function post(path, body, base = BASE) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), TIMEOUT)

  let res
  try {
    res = await fetch(`${base}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Audit-Id': auditId() },
      body: JSON.stringify(body),
      signal: controller.signal
    })
  } catch (e) {
    // tarmoq uzilgan, server o'chirilgan yoki vaqt tugagan
    throw new EriError(e.name === 'AbortError' ? 'timeout' : 'network')
  } finally {
    clearTimeout(timer)
  }

  let data = null
  try {
    data = await res.json()
  } catch { /* javob JSON emas */ }

  if (res.status === 422) {
    const first = Array.isArray(data?.detail) ? data.detail[0] : null
    throw new EriError('validation', first?.msg)
  }

  if (!res.ok) throw new EriError('server', data?.detail || `HTTP ${res.status}`)

  return data || {}
}

/* ---------- sertifikatdan ma'lumot olish ---------- */

// backend subject/identity ni turlicha qaytarishi mumkin — barchasini bitta xaritaga yig'amiz
function flatten(source) {
  const out = {}
  const add = (k, v) => {
    if (typeof v === 'string' && v.trim()) out[String(k).toLowerCase()] = v.trim()
  }

  const walk = (value) => {
    if (!value) return
    if (typeof value === 'string') {
      // "CN=..., O=..., 1.2.860.3.16.1.2=..." ko'rinishi
      value.split(/,(?=\s*[\w.]+=)/).forEach((part) => {
        const eq = part.indexOf('=')
        if (eq > 0) add(part.slice(0, eq), part.slice(eq + 1))
      })
      return
    }
    if (Array.isArray(value)) { value.forEach(walk); return }
    if (typeof value === 'object') Object.entries(value).forEach(([k, v]) => {
      if (v && typeof v === 'object') walk(v)
      else add(k, v)
    })
  }

  walk(source)
  return out
}

function pick(map, keys) {
  for (const k of keys) {
    const v = map[k.toLowerCase()]
    if (v) return v
  }
  return ''
}

/**
 * Sertifikatdan foydalanuvchi ma'lumotlarini ajratadi.
 * Maydon nomlari serverga qarab farq qilgani uchun bir nechta variant tekshiriladi.
 */
export function readCertificate(cert) {
  if (!cert) return { name: '', pinfl: '', tin: '', org: '', validTo: '' }

  const map = { ...flatten(cert.subject), ...flatten(cert.identity), ...flatten(cert.raw) }

  const name = pick(map, ['fullname', 'full_name', 'fio', 'cn', 'commonname', 'common_name', 'name'])
  const pinfl = pick(map, ['pinfl', 'jshshir', 'pin', '1.2.860.3.16.1.2'])
  const tin = pick(map, ['tin', 'stir', 'inn', 'innnumber', '1.2.860.3.16.1.1'])
  const org = pick(map, ['o', 'organization', 'organizationname', 'ou'])

  return {
    name,
    pinfl,
    tin,
    org,
    validTo: cert.not_after || pick(map, ['not_after', 'validto']) || ''
  }
}

/** JSHSHIR / STIR ni ko'rsatish uchun niqoblaydi: 3•••••••10 */
export function maskId(value) {
  const s = String(value || '').replace(/\s/g, '')
  if (s.length < 4) return s
  return `${s.slice(0, 1)}${'•'.repeat(Math.max(1, s.length - 3))}${s.slice(-2)}`
}

/* ---------- asosiy amal ---------- */

/**
 * .pfx fayl va parol bilan kirishni tekshiradi.
 * @param {File} file .pfx / .p12 fayli
 * @param {string} password kalit paroli
 * @returns {Promise<{userId:number|null, hasFace:boolean, certificate:object|null, user:object}>}
 */
export async function loginPfx(file, password) {
  if (!file) throw new EriError('noFile')
  if (file.size > MAX_PFX) throw new EriError('tooBig')
  const pfx_b64 = await fileToBase64(file)
  return loginPfxB64(pfx_b64, password)
}

/**
 * Kalit allaqachon base64 ga o'girilgan bo'lsa — to'g'ridan-to'g'ri yuboriladi.
 * @param {string} pfx_b64 .pfx fayli (base64)
 * @param {string} password kalit paroli
 */
export async function loginPfxB64(pfx_b64, password) {
  if (!pfx_b64) throw new EriError('noFile')
  if (!password) throw new EriError('noPassword')

  const data = await post('/login-pfx', { pfx_b64, password })

  if (!data.success) throw new EriError('rejected', data.message)

  const cert = data.certificate || null
  if (cert && cert.expired) throw new EriError('expired')

  return {
    userId: data.user_id ?? null,
    hasFace: !!data.has_face,
    certificate: cert,
    user: readCertificate(cert)
  }
}

/* ---------- ISigner imzosi orqali ---------- */

/** Server tokeni va imzolanadigan challenge. */
export async function serverToken() {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), TIMEOUT)

  let res
  try {
    res = await fetch(`${BASE}/token`, { signal: controller.signal })
  } catch (e) {
    throw new EriError(e.name === 'AbortError' ? 'timeout' : 'network')
  } finally {
    clearTimeout(timer)
  }

  if (!res.ok) throw new EriError('server', `HTTP ${res.status}`)
  const data = await res.json()
  if (!data?.token || !data?.challenge) throw new EriError('server')
  return data
}

/**
 * ISigner yasagan imzoni serverda tekshiradi.
 * @param {{signature:string, data:string, certificate?:string}} p
 */
export async function verifySignature({ signature, data, certificate = '' }) {
  return post('/verify', {
    format: 'isigner',
    certificate,
    signature,
    data,
    data_type: 'text'
  })
}

/* ---------- auth-gateway: yuz bosqichi bilan to'liq oqim ---------- */

/*
  Hujjat: http://192.168.14.186/auth-gateway/docs

    POST /auth/pfx       { pfx_b64, password }
      -> { challenge_id, face_ticket, face_ws_url, has_face, identity }
    (ws)  face_ws_url    — services/faceAuth.js, natijasi face_proof
    POST /auth/complete  { challenge_id, face_proof }
      -> { access, refresh, token_type, user }
*/

/**
 * 1-qadam: kalitni darvozaga beradi va yuz bosqichi uchun chipta oladi.
 * @param {string} pfx_b64 .pfx fayli (base64)
 * @param {string} password kalit paroli
 */
export async function authPfxB64(pfx_b64, password) {
  if (!pfx_b64) throw new EriError('noFile')
  if (!password) throw new EriError('noPassword')

  const data = await post('/auth/pfx', { pfx_b64, password }, GATEWAY)

  if (!data.challenge_id) throw new EriError('server')

  return {
    challengeId: data.challenge_id,
    faceTicket: data.face_ticket || '',
    faceWsUrl: data.face_ws_url || '',
    hasFace: data.has_face !== false,
    identity: data.identity || null,
    // identity maydonlari sertifikatdagidek nomlanadi — bir xil o'qiymiz
    user: readCertificate(data.identity ? { identity: data.identity } : null)
  }
}

/**
 * 3-qadam: yuz dalilini beradi va yakuniy JWT ni oladi.
 * @param {string} challengeId
 * @param {string} faceProof faceAuth.startFaceCheck() natijasi
 */
export async function authComplete(challengeId, faceProof) {
  if (!challengeId || !faceProof) throw new EriError('server')

  const data = await post('/auth/complete', {
    challenge_id: challengeId,
    face_proof: faceProof
  }, GATEWAY)

  if (!data.access) throw new EriError('server')

  return {
    access: data.access,
    refresh: data.refresh || '',
    tokenType: data.token_type || 'Bearer',
    user: data.user || {}
  }
}

export const ERI_BASE = BASE
export const GATEWAY_BASE = GATEWAY
