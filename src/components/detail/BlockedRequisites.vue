<script setup>
/* Bloklangan rekvizitlar — bank amaliyotlaridagi «Barchasini ko'rish» dan ochiladi. */
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import AppIcon from '@/components/ui/AppIcon.vue'
import { formatAmount } from '@/data/detail'
import { useUi } from '@/stores/useUi'

const props = defineProps({
  rows: { type: Array, required: true }
})

const emit = defineEmits(['close'])

const { t } = useI18n()
const { toast } = useUi()

const query = ref('')

const list = computed(() => {
  const q = query.value.trim().toLowerCase()
  if (!q) return props.rows
  return props.rows.filter((r) => `${r.card} ${r.bank} ${r.cur}`.toLowerCase().includes(q))
})

const stats = computed(() => ({
  cards: props.rows.filter((r) => !r.account).length,
  accounts: props.rows.filter((r) => r.account).length,
  total: formatAmount(props.rows.reduce((s, r) => s + r.raw, 0))
}))

// valyuta rangi — dizayndagi CUR jadvali
const CUR_TONE = {
  UZS: { fg: 'var(--c1a6e4b)', bg: 'var(--ce6f2ec)', bd: 'var(--cc8e2d4)' },
  RUB: { fg: 'var(--c23568f)', bg: 'var(--ce8eef7)', bd: 'var(--kc9d9ec)' },
  USD: { fg: 'var(--c8a6410)', bg: 'var(--cfdf6e8)', bd: 'var(--cf2e3c2)' }
}

const curTone = (cur) => CUR_TONE[cur] || CUR_TONE.UZS

function exportAll() {
  toast(t('blocked.exported'))
}
</script>

<template>
  <div class="root">
    <div class="scrim" @click="emit('close')" />

    <div class="sheet">
      <header class="head">
        <AppIcon name="lock" :size="28" />
        <span class="title">{{ $t('blocked.title') }}</span>
        <span class="count mono">{{ rows.length }}</span>
        <div class="spacer" />
        <button type="button" class="head-btn" @click="exportAll">
          <AppIcon name="excel" :size="16" />
          Excel
        </button>
        <button type="button" class="close" :title="$t('common.close')" @click="emit('close')">
          <AppIcon name="close" :size="24" />
        </button>
      </header>

      <div class="tools">
        <label class="search">
          <AppIcon name="search" :size="20" />
          <input v-model="query" type="search" :placeholder="$t('blocked.searchPh')">
        </label>

        <span class="chip cards">
          {{ $t('blocked.cards') }}<span class="mono">{{ stats.cards }}</span>
        </span>
        <span class="chip accounts">
          {{ $t('blocked.accounts') }}<span class="mono">{{ stats.accounts }}</span>
        </span>
        <span class="chip total">
          {{ $t('blocked.sumShort') }}<span class="mono">{{ stats.total }}</span>
        </span>
      </div>

      <div class="body thin-scroll">
        <div class="grid-head">
          <span class="c-n">#</span>
          <span class="c-card">{{ $t('blocked.colCard') }}</span>
          <span class="c-kind">{{ $t('blocked.colKind') }}</span>
          <span class="c-bank">{{ $t('filters.groups.bank') }}</span>
          <span class="c-cur">{{ $t('blocked.colCur') }}</span>
          <span class="c-sum">{{ $t('table.amount') }}</span>
        </div>

        <div
          v-for="(r, i) in list"
          :key="r.card"
          class="grid-row"
          :class="{ odd: i % 2 === 1 }"
        >
          <span class="c-n mono">{{ r.n }}</span>
          <span class="c-card mono">{{ r.card }}</span>
          <span class="c-kind">
            <span class="kind" :class="{ acc: r.account }">
              <AppIcon :name="r.account ? 'accountBank' : 'card'" :size="18" />
              {{ $t(`blocked.kinds.${r.account ? 'account' : 'card'}`) }}
            </span>
          </span>
          <span class="c-bank truncate">{{ r.bank }}</span>
          <span class="c-cur">
            <span
              class="cur mono"
              :style="{ color: curTone(r.cur).fg, background: curTone(r.cur).bg, borderColor: curTone(r.cur).bd }"
            >{{ r.cur }}</span>
          </span>
          <span class="c-sum mono">{{ r.sum }}</span>
        </div>

        <div v-if="!list.length" class="no-match">{{ $t('blocked.noMatch') }}</div>
      </div>

      <footer class="foot">
        <span class="foot-count">{{ $t('blocked.footCount', rows.length) }}</span>
        <div class="spacer" />
        <span class="foot-label">{{ $t('blocked.footSum') }}</span>
        <span class="foot-sum mono">{{ stats.total }}</span>
      </footer>
    </div>
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

.sheet {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 1180px;
  max-width: calc(100vw - 60px);
  max-height: calc(100vh - 110px);
  display: flex;
  flex-direction: column;
  background: var(--s-card);
  border-radius: 12px;
  box-shadow: 0 20px 60px rgba(5, 12, 28, .32);
  overflow: hidden;
}

