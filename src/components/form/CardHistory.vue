<script setup>
/* Karta tarixi — formadagi takroriylik ogohlantirishidan ochiladigan yon panel. */
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import AppIcon from '@/components/ui/AppIcon.vue'
import StatusPill from '@/components/ui/StatusPill.vue'
import { useUi } from '@/stores/useUi'

const props = defineProps({
  card: { type: String, required: true },
  rows: { type: Array, required: true }
})

const emit = defineEmits(['close', 'open'])

const { t } = useI18n()
const { toast } = useUi()

const pad = (n) => String(n).padStart(2, '0')

// "04.08.2026 09:12" -> Date
function parseTime(text) {
  const [day, time] = String(text).split(' ')
  const [d, m, y] = day.split('.').map(Number)
  const [h, min] = (time || '00:00').split(':').map(Number)
  return new Date(y, m - 1, d, h, min)
}

// nisbiy vaqt: "3 kun oldin" / "5 soat oldin" / "hozirgina"
function ago(text) {
  const diff = Date.now() - parseTime(text).getTime()
  const min = Math.floor(diff / 60000)
  if (min < 1) return t('cardHistory.ago.now')
  if (min < 60) return t('cardHistory.ago.min', min)
  const hours = Math.floor(min / 60)
  if (hours < 24) return t('cardHistory.ago.hour', hours)
  const days = Math.floor(hours / 24)
  if (days < 30) return t('cardHistory.ago.day', days)
  return t('cardHistory.ago.month', Math.floor(days / 30))
}

const items = computed(() => props.rows.map((r) => ({
  id: r.id,
  material: r.material || t('table.noMaterial'),
  status: r.status,
  time: r.time,
  ago: ago(r.time),
  person: r.name,
  sum: r.amount
})))

// tekshiruv vaqti — panel ochilgan payt
const checkedAt = computed(() => {
  const d = new Date()
  return `${pad(d.getDate())}.${pad(d.getMonth() + 1)}.${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`
})

function copy(text) {
  try {
    navigator.clipboard?.writeText(text)
  } catch { /* clipboard yopiq bo'lishi mumkin */ }
  toast(t('cardHistory.copied', { text }))
}
</script>

