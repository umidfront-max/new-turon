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

  /*
    Serverdan ba'zan faqat sana keladi ("2026-02-01"). `new Date` uni UTC
    yarim tuni deb o'qiydi, natijada ekranda "05:00" degan uydirma vaqt
    chiqardi. Vaqt qismi bo'lmasa — faqat sana ko'rsatiladi.
  */
  const dateOnly = /^\d{4}-\d{2}-\d{2}$/.test(String(iso).trim())
  const d = new Date(dateOnly ? `${iso}T00:00:00` : iso)
  if (Number.isNaN(d.getTime())) return String(iso)

  const p = (n) => String(n).padStart(2, '0')
  const day = `${p(d.getDate())}.${p(d.getMonth() + 1)}.${d.getFullYear()}`
  return dateOnly ? day : `${day} ${p(d.getHours())}:${p(d.getMinutes())}`
}

/*
  `requisite` — Swagger'da tuzilmasi e'lon qilinmagan, lekin haqiqiy javobda:
    { number, type, bank, bank_name, is_blocked, count }
  Boshqa nomlar ham tekshiriladi — server o'zgarsa ekran buzilmasin uchun.
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
    // ariza bo'yicha jami rekvizit soni
    requisiteCount: typeof req.count === 'number' ? req.count : null,
    requisiteType: req.type || null,
    requisiteBlocked: !!req.is_blocked,
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

/** Navbat chipi: server kalitini ekrandagi kalitga o'giradi. */
function queueTab(t) {
  return {
    // 'auto_payment' -> 'autopayment', 'canceled' -> 'cancelled'
    key: t.key === 'all' ? 'all' : statusToUi(t.key),
    apiKey: t.key,
    label: t.label || '',
    count: t.count ?? 0
  }
}

/** Sahifa javobi -> { rows, total } */
export function registryPage(res, page = 1, perPage = 10) {
  const results = res?.results || []
  const offset = (page - 1) * perPage
  return {
    rows: results.map((r, i) => registryRow(r, offset + i)),
    total: res?.count ?? results.length,
    /*
      Sxemada e'lon qilinmagan, lekin haqiqiy javobda bor:
        tabs         [{ key, label, count }] — status bo'yicha (ekrandagi chiplar)
        process_tabs [{ key, label, count }] — jarayon bo'yicha (all, overdue, …)
        by_status    { new, pending, auto_payment, … }
        facets       { <guruh>: [{ value, label, count }] }
    */
    byStatus: res?.by_status || null,
    tabs: (res?.tabs || []).map(queueTab),
    processTabs: (res?.process_tabs || []).map(queueTab),
    facets: res?.facets || null
  }
}

/* ---------- bildirishnomalar ---------- */

// server turi -> ekrandagi rang va ikonka
const NOTIFY_TONE = {
  sanction_created: { tone: 'ok', icon: 'shield' },
  crime_created: { tone: 'info', icon: 'doc' },
  crime_error: { tone: 'bad', icon: 'warn' },
  user_not_logged: { tone: 'warn', icon: 'user' },
  duty_handed_over: { tone: 'info', icon: 'swap' },
  duty_accepted: { tone: 'ok', icon: 'check' },
  duty_returned: { tone: 'warn', icon: 'back' }
}

/** "2026-08-26T09:12:00+05:00" -> { unit, n } ("8 daqiqa oldin" uchun) */
export function agoOf(iso) {
  const at = new Date(iso).getTime()
  if (Number.isNaN(at)) return { unit: 'min', n: 0 }

  const min = Math.max(0, Math.round((Date.now() - at) / 60000))
  if (min < 60) return { unit: 'min', n: min }
  const hours = Math.round(min / 60)
  if (hours < 24) return { unit: 'hour', n: hours }
  return { unit: 'day', n: Math.round(hours / 24) }
}

/**
 * NotificationOutput -> ekran yozuvi.
 * Sarlavha va matn serverdan tayyor keladi, shuning uchun i18n kaliti kerak emas.
 */
