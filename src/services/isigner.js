/*
  ISigner — kompyuterga o'rnatiladigan lokal imzolash ilovasi (WebSocket).

  Protokol cardblock loyihasidagi isigner.js dan olingan:
    so'rov  -> { type: 0, func: <FUNC>, cbid: <id>, args: {...} }
    javob   -> { type: 1, code: 1, cbid, data }   (code 1 = muvaffaqiyat)

  Kalitlar ro'yxati KEYLIST (func 2) orqali olinadi, har bir yozuv:
    PFX:/<SERIAL>/CN=...;NAME=...;SURNAME=...;1.2.860.3.16.1.2=<JSHSHIR>;
    SERIALNUMBER=...;VALIDFROM=...;VALIDTO=...;PASSREQ=1
*/

export const FUNC = {
  METHODS_LIST: 0,
  VERSION: 1,
  KEYLIST: 2,
  REMOVABLELIST: 3,
  HASH: 4,
  SIGN: 5,
  CHANGEPIN: 8,
  TOKEN_AUTH: 11,
  SIGNP7: 13
}

const TYPE_REQUEST = 0
const TYPE_RESPONSE = 1
const TYPE_NOTIFY = 2

const CODE_SUCCESS = 1

// ISigner xato kodlari -> i18n kaliti
const ERROR_KEYS = {
  13: 'keyNotFound',
  14: 'wrongPassword',
  15: 'unknownFormat',
  16: 'signFailed',
  17: 'badCertificate',
  18: 'cancelled',
  19: 'badPrivateKey',
  24: 'wrongPassword',
  25: 'wrongPassword'
}

const CONNECT_TIMEOUT = 6000
const CALL_TIMEOUT = 180000 // imzo paytida ISigner o'z oynasini ochadi — kutish uzoq bo'lishi mumkin

export class ISignerError extends Error {
  constructor(key, detail, code) {
    super(detail || key)
    this.key = key
    this.detail = detail || ''
    this.code = code ?? null
  }
}

function serverAddr() {
  const https = typeof location !== 'undefined' && location.protocol?.toLowerCase() === 'https:'
  return https ? 'wss://127.0.0.1:44443' : 'ws://127.0.0.1:44480'
}

let socket = null
let opening = null
const callbacks = new Map()
let seq = 0

function reset() {
  socket = null
  opening = null
  callbacks.forEach(({ reject, timer }) => {
    clearTimeout(timer)
    reject(new ISignerError('disconnected'))
  })
  callbacks.clear()
}

/** ISigner bilan ulanish. Bir marta ochiladi, keyin qayta ishlatiladi. */
export function connect() {
  if (socket && socket.readyState === WebSocket.OPEN) return Promise.resolve()
  if (opening) return opening

  opening = new Promise((resolve, reject) => {
    let ws
    try {
      ws = new WebSocket(serverAddr())
    } catch {
      opening = null
      reject(new ISignerError('notRunning'))
      return
    }

    const timer = setTimeout(() => {
      try { ws.close() } catch { /* allaqachon yopiq */ }
      opening = null
      reject(new ISignerError('notRunning'))
    }, CONNECT_TIMEOUT)

    ws.onopen = () => {
      clearTimeout(timer)
      socket = ws
      opening = null
      resolve()
    }

    ws.onerror = () => {
      clearTimeout(timer)
      opening = null
      reject(new ISignerError('notRunning'))
    }

    ws.onclose = () => {
      clearTimeout(timer)
      if (socket === ws) reset()
    }

    ws.onmessage = (event) => {
      let res
      try {
        res = JSON.parse(String(event.data))
      } catch {
        return
      }

      if (res.type === TYPE_NOTIFY) return // USB token ulandi/uzildi — hozircha kerak emas
      if (res.type !== TYPE_RESPONSE) return

      const pending = callbacks.get(res.cbid)
      if (!pending) return
      callbacks.delete(res.cbid)
      clearTimeout(pending.timer)

      if (res.code === CODE_SUCCESS) pending.resolve(res.data)
      else {
        const detail = typeof res.data === 'string' ? res.data : JSON.stringify(res.data ?? '')
        pending.reject(new ISignerError(ERROR_KEYS[res.code] || 'failed', detail, res.code))
      }
    }
  })

  return opening
}

export function disconnect() {
  try { socket?.close() } catch { /* e'tiborsiz */ }
  reset()
}

/** ISigner ishlayaptimi — ro'yxatni yuklashdan oldin tekshirish uchun. */
export async function isAvailable() {
  try {
    await connect()
    return true
  } catch {
    return false
  }
}

