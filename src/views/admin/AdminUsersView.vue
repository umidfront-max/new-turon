<script setup>
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import AppIcon from '@/components/ui/AppIcon.vue'
import { useAdmin } from '@/stores/useAdmin'
import { useUi } from '@/stores/useUi'

const { t } = useI18n()
const { toast, ask } = useUi()
const { users, userCounts, toggleUser } = useAdmin()

const page = ref(1)
const perPage = ref(8)

const kpi = computed(() => [
  { key: 'all', v: userCounts.value.all, fg: 'var(--c1c2b45)' },
  { key: 'active', v: userCounts.value.active, fg: 'var(--c1a6e4b)' },
  { key: 'blocked', v: userCounts.value.blocked, fg: 'var(--ca52220)' },
  { key: 'today', v: 6, fg: 'var(--c23568f)' }
])

const lastPage = computed(() => Math.max(1, Math.ceil(users.value.length / perPage.value)))

const rows = computed(() => {
  const start = (page.value - 1) * perPage.value
  return users.value.slice(start, start + perPage.value).map((u) => ({
    ...u,
    ini: u.name.split(' ').slice(0, 2).map((w) => w[0]).join('')
  }))
})

function go(p) {
  page.value = Math.min(Math.max(1, p), lastPage.value)
}

function cyclePerPage() {
  perPage.value = perPage.value === 8 ? 15 : perPage.value === 15 ? 25 : 8
  page.value = 1
}

function resetPassword(user) {
  ask({
    title: t('admin.users.resetTitle'),
    text: t('admin.users.resetText', { name: user.name }),
    ok: t('admin.users.reset'),
    run: () => toast(t('admin.users.resetDone', { login: user.login }))
  })
}

function toggle(user) {
  toggleUser(user.login)
  toast(user.active ? t('admin.users.blockedDone', { login: user.login }) : t('admin.users.activeDone', { login: user.login }))
}
</script>

<template>
  <div class="screen">
    <div class="kpi-grid">
      <div v-for="k in kpi" :key="k.key" class="kpi card-surface">
        <span class="kpi-label">{{ $t(`admin.users.kpi.${k.key}`) }}</span>
        <span class="kpi-value mono" :style="{ color: k.fg }">{{ k.v }}</span>
      </div>
    </div>

    <section class="card-surface panel">
      <header class="panel-head dark-bar">
        <AppIcon name="badge" :size="26" />
        <span class="panel-title">{{ $t('admin.users.title') }}</span>
        <span class="panel-count mono">{{ $t('admin.users.count', { n: userCounts.all }) }}</span>
      </header>

      <div class="table-scroll thin-scroll">
        <div class="grid">
          <div class="row head">
            <span>{{ $t('admin.users.colName') }}</span>
            <span>{{ $t('admin.users.colRole') }}</span>
            <span>{{ $t('admin.users.colDep') }}</span>
            <span>{{ $t('admin.users.colSeen') }}</span>
            <span>{{ $t('admin.users.colState') }}</span>
            <span class="actions-col" />
          </div>

          <div v-for="u in rows" :key="u.login" class="row">
            <div class="person">
              <span class="avatar">{{ u.ini }}</span>
              <span class="person-text">
                <span class="person-name truncate">{{ u.name }}</span>
                <span class="person-login mono truncate">{{ u.login }}</span>
              </span>
            </div>
            <span class="cell">{{ $t(`admin.roles.${u.role}`) }}</span>
            <span class="cell">{{ $t(`admin.deps.${u.dep}`) }}</span>
            <span class="cell mono">{{ u.seen }}</span>
            <span class="state" :class="{ off: !u.active }">
              <span class="state-dot" />
              {{ u.active ? $t('admin.users.on') : $t('admin.users.off') }}
            </span>
            <span class="actions">
              <button type="button" class="icon-btn" :title="$t('admin.users.reset')" @click="resetPassword(u)">
                <AppIcon name="lockReset" :size="18" />
              </button>
              <button
                type="button"
                class="icon-btn"
                :class="{ danger: u.active }"
                :title="u.active ? $t('admin.users.block') : $t('admin.users.unblock')"
                @click="toggle(u)"
              >
                <AppIcon :name="u.active ? 'lock' : 'check'" :size="18" />
              </button>
            </span>
          </div>
        </div>
      </div>

      <div class="pager">
        <div class="spacer" />
        <button type="button" class="per-page" @click="cyclePerPage">
          <span>{{ $t('pager.perPage', perPage) }}</span>
          <AppIcon name="chevronDown" :size="14" />
        </button>
        <button type="button" class="sq" :disabled="page <= 1" @click="go(page - 1)">
          <AppIcon name="chevronLeft" :size="16" />
        </button>
        <button
          v-for="p in lastPage"
          :key="p"
          type="button"
          class="page"
          :class="{ on: p === page }"
          @click="go(p)"
        >{{ p }}</button>
        <button type="button" class="sq" :disabled="page >= lastPage" @click="go(page + 1)">
          <AppIcon name="chevronRight" :size="16" />
        </button>
        <span class="hint">{{ $t('pager.total', { n: userCounts.all }) }}</span>
      </div>
    </section>
  </div>