export function notification(row) {
  const tone = NOTIFY_TONE[row.type] || { tone: 'info', icon: 'bell' }
  const payload = row.payload || {}

  return {
    id: row.id,
    // tayyor matn — komponentlar buni i18n kalitidan ustun ko'radi
    title: row.title || '',
    text: row.message || '',
    type: row.type || null,
    tone: tone.tone,
    icon: tone.icon,
    read: !!row.is_read,
    ago: agoOf(row.created_at),
    // arizaga o'tish uchun (payload tuzilmasi sxemada e'lon qilinmagan)
    appId: payload.complaint_number || payload.number || payload.complaint_id || null
  }
}

/* ---------- qoralamalar ---------- */

/** ComplaintDraftRow -> qoralamalar jadvali qatori. */
export function draftRow(row) {
  const req = row.requisite || {}
  const total = row.total_steps || 0
  const done = row.completed_steps || 0

  return {
    apiId: row.id,
    id: row.number || '—',
    material: row.material_number || null,
    name: row.applicant_name || '—',
    method: row.method || null,
    methodLabel: row.method_name || '',
    card: textOf(req, CARD_KEYS) || '—',
    bank: textOf(req, BANK_KEYS) || null,
    tx: typeof req.count === 'number' ? req.count : null,
    // to'ldirilganlik foizi
    done: total ? Math.round((done / total) * 100) : 0,
    // qaysi qadam qolgani — steps ichidagi birinchi tugallanmagani
    missing: (row.steps || []).find((s) => !s.done)?.key || null,
    time: dateTime(row.updated_at || row.created_at),
    ago: agoOf(row.updated_at || row.created_at)
  }
}

/* ---------- raqam tekshiruvi ---------- */

/**
 * EarlierComplaint -> karta tarixi qatori.
 * CardHistory paneli va formadagi takroriylik ogohlantirishi shu ko'rinishni kutadi.
 */
export function earlierComplaint(row) {
  return {
    apiId: row.id,
    id: row.number || String(row.id),
    material: row.material_number || null,
    name: row.citizen_name || '',
    status: statusToUi(row.status),
    time: dateTime(row.date || row.created_at),
    amount: money(row.matched_amount),
    // shu raqamga tegishli o'tkazmalar soni
    tx: Array.isArray(row.transactions) ? row.transactions.length : null
  }
}

/** NumberCheckOutput -> «Tekshirish» paneli. */
export function numberCheck(res) {
  return {
    number: res?.number || '',
    numberType: res?.number_type || null,
    numberTypeLabel: res?.number_type_display || '',
    known: !!res?.is_known,
    bank: res?.bank ?? null,
    bankName: res?.bank_name || '',
    blocked: !!res?.is_blocked,
    frozen: res?.frozen_amount ? money(res.frozen_amount) : null,
    total: money(res?.total_amount),
    count: res?.complaint_count ?? 0,
    checkedAt: dateTime(res?.checked_at),
    earlier: (res?.complaints || []).map(earlierComplaint)
  }
}

/** CardIdentifyOutput -> rekvizit maydonidagi bank yozuvi. */
export function cardIdentity(res) {
  if (!res?.matched) return null
  return {
    prefix: res.prefix || '',
    system: res.processing_display || res.processing || '',
    bank: res.bank ?? null,
    /*
      Ekranda to'liq nom ko'rsatiladi ("Kapital Bank"): qisqartma ("KB")
      qaysi bank ekanini aytmaydi. Qisqasi tor joylar uchun qoladi.
    */
    bankName: res.bank_name || res.bank_short_name || '',
    bankShort: res.bank_short_name || res.bank_name || '',
    isBank: res.is_bank !== false,
    numberType: res.number_type || 'card'
  }
}

/* ---------- ariza tafsiloti ---------- */

