import { reactive, computed, readonly, watch } from 'vue'
import i18n, { setLang, storedLang, t } from '@/i18n'
import { NOTIFICATIONS } from '@/data/notifications'

const THEME_KEY = 'turon-theme'

function storedTheme() {
  try {
    return localStorage.getItem(THEME_KEY)
  } catch {
    return null
  }
}

const state = reactive({
  dark: storedTheme() === 'dark',
  sidebarOpen: true,        // desktopda yig'ilgan/ochilgan
  mobileNavOpen: false,     // mobilda chekka menyu
  role: 'staff',            // 'staff' | 'exec'
  roleMenuOpen: false,
  notifyOpen: false,
  notifications: NOTIFICATIONS.map((n) => ({ ...n })),
  lang: storedLang(),       // 'uz' | 'uzk' | 'ru'
  year: 2026,
  dutyPhase: 'on',          // on | review | returned | closed
  toast: null,              // { msg, kind }
  confirm: null             // { title, text, ok, cancel, danger, run }
})

let toastTimer = null

/* ---------- mavzu ---------- */
function applyTheme() {
  document.body.dataset.theme = state.dark ? 'dark' : 'light'
  try {
    localStorage.setItem(THEME_KEY, state.dark ? 'dark' : 'light')
  } catch { /* localStorage yopiq bo'lishi mumkin */ }
}

watch(() => state.dark, applyTheme, { immediate: true })

/* ---------- til ---------- */
watch(() => state.lang, (lang) => {
  state.lang = setLang(lang)
}, { immediate: true })

/* ---------- amallar ---------- */
export function useUi() {
  const isExec = computed(() => state.role === 'exec')
  const isStaff = computed(() => state.role !== 'exec')
  const roleKey = computed(() => (isExec.value ? 'exec' : 'staff'))

  const profile = computed(() => ({
    name: t(`profile.${roleKey.value}.name`),
    label: t(`profile.${roleKey.value}.label`),
    ini: t(`profile.${roleKey.value}.ini`)
  }))

  const DUTY_DOT = {
    on: '#4a9d6b',
    review: '#d9a03f',
    returned: '#d9483f',
    closed: '#8fa4c2'
  }

  const duty = computed(() => ({
    state: t(`duty.${roleKey.value}.${state.dutyPhase}.state`),
    meta: t(`duty.${roleKey.value}.${state.dutyPhase}.meta`),
    dot: DUTY_DOT[state.dutyPhase]
  }))

  const unread = computed(() => state.notifications.filter((n) => !n.read).length)

  function toggleTheme() {
    state.dark = !state.dark
  }

  function setTheme(dark) {
    state.dark = !!dark
  }

  function setLanguage(lang) {
    state.lang = lang
  }

  function toggleSidebar() {
    state.sidebarOpen = !state.sidebarOpen
  }

  function setMobileNav(open) {
    state.mobileNavOpen = open
  }

  function setRole(role) {
    state.role = role
    state.roleMenuOpen = false
  }

  function toggleRoleMenu(force) {
    const next = typeof force === 'boolean' ? force : !state.roleMenuOpen
    state.roleMenuOpen = next
    if (next) state.notifyOpen = false
  }

  function toggleNotify(force) {
    const next = typeof force === 'boolean' ? force : !state.notifyOpen
    state.notifyOpen = next
    if (next) state.roleMenuOpen = false
  }

  function markRead(id) {
    const item = state.notifications.find((n) => n.id === id)
    if (item) item.read = true
  }

  function markAllRead() {
    state.notifications.forEach((n) => { n.read = true })
  }

  function toast(msg, kind = 'ok') {
    clearTimeout(toastTimer)
    state.toast = { msg, kind }
    toastTimer = setTimeout(() => { state.toast = null }, 4500)
  }

  function closeToast() {
    clearTimeout(toastTimer)
    state.toast = null
  }

  function ask(options) {
    state.confirm = options
  }

  function closeConfirm() {
    state.confirm = null
  }

  function runConfirm() {
    const box = state.confirm
    state.confirm = null
    if (box && typeof box.run === 'function') box.run()
  }

  return {
    ui: readonly(state),
    state,
    locale: i18n.global.locale,
    isExec,
    isStaff,
    roleKey,
    profile,
    duty,
    unread,
    toggleTheme,
    setTheme,
    setLanguage,
    toggleSidebar,
    setMobileNav,
    setRole,
    toggleRoleMenu,
    toggleNotify,
    markRead,
    markAllRead,
    toast,
    closeToast,
    ask,
    closeConfirm,
    runConfirm
  }
}
