// Yangi murojaat formasi uchun tanlov ro'yxatlari va tekshiruvlar.
// Matnlar i18n'dan: methods.* / sources.* / regions.*
export const METHOD_OPTIONS = [
  'vishing', 'phishing', 'fakeShop', 'fakeInvest',
  'simSwap', 'apk', 'fakeSupport', 'other'
]

export const SOURCE_OPTIONS = [
  '102', 'duty', 'telegram', 'instagram', 'facebook',
  'whatsapp', 'call', 'sms', 'web', 'bankApp', 'other'
]

export const REGION_OPTIONS = [
  'tashkentCity', 'tashkentRegion', 'andijan', 'bukhara', 'fergana', 'jizzakh',
  'namangan', 'navoi', 'kashkadarya', 'samarkand', 'syrdarya', 'surkhandarya',
  'khorezm', 'karakalpakstan'
]

/* ---------- maskalar ---------- */
export function maskCard(value) {
  return String(value).replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim()
}

export function maskAccount(value) {
  return String(value).replace(/\D/g, '').slice(0, 20).replace(/(.{4})/g, '$1 ').trim()
}

export function maskAmount(value) {
  const digits = String(value).replace(/\D/g, '').slice(0, 12)
  return digits ? digits.replace(/\B(?=(\d{3})+(?!\d))/g, ' ') : ''
}

export function maskPhone(value) {
  const d = String(value).replace(/\D/g, '').replace(/^998/, '').slice(0, 9)
  const parts = [d.slice(0, 2), d.slice(2, 5), d.slice(5, 7), d.slice(7, 9)].filter(Boolean)
  return d ? `+998 ${parts.join(' ')}` : ''
}

export function digitsOnly(value) {
  return String(value).replace(/\D/g, '')
}

// 8600 / 5614 / 6262 — UzCard, 9860 — Humo, 4 — Visa, 5 — Mastercard
export function cardSystem(card) {
  const d = digitsOnly(card)
  if (d.length < 4) return null
  const head = d.slice(0, 4)
  if (head === '9860') return 'Humo'
  if (['8600', '5614', '6262'].includes(head)) return 'UzCard'
  if (d[0] === '4') return 'Visa'
  if (d[0] === '5') return 'Mastercard'
  return null
}

// "KK.OO.YYYY SS:DD" ko'rinishidagi sana
export function isValidDateTime(value) {
  const m = /^(\d{2})\.(\d{2})\.(\d{4}) (\d{2}):(\d{2})$/.exec(String(value).trim())
  if (!m) return false
  const [, d, mo, y, h, mi] = m.map(Number)
  return d >= 1 && d <= 31 && mo >= 1 && mo <= 12 && y >= 2000 && h < 24 && mi < 60
}

export function maskDateTime(value) {
  const d = digitsOnly(value).slice(0, 12)
  let out = d.slice(0, 2)
  if (d.length > 2) out += `.${d.slice(2, 4)}`
  if (d.length > 4) out += `.${d.slice(4, 8)}`
  if (d.length > 8) out += ` ${d.slice(8, 10)}`
  if (d.length > 10) out += `:${d.slice(10, 12)}`
  return out
}
