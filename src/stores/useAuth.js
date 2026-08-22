import { reactive, computed, readonly } from 'vue'
import { useUi } from './useUi'

const AUTH_KEY = 'turon-auth'

// «Parolni eslab qolish» belgilangan bo'lsa localStorage, aks holda sessionStorage
function stores() {
  try {
    return [window.localStorage, window.sessionStorage]
  } catch {
    return []
  }
}

function restore() {
  for (const store of stores()) {
    try {
      const raw = store.getItem(AUTH_KEY)
      if (raw) return JSON.parse(raw)
    } catch { /* buzilgan yozuv — e'tiborsiz qoldiramiz */ }
  }
  return null
}

const state = reactive({
  user: restore()   // { name, role, method, login }
})

function persist(user, remember) {
  const [local, session] = stores()
  try {
    local?.removeItem(AUTH_KEY)
    session?.removeItem(AUTH_KEY)
    const target = remember ? local : session
    target?.setItem(AUTH_KEY, JSON.stringify(user))
  } catch { /* saqlash yopiq bo'lishi mumkin */ }
}

function forget() {
  const [local, session] = stores()
  try {
    local?.removeItem(AUTH_KEY)
    session?.removeItem(AUTH_KEY)
  } catch { /* e'tiborsiz */ }
}

export function useAuth() {
  const { state: ui } = useUi()

  const isAuthed = computed(() => !!state.user)

  /**
   * Demo kirish: backend yo'q, shuning uchun har qanday to'g'ri to'ldirilgan
   * forma qabul qilinadi. Rol kirish usulidan olinadi.
   */
  function signIn({ name, role = 'staff', method = 'password', login = '', remember = true }) {
    const user = { name, role, method, login }
    state.user = user
    ui.role = role
    persist(user, remember)
    return user
  }

  function signOut() {
    state.user = null
    forget()
  }

  // sahifa yangilanganda saqlangan rol tiklansin
  function syncRole() {
    if (state.user) ui.role = state.user.role
  }

  return {
    auth: readonly(state),
    isAuthed,
    signIn,
    signOut,
    syncRole
  }
}

// modul yuklanganda saqlangan sessiya rolini qo'llaymiz
useAuth().syncRole()
