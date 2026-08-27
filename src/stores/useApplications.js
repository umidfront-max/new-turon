import { reactive, computed, readonly } from 'vue'
import { APPLICATIONS, DRAFTS, FILTER_GROUPS } from '@/data/applications'

const state = reactive({
  items: APPLICATIONS.map((a) => ({ ...a })),
  drafts: DRAFTS.map((d) => ({ ...d }))
})

export function toNumber(amount) {
  return Number(String(amount).replace(/[^\d]/g, '')) || 0
}

export function formatAmount(n) {
  return String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
}

// bir xil karta bir necha arizada uchrasa — takroriy rekvizit
const duplicateCards = computed(() => {
  const seen = new Map()
  state.items.forEach((a) => seen.set(a.card, (seen.get(a.card) || 0) + 1))
  return new Set([...seen.entries()].filter(([, n]) => n > 1).map(([card]) => card))
})

/** Filtr guruhi bo'yicha arizaning qiymati */
export function groupValue(app, group, dups = duplicateCards.value) {
  switch (group) {
    case 'status': return app.status
    case 'bank': return app.bank
    case 'method': return app.method
    case 'source': return app.flow === '102' ? '102' : 'duty'
    case 'region': return app.region
    case 'repeat': return dups.has(app.card) ? 'duplicate' : 'clean'
    case 'sla': return app.overdue ? 'breached' : 'inTime'
    default: return null
  }
}

function nowStamp() {
  const d = new Date()
  const p = (n) => String(n).padStart(2, '0')
  return `${p(d.getDate())}.${p(d.getMonth() + 1)}.${d.getFullYear()} ${p(d.getHours())}:${p(d.getMinutes())}`
}

// yangi ariza raqami mavjudlaridan keyin davom etadi
function nextIds() {
  const nums = state.items
    .map((a) => Number(String(a.id).split('-').pop()))
    .filter((n) => !Number.isNaN(n))
  const next = (nums.length ? Math.max(...nums) : 10000) + 1
  return { id: `M01263${next % 100}/2026-${next}`, seq: next }
}

export function useApplications() {
  const items = computed(() => state.items)
  const drafts = computed(() => state.drafts)

  /** Navbat sanoqlari: barchasi, statuslar va muddati o'tganlar */
  const counts = computed(() => {
    const c = { all: state.items.length, overdue: 0 }
    state.items.forEach((a) => {
      c[a.status] = (c[a.status] || 0) + 1
      if (a.overdue) c.overdue += 1
    })
    return c
  })

  /** Filtr panelidagi har bir qiymat uchun sanoq */
  const filterCounts = computed(() => {
    const dups = duplicateCards.value
    const out = {}
    FILTER_GROUPS.forEach((g) => {
      out[g.key] = Object.fromEntries(g.values.map((v) => [v, 0]))
    })
    state.items.forEach((a) => {
      FILTER_GROUPS.forEach((g) => {
        const v = groupValue(a, g.key, dups)
        if (v != null && out[g.key][v] !== undefined) out[g.key][v] += 1
      })
    })
    return out
  })

  function byId(id) {
    return state.items.find((a) => a.id === id) || null
  }

  function draftById(id) {
    return state.drafts.find((d) => d.id === id) || null
  }

  function removeDraft(id) {
    state.drafts = state.drafts.filter((d) => d.id !== id)
  }

  /** Formadan kelgan ma'lumotni ro'yxatga qo'shadi */
  function addApplication(payload) {
    const { id } = nextIds()
    const item = {
      id,
      material: payload.material || null,
      flow: payload.source === '102' ? '102' : 'duty',
      name: payload.name,
      method: payload.method,
      card: payload.card,
      bank: payload.bank || '—',
      amount: payload.amount,
      cur: 'UZS',
      region: payload.region,
      status: 'new',
      time: nowStamp()
    }
    state.items = [item, ...state.items]
    return item
  }

  return {
    state: readonly(state),
    items,
    drafts,
    counts,
    filterCounts,
    duplicateCards,
    byId,
    draftById,
    removeDraft,
    addApplication
  }
}
