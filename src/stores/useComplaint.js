/*
  Bitta ariza tafsiloti — serverdan.

  Tafsilot ekrani ochilganda asosiy yozuv va to'rt tabning ma'lumoti
  parallel so'raladi. Server javob bermasa `source` 'mock' bo'lib qoladi va
  ekran namuna ma'lumot bilan ishlayveradi.
*/
import { reactive, computed } from 'vue'
import { i18nLang } from '@/i18n'
import {
  fetchComplaint, fetchBankOperations, fetchSanctions,
  fetchTransactionChain, fetchWorkflow, fetchHistory, changeStatus
} from '@/services/complaints'
import {
  complaintDetail, bankOperations, sanctionList,
  transactionChain, workflowEvents, statusHistory
} from '@/utils/adapt'

const state = reactive({
  id: null,
  detail: null,
  bank: null,
  sanctions: null,
  chain: null,
  workflow: null,
  history: null,
  loading: false,
  source: null, // 'api' | 'mock'
  error: null
})

function clear() {
  // id va manba ham tozalanadi: aks holda `pending`/`live` eski arizadan
  // qolgan qiymat bo'yicha hisoblanadi
  state.id = null
  state.source = null
  state.error = null
  state.detail = null
  state.bank = null
  state.sanctions = null
  state.chain = null
  state.workflow = null
  state.history = null
}

/**
 * Arizani yuklaydi.
 * @param {number|string} id serverdagi raqamli identifikator
 */
async function load(id) {
  if (!id || state.loading) return
  state.id = id
  state.loading = true
  state.error = null

  try {
    // asosiy yozuv birinchi: u bo'lmasa tablarning ma'nosi yo'q
    const c = await fetchComplaint(id)
    state.detail = complaintDetail(c, i18nLang())
    state.source = 'api'
  } catch (e) {
    clear()
    state.source = 'mock'
    state.error = e
    state.loading = false
    return
  }

  // tablar mustaqil: biri yiqilsa qolgani baribir ko'rsatiladi
  const [bank, sanctions, chain, workflow, history] = await Promise.allSettled([
    fetchBankOperations(id),
    fetchSanctions(id),
    fetchTransactionChain(id),
    fetchWorkflow(id),
    fetchHistory(id)
  ])

  const value = (r, map) => (r.status === 'fulfilled' ? map(r.value) : null)
  state.bank = value(bank, bankOperations)
  state.sanctions = value(sanctions, sanctionList)
  state.workflow = value(workflow, workflowEvents)
  state.history = value(history, statusHistory)

  // Zanjir endpointi jabrlanuvchi kartasini qaytarmaydi — u arizaning o'z
  // rekviziti. Shuning uchun tafsilotdan olib qo'yamiz (ekran shuni kutadi).
  const built = value(chain, transactionChain)
  if (built) {
    const first = state.detail.requisites[0]
    built.victim = {
      card: first?.card || state.detail.row.card || '',
      bank: first?.bank || state.detail.row.bank || '',
      amount: state.detail.total,
      date: state.detail.row.time
    }
  }
  state.chain = built

  state.loading = false
}

/**
 * Status o'zgartiradi va arizani qaytadan o'qiydi.
 *
 * Server har bir o'tishni tarixga yozadi, shuning uchun izoh ham yuboriladi.
 * Yangilashdan keyin status, qadamlar treki, ish jarayoni va tarix bir vaqtda
 * yangilanadi — qo'lda tuzatishga hojat yo'q.
 *
 * @param {string} status server kodidagi status ('pending', 'canceled', ...)
 * @param {string} [comment] tarixda ko'rinadigan izoh
 */
async function setStatus(status, comment = '') {
  if (!state.id) return null

  const body = { status }
  if (String(comment || '').trim()) body.comment = String(comment).trim()

  const res = await changeStatus(state.id, body)
  await load(state.id)
  return res
}

/** Til almashganda ochiq arizani qaytadan so'raydi (yorliqlar tilga bog'liq). */
function reload() {
  return state.id && state.source === 'api' ? load(state.id) : Promise.resolve()
}

/*
  Ariza so'raldi, lekin javob hali kelmadi. Shu paytda ekranda namuna
  ma'lumot emas, skelet ko'rsatiladi — aks holda soxta ariza chaqnab o'tadi.
*/
const pending = computed(() => state.loading || (!!state.id && state.source === null))

const live = computed(() => state.source === 'api' && !!state.detail)

export function useComplaint() {
  return { state, load, clear, reload, setStatus, live, pending }
}