/* ---------- sarlavha ---------- */
.head {
  display: flex;
  align-items: center;
  gap: 14px;
  height: 72px;
  flex: 0 0 72px;
  padding: 0 24px;
  background: linear-gradient(90deg, #050c1c 0%, #12213c 100%);
  color: #c9d9ec;
}

.title {
  font-size: 16px;
  font-weight: 600;
  letter-spacing: .06em;
  text-transform: uppercase;
  color: #fff;
}

.count {
  padding: 3px 9px;
  border-radius: 20px;
  background: rgba(255, 255, 255, .14);
  font-size: 13.5px;
  color: #e7ecf5;
}

.spacer {
  flex: 1;
}

.head-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  height: 34px;
  padding: 0 13px;
  border-radius: 7px;
  border: 1px solid rgba(255, 255, 255, .34);
  background: rgba(255, 255, 255, .1);
  color: #fff;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
}

.head-btn:hover {
  background: rgba(255, 255, 255, .2);
}

.close {
  width: 34px;
  height: 34px;
  flex: 0 0 34px;
  border-radius: 7px;
  border: 1px solid rgba(255, 255, 255, .28);
  background: transparent;
  color: #e7ecf5;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.close:hover {
  background: rgba(255, 255, 255, .12);
}

/* ---------- qidiruv satri ---------- */
.tools {
  display: flex;
  align-items: center;
  gap: 9px;
  flex: 0 0 auto;
  padding: 18px 30px;
  background: var(--cf8fafc);
  border-bottom: 1px solid var(--ce2e8f1);
  flex-wrap: wrap;
}

.search {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  min-width: 240px;
  height: 36px;
  padding: 0 12px;
  border-radius: 8px;
  border: 1px solid var(--ce2e8f1);
  background: var(--s-card);
  color: var(--ca3adbd);
}

.search input {
  flex: 1;
  min-width: 0;
  height: 34px;
  border: 0;
  outline: none;
  background: transparent;
  font-family: inherit;
  font-size: 14.5px;
  color: var(--c1c2b45);
}

.chip {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  height: 28px;
  padding: 0 11px;
  border-radius: 7px;
  border: 1px solid var(--ce2e8f1);
  background: var(--cf0f3f8);
  font-size: 13.5px;
  color: var(--c3d4d66);
  white-space: nowrap;
}

.chip .mono {
  font-weight: 600;
}

.chip.accounts {
  background: var(--cfdf6e8);
  border-color: var(--cf2e3c2);
  color: var(--c8a6410);
}

.chip.total {
  background: var(--ce6f2ec);
  border-color: var(--cc8e2d4);
  color: var(--c1a6e4b);
}

/* ---------- jadval ---------- */
.body {
  flex: 1;
  min-height: 0;
  overflow: auto;
  padding: 0 18px;
}

.grid-head,
.grid-row {
  display: grid;
  grid-template-columns: 62px 224px 118px minmax(140px, 1fr) 96px 166px;
  align-items: center;
}

.grid-head {
  position: sticky;
  top: 0;
  z-index: 2;
  background: var(--cf8fafc);
  border-bottom: 1px solid var(--ce2e8f1);
}

.grid-head > span {
  padding: 13px 12px;
  font-size: 13px;
  font-weight: 600;
  color: var(--c3d4d66);
}

.grid-head .c-n {
  color: var(--c8b95a6);
}

.grid-row {
  border-bottom: 1px solid var(--cf2f5f9);
  background: var(--s-card);
}

.grid-row.odd {
  background: var(--cfbfcfe);
}

.grid-row > span {
  padding: 16px 12px;
  min-width: 0;
}

.c-n {
  font-size: 13.5px;
  color: var(--ca3adbd);
}

.c-card {
  font-size: 14.5px;
  font-weight: 600;
  color: var(--c1c2b45);
}

.c-bank {
  font-size: 14px;
  color: var(--c3d4d66);
}

.c-sum {
  text-align: right;
  font-size: 16px;
  font-weight: 600;
  color: var(--c1c2b45);
}

.kind {
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

.kind.acc {
  background: var(--cefeafa);
  border-color: var(--cd8cff2);
  color: var(--c5b3fa8);
}

.cur {
  display: inline-flex;
  align-items: center;
  height: 24px;
  padding: 0 8px;
  border-radius: 6px;
  border: 1px solid;
  font-size: 12.5px;
  font-weight: 600;
  letter-spacing: .03em;
}

.no-match {
  padding: 40px 12px;
  text-align: center;
  font-size: 14.5px;
  color: var(--c98a3b6);
}

/* ---------- pastki satr ---------- */
.foot {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 0 0 auto;
  padding: 18px 30px;
  background: var(--cf8fafc);
  border-top: 1px solid var(--ce2e8f1);
  flex-wrap: wrap;
}

.foot-count {
  font-size: 14px;
  color: var(--c66748c);
}

.foot-label {
  font-size: 13.5px;
  color: var(--c66748c);
}

.foot-sum {
  font-size: 16px;
  font-weight: 700;
  color: var(--c1c2b45);
}

@media (max-width: 900px) {
  .sheet {
    width: calc(100vw - 24px);
    max-width: calc(100vw - 24px);
  }

  .grid-head,
  .grid-row {
    grid-template-columns: 44px minmax(150px, 1fr) 108px 90px 120px;
  }

  .grid-head .c-bank,
  .grid-row .c-bank {
    display: none;
  }
}
</style>
