<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import AppIcon from '@/components/ui/AppIcon.vue'
import { TONE } from '@/data/notifications'
import { useUi } from '@/stores/useUi'

const router = useRouter()
const { t } = useI18n()
const { state, unread, markRead, markAllRead, toast } = useUi()

const onlyUnread = ref(false)

const TIME_KEY = { min: 'time.minAgo', hour: 'time.hourAgo', day: 'time.dayAgo' }

function ago(a) {
  if (!a || !a.n) return t('time.now')
  return t(TIME_KEY[a.unit] || TIME_KEY.min, a.n)
}

const rows = computed(() => state.notifications
  .filter((n) => !onlyUnread.value || !n.read)
  .map((n) => ({
    id: n.id,
    icon: n.icon,
    read: n.read,
    appId: n.appId,
    title: t(`notify.items.${n.key}.title`),
    text: t(`notify.items.${n.key}.text`, n.params || {}),
    when: ago(n.ago),
    tone: TONE[n.tone] || TONE.info
  })))

function open(item) {
  markRead(item.id)
  if (item.appId) router.push({ path: '/application', query: { id: item.appId } })
}

function readAll() {
  if (!unread.value) return
  markAllRead()
  toast(t('notify.allRead'))
}
</script>

<template>
  <div class="screen">
    <div class="head card-surface">
      <div class="head-text">
        <div class="crumbs">
          <button type="button" class="crumb" @click="router.push('/')">{{ $t('modules.cardblock') }}</button>
          <span>/</span>
          <span class="crumb-now">{{ $t('notify.pageTitle') }}</span>
        </div>
        <div class="head-row">
          <span class="head-title">{{ $t('notify.pageTitle') }}</span>
          <span v-if="unread" class="chip unread mono">{{ $t('notify.unread', unread) }}</span>
        </div>
      </div>

      <div class="spacer" />

      <label class="switch">
        <input v-model="onlyUnread" type="checkbox" class="sr-only" />
        <span class="box" :class="{ on: onlyUnread }">
          <AppIcon v-if="onlyUnread" name="check" :size="13" />
        </span>
        {{ $t('notify.unreadOnly') }}
      </label>

      <button type="button" class="btn-light" :disabled="!unread" @click="readAll">
        <AppIcon name="check" :size="16" />
        {{ $t('notify.markAll') }}
      </button>
    </div>

    <section class="card-surface list">
      <div class="list-head">
        <AppIcon name="bell" :size="18" />
        <span class="list-title">{{ $t('notify.title') }}</span>
        <div class="spacer" />
        <span class="list-note">{{ $t('notify.pageNote') }}</span>
      </div>

      <button
        v-for="(n, i) in rows"
        :key="n.id"
        type="button"
        class="row"
        :class="{ unread: !n.read }"
        :style="{ animationDelay: `${i * 40}ms` }"
        @click="open(n)"
      >
        <span class="n-icon" :style="{ background: n.tone.bg, color: n.tone.fg }">
          <AppIcon :name="n.icon" :size="18" />
        </span>
        <span class="n-body">
          <span class="n-title">{{ n.title }}</span>
          <span class="n-text">{{ n.text }}</span>
        </span>
        <span class="n-when mono">{{ n.when }}</span>
        <span v-if="n.appId" class="n-open">
          {{ $t('notify.open') }}
          <AppIcon name="chevronRight" :size="14" />
        </span>
        <span v-if="!n.read" class="n-dot" />
      </button>

      <div v-if="!rows.length" class="empty">
        <span class="empty-icon"><AppIcon name="bell" :size="26" /></span>
        <div class="empty-title">{{ $t('notify.emptyTitle') }}</div>
        <div class="empty-text">{{ $t('notify.emptyText') }}</div>
      </div>
    </section>
  </div>
</template>

<style scoped>

.head {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 18px;
  flex-wrap: wrap;
}

.crumb:hover {
  color: var(--c23568f);
}

.chip.unread {
  flex: 0 0 auto;
  display: inline-flex;
  align-items: center;
  height: 22px;
  padding: 0 10px;
  border-radius: 20px;
  background: var(--cd9483f);
  color: #fff;
  font-size: 12.5px;
  font-weight: 600;
  line-height: 1;
  white-space: nowrap;
}

.switch {
  display: inline-flex;
  align-items: center;
  gap: 9px;
  font-size: 14px;
  color: var(--c3d4d66);
  cursor: pointer;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
}

.box {
  width: 20px;
  height: 20px;
  flex: 0 0 20px;
  border-radius: 6px;
  border: 1.6px solid var(--cc8cdd6);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  transition: background .16s ease, border-color .16s ease;
}

.box.on {
  background: var(--c16233d);
  border-color: var(--c16233d);
}

.btn-light {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  height: 40px;
  padding: 0 15px;
  border-radius: 8px;
  border: 1px solid var(--ce2e8f1);
  background: var(--s-card);
  color: var(--c3d4d66);
  font-size: 14.5px;
  font-weight: 600;
  cursor: pointer;
}

.btn-light:hover:not(:disabled) {
  background: var(--cf8fafc);
}

.btn-light:disabled {
  opacity: .5;
  cursor: not-allowed;
}

.list {
  overflow: hidden;
}

.list-head {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 18px;
  border-bottom: 1px solid var(--ceef1f6);
  color: var(--c16233d);
}

.list-title {
  font-size: 14.5px;
  font-weight: 600;
}

.list-note {
  font-size: 13.5px;
  color: var(--c8b95a6);
}

.row {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 18px;
  border: 0;
  border-top: 1px solid var(--cf2f5f9);
  background: var(--s-card);
  text-align: left;
  cursor: pointer;
  animation: riseIn .3s var(--ease) backwards;
  transition: background .16s ease;
}

.row:first-of-type {
  border-top: 0;
}

.row:hover {
  background: var(--cf4f7fb);
}

.row.unread {
  background: var(--cf4f7fb);
}

.row.unread:hover {
  background: var(--cf0f3f8);
}

.n-icon {
  width: 38px;
  height: 38px;
  flex: 0 0 38px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.n-body {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.n-title {
  font-size: 15px;
  font-weight: 600;
  color: var(--c16233d);
}

.n-text {
  font-size: 13.5px;
  line-height: 1.45;
  color: var(--c3d4d66);
}

.n-when {
  font-size: 13px;
  color: var(--c8b95a6);
  white-space: nowrap;
}

.n-open {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 13.5px;
  font-weight: 600;
  color: var(--c23568f);
  white-space: nowrap;
}

.n-dot {
  width: 8px;
  height: 8px;
  flex: 0 0 8px;
  border-radius: 50%;
  background: var(--c23568f);
}

.empty {
  padding: 44px 20px;
  text-align: center;
}

.empty-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: var(--cf0f3f8);
  color: var(--c8b95a6);
  margin-bottom: 12px;
}

.empty-title {
  font-size: 15.5px;
  font-weight: 600;
  color: var(--c16233d);
}

.empty-text {
  margin-top: 4px;
  font-size: 14px;
  color: var(--c8b95a6);
}

@media (max-width: 720px) {
  .n-open,
  .n-when {
    display: none;
  }
}
</style>
