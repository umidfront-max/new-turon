/*
  Tanlangan kalit haqidagi ma'lumotni konsolga chiqaradi — sozlash uchun.

  Ishlab chiqish rejimida o'zi yoqiladi. Boshqa muhitda yoqish uchun konsolda:
    localStorage.setItem('turon-debug', '1')
  O'chirish uchun:
    localStorage.removeItem('turon-debug')
*/

export function debugOn() {
  try {
    if (localStorage.getItem('turon-debug') === '1') return true
    if (localStorage.getItem('turon-debug') === '0') return false
  } catch { /* saqlash yopiq */ }
  return !!import.meta.env?.DEV
}

const MAP = [
  ['F.I.Sh (CN)', 'name'],
  ['Ism', 'firstName'],
  ['Familiya', 'lastName'],
  ['JSHSHIR', 'pinfl'],
  ['STIR / INN', 'tin'],
  ['Tashkilot', 'org'],
  ["Bo'lim", 'unit'],
  ['Lavozim', 'title'],
  ['Viloyat', 'region'],
  ['Tuman', 'district'],
  ['Seriya raqami', 'serial'],
  ['Amal boshlanishi', 'validFrom'],
  ['Amal tugashi', 'validTo'],
  ['Saqlash turi', 'storage'],
  ['Parol talab qiladi', 'passRequired'],
  ['Tashkilot kaliti', 'isOrg'],
  ["Ro'yxatdagi o'rni", 'index']
]

/**
 * Kalit tanlanganda barcha ma'lumotni chiqaradi.
 * @param {object} key parseKey() natijasi
 * @param {File|null} file topilgan .pfx fayli
 * @param {string} b64 base64 ko'rinishi
 */
export function logKey(key, file, b64 = '') {
  if (!debugOn() || !key) return

  console.group(`%cERI kaliti tanlandi: ${key.name}`, 'color:#23568f;font-weight:600')

  const rows = {}
  MAP.forEach(([label, field]) => {
    const value = key[field]
    if (value !== '' && value !== undefined && value !== null) rows[label] = value
  })
  console.table(rows)

  if (file) {
    console.table({
      'Fayl nomi': file.name,
      'Hajmi': `${(file.size / 1024).toFixed(1)} KB (${file.size} bayt)`,
      "O'zgartirilgan": new Date(file.lastModified).toLocaleString(),
      'base64 uzunligi': b64 ? `${b64.length} belgi` : "o'qilmagan"
    })
    if (b64) console.log('%cbase64 (boshi):', 'color:#8b95a6', `${b64.slice(0, 64)}…`)
  } else {
    console.warn("Kalit fayli topilmadi — papkaga ruxsat berilmagan bo'lishi mumkin")
  }

  console.log('%cISigner satri:', 'color:#8b95a6', key.raw)
  console.groupEnd()
}

/**
 * /login-pfx javobini chiqaradi.
 * @param {object} result loginPfxB64() natijasi
 */
export function logLogin(result) {
  if (!debugOn() || !result) return

  console.group('%c/login-pfx javobi', 'color:#1a6e4b;font-weight:600')
  console.table({
    'user_id': result.userId ?? '—',
    'has_face': result.hasFace,
    'F.I.Sh': result.user.name || '—',
    'JSHSHIR': result.user.pinfl || '—',
    'STIR': result.user.tin || '—',
    'Tashkilot': result.user.org || '—',
    'Amal tugashi': result.user.validTo || '—'
  })
  console.log('%cto\'liq sertifikat:', 'color:#8b95a6', result.certificate)
  console.groupEnd()
}
