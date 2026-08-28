/*
  Bildirishnomalar — serverdan.

  Server javob bermasa `source` 'mock' bo'lib qoladi va ekranlar useUi'dagi
  namuna ro'yxatda ishlayveradi — ko'rinishi bir xil.
*/
import { reactive, computed } from 'vue'
import { fetchNotifications, readNotification, readAllNotifications } from '@/services/complaints'
import { openStream } from '@/services/sse'
import { notification } from '@/utils/adapt'

const state = reactive({
  items: [],
  total: 0,
  loading: false,
  source: null, // 'api' | 'mock'
  streaming: false, // jonli oqim ochiqmi
  error: null
})

const rows = (res) => (Array.isArray(res) ? res : res?.results || [])

async function load(params) {
  if (state.loading) return
  state.loading = true
  state.error = null

  try {
    const res = await fetchNotifications(params)
    state.items = rows(res).map(notification)
    state.total = res?.count ?? state.items.length
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

/** Bittasini o'qilgan qiladi. Server javobini kutmasdan ekranda belgilanadi. */
async function markRead(id) {
  const item = state.items.find((n) => n.id === id)
  if (!item || item.read) return
  item.read = true

  try {
    await readNotification(id)
  } catch {
    item.read = false // server qabul qilmadi — orqaga qaytaramiz
  }
}

/** Hammasini o'qilgan qiladi. */
async function markAllRead() {
  const before = state.items.map((n) => n.read)
  state.items.forEach((n) => { n.read = true })

  try {
    await readAllNotifications()
  } catch {
    state.items.forEach((n, i) => { n.read = before[i] })
  }
}

/* ---------- jonli oqim (SSE) ---------- */

// bir necha hodisa ketma-ket kelsa — bitta so'rov yuborilsin
const REFRESH_DELAY = 300
// oqim ochilmasa oddiy so'rovga o'tamiz
const POLL_MS = 60000
const POLL_AFTER = 3

let stream = null
let refreshTimer = 0
let pollTimer = 0
let fails = 0
let opened = 0

/**
  Hodisa kelganda ro'yxat GET orqali qayta so'raladi.

  Hodisaning o'z ma'lumotidan foydalanmaymiz: ro'yxat, sanoq va o'qilgan
  belgisi serverdagi holat bilan bir xil bo'lib qolsin.
*/
function refresh() {
  clearTimeout(refreshTimer)
  refreshTimer = setTimeout(() => {
    if (state.loading) { refresh(); return } // avvalgi so'rov tugasin
    load()
  }, REFRESH_DELAY)
}

function startPolling() {
  if (pollTimer) return
  pollTimer = setInterval(() => { if (!state.loading) load() }, POLL_MS)
}

function stopPolling() {
  clearInterval(pollTimer)
  pollTimer = 0
}

/** Oqimni ochadi. Bir marta chaqiriladi (main.js). */
function connect() {
  if (stream || typeof window === 'undefined') return

  stream = openStream('/notifications/stream/', {
    onOpen() {
      fails = 0
      state.streaming = true
      stopPolling()
      // qayta ulanish bo'lsa — uzilish paytidagilarni olib kelamiz
      if (opened++) refresh()
    },
    onEvent() {
      refresh()
    },
    onError() {
      state.streaming = false
      // oqim ochilmayapti — bildirishnomalar baribir yangilanib tursin
      if (++fails >= POLL_AFTER) startPolling()
    }
  })
}

/** Oqimni yopadi (chiqishda yoki sinovlarda). */
function disconnect() {
  stream?.close()
  stream = null
  state.streaming = false
  clearTimeout(refreshTimer)
  stopPolling()
}

const live = computed(() => state.source === 'api')
const unread = computed(() => state.items.filter((n) => !n.read).length)

export function useNotifications() {
  return { state, load, refresh, connect, disconnect, markRead, markAllRead, live, unread }
}
