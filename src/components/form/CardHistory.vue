<script setup>
/* Karta tarixi — formadagi takroriylik ogohlantirishidan ochiladi. */
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import AppIcon from '@/components/ui/AppIcon.vue'
import { useUi } from '@/stores/useUi'

const props = defineProps({
  card: { type: String, required: true },
  rows: { type: Array, required: true }
})

const emit = defineEmits(['close', 'open'])

const { t } = useI18n()
const { toast } = useUi()

const items = computed(() => props.rows.map((r) => ({
  id: r.id,
  material: r.material,
  status: r.status,
  time: r.time,
  person: r.name,
  sum: r.amount
})))

function copy(text) {
  try {
    navigator.clipboard?.writeText(text)
  } catch { /* clipboard yopiq bo'lishi mumkin */ }
  toast(t('cardHistory.copied', { text }))
}
</script>

<template>
  <div class="root" @click.self="emit('close')">
    <div class="sheet">
      <header class="head">
        <span class="head-ico"><AppIcon name="warn" :size="22" /></span>
        <div class="head-text">
          <span class="title">{{ $t('cardHistory.title') }}</span>
          <span class="card mono">{{ $t('cardHistory.card') }} · {{ card }}</span>
        </div>
        <div class="spacer" />
        <button type="button" class="close" @click="emit('close')">
          <AppIcon name="close" :size="20" />
        </button>
      </header>

      <div class="body thin-scroll">
        <p class="lead">{{ $t('cardHistory.lead') }}</p>

        <div class="list-head">
          <span class="list-title">{{ $t('cardHistory.previous') }}</span>
          <span class="chip">{{ $t('cardHistory.count', items.length) }}</span>
        </div>

        <button
          v-for="it in items"
          :key="it.id"
          type="button"
          class="item"
          @click="emit('open', it.id)"
        >
          <div class="item-head">
            <span class="badge" :class="it.status">{{ $t(`status.${it.status}.short`) }}</span>
            <span class="mono item-id">{{ it.id }}</span>
            <span class="copy" :title="$t('cardHistory.copy')" @click.stop="copy(it.id)">
              <AppIcon name="copy" :size="15" />
            </span>
            <div class="spacer" />
            <span class="mono item-material">{{ it.material || $t('table.noMaterial') }}</span>
          </div>

          <div class="item-grid">
            <span class="cell">
              <span class="cell-k">{{ $t('table.time') }}</span>
              <span class="cell-v mono">{{ it.time }}</span>
            </span>
            <span class="cell">
              <span class="cell-k">{{ $t('detail.applicant.title') }}</span>
              <span class="cell-v truncate">{{ it.person }}</span>
            </span>
            <span class="cell right">
              <span class="cell-k">{{ $t('table.amount') }}</span>
              <span class="cell-v mono strong">{{ it.sum }}</span>
            </span>
          </div>
        </button>
      </div>

      <footer class="foot">
        <span class="foot-note">{{ $t('cardHistory.foot') }}</span>
        <div class="spacer" />
        <button type="button" class="btn-dark" @click="emit('close')">{{ $t('cardHistory.ok') }}</button>
      </footer>
    </div>
  </div>
</template>

<style scoped>
.root {
  position: fixed;
  inset: 0;
  z-index: 130;
  background: rgba(5, 12, 28, .42);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
}

.sheet {
  width: 620px;
  max-width: 100%;
  max-height: 88vh;
  display: flex;
  flex-direction: column;
  background: var(--s-card);
  border-radius: 14px;
  box-shadow: 0 14px 34px rgba(5, 12, 28, .18);
  overflow: hidden;
}

.head {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 18px;
  background: var(--cfff5e9);
  border-bottom: 1px solid var(--cf6dfc0);
}

.head-ico {
  width: 40px;
  height: 40px;
  flex: 0 0 40px;
  border-radius: 11px;
  background: var(--s-card);
  border: 1px solid var(--cf6dfc0);
  color: var(--ce07c1e);
  display: flex;
  align-items: center;
  justify-content: center;
}

.head-text {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.title {
  font-size: 16px;
  font-weight: 700;
  color: var(--cb45309);
}

.card {
  font-size: 13.5px;
  color: var(--c3d4d66);
}

.spacer {
  flex: 1;
}

.close {
  border: 0;
  background: transparent;
  color: var(--c66748c);
  cursor: pointer;
  display: flex;
}

.body {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: 16px 18px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.lead {
  margin: 0;
  font-size: 14.5px;
  line-height: 1.6;
  color: var(--c3d4d66);
}

.list-head {
  display: flex;
  align-items: center;
  gap: 9px;
  margin-top: 4px;
}

.list-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--c3d4d66);
}

.chip {
  padding: 2px 9px;
  border-radius: 20px;
  background: var(--cf0f3f8);
  border: 1px solid var(--ce2e8f1);
  font-size: 12.5px;
  color: var(--c66748c);
}

.item {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 12px 13px;
  border-radius: 10px;
  border: 1px solid var(--ce2e8f1);
  background: var(--s-card);
  cursor: pointer;
  text-align: left;
  transition: border-color .16s ease, background .16s ease;
}

.item:hover {
  border-color: var(--c23568f);
  background: var(--cf8fafc);
}

.item-head {
  display: flex;
  align-items: center;
  gap: 9px;
  flex-wrap: wrap;
}

.badge {
  padding: 3px 9px;
  border-radius: 6px;
  font-size: 12.5px;
  font-weight: 600;
  background: var(--cf0f3f8);
  color: var(--c66748c);
}

.badge.blocked,
.badge.done {
  background: var(--ce3f2e9);
  color: var(--c1a6e4b);
}

.badge.error {
  background: var(--cfceceb);
  color: var(--ca52220);
}

.badge.pending {
  background: var(--cfdf3e3);
  color: var(--c96620a);
}

.item-id {
  font-size: 14.5px;
  font-weight: 600;
  color: var(--c16233d);
}

.item-material {
  font-size: 13px;
  color: var(--c8b95a6);
}

.copy {
  display: inline-flex;
  color: var(--c98a3b6);
  cursor: pointer;
}

.copy:hover {
  color: var(--c23568f);
}

.item-grid {
  display: grid;
  grid-template-columns: 150px 1fr 140px;
  gap: 12px;
}

.cell {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.cell.right {
  text-align: right;
}

.cell-k {
  font-size: 12.5px;
  color: var(--c8b95a6);
}

.cell-v {
  font-size: 14px;
  color: var(--c3d4d66);
}

.strong {
  font-weight: 600;
  color: var(--c16233d);
}

.foot {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 18px;
  background: var(--cfafbfc);
  border-top: 1px solid var(--ce5e7eb);
  flex-wrap: wrap;
}

.foot-note {
  flex: 1;
  min-width: 200px;
  font-size: 13.5px;
  color: var(--c98a3b6);
}

.btn-dark {
  height: 42px;
  padding: 0 20px;
  border-radius: 11px;
  border: 1px solid var(--btn);
  background: var(--btn);
  color: #fff;
  font-size: 14.5px;
  font-weight: 600;
  cursor: pointer;
}

@media (max-width: 560px) {
  .item-grid {
    grid-template-columns: 1fr;
  }

  .cell.right {
    text-align: left;
  }
}
</style>
