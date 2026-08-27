/*
  Arizalar reyestri — serverdan.

  Server javob bermasa (yoki JWT hali sozlanmagan bo'lsa) ekran namuna
  ma'lumot bilan ishlayveradi: `source` shuni ko'rsatadi — 'api' yoki 'mock'.
  Shu sababli dizayn hech qachon bo'sh qolmaydi.
*/
import { reactive, computed } from 'vue'
import { fetchRegistry } from '@/services/complaints'
import { registryPage, statusToApi } from '@/utils/adapt'

const FACETS = ['status', 'method', 'source', 'region', 'basis', 'crime_type', 'intake_type']

// filtr panelidagi summa million so'mda kiritiladi
const MLN = 1000000

const state = reactive({
  rows: [],
  total: 0,
  byStatus: null,
  tabs: [],
  processTabs: [],
  facets: null,
  loading: false,
  // 'api' — serverdan keldi, 'mock' — namuna, null — hali urinilmagan
  source: null,
  error: null
})

/** Ekran filtrini server parametrlariga o'giradi. */
function toParams({ queue = 'all', query = '', region = '', picked = {}, amount = {}, page = 1, perPage = 10 } = {}) {
  const params = { page, perPage, facets: FACETS }

  if (query.trim()) params.search = query.trim()
  if (region) params.region = region

  // navbat tabi — status bo'yicha (dizayndagi chiplar shunday)
  if (queue !== 'all' && queue !== 'overdue') params.status = statusToApi(queue)
  if (queue === 'overdue') params.is_overdue = true

  // filtr panelidagi tanlovlar
  const many = (list) => list.join(',')
  if (picked.status?.length) params.status__in = many(picked.status.map(statusToApi))
  if (picked.method?.length) params.method__in = many(picked.method)
  if (picked.source?.length) params.source__in = many(picked.source)
  if (picked.region?.length) params.region__in = many(picked.region)
  if (picked.bank?.length) params.bank__in = many(picked.bank)

  // muddat va takroriylik — ikkalasi ham tanlansa cheklov qolmaydi
  if (picked.sla?.length === 1) params.is_overdue = picked.sla[0] === 'breached'
  if (picked.repeat?.length === 1) params.has_duplicate = picked.repeat[0] === 'duplicate'

  // zarar summasi oralig'i: ekranda mln so'm, serverga so'mda ketadi
  const from = Number(amount.from)
  const to = Number(amount.to)
  if (from > 0) params.damage_amount__gte = from * MLN
  if (to > 0) params.damage_amount__lte = to * MLN

  return params
}

/**
 * Reyestrni yuklaydi. Xato bo'lsa `source` 'mock' bo'lib qoladi va
 * chaqiruvchi namuna ma'lumotга o'tadi.
 */
async function load(filters) {
  state.loading = true
  state.error = null

  try {
    const params = toParams(filters)
    const res = await fetchRegistry(params)
    const page = registryPage(res, params.page, params.perPage)

    state.rows = page.rows
    state.total = page.total
    state.byStatus = page.byStatus
    state.tabs = page.tabs
    state.processTabs = page.processTabs
    state.facets = page.facets
    state.source = 'api'
  } catch (e) {
    state.rows = []
    state.total = 0
    state.byStatus = null
    state.tabs = []
    state.processTabs = []
    state.facets = null
    state.source = 'mock'
    state.error = e
  } finally {
    state.loading = false
  }
}

/** Serverdagi ma'lumot ishlatilyaptimi. */
const live = computed(() => state.source === 'api')

export function useRegistry() {
  return { state, load, live, toParams }
}