function execute(func, args = {}) {
  return new Promise((resolve, reject) => {
    if (!socket || socket.readyState !== WebSocket.OPEN) {
      reject(new ISignerError('notRunning'))
      return
    }

    seq += 1
    const cbid = `cb${seq}`
    const timer = setTimeout(() => {
      callbacks.delete(cbid)
      reject(new ISignerError('timeout'))
    }, CALL_TIMEOUT)

    callbacks.set(cbid, { resolve, reject, timer })
    socket.send(JSON.stringify({ type: TYPE_REQUEST, func, cbid, args }))
  })
}

/* ---------- kalit satrini o'qish ---------- */

/**
 * "PFX:/77F7F81E/CN=...;NAME=...;VALIDTO=..." satrini obyektga aylantiradi.
 * @param {string} raw KEYLIST dan kelgan satr
 */
export function parseKey(raw) {
  const text = String(raw || '')
  const parts = text.split('/')
  const storage = parts[0] || 'PFX:' // PFX: yoki TOKEN:
  const serial = parts[1] || ''

  const fields = {}
  parts.slice(2).join('/').split(';').forEach((chunk) => {
    const eq = chunk.indexOf('=')
    if (eq > 0) fields[chunk.slice(0, eq).trim().toUpperCase()] = chunk.slice(eq + 1).trim()
  })

  const day = (value) => String(value || '').split(' ')[0].replace(/\./g, '.')

  return {
    raw: text,
    storage: storage.replace(':', ''),
    serial: serial || fields.SERIALNUMBER || '',
    name: fields.CN || '',
    firstName: fields.NAME || '',
    lastName: fields.SURNAME || '',
    org: fields.O || '',
    unit: fields.OU || '',
    title: fields.T || fields.TITLE || '',
    region: fields.ST || '',
    district: fields.L || '',
    // turli sertifikatlarda maydon nomi har xil: PINFL / OID, INN / UID / OID
    pinfl: fields.PINFL || fields['1.2.860.3.16.1.2'] || '',
    tin: fields.INN || fields.UID || fields['1.2.860.3.16.1.1'] || '',
    validFrom: day(fields.VALIDFROM),
    validTo: day(fields.VALIDTO),
    // PASSREQ=0 bo'lsa parol so'ralmaydi
    passRequired: fields.PASSREQ !== '0',
    // tashkilot kaliti: JSHSHIR yo'q, faqat STIR bor
    // (shaxsiy kalitlarda UID — ish beruvchining STIRi, shuning uchun u hisobga olinmaydi)
    isOrg: !(fields.PINFL || fields['1.2.860.3.16.1.2'])
  }
}

/** Sanani tartiblash uchun: "2025.04.05" -> 20250405 */
function dateKey(value) {
  return Number(String(value || '').replace(/\D/g, '').slice(0, 8)) || 0
}

/**
 * Kalitlar ro'yxati. Muddati tugamaganlari birinchi, keyin amal muddati bo'yicha.
 * @param {string} [session] ISigner sessiya identifikatori (ixtiyoriy)
 */
export async function listKeys(session = '') {
  await connect()
  const data = await execute(FUNC.KEYLIST, { sess: session })
  const list = Array.isArray(data) ? data : []

  const today = Number(new Date().toISOString().slice(0, 10).replace(/-/g, ''))

  return list
    .map((raw, i) => {
      const key = parseKey(raw)
      return { ...key, index: i, expired: dateKey(key.validTo) < today }
    })
    .sort((a, b) => {
      if (a.expired !== b.expired) return a.expired ? 1 : -1
      return dateKey(b.validTo) - dateKey(a.validTo)
    })
}

export async function version() {
  await connect()
  return execute(FUNC.VERSION, {})
}

/** Ma'lumot xeshi (imzolashdan oldin). */
export async function hash(data) {
  await connect()
  return execute(FUNC.HASH, { data })
}

/**
 * Xeshni tanlangan kalit bilan imzolaydi.
 * @param {object} p
 * @param {string} p.token serverdan olingan token (stok)
 * @param {string} p.digest hash() natijasi
 * @param {string} p.serial kalit seriya raqami (snum)
 * @param {string} [p.password] bo'sh qoldirilsa ISigner o'z oynasida so'raydi
 * @param {string} [p.session]
 */
export async function sign({ token, digest, serial, password = '', session = '' }) {
  await connect()
  return execute(FUNC.SIGN, {
    data: digest,
    snum: serial,
    stok: token,
    pass: password,
    sess: session
  })
}
