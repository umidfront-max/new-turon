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

const state = reactive({
  rows: [],
  total: 0,
  byStatus: null,
  tabs: null,
  facets: null,
  loading: false,
  // 'api' — serverdan keldi, 'mock' — namuna, null — hali urinilmagan
  source: null,
  error: null
})

/** Ekran filtrini server parametrlariga o'giradi. */
function toParams({ queue = 'all', query = '', region = '', picked = {}, page = 1, perPage = 10 } = {}) {
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
    state.facets = page.facets
    state.source = 'api'
  } catch (e) {
    state.rows = []
    state.total = 0
    state.byStatus = null
    state.tabs = null
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
