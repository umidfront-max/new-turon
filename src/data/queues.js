// Navbatlar: manzil bo'lagi <-> navbat kaliti <-> filtr
export const QUEUE_STATUS = {
  new: ['new'],
  pending: ['pending'],
  error: ['error'],
  blocked: ['blocked'],
  autopayment: ['autopayment'],
  cancelled: ['cancelled'],
  done: ['done'],
  duplicate: ['duplicate']
}

// URL bo'lagi -> navbat kaliti
export const QUEUE_SLUG = {
  new: 'new',
  'in-bank': 'pending',
  returned: 'error',
  blocked: 'blocked',
  autopayment: 'autopayment',
  cancelled: 'cancelled',
  completed: 'done',
  duplicate: 'duplicate',
  overdue: 'overdue'
}

const KEY_SLUG = Object.fromEntries(Object.entries(QUEUE_SLUG).map(([slug, key]) => [key, slug]))

export function queueFromSlug(slug) {
  return QUEUE_SLUG[slug] || 'all'
}

/*
  Navbat endi alohida sahifa emas — reyestrning `?tab=` parametri.
  Shu sababli tabdan tabga o'tganda komponent qayta yuklanmaydi.
*/
export function queuePath(key) {
  return key && key !== 'all' ? `/?tab=${key}` : '/'
}

/** Navbat bo'yicha tekshiruv: barchasi, status yoki muddati o'tganlar */
export function queueFilter(key) {
  if (key === 'overdue') return (a) => !!a.overdue
  const allowed = QUEUE_STATUS[key]
  return allowed ? (a) => allowed.includes(a.status) : () => true
}
