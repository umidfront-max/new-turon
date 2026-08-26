/*
  Bildirishnomalar — serverdan.

  Server javob bermasa `source` 'mock' bo'lib qoladi va ekranlar useUi'dagi
  namuna ro'yxatda ishlayveradi — ko'rinishi bir xil.
*/
import { reactive, computed } from 'vue'
import { fetchNotifications, readNotification, readAllNotifications } from '@/services/complaints'
import { notification } from '@/utils/adapt'

const state = reactive({
  items: [],
  total: 0,
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

const live = computed(() => state.source === 'api')
const unread = computed(() => state.items.filter((n) => !n.read).length)

export function useNotifications() {
  return { state, load, markRead, markAllRead, live, unread }
}
