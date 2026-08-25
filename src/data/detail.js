// Ariza tafsiloti ekrani uchun namuna ma'lumot.
// Barcha matnlar i18n'da (detail.*), bu yerda faqat sana/summa hisob-kitobi
// va status bo'yicha jarayon lentasi yig'iladi.
import { APPLICATIONS } from './applications'

export function parseAmount(value) {
  return Number(String(value).replace(/[^\d]/g, '')) || 0
}

export function formatAmount(n) {
  return String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
}

// 8600 / 5614 — UzCard, 9860 — Humo
export function cardSystem(card) {
  const head = String(card).slice(0, 4)
  if (head === '9860') return 'Humo'
  if (head === '8600' || head === '5614') return 'UzCard'
  return 'Visa'
}

/* ---------- sana bilan ishlash: "DD.MM.YYYY HH:MM" ---------- */
function parseDate(value) {
  const [day, time] = String(value).split(' ')
  const [d, m, y] = day.split('.').map(Number)
  const [h, min] = (time || '00:00').split(':').map(Number)
  return new Date(y, m - 1, d, h, min)
}

function formatDate(date) {
  const p = (n) => String(n).padStart(2, '0')
  return `${p(date.getDate())}.${p(date.getMonth() + 1)}.${date.getFullYear()} ${p(date.getHours())}:${p(date.getMinutes())}`
}

// asosiy sanadan N kun keyin, soati belgilangan
function shift(base, days, hhmm) {
  const date = parseDate(base)
  date.setDate(date.getDate() + days)
  const [h, m] = hhmm.split(':').map(Number)
  date.setHours(h, m, 0, 0)
  return formatDate(date)
}

function dayOnly(value) {
  return String(value).split(' ')[0]
}

const TX_TIMES = ['28.07.2026 17:05', '02.08.2026 21:14', '05.08.2026 08:19']

const BANK_STAFF = { name: 'Aliyev Sardor Baxtiyorovich', phone: '+998 90 123 45 67' }

// Summani rekvizitlar bo'yicha barqaror (har safar bir xil) taqsimlaydi
function splitAmount(total, parts) {
  const step = 10000
  const out = []
  let left = total
  for (let i = 0; i < parts - 1; i += 1) {
    const share = Math.round((total / parts) / step) * step
    out.push(share)
    left -= share
  }
  out.push(left)
  return out
}

function maskCard(card) {
  const groups = String(card).split(' ')
  if (groups.length < 4) return card
  return `${groups[0]} ${groups[1]} 44** ${groups[3]}`
}

// so'rov ID — ariza raqamidan barqaror yasaladi
function requestId(row) {
  const [, tail = ''] = String(row.id).split('/')
  const [year = '2026', num = '0000'] = tail.split('-')
  return `REQ-${year}${String(num).slice(-4)}`
}

/* ---------- bloklangan rekvizitlar ---------- */
// Ariza rekvizitlari + zanjirdagi bloklangan kartalar. Barchasi barqaror hisoblanadi.
const BLOCK_BANKS = ['Uzum Bank', 'Kapitalbank', 'Anorbank', 'Aloqabank', 'Trastbank',
  'Ipoteka bank', 'Hamkorbank', 'Davr bank', 'TBC bank', 'Agrobank']

const BLOCK_CURS = ['UZS', 'UZS', 'UZS', 'UZS', 'UZS', 'RUB', 'UZS', 'USD', 'UZS', 'UZS']

function blockCard(seed, account) {
  const p = (n, len) => String(n).padStart(len, '0')
  const head = account ? '2050' : (seed % 2 ? '8600' : '9860')
  return `${head} ${p((1300 + seed * 53) % 10000, 4)} ${p((4100 + seed * 97) % 10000, 4)} ${p((2600 + seed * 131) % 10000, 4)}`
}

/**
 * Bank bloklagan barcha rekvizitlar.
 * Birinchi qatorlar — arizaning o'z rekvizitlari, qolgani zanjir bo'ylab topilganlari.
 */
