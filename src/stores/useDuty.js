/*
  Navbatchilik — serverdan.

  `GET /duty/current/` uch narsani qaytaradi:
    shift    — hozir kim javobgar (navbatda bo'lmasa null)
    report   — topshirilgan hisobot
    incoming — menga topshirilayotgan smenalar

  Server javob bermasa `source` 'mock' bo'lib qoladi va navbatchilik oynasi
  useUi'dagi namuna bosqichlar bilan ishlayveradi.
*/
import { reactive, computed } from 'vue'
import {
  fetchCurrentDuty, fetchDutyCandidates, startDuty,
  handOverDuty, acceptDuty, returnDuty
} from '@/services/complaints'
import { dutyShift, dutyCandidates } from '@/utils/adapt'

const state = reactive({
  shift: null,
  report: null,
  incoming: [],
  candidates: { available: false, count: 0, items: [] },
  loading: false,
  source: null, // 'api' | 'mock'
  error: null
})

async function load() {
  if (state.loading) return
  state.loading = true
  state.error = null

  try {
    const res = await fetchCurrentDuty()
    state.shift = dutyShift(res?.shift)
    state.report = dutyShift(res?.report)
    state.incoming = (res?.incoming || []).map(dutyShift).filter(Boolean)
    state.source = 'api'
  } catch (e) {
    state.shift = null
    state.report = null
    state.incoming = []
    state.source = 'mock'
    state.error = e
  } finally {
    state.loading = false
  }
}

/** Topshirish oynasi ochilganda nomzodlar ro'yxati kerak bo'ladi. */
async function loadCandidates() {
  try {
    state.candidates = dutyCandidates(await fetchDutyCandidates())
  } catch {
    state.candidates = { available: false, count: 0, items: [] }
  }
}

/** Navbatchilikni boshlash. Takror chaqirilsa server o'sha smenani qaytaradi. */
async function start(note = '') {
  const res = await startDuty(note ? { note } : {})
  state.shift = dutyShift(res)
  state.source = 'api'
  return state.shift
}

/** Hisobotni tanlangan xodimga topshirish. */
async function handOver(id, successorId, note = '') {
  const res = await handOverDuty(id, { successor_employee_id: successorId, note })
  state.shift = dutyShift(res)
  return state.shift
}

/** Topshirilgan smenani qabul qilish. */
async function accept(id) {
  const res = await acceptDuty(id)
  state.shift = dutyShift(res)
  await load() // qabul qilingach ro'yxat o'zgaradi
  return state.shift
}

/** Hisobotni tuzatishga qaytarish. */
async function sendBack(id, reason, comment = '') {
  const res = await returnDuty(id, { reason, comment })
  state.report = dutyShift(res)
  return state.report
}

const live = computed(() => state.source === 'api')

/** Ekrandagi bosqich: serverdagi smenaga qarab. */
const phase = computed(() => state.shift?.phase || state.report?.phase || null)

export function useDuty() {
  return { state, load, loadCandidates, start, handOver, accept, sendBack, live, phase }
}
