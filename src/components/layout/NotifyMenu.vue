<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import AppIcon from '@/components/ui/AppIcon.vue'
import { TONE } from '@/data/notifications'
import { useUi } from '@/stores/useUi'
import { useNotifications } from '@/stores/useNotifications'

const router = useRouter()
const { t } = useI18n()
const { toggleNotify, toast } = useUi()

const api = useNotifications()

const TIME_KEY = { min: 'time.minAgo', hour: 'time.hourAgo', day: 'time.dayAgo' }

function ago(a) {
  if (!a || !a.n) return t('time.now')
  return t(TIME_KEY[a.unit] || TIME_KEY.min, a.n)
}

/*
  Ro'yxat faqat serverdan. Ilgari javob kelgunicha namuna bildirishnomalar
  ko'rinib turardi — foydalanuvchi ularni haqiqiy deb o'ylardi. Endi javob
  kelgunicha skelet turadi.

  Sarlavha va matn serverdan tayyor keladi, shuning uchun i18n kaliti kerak emas.
*/
const pending = computed(() => api.state.source === null)
const unreadCount = computed(() => api.unread.value)

const items = computed(() => api.state.items.map((n) => ({
  id: n.id,
  icon: n.icon,
  read: n.read,
  appId: n.appId,
  title: n.title,
  text: n.text,
  when: ago(n.ago),
  tone: TONE[n.tone] || TONE.info
})))

function open(item) {
  api.markRead(item.id)
  toggleNotify(false)
  if (item.appId) router.push({ path: '/application', query: { id: item.appId } })
}

function openAll() {
  toggleNotify(false)
  router.push('/notifications')
}

function readAll() {
  if (!unreadCount.value) return
  api.markAllRead()
  toast(t('notify.allRead'))
}
</script>

<template>
  <div class="notify-menu">
    <div class="menu-head">
      <span class="head-title">{{ $t('notify.title') }}</span>
      <span v-if="unreadCount" class="head-count mono">{{ $t('notify.unread', unreadCount) }}</span>
      <div class="spacer" />
      <button type="button" class="head-action" :disabled="!unreadCount" @click="readAll">
        {{ $t('notify.markAll') }}
      </button>
    </div>

    <div class="notify-list thin-scroll">
      <!-- javob kelgunicha: uchta bo'sh qator -->
      <div v-if="pending" class="notify-skel">
        <div v-for="n in 3" :key="n" class="skel-row">
          <span class="sk skel-icon" />
          <span class="skel-body">
            <span class="sk skel-line w60" />
            <span class="sk skel-line w90" />
            <span class="sk skel-line w30" />
          </span>
        </div>
      </div>

      <button
        v-for="(n, i) in items"
        :key="n.id"
        type="button"
        class="notify-item"
        :class="{ unread: !n.read }"
        :style="{ animationDelay: `${i * 35}ms` }"
        @click="open(n)"
      >
        <span class="n-icon" :style="{ background: n.tone.bg, color: n.tone.fg }">
          <AppIcon :name="n.icon" :size="17" />
        </span>
        <span class="n-body">
          <span class="n-title">{{ n.title }}</span>
          <span class="n-text">{{ n.text }}</span>
          <span class="n-when mono">{{ n.when }}</span>
        </span>
        <span v-if="!n.read" class="n-dot" />
      </button>

      <div v-if="!pending && !items.length" class="notify-empty">
        <span class="empty-icon"><AppIcon name="bell" :size="24" /></span>
        <div class="empty-title">{{ $t('notify.emptyTitle') }}</div>
        <div class="empty-text">{{ $t('notify.emptyText') }}</div>
      </div>
    </div>

    <button type="button" class="notify-foot" @click="openAll">
      {{ $t('notify.viewAll') }}
      <AppIcon name="chevronRight" :size="15" />
    </button>
  </div>
</template>

