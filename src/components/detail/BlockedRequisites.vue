<script setup>
/* Bloklangan rekvizitlar — ariza tafsilotidagi «Barchasini ko'rish» dan ochiladi. */
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import AppIcon from '@/components/ui/AppIcon.vue'
import { parseAmount, formatAmount } from '@/data/detail'
import { useUi } from '@/stores/useUi'

const props = defineProps({
  requisites: { type: Array, required: true }
})

const emit = defineEmits(['close'])

const { t } = useI18n()
const { toast } = useUi()

const rows = computed(() => props.requisites.map((r, i) => ({
  n: i + 1,
  card: r.card,
  kind: r.card.replace(/\D/g, '').length > 16 ? 'account' : 'card',
  bank: r.bank,
  cur: 'UZS',
  sum: r.sum
})))

const stats = computed(() => ({
  cards: rows.value.filter((r) => r.kind === 'card').length,
  accounts: rows.value.filter((r) => r.kind === 'account').length,
  total: formatAmount(rows.value.reduce((s, r) => s + parseAmount(r.sum), 0))
}))
</script>

<template>
  <div class="root" @click.self="emit('close')">
    <div class="sheet">
      <header class="head dark-bar">
        <AppIcon name="lock" :size="24" />
        <span class="title">{{ $t('blocked.title') }}</span>
        <span class="count mono">{{ $t('blocked.count', rows.length) }}</span>
        <div class="spacer" />
        <button type="button" class="head-btn" @click="toast(t('blocked.exported'))">
          <AppIcon name="excel" :size="17" />
          Excel
        </button>
        <button type="button" class="close" @click="emit('close')">
          <AppIcon name="close" :size="20" />
        </button>
      </header>

      <div class="stats">
        <div class="stat">
          <span class="stat-k">{{ $t('blocked.cards') }}</span>
          <span class="stat-v mono">{{ stats.cards }}</span>
        </div>
        <div class="stat">
          <span class="stat-k">{{ $t('blocked.accounts') }}</span>
          <span class="stat-v mono">{{ stats.accounts }}</span>
        </div>
        <div class="stat">
          <span class="stat-k">{{ $t('blocked.sum') }}</span>
          <span class="stat-v mono strong">{{ stats.total }}</span>
        </div>
      </div>

      <div class="body thin-scroll">
        <table class="grid">
          <thead>
            <tr>
              <th style="width:44px">#</th>
              <th>{{ $t('blocked.colCard') }}</th>
              <th style="width:110px">{{ $t('blocked.colKind') }}</th>
              <th style="width:150px">{{ $t('filters.groups.bank') }}</th>
              <th style="width:90px">{{ $t('blocked.colCur') }}</th>
              <th style="width:140px" class="right">{{ $t('table.amount') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="r in rows" :key="r.card">
              <td class="mono muted">{{ r.n }}</td>
              <td>
                <span class="card-cell">
                  <AppIcon :name="r.kind === 'card' ? 'card' : 'accountBank'" :size="18" />
                  <span class="mono">{{ r.card }}</span>
                </span>
              </td>
              <td>{{ $t(`blocked.kinds.${r.kind}`) }}</td>
              <td>{{ r.bank }}</td>
              <td class="mono">{{ r.cur }}</td>
              <td class="right mono strong">{{ r.sum }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <footer class="foot">
        <span>{{ $t('blocked.footCount', rows.length) }}</span>
        <div class="spacer" />
        <span class="foot-label">{{ $t('blocked.footSum') }}</span>
        <span class="foot-sum mono">{{ stats.total }} <span class="dim">{{ $t('detail.sum') }}</span></span>
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
  width: 820px;
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
  gap: 11px;
  height: 52px;
  padding: 0 16px;
  color: #c9d9ec;
}

.title {
  font-size: 15px;
  font-weight: 600;
  letter-spacing: .06em;
  text-transform: uppercase;
  color: #fff;
}

.count {
  font-size: 13px;
  color: #8fa4c2;
}

.spacer {
  flex: 1;
}

.head-btn {
  display: flex;
  align-items: center;
  gap: 7px;
  height: 32px;
  padding: 0 12px;
  border-radius: 6px;
  border: 1px solid rgba(255, 255, 255, .34);
  background: rgba(255, 255, 255, .10);
  color: #fff;
  font-size: 14px;
  cursor: pointer;
}

.head-btn:hover {
  background: rgba(255, 255, 255, .2);
}

.close {
  border: 0;
  background: transparent;
  color: #c9d9ec;
  cursor: pointer;
  display: flex;
}

.close:hover {
  color: #fff;
}

.stats {
  display: flex;
  gap: 26px;
  padding: 13px 18px;
  background: var(--cf8fafc);
  border-bottom: 1px solid var(--ce2e8f1);
  flex-wrap: wrap;
}

.stat-k {
  display: block;
  font-size: 13px;
  color: var(--c8b95a6);
}

.stat-v {
  display: block;
  margin-top: 3px;
  font-size: 18px;
  font-weight: 600;
  color: var(--c16233d);
}

.body {
  flex: 1;
  min-height: 0;
  overflow: auto;
}

.grid {
  width: 100%;
  min-width: 640px;
  border-collapse: collapse;
}

th {
  padding: 11px 13px;
  font-size: 12.5px;
  font-weight: 700;
  letter-spacing: .04em;
  text-transform: uppercase;
  color: var(--c8b95a6);
  text-align: left;
  background: var(--s-card);
  border-bottom: 1px solid var(--ce5e7eb);
  position: sticky;
  top: 0;
}

td {
  padding: 12px 13px;
  font-size: 14.5px;
  color: var(--c3d4d66);
  border-bottom: 1px solid var(--cf2f5f9);
}

.right {
  text-align: right;
}

.muted {
  color: var(--c98a3b6);
}

.strong {
  font-weight: 600;
  color: var(--c16233d);
}

.card-cell {
  display: inline-flex;
  align-items: center;
  gap: 9px;
  color: var(--c23568f);
}

.card-cell .mono {
  font-size: 14.5px;
  font-weight: 600;
  color: var(--c16233d);
}

.foot {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 18px;
  background: var(--cfafbfc);
  border-top: 1px solid var(--ce5e7eb);
  font-size: 14px;
  color: var(--c8b95a6);
  flex-wrap: wrap;
}

.foot-label {
  font-size: 14px;
  color: var(--c66748c);
}

.foot-sum {
  font-size: 17px;
  font-weight: 700;
  color: var(--c16233d);
}

.dim {
  color: var(--c8b95a6);
  font-weight: 500;
}
</style>
