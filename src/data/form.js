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

/*
  Niqobni maydonga qo'llaydi va DOM ni tekislaydi.

  Vue qiymat o'zgarmasa maydonni qayta chizmaydi. Shu sababli niqob tashlab
  yuboradigan belgi (17-raqam, harf, ortiqcha bo'sh joy) ekranda qolib ketardi:
  yozilgan matn bilan haqiqiy qiymat bir-biriga mos kelmasdi. Bu yerda qiymat
  qo'lda qaytariladi, kursor esa o'zidan oldingi raqamlar soni bo'yicha
  tiklanadi — matn o'rtasini tahrirlaganda oxiriga sakrab ketmaydi.

  @param {HTMLInputElement} el maydon
  @param {(value: string) => string} mask niqob funksiyasi
  @returns {string} tozalangan qiymat
*/
export function applyMask(el, mask) {
  const typed = String(el.value)
  const masked = mask(typed)
  if (typed === masked) return masked

  const caret = el.selectionStart ?? typed.length

  /*
    Kursor o'zidan KEYINGI "mazmunli" belgilar soni bo'yicha tiklanadi.

    Oldingilarini sanash mumkin emas edi: `+998 ` kabi qat'iy prefiks niqob
    natijasiga qo'shiladi, ya'ni belgilar soni yozilganidan ko'p bo'lib qoladi
    va kursor prefiksning o'rtasiga tushib, raqamlar aralashib ketardi.
    Oxiridan sanaganda prefiks qancha uzun bo'lsa ham ahamiyati yo'q.

    Niqob raqamli bo'lsa faqat raqamlar sanaladi — tashlab yuborilgan harf
    kursorni surib yubormaydi.
  */
  const meaningful = /[A-Za-z]/.test(masked) ? /[0-9A-Za-z]/ : /\d/
  const tail = [...typed.slice(caret)].filter((ch) => meaningful.test(ch)).length

  el.value = masked

  let next = masked.length
  if (tail > 0) {
    let seen = 0
    for (let i = masked.length - 1; i >= 0; i -= 1) {
      if (!meaningful.test(masked[i])) continue
      seen += 1
      if (seen === tail) { next = i; break }
    }
  }

  try { el.setSelectionRange(next, next) } catch { /* ba'zi turlarda mumkin emas */ }
  return masked
}

export function digitsOnly(value) {
  return String(value).replace(/\D/g, '')
}


// "KK.OO.YYYY SS:DD" ko'rinishidagi sana
export function isValidDateTime(value) {
  const m = /^(\d{2})\.(\d{2})\.(\d{4}) (\d{2}):(\d{2})$/.exec(String(value).trim())
  if (!m) return false
  const [, d, mo, y, h, mi] = m.map(Number)
  return d >= 1 && d <= 31 && mo >= 1 && mo <= 12 && y >= 2000 && h < 24 && mi < 60
}

/*
  "14.03.2026 01:13" -> "2026-03-14T01:13:00+05:00".

  Server ISO kutadi. Vaqt mintaqasi ochiq yoziladi: naive sana yuborilsa
  server uni o'z sozlamasi bo'yicha talqin qiladi va soat siljib ketishi
  mumkin. Ariza O'zbekiston bo'yicha to'ldiriladi.
  @returns {string} noto'g'ri qiymatda bo'sh satr
*/
export function toIsoDateTime(value) {
  if (!isValidDateTime(value)) return ''
  const [date, time] = String(value).trim().split(' ')
  const [d, mo, y] = date.split('.')
  return `${y}-${mo}-${d}T${time}:00+05:00`
}

/**
 * toIsoDateTime() ning teskarisi: "2026-03-14T01:13:00+05:00" -> "14.03.2026 01:13".
 * Qoralamadagi saqlangan vaqtni formaga qaytarish uchun.
 */
export function fromIsoDateTime(value) {
  const m = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/.exec(String(value || ''))
  return m ? `${m[3]}.${m[2]}.${m[1]} ${m[4]}:${m[5]}` : ''
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
