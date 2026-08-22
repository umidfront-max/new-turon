// Ariza tafsiloti ekrani uchun namuna ma'lumot.
// Barcha matnlar i18n'da (detail.*), bu yerda faqat raqam/rekvizit hisob-kitobi.
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

const TX_TIMES = ['28.07.2026 17:05', '02.08.2026 21:14', '05.08.2026 08:19']

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

export function detailFor(id) {
  const row = APPLICATIONS.find((a) => a.id === id) || APPLICATIONS[0]
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

  return {
    row,
    shortName: shortName(row.name),
    phone: '+998 90 123 45 67',
    region: 'tashkentCity',
    source: row.flow === '102' ? '102' : 'duty',
    total: formatAmount(total),
    deadline: { days: row.overdue ? 2 : 10, overdue: !!row.overdue },
    requisites,
    txTotal,
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
