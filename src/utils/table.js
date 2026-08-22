// Jadval mantiqi: filtrlash va sahifalash. Komponentlardan ajratilgan —
// shu sababli alohida tekshirish (test) qilish oson.
import { queueFilter } from '@/data/queues'
import { groupValue, toNumber } from '@/stores/useApplications'

export const EMPTY_COLS = {
  id: '', flow: '', name: '', card: '', min: '', max: '', status: '', date: ''
}

function textMatch(value, query) {
  return !query || String(value ?? '').toLowerCase().includes(String(query).trim().toLowerCase())
}

// "04.08.2026 09:12" -> "2026-08-04" (input[type=date] formati)
export function isoDay(time) {
  const [d, m, y] = String(time).split(' ')[0].split('.')
  return `${y}-${m}-${d}`
}

/**
 * Arizalarni navbat, filtr paneli va ustun qidiruvlari bo'yicha saralaydi.
 * @param {Array} items barcha arizalar
 * @param {object} opts { queue, picked, cols, dups, labels }
 *   labels — matn qidiruvida ishlatiladigan tarjimalar: { flow(a), method(a) }
 */
export function filterApplications(items, { queue = 'all', picked = {}, cols = EMPTY_COLS, dups = new Set(), labels = {} } = {}) {
  const inQueue = queueFilter(queue)
  const groups = Object.entries(picked).filter(([, list]) => list && list.length)
  const min = toNumber(cols.min)
  const max = toNumber(cols.max)
  const flowLabel = labels.flow || ((a) => a.flow)
  const methodLabel = labels.method || ((a) => a.method)

  return items.filter((a) => {
    if (!inQueue(a)) return false

    for (const [group, list] of groups) {
      if (!list.includes(groupValue(a, group, dups))) return false
    }

    if (!textMatch(`${a.id} ${a.material || ''}`, cols.id)) return false
    if (!textMatch(flowLabel(a), cols.flow)) return false
    if (!textMatch(`${a.name} ${methodLabel(a)}`, cols.name)) return false
    if (!textMatch(`${a.card} ${a.bank}`, cols.card)) return false
    if (cols.status && a.status !== cols.status) return false
    if (cols.date && isoDay(a.time) !== cols.date) return false

    const sum = toNumber(a.amount)
    if (min && sum < min) return false
    if (max && sum > max) return false

    return true
  })
}

/** Sahifadagi qatorlar, tartib raqami bilan */
export function pageSlice(rows, page, perPage) {
  const start = (page - 1) * perPage
  return rows.slice(start, start + perPage).map((a, i) => ({ ...a, n: start + i + 1 }))
}

export function lastPageOf(total, perPage) {
  return Math.max(1, Math.ceil(total / perPage))
}

/** 1 … 4 5 6 … 13 ko'rinishidagi sahifa raqamlari ro'yxati */
export function pageList(current, last) {
  if (last <= 7) return Array.from({ length: last }, (_, i) => i + 1)

  const set = new Set([1, last, current, current - 1, current + 1])
  if (current <= 3) [2, 3, 4].forEach((p) => set.add(p))
  if (current >= last - 2) [last - 3, last - 2, last - 1].forEach((p) => set.add(p))

  const sorted = [...set].filter((p) => p >= 1 && p <= last).sort((a, b) => a - b)
  const out = []
  sorted.forEach((p, i) => {
    if (i && p - sorted[i - 1] > 1) out.push('…')
    out.push(p)
  })
  return out
}
