<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useI18n } from 'vue-i18n'
import AppIcon from '@/components/ui/AppIcon.vue'
import RoleMenu from './RoleMenu.vue'
import NotifyMenu from './NotifyMenu.vue'
import { useUi } from '@/stores/useUi'

const { t } = useI18n()
const {
  state, isExec, profile, duty, unread,
  toggleRoleMenu, toggleNotify, setMobileNav, ask, toast
} = useUi()

const clock = ref('09:41')
const today = ref('14.08')
const menuRoot = ref(null)
const bellRoot = ref(null)

// Soat jonli yursin (dizayndagi 09:41 boshlang'ich qiymat sifatida qoladi).
let timer = null
function tick() {
  const d = new Date()
  const p = (n) => String(n).padStart(2, '0')
  clock.value = `${p(d.getHours())}:${p(d.getMinutes())}`
  today.value = `${p(d.getDate())}.${p(d.getMonth() + 1)}`
}

function onDocClick(e) {
  if (state.roleMenuOpen && menuRoot.value && !menuRoot.value.contains(e.target)) {
    toggleRoleMenu(false)
  }
  if (state.notifyOpen && bellRoot.value && !bellRoot.value.contains(e.target)) {
    toggleNotify(false)
  }
}

function onEsc(e) {
  if (e.key !== 'Escape') return
  toggleRoleMenu(false)
  toggleNotify(false)
}

onMounted(() => {
  tick()
  timer = setInterval(tick, 30000)
  document.addEventListener('click', onDocClick)
  document.addEventListener('keydown', onEsc)
})

onBeforeUnmount(() => {
  clearInterval(timer)
  document.removeEventListener('click', onDocClick)
  document.removeEventListener('keydown', onEsc)
})

// Navbatchilik tugmasi — fazaga qarab o'zgaradi
const dutyButton = computed(() => {
  if (isExec.value) {
    return state.dutyPhase === 'review'
      ? { key: 'review', bg: '#2f6fd0', ring: '#2f6fd0', icon: 'eye' }
      : null
  }
  return {
    on: { key: 'hand', bg: 'transparent', ring: 'rgba(255,255,255,.28)', icon: 'logout' },
    review: { key: 'report', bg: 'transparent', ring: 'rgba(255,255,255,.28)', icon: 'doc' },
    returned: { key: 'fix', bg: '#b8503a', ring: '#b8503a', icon: 'doc' },
    closed: { key: 'accept', bg: '#2f6fd0', ring: '#2f6fd0', icon: 'login' }
  }[state.dutyPhase]
})

function onDutyClick() {
  const phase = state.dutyPhase
  if (phase === 'closed' && !isExec.value) {
    ask({
      title: t('duty.ask.title'),
      text: t('duty.ask.text'),
      ok: t('duty.ask.ok'),
      run: () => {
        state.dutyPhase = 'on'
        toast(t('duty.toast.accepted'))
      }
    })
    return
  }
  if (isExec.value && phase === 'review') {
    state.dutyPhase = 'closed'
    toast(t('duty.toast.approved'))
    return
  }
  state.dutyPhase = 'review'
  toast(t('duty.toast.sent'))
}
</script>

<template>
  <header class="topbar dark-bar">
    <button
      type="button"
      class="hamburger"
      :aria-label="$t('nav.openMenu')"
      @click="setMobileNav(true)"
    >
      <AppIcon name="menu" :size="22" :width="1.7" />
    </button>

    <div class="brand">
      <img src="/logo.webp" :alt="$t('app.logoAlt')" class="brand-logo" />
      <span class="brand-name">{{ $t('app.brand') }}</span>
    </div>

    <div class="spacer" />

    <!-- navbatchilik holati -->
    <div class="duty" :title="dutyButton ? $t(`duty.tip.${dutyButton.key}`) : undefined">
      <span class="duty-dot" :style="{ background: duty.dot }" />
      <span class="duty-text">
        <span class="duty-state">{{ duty.state }}</span>
        <span class="duty-meta mono">{{ duty.meta }}</span>
      </span>
      <button
        v-if="dutyButton"
        type="button"
        class="duty-btn"
        :style="{ background: dutyButton.bg, borderColor: dutyButton.ring }"
        @click="onDutyClick"
      >
        <AppIcon :name="dutyButton.icon" :size="15" :width="1.7" />
        <span>{{ $t(`duty.btn.${dutyButton.key}`) }}</span>
      </button>
    </div>

    <div class="right">
      <div
        class="clock"
        :title="$t('topbar.clockTip', { date: '14.08.2026', weekday: $t('topbar.weekday'), year: state.year })"
      >
        <span class="clock-time mono">{{ clock }}</span>
        <span class="clock-date mono">{{ today }}</span>
      </div>

      <div ref="bellRoot" class="bell-wrap">
        <button
          type="button"
          class="bell"
          :class="{ on: state.notifyOpen }"
          :title="$t('topbar.notifications')"
          @click="toggleNotify()"
        >
          <AppIcon name="bell" :size="20" />
          <span v-if="unread" class="badge mono">{{ unread }}</span>
        </button>

        <Transition name="fade">
          <NotifyMenu v-if="state.notifyOpen" />
        </Transition>
      </div>

      <div ref="menuRoot" class="profile-wrap">
        <button
          type="button"
          class="profile"
          :title="$t('topbar.profile')"
          @click="toggleRoleMenu()"
        >
          <span class="avatar">{{ profile.ini }}</span>
          <span class="profile-text">
            <span class="profile-name">{{ profile.name }}</span>
            <span class="profile-role">{{ profile.label }}</span>
          </span>
          <AppIcon name="chevronDown" :size="12" class="caret" :class="{ up: state.roleMenuOpen }" />
        </button>

        <Transition name="fade">
          <RoleMenu v-if="state.roleMenuOpen" />
        </Transition>
      </div>
    </div>
  </header>
