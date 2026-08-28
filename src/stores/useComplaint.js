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
  fetchTransactionChain, fetchWorkflow, fetchHistory, changeStatus,
  checkReadiness, sendToPlatform, resendToPlatform
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
  // ayni paytda qaysi tab yuklanyapti
  tabLoading: null,
  source: null, // 'api' | 'mock'
  error: null
})

// qaysi tablar yuklab bo'lingan — qayta ochilganda so'rov ketmasin
const loaded = new Set()

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
  state.tabLoading = null
  loaded.clear()
}

/**
 * Arizani yuklaydi — faqat asosiy yozuvni.
 *
 * Tablar (bank, sanksiya, zanjir, ish jarayoni) o'zi ochilganda so'raladi:
 * ilgari beshalasi birdan ketardi, ochilmagan tablar uchun ham.
 *
 * @param {number|string} id serverdagi raqamli identifikator
 */
async function load(id) {
  if (!id || state.loading) return
  state.id = id
  state.loading = true
  state.error = null
  loaded.clear()

  try {
    const c = await fetchComplaint(id)
    state.detail = complaintDetail(c, i18nLang())
    state.source = 'api'
  } catch (e) {
    clear()
    state.source = 'mock'
    state.error = e
  } finally {
    state.loading = false
  }
}

/*
  Tab ma'lumotini o'z paytida so'raydi. Har bir tab bir marta yuklanadi;
  qayta ochilganda so'rov ketmaydi (`force` bilan majburlash mumkin).
*/
const TAB_LOADERS = {
  bank: [fetchBankOperations, bankOperations],
  sanctions: [fetchSanctions, sanctionList],
  transactions: [fetchTransactionChain, transactionChain],
  workflow: [fetchWorkflow, workflowEvents]
}

// tab -> `state` dagi maydon nomi
const TAB_FIELD = { bank: 'bank', sanctions: 'sanctions', transactions: 'chain', workflow: 'workflow' }

/**
 * @param {string} key tab kaliti (bank | sanctions | transactions | workflow)
 * @param {boolean} [force] keshni e'tiborsiz qoldirib qayta so'raydi
 */
async function loadTab(key, force = false) {
  const loader = TAB_LOADERS[key]
  if (!loader || !state.id || state.source !== 'api') return
  if (!force && loaded.has(key)) return

  loaded.add(key)
  state.tabLoading = key

  const [fetcher, adapt] = loader
  try {
    const res = await fetcher(state.id)
    state[TAB_FIELD[key]] = adapt(res)

    /*
      Zanjir endpointi jabrlanuvchi kartasini qaytarmaydi — u arizaning o'z
      rekviziti. Shuning uchun tafsilotdan olib qo'yamiz (ekran shuni kutadi).
    */
    if (key === 'transactions' && state.chain && state.detail) {
      const first = state.detail.requisites[0]
      state.chain.victim = {
        card: first?.card || state.detail.row.card || '',
        bank: first?.bank || state.detail.row.bank || '',
        amount: state.detail.total,
        date: state.detail.row.time
      }
    }

    // status tarixi ish jarayoni tabida ko'rsatiladi — u bilan birga keladi
    if (key === 'workflow') {
      try {
        state.history = statusHistory(await fetchHistory(state.id))
      } catch { state.history = null }
    }
  } catch {
    // tab bo'sh qoladi, ekran o'z bo'sh holatini ko'rsatadi
    state[TAB_FIELD[key]] = null
    loaded.delete(key)
  } finally {
    if (state.tabLoading === key) state.tabLoading = null
  }
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
  // status, qadamlar treki va ochilgan tablar birga yangilanadi
  await reload()
  return res
}

/**
 * Arizani va ochilgan tablarni qaytadan so'raydi (til almashganda yoki
 * status o'zgargandan keyin). Ochilmagan tablar tegilmaydi.
 */
async function reload() {
  if (!state.id || state.source !== 'api') return

  const open = [...loaded]
  await load(state.id)
  await Promise.all(open.map((key) => loadTab(key, true)))
}

/** Yuborishdan oldingi tekshiruv: { ready, missing: [{ field, message }] }. */
function readiness() {
  return checkReadiness(state.id)
}

/**
 * Arizani bankka (Platformaga) yuboradi va yozuvni yangilaydi.
 *
 * Sayt orqali yaratilgan ariza fon rejimida o'zi ketadi; bu — qo'lda
 * yuborish. Bank xato qaytargan bo'lsa `again` bilan qayta yuboriladi.
 *
 * @param {boolean} [again]
 */
async function sendToBank(again = false) {
  if (!state.id) return null

  const res = again ? await resendToPlatform(state.id) : await sendToPlatform(state.id)
  await reload()
  return res
}

const pending = computed(() => !!state.id && !state.detail && !state.error)

const live = computed(() => state.source === 'api' && !!state.detail)

export function useComplaint() {
  return { state, load, loadTab, clear, reload, setStatus, readiness, sendToBank, live, pending }
}