// serverdagi qadam kaliti -> ekrandagi ikonka va rang
const STEP_ICON = {
  received: { icon: 'doc', tone: 'done' },
  sent_to_bank: { icon: 'send', tone: 'done' },
  awaiting: { icon: 'clock', tone: 'wait' },
  blocked: { icon: 'lock', tone: 'ok' },
  returned: { icon: 'back', tone: 'bad' },
  autopayment: { icon: 'refresh', tone: 'ok' },
  refunded: { icon: 'check', tone: 'ok' },
  cancelled: { icon: 'close', tone: 'idle' }
}

/** "KARIMOV ALISHER BAXTIYOROVICH" -> "Karimov A. B." */
function shortNameOf(full) {
  const parts = String(full || '').trim().split(/\s+/).filter(Boolean)
  if (!parts.length) return ''
  const cap = (w) => w[0].toUpperCase() + w.slice(1).toLowerCase()
  return [cap(parts[0]), ...parts.slice(1).map((w) => `${w[0].toUpperCase()}.`)].join(' ')
}

/** Ma'lumotnoma obyektidan hozirgi tildagi nom. */
function refName(obj, lang) {
  if (!obj) return ''
  const field = { uz: 'name_uz', uzk: 'name_uz_cyrl', ru: 'name_ru' }[lang] || 'name_uz'
  return obj[field] || obj.name || ''
}

/**
 * ComplaintOutput -> tafsilot ekrani kutadigan ko'rinish.
 * detailFor() bilan bir xil maydonlar: row, requisites, steps, total ...
 * @param {object} c serverdagi ariza
 * @param {string} lang hozirgi til kodi (uz | uzk | ru)
 */
export function complaintDetail(c, lang = 'uz') {
  const citizen = c.citizen || {}
  const requisites = (c.requisites || []).map((r) => ({
    card: r.number || '',
    bank: r.bank_name || '',
    // ro'yxatda faqat `number_type` keladi, tayyor yorliq esa tranzaksiya
    // ichidagi kartada — shuning uchun tur kaliti ham saqlanadi
    system: r.number_type_display || '',
    systemKey: r.number_type || '',
    blocked: !!r.is_blocked,
    frozen: r.frozen_amount ? money(r.frozen_amount) : null,
    sum: money(r.total_amount),
    tx: (r.transactions || []).map((t, i) => ({
      n: i + 1,
      amount: money(t.amount),
      time: dateTime(t.withdrawn_at)
    }))
  }))

  const row = {
    apiId: c.id,
    id: c.number || String(c.id),
    material: c.material_number || null,
    flow: c.intake_type === 'hotline_102' ? '102' : 'duty',
    name: citizen.full_name || '',
    method: c.method?.id ?? null,
    methodLabel: refName(c.method, lang),
    card: requisites[0]?.card || '',
    bank: requisites[0]?.bank || '',
    amount: money(c.total_amount),
    cur: 'UZS',
    region: c.region?.id ?? null,
    regionLabel: refName(c.region, lang),
    status: statusToUi(c.status),
    // ariza sanasi va vaqti alohida maydonlarda keladi
    time: c.date ? dateTime(`${c.date}T${c.time || '00:00:00'}`) : '',
    overdue: false
  }

  const steps = (c.timeline || []).map((s) => {
    const look = STEP_ICON[s.key] || { icon: 'doc', tone: s.is_done ? 'done' : 'idle' }
    return {
      key: s.key,
      label: s.label || '',
      icon: look.icon,
      tone: s.is_done ? look.tone : 'idle',
      time: s.at ? dateTime(s.at) : null
    }
  })

  return {
    row,
    shortName: shortNameOf(citizen.full_name),
    phone: citizen.phone_number || '',
    phone2: citizen.additional_phone_number || '',
    address: citizen.address || c.address || '',
    pinfl: citizen.pinfl || '',
    // manba va usul yorlig'i tayyor matn bo'lib keladi
    sourceLabel: refName(c.source, lang),
    regionLabel: refName(c.region, lang),
    description: c.description || '',
    // serverda tayyor yorliq bilan keladigan maydonlar
    basis: c.basis || '',
    basisLabel: c.basis_display || '',
    crimeType: c.crime_type || '',
    crimeTypeLabel: c.crime_type_display || '',
    intakeLabel: c.intake_type_display || '',
    externalId: c.external_id || '',
    statusLabel: c.status_display || '',
    total: money(c.total_amount),
    requisites,
    txTotal: requisites.reduce((n, r) => n + r.tx.length, 0),
    steps,
    executors: (c.executors || []).map((e) => ({
      name: e.employee_name || '',
      position: e.employee_position || '',
      active: !!e.is_active,
      at: dateTime(e.assigned_at)
    })),
    isDuplicate: !!c.is_duplicate,
    duplicateOf: c.duplicate_of ?? null,
    action: { new: 'send', error: 'fix' }[statusToUi(c.status)] || null,

    // Quyidagilar shablon kutadigan maydonlar. Serverda hozircha mos
    // ma'lumot yo'q, shuning uchun tayyor yorliqlar beriladi.
    source: null,          // manba i18n kaliti o'rniga sourceLabel ishlatiladi
    region: null,          // regionLabel ishlatiladi
    deadline: null,        // muddat sanksiyadan keladi (hali bo'sh)
    audio: null,           // ovozli fabula serverda yo'q — pleyer ko'rsatilmaydi
    exchange: [],
    blocked: [],
    workflow: []
  }
}

