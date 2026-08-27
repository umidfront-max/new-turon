/*
  Qoralamalar — serverdan.

  Server javob bermasa `source` 'mock' bo'lib qoladi va ekran useApplications
  ichidagi namuna ro'yxatda ishlayveradi.
*/
import { reactive, computed } from 'vue'
import { fetchDrafts, removeDraft as removeOnServer } from '@/services/complaints'
import { draftRow } from '@/utils/adapt'

const state = reactive({
  items: [],
  total: 0,
  // yon paneldagi sanoq — ro'yxat yuklanmagan sahifalarda ham to'g'ri tursin
  count: null,
  loading: false,
  source: null, // 'api' | 'mock'
  error: null
})

const rows = (res) => (Array.isArray(res) ? res : res?.results || [])

async function load(params) {
  if (state.loading) return
  state.loading = true
  state.error = null

  try {
    const res = await fetchDrafts(params)
    state.items = rows(res).map(draftRow)
    state.total = res?.count ?? state.items.length
    state.count = state.total
    state.source = 'api'
  } catch (e) {
    state.items = []
    state.total = 0
    state.source = 'mock'
    state.error = e
  } finally {
    state.loading = false
  }
}

/**
 * Qoralamani o'chiradi. Ekrandan darhol olinadi; server rad etsa qaytariladi.
 * @param {number} id serverdagi identifikator (draftRow.apiId)
 */
async function remove(id) {
  const index = state.items.findIndex((d) => d.apiId === id)
  if (index < 0) return
  const [taken] = state.items.splice(index, 1)
  state.total = Math.max(0, state.total - 1)
  if (state.count !== null) state.count = Math.max(0, state.count - 1)

  try {
    await removeOnServer(id)
  } catch (e) {
    state.items.splice(index, 0, taken)
    state.total += 1
    if (state.count !== null) state.count += 1
    throw e
  }
}

/*
  Faqat sanoq — yon panel uchun. Ro'yxatga (`items`, `source`) tegmaydi,
  shuning uchun qoralamalar sahifasi ochiq bo'lmasa ham xavfsiz chaqiriladi.
*/
async function loadCount() {
  if (state.loading || state.count !== null) return

  try {
    const res = await fetchDrafts({ limit: 1 })
    state.count = res?.count ?? rows(res).length
  } catch { /* namuna ro'yxati qoladi */ }
}

const live = computed(() => state.source === 'api')

export function useDrafts() {
  return { state, load, loadCount, remove, live }
}
