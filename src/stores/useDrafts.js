/*
  Qoralamalar — serverdan.

  Server javob bermasa `source` 'mock' bo'lib qoladi va ekran useApplications
  ichidagi namuna ro'yxatda ishlayveradi.
*/
import { reactive, computed } from 'vue'
import {
  fetchDrafts, fetchDraft, startDraft, saveDraft, submitDraft,
  removeDraft as removeOnServer
} from '@/services/complaints'
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
  Qoralama — formaning joriy holati (`payload`). Server uni tekshirmaydi,
  faqat yuborilganda (`submit`) to'liqligi talab qilinadi. Shuning uchun
  yarim to'ldirilgan forma ham saqlanaveradi.
*/

/** Bitta qoralamani o'qiydi — formada davom ettirish uchun. */
async function one(id) {
  return fetchDraft(id)
}

/**
 * Saqlaydi: `id` bo'lsa yangilaydi, bo'lmasa yangisini yaratadi.
 * @returns {Promise<object>} ComplaintDraftOutput
 */
async function save(payload, id = null) {
  const res = id ? await saveDraft(id, { payload }) : await startDraft({ payload })
  if (!id && state.count !== null) state.count += 1
  return res
}

/**
 * Qoralamani arizaga aylantiradi. Formaning oxirgi holati ham yuboriladi —
 * saqlangandan keyin tahrirlangan bo'lishi mumkin.
 * @returns {Promise<object>} ComplaintOutput
 */
async function submit(id, payload) {
  const created = await submitDraft(id, { payload })

  state.items = state.items.filter((d) => d.apiId !== Number(id))
  state.total = Math.max(0, state.total - 1)
  if (state.count !== null) state.count = Math.max(0, state.count - 1)

  return created
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

/*
  Hali birinchi javob kelmagan — ekranda namuna ro'yxat emas, skelet turadi.
  `loadCount()` bunga ta'sir qilmaydi: u faqat yon paneldagi sanoq uchun.
*/
const pending = computed(() => state.source === null)

const live = computed(() => state.source === 'api')

export function useDrafts() {
  return { state, load, loadCount, one, save, submit, remove, live, pending }
}