/** Bank amaliyotlari tabi. */
export function bankOperations(res) {
  const blocked = res?.blocked_requisites || {}
  return {
    exchange: (res?.exchange || []).map((e, i) => ({
      id: e.id ?? `e${i}`,
      kind: e.kind || e.method || 'sent',
      label: e.label || '',
      tone: e.is_error ? 'bad' : (e.tone || 'info'),
      icon: e.is_error ? 'warn' : 'send',
      time: dateTime(e.at || e.created_at),
      code: e.code || null,
      attempt: e.attempt ?? 1,
      isError: !!e.is_error
    })),
    errors: (res?.errors || []).map((x) => ({
      field: x.field || '',
      message: x.message || x.text || '',
      at: dateTime(x.at || x.created_at)
    })),
    blocked: (blocked.items || []).map((r, i) => ({
      n: i + 1,
      card: r.number || r.masked_number || '',
      account: (r.number_type || r.type) === 'account',
      bank: r.bank_name || '',
      cur: r.currency || 'UZS',
      raw: Number(String(r.frozen_amount ?? r.amount ?? 0).replace(/[^\d.]/g, '')) || 0,
      sum: money(r.frozen_amount ?? r.amount)
    })),
    blockedTotal: money(blocked.total)
  }
}

/** Sanksiyalar tabi. */
export function sanctionList(res) {
  const rows = Array.isArray(res) ? res : res?.results || []
  return rows.map((s) => ({
    id: s.id,
    number: s.number || '',
    label: s.status_display || s.type_display || '',
    file: s.file_url || null,
    sentAt: dateTime(s.sent_at),
    fileSentAt: dateTime(s.file_sent_at),
    deadline: s.deadline || null,
    at: dateTime(s.created_at)
  }))
}

/** Tranzaksiyalar zanjiri tabi. */
export function transactionChain(res) {
  const stats = res?.stats || {}

  const node = (n, level) => ({
    id: `n${level}-${n.id ?? Math.random().toString(36).slice(2)}`,
    level,
    card: n.card?.masked_number || n.number || '',
    system: n.card?.number_type_display || '',
    bank: n.card?.bank_name || n.bank_name || '',
    amount: money(n.amount),
    raw: Number(String(n.amount ?? 0).replace(/[^\d.]/g, '')) || 0,
    op: n.operation || n.reference || '',
    date: dateTime(n.withdrawn_at || n.at),
    children: (n.children || []).map((c) => node(c, level + 1))
  })

  return {
    stats: {
      count: stats.transaction_count ?? 0,
      sum: money(stats.total_amount),
      cards: stats.card_count ?? 0
    },
    statement: res?.bank_statement || null,
    level1: (res?.chain || []).map((n) => node(n, 1))
  }
}

