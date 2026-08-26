/*
  Serverdan kelgan yozuvlarni ekran kutadigan ko'rinishga keltiradi.
  Maqsad — jadval, kartochka va tafsilot komponentlari o'zgarmasligi.
*/

// server statusi -> loyihadagi kalit (StatusPill va navbatlar shu nom bilan ishlaydi)
const STATUS_MAP = {
  new: 'new',
  pending: 'pending',
  auto_payment: 'autopayment',
  error: 'error',
  blocked: 'blocked',
  done: 'done',
  canceled: 'cancelled',
  duplicate: 'duplicate'
}

// teskari yo'nalish — filtrni serverga yuborishda
const STATUS_TO_API = Object.fromEntries(
  Object.entries(STATUS_MAP).map(([api, ui]) => [ui, api])
)

export const statusToUi = (s) => STATUS_MAP[s] || 'new'
export const statusToApi = (s) => STATUS_TO_API[s] || s

/** "12500000" yoki "12500000.00" -> "12 500 000" */
export function money(value) {
  const digits = String(value ?? '').split('.')[0].replace(/\D/g, '')
  if (!digits) return '0'
  return digits.replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
}

/** ISO sana -> "04.08.2026 09:12" */
export function dateTime(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return String(iso)
  const p = (n) => String(n).padStart(2, '0')
  return `${p(d.getDate())}.${p(d.getMonth() + 1)}.${d.getFullYear()} ${p(d.getHours())}:${p(d.getMinutes())}`
}

/*
  DIQQAT — `requisite` ichidagi maydon nomlari Swagger'da e'lon qilinmagan
  (`{type: object, additionalProperties: {}}`). Izohda faqat shunday deyilgan:
  «the first card or account on the complaint, masked, with its bank — plus
  `count`». Shuning uchun bir nechta ehtimoliy nom tekshiriladi.
  Backenddan namuna javob kelgach bittasini qoldirish kerak.
*/
const CARD_KEYS = ['number', 'masked', 'masked_number', 'card', 'card_number', 'pan']
const BANK_KEYS = ['bank_name', 'bank_title', 'bank_label']

// faqat matnli qiymat olinadi: `bank` butun son (ID) bo'lishi mumkin
function textOf(obj, keys) {
  for (const k of keys) {
    const v = obj?.[k]
    if (typeof v === 'string' && v.trim()) return v.trim()
  }
  return ''
}

/**
 * Reyestr qatori -> jadval qatori.
 * @param {object} row serverdagi RegistryRow
 * @param {number} index sahifadagi tartib (№ ustuni uchun)
 */
export function registryRow(row, index = 0) {
  const req = row.requisite || {}

  return {
    // asl yozuv — tafsilotga o'tishda kerak bo'ladi
    apiId: row.id,
    raw: row,

    n: index + 1,
    id: row.number || String(row.id),
    material: row.material_number || null,
    // oqim: 102 yoki navbatchi qo'lda kiritgan
    flow: row.intake_type === 'hotline_102' ? '102' : 'duty',
    name: row.citizen_name || '',
    // usul serverdan tayyor matn bo'lib keladi; kalit yo'q, shuning uchun label
    method: row.method || null,
    methodLabel: row.method_name || '',
    card: textOf(req, CARD_KEYS),
    bank: textOf(req, BANK_KEYS),
    // ariza bo'yicha jami rekvizit soni (izohda `count` deb aytilgan)
    requisiteCount: typeof req.count === 'number' ? req.count : null,
    amount: money(row.total_amount),
    cur: 'UZS',
    region: row.region || null,
    regionLabel: row.region_name || '',
    status: statusToUi(row.status),
    time: dateTime(row.occurred_at),
    overdue: !!row.is_overdue,
    // muddat: server soniyada beradi, ekranda kunlarda ko'rsatiladi
    remainingSeconds: row.remaining_seconds ?? null,
    deadline: row.deadline || null
  }
}

/** Sahifa javobi -> { rows, total } */
export function registryPage(res, page = 1, perPage = 10) {
  const results = res?.results || []
  const offset = (page - 1) * perPage
  return {
    rows: results.map((r, i) => registryRow(r, offset + i)),
    total: res?.count ?? results.length,
    // Bu uchtasi Swagger sxemasida e'lon qilinmagan — faqat endpoint izohida
    // tasvirlangan. Nomi boshqacha bo'lsa shu yerda tuzatiladi.
    byStatus: res?.by_status || null,
    tabs: res?.tabs || null,
    facets: res?.facets || null
  }
}