</template>

<style scoped>

.kpi-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(212px, 1fr));
  gap: 12px;
}

.kpi {
  padding: 14px 16px;
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.kpi-label {
  font-size: 13.5px;
  color: var(--c66748c);
  font-weight: 500;
}

.kpi-value {
  font-size: 28px;
  font-weight: 600;
  line-height: 1;
}

.panel {
  overflow: hidden;
}

.panel-head {
  height: 46px;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 0 18px;
  color: #c9d9ec;
}

.panel-title {
  font-size: 16px;
  font-weight: 600;
  letter-spacing: .07em;
  text-transform: uppercase;
  color: #fff;
}

.panel-count {
  font-size: 13.5px;
  color: #8fa4c2;
}

.grid {
  min-width: 860px;
}

.row {
  display: grid;
  grid-template-columns: 1.6fr 1.1fr 1fr .9fr .8fr 92px;
  gap: 16px;
  align-items: center;
  padding: 0 18px;
  height: 60px;
  border-bottom: 1px solid var(--ceef1f6);
}

.row.head {
  height: 42px;
  background: var(--cf8fafc);
  border-bottom: 1px solid var(--ce5e7eb);
  font-size: 12.5px;
  font-weight: 700;
  letter-spacing: .05em;
  text-transform: uppercase;
  color: var(--c8b95a6);
}

.person {
  display: flex;
  align-items: center;
  gap: 11px;
  min-width: 0;
}

.avatar {
  width: 36px;
  height: 36px;
  flex: 0 0 36px;
  border-radius: 50%;
  background: var(--ce8eef7);
  color: var(--c23568f);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13.5px;
  font-weight: 600;
}

.person-text {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.person-name {
  font-size: 14.5px;
  font-weight: 500;
  color: var(--c16233d);
}

.person-login {
  font-size: 13px;
  color: var(--c8b95a6);
}

.cell {
  font-size: 14px;
  color: var(--c3d4d66);
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.state {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 4px 11px;
  border-radius: 20px;
  background: var(--ce3f2e9);
  color: var(--c1a6e4b);
  font-size: 13.5px;
  font-weight: 500;
  white-space: nowrap;
  justify-self: start;
}

.state.off {
  background: var(--cfceceb);
  color: var(--ca52220);
}

.state-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: currentColor;
}

.actions {
  display: flex;
  gap: 6px;
  justify-content: flex-end;
}

.icon-btn {
  width: 34px;
  height: 34px;
  border-radius: 8px;
  border: 1px solid var(--ce2e8f1);
  background: var(--s-card);
  color: var(--c66748c);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background .16s ease, color .16s ease;
}

.icon-btn:hover {
  background: var(--cf4f7fb);
  color: var(--c23568f);
}

.icon-btn.danger:hover {
  background: var(--cfceceb);
  color: var(--ca52220);
}

/* ---------- sahifalagich ---------- */
.pager {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  flex-wrap: wrap;
}

.per-page,
.sq,
.page {
  height: 32px;
  min-width: 32px;
  padding: 0 10px;
  border-radius: 7px;
  border: 1px solid var(--ce2e8f1);
  background: var(--s-card);
  color: var(--c4b5a73);
  font-size: 13.5px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.page.on {
  background: var(--btn);
  border-color: var(--btn);
  color: #fff;
  font-weight: 600;
}

.sq:disabled {
  opacity: .45;
  cursor: not-allowed;
}

.hint {
  font-size: 13.5px;
  color: var(--c8b95a6);
  white-space: nowrap;
}

@media (max-width: 720px) {
  .hint {
    display: none;
  }
}
</style>