export function buildBlocked(row, requisites) {
  const base = requisites.map((r, i) => ({
    card: r.card,
    account: false,
    bank: r.bank,
    cur: 'UZS',
    raw: parseAmount(r.sum),
    tx: r.tx.length,
    own: true,
    n: i + 1
  }))

  // zanjirdan topilgan qo'shimcha rekvizitlar — summasi kamayib boradi
  const extraCount = 8 + (parseAmount(row.amount) % 7)
  const seed0 = parseAmount(row.id) % 97
  let amount = Math.max(900000, Math.round(parseAmount(row.amount) / 12 / 10000) * 10000)
  const extra = []

  for (let i = 0; i < extraCount; i += 1) {
    const seed = seed0 + i * 11 + 5
    const account = i % 5 === 3
    extra.push({
      card: blockCard(seed, account),
      account,
      bank: BLOCK_BANKS[seed % BLOCK_BANKS.length],
      cur: BLOCK_CURS[seed % BLOCK_CURS.length],
      raw: amount,
      tx: (seed % 4) + 1,
      own: false,
      n: base.length + i + 1
    })
    amount = Math.max(120000, Math.round(amount * 0.82 / 10000) * 10000)
  }

  return [...base, ...extra].map((r) => ({ ...r, sum: formatAmount(r.raw) }))
}

/* ---------- muddat ---------- */
const CLOSED = ['blocked', 'done', 'autopayment', 'cancelled']

function deadlineFor(row) {
  if (CLOSED.includes(row.status)) return null
  if (row.overdue) return { days: 2, overdue: true, tone: 'bad' }
  if (row.status === 'error') return { days: 1, overdue: false, tone: 'bad' }
  return { days: 6, overdue: false, tone: 'warn' }
}

/* ---------- bank bilan almashinuv lentasi ---------- */
// Yangi hodisa tepada turadi. body: qanday tafsilot ko'rsatilishi.
function buildExchange(row, requisites) {
  if (row.status === 'new') return []

  const sent = {
    id: 'sent-1',
    kind: 'sent',
    tone: 'info',
    icon: 'send',
    time: shift(row.time, 1, '09:24'),
    code: 'E2202',
    attempt: 1,
    route: true,
    body: 'sent',
    requestId: requestId(row),
    requisites: requisites.map((r) => ({ card: r.card, bank: r.bank }))
  }

  const events = []

  if (row.status === 'error') {
    const note = {
      card: maskCard(row.card),
      date: dayOnly(row.time),
      amount: requisites[0].tx[0].amount
    }
    events.push({
      id: 'ret-2',
      kind: 'returned',
      tone: 'bad',
      icon: 'download',
      time: shift(row.time, 8, '10:39'),
      attempt: 2,
      body: 'returned',
      staff: BANK_STAFF,
      note
    })
    events.push({
      id: 'ret-1',
      kind: 'returned',
      tone: 'bad',
      icon: 'download',
      time: shift(row.time, 2, '10:12'),
      attempt: 1
    })
  }

  if (row.status === 'blocked') {
    events.push({ id: 'blk', kind: 'blocked', tone: 'ok', icon: 'lock', time: shift(row.time, 2, '14:05'), attempt: 1, body: 'blocked' })
  }

  if (row.status === 'autopayment') {
    events.push({ id: 'auto', kind: 'autopayment', tone: 'ok', icon: 'refresh', time: shift(row.time, 1, '16:30'), attempt: 1 })
  }

  if (row.status === 'done') {
    events.push({ id: 'ref', kind: 'refunded', tone: 'ok', icon: 'check', time: shift(row.time, 5, '11:20'), attempt: 1 })
    events.push({ id: 'blk', kind: 'blocked', tone: 'ok', icon: 'lock', time: shift(row.time, 2, '14:05'), attempt: 1, body: 'blocked' })
  }

  if (row.status === 'cancelled') {
    events.push({ id: 'cancel', kind: 'cancelled', tone: 'idle', icon: 'close', time: shift(row.time, 3, '09:50'), attempt: 1 })
  }

  return [...events, sent]
}