/** Ish jarayoni tabi — hodisalar tekis ro'yxatda, yangisi tepada. */
export function workflowEvents(res) {
  const events = res?.events || []

  return events
    // server yangisini tepada beradi, ekranda esa voqealar tartibi bo'yicha
    .slice()
    .sort((a, b) => String(a.at).localeCompare(String(b.at)))
    .map((e) => ({
      kind: e.kind,
      label: e.label || '',
      // xodim nomi bo'lsa — u qilgan, bo'lmasa tizim/bank tomonidan
      actor: e.employee_name ? 'staff' : 'bank',
      badge: e.to_status || e.kind,
      from: e.from_status ? statusToUi(e.from_status) : null,
      to: e.to_status ? statusToUi(e.to_status) : null,
      time: dateTime(e.at),
      person: e.employee_name || '',
      position: e.employee_position || '',
      comment: e.comment || '',
      depth: 0,
      children: []
    }))
}

/**
 * Status tarixi — /complaints/<id>/history/.
 * Server ro'yxatni o'sish tartibida beradi, ekranda yangisi tepada turadi.
 */
export function statusHistory(res) {
  const rows = Array.isArray(res) ? res : res?.results || []

  return rows
    .map((h) => ({
      id: h.id,
      from: h.from_status ? statusToUi(h.from_status) : null,
      to: statusToUi(h.to_status),
      time: dateTime(h.changed_at || h.created_at),
      at: h.changed_at || h.created_at || '',
      person: h.employee_name || '',
      comment: h.comment || ''
    }))
    .sort((a, b) => String(b.at).localeCompare(String(a.at)))
}

/* ---------- navbatchilik ---------- */

// server holati -> ekrandagi bosqich (useUi.dutyPhase)
const DUTY_PHASE = {
  active: 'on',
  submitted: 'review',
  returned: 'returned',
  accepted: 'closed'
}

export const dutyPhaseOf = (status) => DUTY_PHASE[status] || 'on'

/** DutyShift -> navbatchilik hisoboti oynasi kutadigan ko'rinish. */
export function dutyShift(s) {
  if (!s) return null

  return {
    id: s.id,
    code: s.code || '',
    phase: dutyPhaseOf(s.status),
    statusLabel: s.status_display || '',
    open: !!s.is_open,

    officer: s.employee_name || '',
    position: s.employee_position || '',
    region: s.region_name || '',

    startedAt: dateTime(s.started_at),
    endedAt: dateTime(s.ended_at),
    submittedAt: dateTime(s.submitted_at),
    acceptedAt: dateTime(s.accepted_at),
    returnedAt: dateTime(s.returned_at),

    note: s.note || '',
    successorId: s.successor_employee_id ?? null,
    successor: s.successor_name || '',
    successorPosition: s.successor_position || '',

    returnReason: s.return_reason || null,
    returnReasonLabel: s.return_reason_display || '',
    returnComment: s.return_comment || '',

    // topshirilgan arizalar soni
    handedOver: s.handed_over_count ?? 0,
    // smena davomiyligi (soat)
    hours: hoursBetween(s.started_at, s.ended_at)
  }
}

/** Ikki sana orasidagi soat — smena davomiyligi uchun. */
function hoursBetween(from, to) {
  const a = new Date(from).getTime()
  const b = to ? new Date(to).getTime() : Date.now()
  if (Number.isNaN(a) || Number.isNaN(b)) return null
  return Math.max(0, Math.round((b - a) / 3600000))
}

/** Topshirish uchun nomzodlar. */
export function dutyCandidates(res) {
  return {
    available: !!res?.available,
    count: res?.count ?? 0,
    items: (res?.candidates || []).map((c) => ({
      id: c.employee_id ?? c.id,
      name: c.employee_name || c.full_name || '',
      position: c.employee_position || c.position || '',
      region: c.region_name || ''
    }))
  }
}
