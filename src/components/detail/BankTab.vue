<script setup>
/* «Bank amaliyotlari» tabi — bank bilan almashinuv lentasi va bloklangan rekvizitlar. */
import { ref, computed } from 'vue'
import AppIcon from '@/components/ui/AppIcon.vue'
import DetailPanel from '@/components/detail/DetailPanel.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import BlockedRequisites from '@/components/detail/BlockedRequisites.vue'
import { formatAmount } from '@/data/detail'
import { useUi } from '@/stores/useUi'

const props = defineProps({
  // detailFor() natijasi (namuna)
  data: { type: Object, required: true },
  // serverdan: { exchange, errors, blocked, blockedTotal }
  api: { type: Object, default: null }
})

// serverdagi javob bo'lsa — undan, aks holda namunadan
const exchange = computed(() => props.api?.exchange ?? props.data.exchange ?? [])
const blockedRows = computed(() => props.api?.blocked ?? props.data.blocked ?? [])

const emit = defineEmits(['fix'])

const { toast } = useUi()

// hodisa turi -> rang
const TONE = {
  info: { fg: 'var(--c23568f)', bg: 'var(--ce8eef7)' },
  ok: { fg: 'var(--c1a6e4b)', bg: 'var(--ce3f2e9)' },
  bad: { fg: 'var(--ca52220)', bg: 'var(--cfceceb)' },
  idle: { fg: 'var(--c66748c)', bg: 'var(--cf0f3f8)' }
}

/* ---------- bloklangan rekvizitlar ---------- */
const blockedOpen = ref(false)
const blockedTop = computed(() => blockedRows.value.slice(0, 5))
const blockedShown = computed(() => formatAmount(blockedTop.value.reduce((s, r) => s + r.raw, 0)))
</script>

<template>
  <DetailPanel icon="bank" :title="$t('detail.bank.title')">
    <article
      v-for="(e, i) in exchange"
      :key="e.id"
      class="event"
      :class="e.tone"
      :style="{ animationDelay: `${i * 45}ms` }"
    >
      <div class="event-head">
        <span class="event-icon" :style="{ background: TONE[e.tone].bg, color: TONE[e.tone].fg }">
          <AppIcon :name="e.icon" :size="17" />
        </span>

        <span v-if="e.route" class="event-time mono">
          <AppIcon name="clock" :size="13" />
          {{ e.time }}
        </span>

        <span class="event-title">{{ $t(`detail.bank.events.${e.kind}`) }}</span>
        <span v-if="e.code" class="tag code mono">{{ e.code }}</span>
        <span class="tag">{{ $t('detail.bank.attempt', e.attempt) }}</span>

        <div class="spacer" />

        <span v-if="e.route" class="event-route mono">{{ $t('detail.bank.route') }}</span>
        <span v-else class="event-time mono">{{ e.time }}</span>
      </div>

      <div v-if="e.body === 'sent'" class="event-body">
        <div class="event-field">
          <div class="field-label">{{ $t('detail.bank.sentAt') }}</div>
          <div class="field-value mono">{{ e.time }}</div>
        </div>
        <div class="event-field">
          <div class="field-label">{{ $t('detail.bank.requestId') }}</div>
          <div class="field-value mono">{{ e.requestId }}</div>
        </div>
        <div class="event-field grow">
          <div class="field-label">{{ $t('detail.bank.requisites') }}</div>
          <div class="req-chips">
            <span v-for="r in e.requisites" :key="r.card" class="req-chip">
              <span class="mono">{{ r.card }}</span>
              <span class="req-chip-bank">{{ r.bank }}</span>
            </span>
          </div>
        </div>
      </div>

      <div v-else-if="e.body === 'blocked'" class="event-body column">
        <div class="blk">
          <div class="blk-head">
            <span class="blk-title">{{ $t('blocked.title') }}</span>
            <div class="spacer" />
            <button type="button" class="blk-excel" @click="toast($t('blocked.exported'))">
              <AppIcon name="excel" :size="16" />
              Excel
            </button>
          </div>

          <div class="blk-grid head">
            <span>#</span>
            <span>{{ $t('blocked.colCard') }}</span>
            <span>{{ $t('blocked.colKind') }}</span>
            <span>{{ $t('filters.groups.bank') }}</span>
            <span class="right">{{ $t('table.amount') }}</span>
            <span>{{ $t('blocked.colCur') }}</span>
          </div>

          <div v-for="b in blockedTop" :key="b.card" class="blk-grid">
            <span class="mono dim">{{ b.n }}</span>
            <span class="mono blk-card">{{ b.card }}</span>
            <span>
              <span class="blk-kind" :class="{ acc: b.account }">
                <AppIcon :name="b.account ? 'accountBank' : 'card'" :size="17" />
                {{ $t(`blocked.kinds.${b.account ? 'account' : 'card'}`) }}
              </span>
            </span>
            <span class="truncate blk-bank">{{ b.bank }}</span>
            <span class="right mono blk-sum">{{ b.sum }}</span>
            <span><span class="blk-cur mono">{{ b.cur }}</span></span>
          </div>

          <div class="blk-foot">
            <button type="button" class="blk-all" @click="blockedOpen = true">
              {{ $t('blocked.allCount', blockedRows.length) }}
              <AppIcon name="chevronRight" :size="17" />
            </button>
            <div class="spacer" />
            <span class="dim">{{ $t('blocked.shown', blockedTop.length) }}</span>
            <span class="mono blk-total">{{ blockedShown }} UZS</span>
          </div>
        </div>
      </div>

      <div v-else-if="e.body === 'returned'" class="event-body column">
        <div class="event-row">
          <div class="event-field">
            <div class="field-label">{{ $t('detail.bank.staff') }}</div>
            <div class="field-value">{{ e.staff.name }}</div>
          </div>
          <div class="event-field">
            <div class="field-label">{{ $t('detail.bank.phone') }}</div>
            <div class="field-value mono">{{ e.staff.phone }}</div>
          </div>
        </div>

        <div class="note">
          <div class="note-head">
            <AppIcon name="warn" :size="15" />
            {{ $t('detail.bank.noteTitle') }}
          </div>
          <p class="note-text">{{ $t('detail.bank.note', e.note) }}</p>
          <button v-if="data.action === 'fix'" type="button" class="note-fix" @click="emit('fix')">
            {{ $t('detail.bank.fixField') }}
          </button>
        </div>
      </div>
    </article>

    <EmptyState
      v-if="!exchange.length"
      icon="send"
      :title="$t('detail.bank.emptyTitle')"
      :text="$t('detail.bank.emptyText')"
    />
  </DetailPanel>

  <BlockedRequisites v-if="blockedOpen" :rows="blockedRows" @close="blockedOpen = false" />
