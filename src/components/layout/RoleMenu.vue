<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import AppIcon from '@/components/ui/AppIcon.vue'
import { LANGS } from '@/i18n'
import { useUi } from '@/stores/useUi'

const router = useRouter()
const { t } = useI18n()
const { state, isExec, setRole, setTheme, setLanguage, toggleRoleMenu, toast } = useUi()

const roles = computed(() => [
  { key: 'staff', label: t('role.staff.label'), note: t('role.staff.note'), on: !isExec.value },
  { key: 'exec', label: t('role.exec.label'), note: t('role.exec.note'), on: isExec.value }
])

const groups = computed(() => [
  {
    label: t('role.lang'),
    options: LANGS.map((l) => ({
      v: l.value,
      label: t(`lang.${l.value}.short`),
      tip: t(`lang.${l.value}.full`)
    })),
    value: state.lang,
    pick: pickLang
  },
  {
    label: t('role.theme'),
    options: [
      { v: 'l', label: t('role.light'), icon: 'sun' },
      { v: 'd', label: t('role.dark'), icon: 'moon' }
    ],
    value: state.dark ? 'd' : 'l',
    pick: (v) => setTheme(v === 'd')
  },
  {
    label: t('role.year'),
    options: [{ v: 2026, label: '2026' }, { v: 2025, label: '2025' }],
    value: state.year,
    pick: (v) => { state.year = v }
  }
])

function pickLang(v) {
  if (v === state.lang) return
  setLanguage(v)
  toast(t('role.langChanged'))
}

function pickRole(key) {
  setRole(key)
  if (key === 'exec') router.push('/rahbar')
  else if (router.currentRoute.value.path === '/rahbar') router.push('/')
}

function exit() {
  toggleRoleMenu(false)
  toast(t('role.loggedOut'), 'warn')
}
</script>

<template>
  <div class="role-menu">
    <div class="menu-head">{{ $t('role.title') }}</div>

    <div class="role-list">
      <button
        v-for="r in roles"
        :key="r.key"
        type="button"
        class="role-item"
        :class="{ on: r.on }"
        @click="pickRole(r.key)"
      >
        <span class="radio"><span class="dot" /></span>
        <span class="role-text">
          <span class="role-label">{{ r.label }}</span>
          <span class="role-note">{{ r.note }}</span>
        </span>
      </button>
    </div>

    <div v-for="g in groups" :key="g.label" class="pref-row">
      <span class="pref-label">{{ g.label }}</span>
      <div class="seg">
        <button
          v-for="o in g.options"
          :key="o.v"
          type="button"
          class="seg-btn"
          :class="{ on: o.v === g.value }"
          :title="o.tip || o.label"
          @click="g.pick(o.v)"
        >
          <AppIcon v-if="o.icon" :name="o.icon" :size="14" :width="1.6" />
          {{ o.label }}
        </button>
      </div>
    </div>

    <button type="button" class="exit" @click="exit">
      <AppIcon name="logout" :size="17" :width="1.6" />
      {{ $t('role.logout') }}
    </button>
  </div>
</template>

<style scoped>
.role-menu {
  position: absolute;
  top: 50px;
  right: 0;
  z-index: 90;
  width: 288px;
  background: var(--s-card);
  border: 1px solid var(--ce2e8f1);
  border-radius: 12px;
  box-shadow: var(--shadow-pop);
  overflow: hidden;
  animation: popIn .16s var(--ease);
  transform-origin: top right;
}

.menu-head {
  padding: 13px 15px 10px;
  border-bottom: 1px solid var(--ceef1f6);
  font-size: 12.5px;
  font-weight: 700;
  letter-spacing: .08em;
  text-transform: uppercase;
  color: var(--c8b95a6);
}

.role-list {
  padding: 8px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.role-item {
  display: flex;
  align-items: center;
  gap: 11px;
  padding: 11px 12px;
  border: 0;
  border-radius: 10px;
  background: var(--s-card);
  box-shadow: inset 0 0 0 1px var(--ce5e7eb);
  cursor: pointer;
  text-align: left;
  transition: background .16s ease, box-shadow .16s ease;
}

.role-item:hover {
  background: var(--cf8fafc);
}

.role-item.on {
  background: var(--cf4f7fb);
  box-shadow: inset 0 0 0 1px var(--c23568f);
}

.radio {
  width: 18px;
  height: 18px;
  flex: 0 0 18px;
  border-radius: 50%;
  box-shadow: inset 0 0 0 1.5px var(--ce5e7eb);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: box-shadow .16s ease;
}

.role-item.on .radio {
  box-shadow: inset 0 0 0 1.5px var(--c23568f);
}

.dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: transparent;
  transform: scale(.4);
  transition: transform .18s var(--ease), background .18s ease;
}

.role-item.on .dot {
  background: var(--c23568f);
  transform: scale(1);
}

.role-text {
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.role-label {
  font-size: 14.5px;
  font-weight: 600;
  color: var(--c16233d);
}

.role-note {
  margin-top: 2px;
  font-size: 13px;
  color: var(--c8b95a6);
}

.pref-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 9px 12px 9px 15px;
  border-top: 1px solid var(--ceef1f6);
}

.pref-label {
  min-width: 0;
  flex: 1;
  font-size: 14px;
  color: var(--c3d4d66);
}

.seg {
  display: flex;
  gap: 3px;
  padding: 3px;
  border-radius: 9px;
  background: var(--cf0f3f8);
}

.seg-btn {
  height: 28px;
  min-width: 34px;
  padding: 0 9px;
  border: 0;
  border-radius: 7px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  cursor: pointer;
  font-size: 13.5px;
  font-weight: 600;
  background: transparent;
  color: var(--c8b95a6);
  transition: background .18s ease, color .18s ease, box-shadow .18s ease;
}

.seg-btn.on {
  background: var(--s-card);
  color: var(--c16233d);
  box-shadow: 0 1px 3px rgba(5, 12, 28, .14);
}

.exit {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 9px;
  padding: 12px 15px;
  border: 0;
  border-top: 1px solid var(--ceef1f6);
  background: var(--s-card);
  cursor: pointer;
  color: var(--ca52220);
  font-size: 14.5px;
  font-weight: 600;
  transition: background .16s ease;
}

.exit:hover {
  background: var(--cfceceb);
}
</style>
