// Tranzaksiyalar zanjiri — yangi dizayndagi «Tranzaksiyalar» tabi uchun.
// Ariza rekvizitlaridan daraja-daraja pul harakati yig'iladi (tasodifiy son yo'q).
import { parseAmount, formatAmount, cardSystem } from './detail'

const BANKS = ['Uzum Bank', 'Kapitalbank', 'Anorbank', 'TBC Bank', 'Ipoteka bank', 'Hamkorbank', 'SQB']

const OPS = ['P2P', 'Terminal', 'Onlayn', 'Bank ilovasi']

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
  return {
    id: `n${level}-${seed}`,
    level,
    card: makeCard(seed),
    system: cardSystem(makeCard(seed)),
    amount: formatAmount(amount),
    raw: amount,
    bank: BANKS[seed % BANKS.length],
    op: OPS[seed % OPS.length],
    date: time,
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