</template>

<style scoped>

.blk {
  border: 1px solid var(--ce2e8f1);
  border-radius: 10px;
  overflow: hidden;
}

.blk-head {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 11px 12px;
  background: var(--cf8fafc);
  border-bottom: 1px solid var(--ce2e8f1);
}

.blk-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--c16233d);
}

.blk-excel {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  height: 30px;
  padding: 0 11px;
  border-radius: 7px;
  border: 1px solid var(--ce2e8f1);
  background: var(--s-card);
  color: var(--c1a6e4b);
  font-size: 13.5px;
  font-weight: 600;
  cursor: pointer;
}

.blk-excel:hover {
  border-color: var(--cc3cbd8);
  background: var(--cf8fafc);
}

.blk-grid {
  display: grid;
  grid-template-columns: 48px minmax(150px, 200px) 108px minmax(120px, 1fr) 140px 78px;
  align-items: center;
  border-bottom: 1px solid var(--cf2f5f9);
}

.blk-grid > span {
  padding: 11px 12px;
  min-width: 0;
  font-size: 14px;
  color: var(--c3d4d66);
}

.blk-grid.head > span {
  padding-top: 10px;
  padding-bottom: 10px;
  font-size: 13px;
  font-weight: 600;
  color: var(--c8b95a6);
  background: var(--s-card);
}

.blk-grid .right {
  text-align: right;
}

.blk-card {
  font-size: 14.5px;
  font-weight: 600;
  color: var(--c1c2b45);
}

.blk-sum {
  font-size: 16px;
  font-weight: 600;
  color: var(--c1c2b45);
}

.blk-kind {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 24px;
  padding: 0 8px;
  border-radius: 6px;
  background: var(--ce8eef7);
  border: 1px solid var(--kc9d9ec);
  font-size: 13px;
  color: var(--c23568f);
  white-space: nowrap;
}

