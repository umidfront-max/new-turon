// Navbatlar: manzil bo'lagi <-> navbat kaliti <-> status ro'yxati
export const QUEUE_STATUS = {
  new: ['new'],
  pending: ['pending'],
  error: ['error'],
  blocked: ['blocked'],
  autopayment: ['autopayment'],
  cancelled: ['cancelled'],
  done: ['done']
}

// URL bo'lagi -> navbat kaliti
export const QUEUE_SLUG = {
  new: 'new',
  'in-bank': 'pending',
  returned: 'error',
  blocked: 'blocked',
  autopayment: 'autopayment',
  cancelled: 'cancelled',
  completed: 'done'
}

const KEY_SLUG = Object.fromEntries(Object.entries(QUEUE_SLUG).map(([slug, key]) => [key, slug]))

export function queueFromSlug(slug) {
  return QUEUE_SLUG[slug] || 'all'
}

export function queuePath(key) {
  return KEY_SLUG[key] ? `/queue/${KEY_SLUG[key]}` : '/'
}
