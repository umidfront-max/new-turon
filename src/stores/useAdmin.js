import { reactive, computed, readonly } from 'vue'
import { USERS, LOGS } from '@/data/admin'
import { BANKS } from '@/data/banks'

const state = reactive({
  users: USERS.map((u) => ({ ...u })),
  logs: LOGS.map((l) => ({ ...l })),
  banks: BANKS.map((b) => ({ ...b, bins: [...b.bins] }))
})

let seq = BANKS.length

export function useAdmin() {
  const users = computed(() => state.users)
  const logs = computed(() => state.logs)
  const banks = computed(() => state.banks)

  const userCounts = computed(() => ({
    all: state.users.length,
    active: state.users.filter((u) => u.active).length,
    blocked: state.users.filter((u) => !u.active).length,
    admins: state.users.filter((u) => u.role === 'admin' || u.role === 'sadmin').length
  }))

  const binCount = computed(() => state.banks.reduce((n, b) => n + b.bins.length, 0))

  function toggleUser(login) {
    const u = state.users.find((x) => x.login === login)
    if (u) u.active = !u.active
  }

  function addBank({ name, mfo, bins }) {
    seq += 1
    const bank = { id: `b${seq}`, name: name.trim(), mfo: String(mfo).trim(), bins: bins.filter(Boolean), active: true }
    state.banks = [bank, ...state.banks]
    return bank
  }

  function updateBank(id, patch) {
    const b = state.banks.find((x) => x.id === id)
    if (b) Object.assign(b, patch)
  }

  function removeBank(id) {
    state.banks = state.banks.filter((b) => b.id !== id)
  }

  /** Excel importi — namuna: bir nechta bank bir vaqtda qo'shiladi */
  function importBanks(rows) {
    rows.forEach((r) => addBank(r))
    return rows.length
  }

  return {
    state: readonly(state),
    users,
    logs,
    banks,
    userCounts,
    binCount,
    toggleUser,
    addBank,
    updateBank,
    removeBank,
    importBanks
  }
}