</template>

<style scoped>
.topbar {
  height: var(--topbar-h);
  flex: 0 0 var(--topbar-h);
  display: flex;
  align-items: center;
  gap: 18px;
  padding: 0 20px 0 18px;
  position: sticky;
  top: 0;
  z-index: 80;
}

/* ---------- brend ---------- */
.brand {
  display: flex;
  align-items: center;
  gap: 11px;
  flex: 0 0 auto;
}

.brand-logo {
  width: 36px;
  height: 36px;
  flex: 0 0 36px;
  object-fit: contain;
  display: block;
}

.brand-name {
  font-family: var(--font-display);
  font-size: 22px;
  font-weight: 700;
  color: #fff;
  letter-spacing: .06em;
  text-transform: uppercase;
  white-space: nowrap;
}

.hamburger {
  display: none;
  width: 38px;
  height: 38px;
  border: 1px solid rgba(255, 255, 255, .18);
  border-radius: 9px;
  background: rgba(255, 255, 255, .08);
  color: #c9d9ec;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background .16s ease;
}

.hamburger:hover {
  background: rgba(255, 255, 255, .16);
}

/* ---------- navbatchilik ---------- */
.duty {
  display: flex;
  align-items: center;
  gap: 11px;
  height: 44px;
  padding: 0 5px 0 13px;
  border-radius: 10px;
  background: rgba(255, 255, 255, .07);
  border: 1px solid rgba(255, 255, 255, .14);
  flex: 0 0 auto;
}

.duty-dot {
  width: 8px;
  height: 8px;
  flex: 0 0 8px;
  border-radius: 50%;
  animation: pulseDot 2.6s infinite;
}

.duty-text {
  display: flex;
  flex-direction: column;
  line-height: 1.25;
}

.duty-state {
  font-size: 14px;
  font-weight: 600;
  color: #fff;
  white-space: nowrap;
}

.duty-meta {
  font-size: 12px;
  color: #8fa4c2;
  white-space: nowrap;
}

.duty-btn {
  display: flex;
  align-items: center;
  gap: 7px;
  height: 28px;
  padding: 0 11px;
  border-radius: 7px;
  cursor: pointer;
  border: 1px solid;
  color: #fff;
  font-size: 13.5px;
  font-weight: 600;
  white-space: nowrap;
  transition: filter .16s ease, transform .16s var(--ease);
}

.duty-btn:hover {
  filter: brightness(1.14);
  transform: translateY(-1px);
}

/* ---------- o'ng blok ---------- */
.right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.clock {
  display: flex;
  align-items: baseline;
  gap: 9px;
}

.clock-time {
  font-size: 21px;
  font-weight: 600;
  color: #fff;
  letter-spacing: .02em;
  line-height: 1;
}

.clock-date {
  font-size: 13.5px;
  color: #8fa4c2;
  white-space: nowrap;
}

.bell-wrap {
  position: relative;
}

.bell {
  position: relative;
  width: 36px;
  height: 36px;
  border-radius: 9px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border: 1px solid transparent;
  background: transparent;
  color: #c9d9ec;
  transition: background .16s ease, border-color .16s ease;
}

.bell:hover,
.bell.on {
  background: rgba(255, 255, 255, .10);
  border-color: rgba(255, 255, 255, .20);
}

.badge {
  position: absolute;
  top: 2px;
  right: 2px;
  min-width: 16px;
  height: 16px;
  padding: 0 4px;
  border-radius: 20px;
  background: var(--cd9483f);
  color: #fff;
  font-size: 10.5px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1.5px solid #0b1425;
}

.profile-wrap {
  position: relative;
}

.profile {
  display: flex;
  align-items: center;
  gap: 10px;
  height: 42px;
  padding: 0 10px 0 6px;
  border-radius: 10px;
  cursor: pointer;
  border: 1px solid transparent;
  background: transparent;
  transition: background .16s ease, border-color .16s ease;
}

.profile:hover {
  background: rgba(255, 255, 255, .10);
  border-color: rgba(255, 255, 255, .20);
}

.avatar {
  width: 32px;
  height: 32px;
  flex: 0 0 32px;
  border-radius: 50%;
  background: var(--s-card);
  color: var(--t-ink);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13.5px;
  font-weight: 700;
}

.profile-text {
  display: flex;
  flex-direction: column;
  line-height: 1.3;
  text-align: left;
}

.profile-name {
  font-size: 14.5px;
  font-weight: 600;
  color: #fff;
  white-space: nowrap;
}

.profile-role {
  font-size: 12.5px;
  color: #8fa4c2;
  white-space: nowrap;
}

.caret {
  color: #8fa4c2;
  transition: transform .2s var(--ease);
}

.caret.up {
  transform: rotate(180deg);
}

/* ---------- responsive ---------- */
@media (max-width: 1180px) {
  .duty-btn span {
    display: none;
  }

  .duty-btn {
    padding: 0 9px;
  }
}

@media (max-width: 1024px) {
  .hamburger {
    display: flex;
  }

  .duty {
    display: none;
  }
}

@media (max-width: 820px) {
  .profile-text,
  .clock-date {
    display: none;
  }
}

@media (max-width: 560px) {
  .topbar {
    gap: 10px;
    padding: 0 12px;
  }

  .brand-name {
    font-size: 17px;
  }

  .clock {
    display: none;
  }
}

@media (max-width: 400px) {
  .brand-name {
    display: none;
  }
}
</style>