/* ---------- qadamlar treki ---------- */
function buildSteps(row, exchange, deadline) {
  const steps = [{ key: 'accepted', icon: 'doc', tone: 'done', time: row.time }]

  if (row.status === 'new') {
    steps.push({ key: 'notSent', icon: 'send', tone: 'idle', metaKey: 'queued' })
    return steps
  }

  const sent = exchange.find((e) => e.kind === 'sent')
  steps.push({ key: 'sentToBank', icon: 'send', tone: 'done', time: sent ? sent.time : row.time })

  const last = exchange[0]
  const map = {
    pending: { key: 'awaiting', icon: 'clock', tone: 'wait', days: deadline ? deadline.days : null },
    error: { key: 'returned', icon: 'back', tone: 'bad', time: last.time },
    blocked: { key: 'blocked', icon: 'lock', tone: 'ok', time: last.time },
    autopayment: { key: 'autopayment', icon: 'refresh', tone: 'ok', time: last.time },
    done: { key: 'refunded', icon: 'check', tone: 'ok', time: last.time },
    cancelled: { key: 'cancelled', icon: 'close', tone: 'idle', time: last.time }
  }

  if (map[row.status]) steps.push(map[row.status])
  return steps
}

/* ---------- ish jarayoni (daraxt) ---------- */
// Har bir hodisa oldingisining ichiga joylashadi — dizayndagidek.
function buildWorkflow(row, exchange) {
  const chain = [{ time: row.time, actor: 'staff', badge: 'accepted' }]

  const ordered = [...exchange].reverse() // eskidan yangiga
  ordered.forEach((e) => {
    if (e.kind === 'sent') {
      chain.push({ time: e.time, actor: 'staff', badge: 'sent', code: e.code })
      return
    }
    chain.push({ time: e.time, actor: 'bank', badge: e.kind === 'returned' ? 'returned' : e.kind })
  })

  if (row.status === 'pending') {
    chain.push({ time: null, actor: 'bank', badge: 'waiting' })
  }

  // ro'yxatni ichma-ich daraxtga aylantirish
  return chain.reduceRight((child, node) => [{ ...node, children: child }], [])
}

/** @param {object|string} source ariza obyekti yoki uning raqami */
export function detailFor(source) {
  const row = (source && typeof source === 'object')
    ? source
    : (APPLICATIONS.find((a) => a.id === source) || APPLICATIONS[0])
  const total = parseAmount(row.amount)

  // katta summa — ikki rekvizitga, kichigi — bittasiga
  const txCount = total >= 10000000 ? 3 : 1
  const shares = splitAmount(total, txCount)

  const first = {
    card: row.card,
    bank: row.bank,
    system: cardSystem(row.card),
    tx: shares.slice(0, txCount === 3 ? 2 : 1).map((amount, i) => ({
      n: i + 1,
      amount: formatAmount(amount),
      time: TX_TIMES[i] || row.time
    }))
  }

  const requisites = [first]

  if (txCount === 3) {
    requisites.push({
      card: maskCard(row.card),
      bank: row.bank,
      system: cardSystem(row.card),
      tx: [{ n: 1, amount: formatAmount(shares[2]), time: TX_TIMES[2] }]
    })
  }

  // har bir rekvizit bo'yicha jami summa
  requisites.forEach((r) => {
    r.sum = formatAmount(r.tx.reduce((acc, x) => acc + parseAmount(x.amount), 0))
  })

  const txTotal = requisites.reduce((sum, r) => sum + r.tx.length, 0)
  const deadline = deadlineFor(row)
  const exchange = buildExchange(row, requisites)

  return {
    row,
    shortName: shortName(row.name),
    phone: '+998 90 123 45 67',
    region: 'tashkentCity',
    source: row.flow === '102' ? '102' : 'duty',
    total: formatAmount(total),
    deadline,
    action: { new: 'send', error: 'fix' }[row.status] || null,
    requisites,
    txTotal,
    blocked: buildBlocked(row, requisites),
    exchange,
    steps: buildSteps(row, exchange, deadline),
    workflow: buildWorkflow(row, exchange),
    audio: { length: '03:29' }
  }
}

// "KARIMOVA DILNOZA SHUHRAT QIZI" -> "Karimova D. Sh."
export function shortName(full) {
  const parts = String(full).trim().split(/\s+/).filter(Boolean)
  if (!parts.length || parts[0] === '—') return full
  const cap = (w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()
  const initial = (w) => {
    const head = w.slice(0, 2).toUpperCase()
    // Sh / Ch kabi qo'shaloq harflar bo'linib ketmasin
    return (head === 'SH' || head === 'CH') ? `${cap(head)}.` : `${w.charAt(0).toUpperCase()}.`
  }
  const initials = parts.slice(1, 3).map(initial)
  return [cap(parts[0]), ...initials].join(' ')
}