.blk-kind.acc {
  background: var(--cefeafa);
  border-color: var(--cd8cff2);
  color: var(--c5b3fa8);
}

.blk-cur {
  display: inline-flex;
  align-items: center;
  height: 24px;
  padding: 0 8px;
  border-radius: 6px;
  background: var(--ce6f2ec);
  border: 1px solid var(--cc8e2d4);
  font-size: 12.5px;
  font-weight: 600;
  letter-spacing: .03em;
  color: var(--c1a6e4b);
}

.blk-foot {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 11px 12px;
  background: var(--cf8fafc);
  flex-wrap: wrap;
}

.blk-all {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  border: 0;
  padding: 0;
  background: transparent;
  font-size: 14px;
  font-weight: 600;
  color: var(--c23568f);
  cursor: pointer;
}

.blk-all:hover {
  text-decoration: underline;
}

.blk-total {
  font-size: 16px;
  font-weight: 700;
  color: var(--c1c2b45);
}

.note-fix {
  align-self: flex-start;
  height: 38px;
  padding: 0 16px;
  border-radius: 8px;
  border: 1px solid var(--btn);
  background: var(--btn);
  color: #fff;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
}

.note-fix:hover {
  filter: brightness(1.14);
}

.field-label {
  font-size: 13.5px;
  color: var(--c8b95a6);
}

.field-value {
  margin-top: 4px;
  font-size: 15.5px;
  color: var(--c16233d);
  overflow-wrap: anywhere;
}

.event {
  border: 1px solid var(--ce2e8f1);
  border-left: 3px solid var(--c23568f);
  border-radius: 10px;
  margin-bottom: 12px;
  overflow: hidden;
  animation: riseIn .28s var(--ease) backwards;
}

.event:last-child {
  margin-bottom: 0;
}

.event.bad {
  border-left-color: var(--ca52220);
  background: var(--cfef7f6);
}

.event.ok {
  border-left-color: var(--c1a6e4b);
}

.event.idle {
  border-left-color: var(--c98a3b6);
}

.event-head {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 14px;
  flex-wrap: wrap;
}

.event-icon {
  width: 32px;
  height: 32px;
  flex: 0 0 32px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.event-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--c16233d);
}

.event-time {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 3px 9px;
  border-radius: 7px;
  background: var(--cf0f3f8);
  border: 1px solid var(--ce2e8f1);
  font-size: 13.5px;
  color: var(--c66748c);
  white-space: nowrap;
}

.event-route {
  font-size: 13.5px;
  color: var(--c8b95a6);
  white-space: nowrap;
}

.event-body {
  display: flex;
  gap: 26px;
  padding: 13px 14px 14px;
  border-top: 1px solid var(--ceef1f6);
  flex-wrap: wrap;
}

.event-body.column {
  flex-direction: column;
  gap: 14px;
}

.event-row {
  display: flex;
  gap: 26px;
  flex-wrap: wrap;
}

.event-field.grow {
  flex: 1;
  min-width: 240px;
}

.req-chips {
  display: flex;
  gap: 10px;
  margin-top: 5px;
  flex-wrap: wrap;
}

.req-chip {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 6px 12px;
  border-radius: 8px;
  border: 1px solid var(--ce2e8f1);
  background: var(--cf8fafc);
  font-size: 15px;
  color: var(--c16233d);
}

.req-chip-bank {
  font-size: 13px;
  color: var(--c8b95a6);
}

.note {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 10px;
  border-radius: 8px;
  border: 1px solid var(--cf2cfcd);
  background: var(--cfceceb);
  padding: 11px 13px;
}

.note-head {
  display: flex;
  align-items: center;
  gap: 7px;
  font-size: 12.5px;
  font-weight: 700;
  letter-spacing: .06em;
  text-transform: uppercase;
  color: var(--ca52220);
}

.note-text {
  margin: 0;
  font-size: 14.5px;
  line-height: 1.55;
  color: var(--c3d4d66);
}
.tag {
  padding: 3px 9px;
  border-radius: 8px;
  background: rgba(102, 112, 128, .16);
  border: 0;
  font-size: 13.5px;
  color: var(--c667080);
  white-space: nowrap;
}

.tag.code {
  padding: 3px 8px;
  border-radius: 4px;
  background: var(--ce8eef7);
  font-size: 12.5px;
  font-weight: 600;
  color: var(--c23568f);
}
</style>
