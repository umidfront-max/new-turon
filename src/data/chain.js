// Tranzaksiyalar zanjiri — yangi dizayndagi «Tranzaksiyalar» tabi uchun.
// Ariza rekvizitlaridan daraja-daraja pul harakati yig'iladi (tasodifiy son yo'q).
import { parseAmount, formatAmount, cardSystem } from './detail'

const BANKS = ['Uzum Bank', 'Kapitalbank', 'Anorbank', 'TBC Bank', 'Ipoteka bank', 'Hamkorbank', 'SQB']

const OPS = ['P2P', 'Terminal', 'Onlayn', 'Bank ilovasi']

// karta egasi ma'lumotlari — barqaror (tasodifiy son ishlatilmaydi)
const NAMES = [
  'RASULOV BEKZOD ILHOMOVICH',
  'YUSUPOVA MADINA ANVAROVNA',
  'TOSHMATOV JAMSHID BAXTIYOROVICH',
  "SAIDOVA GULNORA O'TKIROVNA",
  'NORMATOV SANJAR RUSTAMOVICH',
  'ERGASHEV DILSHOD FARHODOVICH',
  'QODIROVA ZILOLA AKMALOVNA'
]

const APPS_MOBILE = ['Uzum Bank', 'Kapital 24', 'Anor', 'TBC UZ', 'Ipoteka Mobile', 'Hamkor Mobile', 'SQB Mobile']

const BIRTH_PLACES = [
  'Toshkent shahri',
  'Samarqand viloyati',
  'Farg\'ona viloyati',
  'Andijon viloyati',
  'Buxoro viloyati',
  'Namangan viloyati',
  'Qashqadaryo viloyati'
]

const OS_LIST = ['Android 14', 'iOS 17.4', 'Android 13', 'HarmonyOS 4']

function pad(n, len) {
  return String(n).padStart(len, '0')
}

// "9860 1201 4471 4922" ko'rinishidagi barqaror raqam
function makeCard(seed) {
  const head = seed % 3 === 0 ? '8600' : '9860'
  return `${head} ${pad((1200 + seed * 37) % 10000, 4)} ${pad((4400 + seed * 71) % 10000, 4)} ${pad((3100 + seed * 113) % 10000, 4)}`
}

function shiftDate(base, days, hhmm) {
  const [day, time] = String(base).split(' ')
  const [d, m, y] = day.split('.').map(Number)
  const date = new Date(y, m - 1, d, 0, 0)
  date.setDate(date.getDate() + days)
  const [h, min] = (hhmm || time || '10:00').split(':').map(Number)
  date.setHours(h, min)
  const p = (n) => pad(n, 2)
  return `${p(date.getDate())}.${p(date.getMonth() + 1)}.${date.getFullYear()} ${p(date.getHours())}:${p(date.getMinutes())}`
}

function node(seed, amount, time, level, children = []) {
  const card = makeCard(seed)
  const d = pad((seed * 3) % 28 + 1, 2)
  const m = pad((seed * 5) % 12 + 1, 2)
  const y = 1972 + (seed * 7) % 30

  return {
    id: `n${level}-${seed}`,
    txId: `TX-${pad(2026000 + seed * 137 % 900000, 7)}`,
    level,
    card,
    system: cardSystem(card),
    amount: formatAmount(amount),
    raw: amount,
    bank: BANKS[seed % BANKS.length],
    op: OPS[seed % OPS.length],
    date: time,
    // karta egasi (bank javobidan keladigan ma'lumot o'rnida)
    name: NAMES[seed % NAMES.length],
    pinfl: `${(seed % 5) + 3} ${pad((seed * 311) % 10000, 4)} ${pad((seed * 137) % 10000, 4)} ${pad((seed * 71) % 100000, 5)}`,
    passport: `A${String.fromCharCode(65 + seed % 6)} ${pad((seed * 913) % 10000000, 7)}`,
    birth: `${d}.${m}.${y}`,
    birthPlace: BIRTH_PLACES[seed % BIRTH_PLACES.length],
    issued: `${pad((seed * 11) % 28 + 1, 2)}.${pad((seed * 3) % 12 + 1, 2)}.${2015 + seed % 8}`,
    expires: `${pad((seed * 11) % 28 + 1, 2)}.${pad((seed * 3) % 12 + 1, 2)}.${2025 + seed % 8}`,
    age: 2026 - y,
    male: seed % 2 === 0,
    addr: `${BIRTH_PLACES[seed % BIRTH_PLACES.length]}, ${(seed % 20) + 1}-kvartal, ${(seed % 60) + 1}-uy`,
    phone: `+998 ${90 + seed % 10} ${pad((seed * 17) % 1000, 3)} ${pad((seed * 29) % 100, 2)} ${pad((seed * 41) % 100, 2)}`,
    merchant: `M${pad((seed * 4409) % 10000000, 7)}`,
    dev: `DEV-${pad((seed * 733) % 100000, 5)}`,
    ip: `91.${seed % 200 + 10}.${(seed * 7) % 250 + 1}.${(seed * 13) % 250 + 1}`,
    os: OS_LIST[seed % OS_LIST.length],
    app: APPS_MOBILE[seed % APPS_MOBILE.length],
    reqId: `REQ-${pad((seed * 8081) % 100000000, 8)}`,
    key: `K${pad((seed * 613) % 100000, 5)}`,
    children
  }
}

/**
 * Ariza bo'yicha zanjir: jabrlanuvchi kartasi -> 1-daraja -> 2-daraja -> 3-daraja
 * @param {object} detail detailFor() natijasi
 */
export function buildChain(detail) {
  const { row, requisites } = detail
  const level1 = requisites.map((r, i) => {
    const total = parseAmount(r.sum)
    const seed = i + 3

    // 2-daraja: summa 60/40 ga bo'linadi
    const a2 = Math.round(total * 0.6 / 10000) * 10000
    const b2 = total - a2

    const kid = (k, amount) => {
      const s = seed * 7 + k
      // 3-daraja: bitta yakuniy karta
      const leaf = node(s * 5 + 1, Math.round(amount * 0.75 / 10000) * 10000, shiftDate(row.time, 3 + k, '18:12'), 3)
      return node(s, amount, shiftDate(row.time, 2 + k, '14:35'), 2, [leaf])
    }

    return node(seed, total, shiftDate(row.time, 1, '09:24'), 1, [kid(1, a2), kid(2, b2)])
  })

  const victimTotal = level1.reduce((s, n) => s + n.raw, 0)

  return {
    victim: {
      card: row.card,
      bank: row.bank,
      amount: formatAmount(victimTotal),
      date: row.time
    },
    level1
  }
}

/** Zanjir bo'yicha umumiy ko'rsatkichlar */
export function chainStats(chain) {
  let count = 0
  let sum = 0
  const cards = new Set()

  const walk = (nodes) => nodes.forEach((n) => {
    count += 1
    sum += n.raw
    cards.add(n.card)
    if (n.children.length) walk(n.children)
  })

  walk(chain.level1)
  cards.add(chain.victim.card)

  return { count, sum: formatAmount(sum), cards: cards.size }
}

/** Qidiruv: karta raqami yoki bank nomi bo'yicha */
export function chainMatches(node, query) {
  const q = query.trim().toLowerCase()
  if (!q) return true
  if (`${node.card} ${node.bank} ${node.op}`.toLowerCase().includes(q)) return true
  return node.children.some((c) => chainMatches(c, q))
}