<style scoped>
.notify-menu {
  position: absolute;
  top: 46px;
  right: 0;
  z-index: 90;
  width: 376px;
  background: var(--s-card);
  border: 1px solid var(--ce2e8f1);
  border-radius: 12px;
  box-shadow: var(--shadow-pop);
  overflow: hidden;
  animation: popIn .16s var(--ease);
  transform-origin: top right;
}

.menu-head {
  display: flex;
  align-items: center;
  gap: 8px;
  row-gap: 6px;
  flex-wrap: wrap;
  padding: 12px 14px;
  border-bottom: 1px solid var(--ceef1f6);
}

.head-title {
  font-size: 14.5px;
  font-weight: 700;
  color: var(--c16233d);
  white-space: nowrap;
}

/* badge hech qachon ikki qatorga bo'linmasin */
.head-count {
  flex: 0 0 auto;
  height: 20px;
  padding: 0 9px;
  display: inline-flex;
  align-items: center;
  border-radius: 20px;
  background: var(--cd9483f);
  color: #fff;
  font-size: 12px;
  font-weight: 600;
  line-height: 1;
  white-space: nowrap;
}

.head-action {
  flex: 0 0 auto;
  border: 0;
  background: transparent;
  padding: 0;
  cursor: pointer;
  font-size: 13px;
  font-weight: 600;
  color: var(--c23568f);
  white-space: nowrap;
}

.head-action:disabled {
  color: var(--c8b95a6);
  cursor: default;
}

.head-action:not(:disabled):hover {
  text-decoration: underline;
}

.notify-list {
  max-height: 356px;
  overflow-y: auto;
  scrollbar-width: thin;
}

.notify-skel {
  padding: 4px 0;
}

.skel-row {
  display: flex;
  align-items: flex-start;
  gap: 11px;
  padding: 12px 14px;
  border-bottom: 1px solid var(--ceef1f6);
}

.skel-icon {
  width: 32px;
  height: 32px;
  flex: 0 0 32px;
  border-radius: 9px;
}

.skel-body {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.skel-line {
  height: 11px;
}

.skel-line.w30 { width: 30%; }
.skel-line.w60 { width: 60%; }
.skel-line.w90 { width: 90%; }

.notify-item {
  width: 100%;
  display: flex;
  align-items: flex-start;
  gap: 11px;
  padding: 12px 14px;
  border: 0;
  border-bottom: 1px solid var(--ceef1f6);
  background: var(--s-card);
  cursor: pointer;
  text-align: left;
  animation: riseIn .26s var(--ease) backwards;
  transition: background .16s ease;
}

.notify-item:hover {
  background: var(--cf8fafc);
}

.notify-item.unread {
  background: var(--cf4f7fb);
}

.notify-item.unread:hover {
  background: var(--cf0f3f8);
}

.n-icon {
  width: 32px;
  height: 32px;
  flex: 0 0 32px;
  border-radius: 9px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.n-body {
  min-width: 0;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.n-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--c16233d);
}

.n-text {
  font-size: 13px;
  line-height: 1.4;
  color: var(--c3d4d66);
}

.n-when {
  margin-top: 3px;
  font-size: 12px;
  color: var(--c8b95a6);
}

.n-dot {
  width: 8px;
  height: 8px;
  flex: 0 0 8px;
  margin-top: 6px;
  border-radius: 50%;
  background: var(--c23568f);
}

.notify-empty {
  padding: 34px 20px;
  text-align: center;
}

.empty-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 46px;
  height: 46px;
  border-radius: 50%;
  background: var(--cf0f3f8);
  color: var(--c8b95a6);
  margin-bottom: 10px;
}

.empty-title {
  font-size: 14.5px;
  font-weight: 600;
  color: var(--c16233d);
}

.empty-text {
  margin-top: 4px;
  font-size: 13px;
  color: var(--c8b95a6);
}

.notify-foot {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 11px 14px;
  border: 0;
  background: var(--s-card);
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  color: var(--c23568f);
  transition: background .16s ease;
}

.notify-foot:hover {
  background: var(--cf8fafc);
}

@media (max-width: 560px) {
  .notify-menu {
    width: min(92vw, 376px);
    right: -60px;
  }
}
</style>