<template>
  <div class="root">
    <div class="scrim" @click="emit('close')" />

    <aside class="panel">
      <header class="head">
        <span class="head-ico"><AppIcon name="warn" :size="28" /></span>
        <div class="head-text">
          <span class="title">{{ $t('cardHistory.title') }}</span>
          <span class="card-line">
            <span class="card-k">{{ $t('cardHistory.card') }} ·</span>
            <span class="card-v mono">{{ card }}</span>
          </span>
        </div>
        <button type="button" class="close" :title="$t('common.close')" @click="emit('close')">
          <AppIcon name="close" :size="22" />
        </button>
      </header>

      <div class="body thin-scroll">
        <p class="lead">{{ $t('cardHistory.lead') }}</p>

        <div class="list-head">
          <span class="list-title">{{ $t('cardHistory.previous') }}</span>
          <div class="spacer" />
          <span class="checked-k">{{ $t('cardHistory.checked') }}</span>
          <span class="checked-v mono">{{ checkedAt }}</span>
        </div>

        <div class="list">
          <div v-for="it in items" :key="it.id" class="line">
            <div class="rail">
              <svg width="11" height="13" viewBox="0 0 11 13" class="arrow"><path d="M0 0l10 6.5L0 13z" /></svg>
              <span class="rail-bar" />
            </div>

            <div class="item">
              <div class="item-head">
                <span class="ago">{{ it.ago }}</span>
                <div class="spacer" />
                <StatusPill :status="it.status" size="sm" short />
              </div>

              <div class="item-ids">
                <span class="id-wrap">
                  <button type="button" class="id-btn mono" @click="emit('open', it.id)">{{ it.id }}</button>
                  <button type="button" class="copy" :title="$t('cardHistory.copy')" @click="copy(it.id)">
                    <AppIcon name="copy" :size="20" />
                  </button>
                </span>
                <span class="mat-wrap">
                  <span class="mat mono truncate">{{ it.material }}</span>
                  <button type="button" class="copy" :title="$t('cardHistory.copy')" @click="copy(it.material)">
                    <AppIcon name="copy" :size="20" />
                  </button>
                </span>
              </div>

              <div class="item-grid">
                <div class="cell">
                  <span class="cell-k">{{ $t('table.time') }}</span>
                  <span class="cell-v mono">{{ it.time }}</span>
                </div>
                <div class="cell">
                  <span class="cell-k">{{ $t('form.applicant.title') }}</span>
                  <span class="cell-v truncate">{{ it.person }}</span>
                </div>
                <div class="cell">
                  <span class="cell-k">{{ $t('table.amount') }}</span>
                  <span class="cell-v mono strong">{{ it.sum }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <footer class="foot">
        <span class="foot-note">{{ $t('cardHistory.foot') }}</span>
        <div class="spacer" />
        <button type="button" class="btn-dark" @click="emit('close')">{{ $t('cardHistory.ok') }}</button>
      </footer>
    </aside>
  </div>
</template>

<style scoped>
.root {
  position: fixed;
  inset: 0;
  z-index: 130;
}

.scrim {
  position: absolute;
  inset: 0;
  background: rgba(5, 12, 28, .42);
}

.panel {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  width: 610px;
  max-width: 100%;
  display: flex;
  flex-direction: column;
  background: var(--s-card);
  box-shadow: -10px 0 34px rgba(5, 12, 28, .22);
  animation: slideIn .18s ease-out;
}

/* ---------- sarlavha ---------- */
.head {
  display: flex;
  align-items: flex-start;
  gap: 13px;
  padding: 22px 26px;
  border-bottom: 1px solid var(--ceef1f6);
}

.head-ico {
  width: 42px;
  height: 42px;
  flex: 0 0 42px;
  border-radius: 11px;
  background: var(--cfff5e9);
  border: 1px solid var(--cf6dfc0);
  color: var(--ce07c1e);
  display: flex;
  align-items: center;
  justify-content: center;
}

.head-text {
  flex: 1;
  min-width: 0;
}

.title {
  display: block;
  font-size: 18px;
  font-weight: 600;
  line-height: 1.35;
  color: var(--c16233d);
}

.card-line {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 6px;
}

.card-k {
  font-size: 14px;
  color: var(--c8b95a6);
}

.card-v {
  font-size: 16px;
  font-weight: 600;
  color: var(--c1c2b45);
}

.close {
  width: 32px;
  height: 32px;
  flex: 0 0 32px;
  border-radius: 8px;
  border: 1px solid var(--ce2e8f1);
  background: var(--s-card);
  color: var(--c66748c);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.close:hover {
  background: var(--cf8fafc);
}

/* ---------- tanasi ---------- */
.body {
  flex: 1;
  min-height: 0;
  overflow: auto;
  padding: 22px 26px;
}

.lead {
  margin: 0;
  padding: 13px 15px;
  border-radius: 0 9px 9px 0;
  border: 1px solid var(--cf6dfc0);
  border-left: 3px solid var(--ce07c1e);
  background: var(--cfffaf3);
  font-size: 14.5px;
  line-height: 1.65;
  color: var(--c7a4a10);
}

.list-head {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 22px 0 12px;
}

.list-title {
  font-size: 14.5px;
  font-weight: 600;
  color: var(--c16233d);
}

.checked-k {
  font-size: 13.5px;
  color: var(--c8b95a6);
}

.checked-v {
  font-size: 13.5px;
  color: var(--c66748c);
}

.list {
  display: flex;
  flex-direction: column;
  gap: 13px;
}

.line {
  display: flex;
  align-items: stretch;
  gap: 14px;
}

.rail {
  width: 11px;
  flex: 0 0 11px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding-top: 15px;
}

.arrow {
  fill: var(--ca3adbd);
  flex: 0 0 auto;
}

.rail-bar {
  width: 2px;
  flex: 1;
  min-height: 14px;
  margin: 5px 0 0 1px;
  border-radius: 2px;
  background: var(--ce2e8f1);
}

.item {
  flex: 1;
  min-width: 0;
  border: 1px solid var(--ce2e8f1);
  border-radius: 10px;
  overflow: hidden;
}

.item-head,
.item-ids {
  display: flex;
  align-items: center;
  gap: 11px;
  padding: 0 16px;
  background: var(--cf8fafc);
}

.item-head {
  padding-top: 13px;
}

.item-ids {
  gap: 14px;
  padding-top: 10px;
  padding-bottom: 13px;
  border-bottom: 1px solid var(--ceef1f6);
}

.ago {
  flex: 0 0 auto;
  padding: 4px 10px;
  border-radius: 7px;
  background: var(--ceef1f6);
  font-size: 13.5px;
  color: var(--c66748c);
  white-space: nowrap;
}

.id-wrap,
.mat-wrap {
  display: flex;
  align-items: center;
  gap: 7px;
  min-width: 0;
}

.id-wrap {
  flex: 0 0 auto;
}

.mat-wrap {
  flex: 0 1 auto;
}

.id-btn {
  border: 0;
  padding: 0;
  background: transparent;
  font-size: 14.5px;
  font-weight: 600;
  color: var(--c23568f);
  white-space: nowrap;
  cursor: pointer;
}

.id-btn:hover {
  text-decoration: underline;
}

.mat {
  font-size: 14.5px;
  color: var(--c66748c);
}

.copy {
  border: 0;
  padding: 0;
  background: transparent;
  color: var(--ca3adbd);
  flex: 0 0 auto;
  display: flex;
  cursor: pointer;
}

.copy:hover {
  color: var(--c23568f);
}

.item-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 14px;
  padding: 14px 16px;
}

.cell {
  min-width: 0;
}

.cell-k {
  display: block;
  font-size: 13px;
  color: var(--c8b95a6);
}

.cell-v {
  display: block;
  margin-top: 5px;
  font-size: 14.5px;
  font-weight: 500;
  color: var(--c1c2b45);
}

.cell-v.strong {
  font-weight: 600;
}

/* ---------- pastki satr ---------- */
.foot {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 18px 26px;
  background: var(--cf8fafc);
  border-top: 1px solid var(--ce2e8f1);
  flex-wrap: wrap;
}

.foot-note {
  font-size: 14px;
  color: var(--c66748c);
}

.btn-dark {
  height: 40px;
  padding: 0 22px;
  border-radius: 9px;
  border: 1px solid var(--btn);
  background: var(--btn);
  color: #fff;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
}

@media (max-width: 640px) {
  .item-grid {
    grid-template-columns: 1fr;
  }
}
</style>
