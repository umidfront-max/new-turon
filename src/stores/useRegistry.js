/*
  Arizalar reyestri — serverdan.

  Server javob bermasa (yoki JWT hali sozlanmagan bo'lsa) ekran namuna
  ma'lumot bilan ishlayveradi: `source` shuni ko'rsatadi — 'api' yoki 'mock'.
  Shu sababli dizayn hech qachon bo'sh qolmaydi.
*/
import { reactive, computed } from 'vue'
import { fetchRegistry } from '@/services/complaints'
import { registryPage, statusToApi, statusToUi } from '@/utils/adapt'

/*
  `facets` — filtr panelining ro'yxatlari. method, source, region va bank
  har bir javobda o'zi keladi, bu parametr faqat qolganlarini QO'SHADI.
  `amount` (chelaklar) va `duplicate` so'ralmaydi: summa oralig'i alohida
  maydonlar bilan, takroriylik esa `status=duplicate` orqali beriladi.
*/
const FACETS = ['status', 'basis', 'crime_type', 'intake_type', 'sla']

/*
  Panel guruhlarining tartibi. `sla` — serverda {key: 'yes'|'no'} ko'rinishida,
  filtrga `is_overdue` bo'lib ketadi.
*/
const FACET_ORDER = ['status', 'bank', 'method', 'source', 'region', 'basis', 'crime_type', 'intake_type', 'sla']

// serverda `__in` shakli bor — bir nechta qiymat tanlash mumkin
const MULTI = ['status', 'method', 'source', 'region', 'basis', 'crime_type']

/*
  Bularda `__in` yo'q (`bank__in`, `intake_type__in` yuborilsa server jimgina
  e'tiborsiz qoldiradi), shuning uchun panelda ham bittadan tanlanadi.
*/
const SINGLE = ['bank', 'intake_type']

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

  // hudud manzildan keladi (admin panelidan); server raqamli id kutadi
  if (/^\d+$/.test(String(region))) params.region = Number(region)

  /*
    Navbat chiplari `tab`/`process_tab` bilan beriladi, `status=`/`is_overdue=`
    bilan emas: server chiplar sanog'ini aynan o'sha tabsiz hisoblaydi, shuning
    uchun bitta chip tanlanganda qolganlari nolga tushib qolmaydi.
  */
  if (queue === 'overdue') params.process_tab = 'overdue'
  else if (queue !== 'all') params.tab = statusToApi(queue)

  // filtr panelidagi tanlovlar
  MULTI.forEach((key) => {
    const list = picked[key]
    if (!list?.length) return
    // status mahalliy ro'yxatdan kelsa boshqacha nomlanadi ('autopayment'),
    // facets'dan kelsa allaqachon server kodida — statusToApi ikkalasini ham uddalaydi
    params[`${key}__in`] = (key === 'status' ? list.map(statusToApi) : list).join(',')
  })

  SINGLE.forEach((key) => {
    const list = picked[key]
    if (list?.length === 1) params[key] = list[0]
  })

  // muddat: facets'da {key:'yes'|'no'}, mahalliy ro'yxatda 'breached'|'inTime'
  if (picked.sla?.length === 1) {
    params.is_overdue = ['yes', 'breached'].includes(picked.sla[0])
  }

  // zarar summasi: ekranda mln so'm, serverga so'mda ketadi
  const from = Number(amount.from)
  const to = Number(amount.to)
  if (from > 0) params.amount_min = from * MLN
  if (to > 0) params.amount_max = to * MLN

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

/**
 * Eksport uchun joriy filtr bo'yicha barcha qatorlar — bitta so'rovda,
 * `state` ga tegmasdan (jadval ochiq sahifasida qolaveradi).
 * @returns {Promise<{rows: object[], total: number}>}
 */
async function loadAll(filters, limit = 1000) {
  const params = toParams({ ...filters, page: 1, perPage: limit })
  const res = await fetchRegistry(params)
  const page = registryPage(res, 1, limit)
  return { rows: page.rows, total: page.total }
}

/** Serverdagi ma'lumot ishlatilyaptimi. */
const live = computed(() => state.source === 'api')

/**
 * Ekran kalitlari bo'yicha sanoqlar (`all`, `new`, `blocked`, `overdue`, ...).
 * Server javob bermagan bo'lsa null — chaqiruvchi namuna sanoqlariga qaytadi.
 */
const counts = computed(() => {
  const raw = state.byStatus
  if (!raw) return null

  // 'all' — chiplardagi sanoq bilan bir xil bo'lishi uchun o'shandan olinadi
  const all = state.tabs.find((t) => t.apiKey === 'all')
  const out = { all: all ? all.count : state.total, overdue: 0 }

  Object.entries(raw).forEach(([status, n]) => { out[statusToUi(status)] = n })

  const late = state.processTabs.find((t) => t.apiKey === 'overdue')
  if (late) out.overdue = late.count

  return out
})

/**
 * Filtr paneli uchun guruhlar — serverdan kelgan `facets` asosida.
 * Bo'sh bo'lsa panel mahalliy ro'yxatga qaytadi.
 */
const facetGroups = computed(() => {
  const facets = state.facets
  if (!facets) return []

  return FACET_ORDER
    .filter((key) => Array.isArray(facets[key]) && facets[key].length)
    .map((key) => ({
      key,
      // bittadan tanlanadigan guruhlar panelda ham shunday ko'rsatiladi
      single: SINGLE.includes(key),
      options: facets[key].map((o) => {
        // sla/duplicate/amount qatorlarida `value` emas, `key` keladi
        const value = o.value !== undefined ? o.value : o.key
        return { value, label: o.label ?? String(value), count: o.count ?? 0 }
      })
    }))
})

export function useRegistry() {
  return { state, load, loadAll, live, counts, facetGroups, toParams }
}
