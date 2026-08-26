<script setup>
/* «Tranzaksiyalar» tabi — pul harakati zanjiri, qidiruv va tranzaksiya paneli. */
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import AppIcon from '@/components/ui/AppIcon.vue'
import DetailPanel from '@/components/detail/DetailPanel.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import TransactionPanel from '@/components/detail/TransactionPanel.vue'
import { buildChain, chainStats, chainMatches } from '@/data/chain'
import { useUi } from '@/stores/useUi'

const props = defineProps({
  // detailFor() natijasi (namuna)
  data: { type: Object, required: true },
  // serverdan: { stats, statement, level1 }
  api: { type: Object, default: null }
})

const { t } = useI18n()
const { toast } = useUi()

const row = computed(() => props.data.row)

// zanjir bank javobidan keyin ko'rinadi
const hasChain = computed(() => (props.api
  ? props.api.level1.length > 0
  : row.value.status !== 'new'))
// serverdagi zanjir bo'lsa — undan, aks holda namuna generatoridan
const chain = computed(() => (props.api ? props.api : buildChain(props.data)))
const stats = computed(() => (props.api ? props.api.stats : chainStats(chain.value)))

const txQuery = ref('')
const sortDesc = ref(true)
const openNodes = ref(new Set())

// amaliyot turi bo'yicha filtr — bo'sh qiymat «barcha kategoriyalar»
const txOp = ref('')
const KIDS_SHOWN = 2 // qolganlari «Yana …» bosilganda ochiladi
const moreOpen = ref(new Set())

const txOps = computed(() => {
  const set = new Set()
  const walk = (nodes) => nodes.forEach((n) => { set.add(n.op); walk(n.children) })
  walk(chain.value.level1)
  return [...set]
})

const chainRows = computed(() => {
  const list = chain.value.level1
    .filter((n) => chainMatches(n, txQuery.value))
    .filter((n) => !txOp.value || opMatches(n, txOp.value))
  return [...list].sort((a, b) => (sortDesc.value ? b.raw - a.raw : a.raw - b.raw))
})

// tanlangan tur tugunning o'zida yoki farzandlarida uchraydimi
function opMatches(node, op) {
  if (node.op === op) return true
  return node.children.some((c) => opMatches(c, op))
}

// 2-darajada nechta karta ko'rsatiladi
function shownKids(node) {
  return moreOpen.value.has(node.id) ? node.children : node.children.slice(0, KIDS_SHOWN)
}

function hiddenKids(node) {
  return moreOpen.value.has(node.id) ? 0 : Math.max(0, node.children.length - KIDS_SHOWN)
}

function showMore(id) {
  const next = new Set(moreOpen.value)
  next.add(id)
  moreOpen.value = next
}

function toggleNode(id) {
  const next = new Set(openNodes.value)
  if (next.has(id)) next.delete(id)
  else next.add(id)
  openNodes.value = next
}

const txNode = ref(null)

function openChainCard(node) {
  txNode.value = node
}

function bankFile(action) {
  toast(t(`detail.tx.${action}`, { file: `kochirma_${row.value.id.replace(/\D/g, '').slice(-6)}.xlsx` }))
}
</script>

<template>
  <DetailPanel icon="swap" :title="$t('detail.tx.title')" bare>
  <EmptyState
    v-if="!hasChain"
    icon="swap"
    :title="$t('detail.tx.emptyTitle')"
    :text="$t('detail.tx.emptyText')"
  />

  <template v-else>
    <div class="tx-stats">
      <div class="stat">
        <span class="stat-label">{{ $t('detail.tx.count') }}</span>
        <span class="stat-value mono">{{ stats.count }}</span>
      </div>
      <div class="stat">
        <span class="stat-label">{{ $t('detail.tx.sum') }}</span>
        <span class="stat-value mono">{{ stats.sum }}</span>
      </div>
      <div class="stat">
        <span class="stat-label">{{ $t('detail.tx.cards') }}</span>
        <span class="stat-value mono">{{ stats.cards }}</span>
      </div>
    </div>

    <div class="tx-file">
      <span class="file-ico"><AppIcon name="excel" :size="20" /></span>
      <div class="file-body">
        <div class="file-head">
          <span class="file-name">{{ $t('detail.tx.file', { file: `kochirma_${row.id.replace(/\D/g, '').slice(-6)}.xlsx` }) }}</span>
          <span class="file-tag">XLSX</span>
        </div>
        <div class="file-meta">{{ $t('detail.tx.fileMeta', { time: row.time }) }}</div>
      </div>
      <div class="spacer" />
      <button type="button" class="btn-light" @click="bankFile('viewed')">
        <AppIcon name="eye" :size="17" />
        {{ $t('detail.tx.view') }}
      </button>
      <button type="button" class="btn-dark" @click="bankFile('downloaded')">
        <AppIcon name="download" :size="17" />
        {{ $t('detail.tx.download') }}
      </button>
    </div>

    <div class="tx-tools">
      <span class="tx-search">
        <AppIcon name="search" :size="18" />
        <input v-model="txQuery" class="tx-input" :placeholder="$t('detail.tx.search')" />
      </span>
      <label class="tx-cat">
        <select v-model="txOp" class="tx-cat-select">
          <option value="">{{ $t('detail.tx.allCategories') }}</option>
          <option v-for="op in txOps" :key="op" :value="op">{{ op }}</option>
        </select>
        <AppIcon name="chevronDown" :size="18" />
      </label>
      <button type="button" class="tx-sort" @click="sortDesc = !sortDesc">
        <span class="sort-label">{{ $t('detail.tx.sortAmount') }}</span>
        <AppIcon :name="sortDesc ? 'chevronDown' : 'chevronUp'" :size="18" />
      </button>
    </div>

    <div class="chain">
      <!-- jabrlanuvchi kartasi -->
      <div class="victim">
        <span class="victim-label">
          <AppIcon name="card" :size="17" />
          {{ $t('detail.tx.victim') }}
        </span>
        <span class="victim-card mono">{{ chain.victim.card }}</span>
        <span class="victim-bank">{{ chain.victim.bank }} · {{ row.method ? $t(`methods.${row.method}`) : '' }}</span>
        <div class="spacer" />
        <span class="victim-taken">{{ $t('detail.tx.taken') }}</span>
        <span class="victim-sum mono">{{ chain.victim.amount }}</span>
      </div>

      <!-- 1-daraja -->
      <div v-for="n1 in chainRows" :key="n1.id" class="node">
        <div class="node-row">
          <button type="button" class="node-tog" :class="{ on: openNodes.has(n1.id) }" @click="toggleNode(n1.id)">
            <AppIcon :name="openNodes.has(n1.id) ? 'chevronUp' : 'chevronDown'" :size="20" />
          </button>
          <span class="level l1">{{ $t('detail.tx.level', { n: 1 }) }}</span>
          <div class="node-card" @click="openChainCard(n1)">
            <span class="pill mono strong">{{ n1.card }}</span>
            <span class="pill amount mono">{{ n1.amount }}</span>
            <span class="pill">UZS ({{ $t('detail.sum') }})</span>
            <span class="pill mono muted">{{ n1.date }}</span>
            <span class="pill muted">{{ n1.bank }}</span>
            <div class="spacer" />
            <span class="node-op">{{ n1.op }}</span>
            <span class="node-open">
              {{ $t('detail.tx.open') }}
              <AppIcon name="chevronRight" :size="16" />
            </span>
          </div>
        </div>

        <!-- 2-daraja -->
        <div v-if="openNodes.has(n1.id)" class="kids">
          <div v-for="n2 in shownKids(n1)" :key="n2.id" class="node">
            <div class="node-row">
              <button type="button" class="node-tog" :class="{ on: openNodes.has(n2.id) }" @click="toggleNode(n2.id)">
                <AppIcon :name="openNodes.has(n2.id) ? 'chevronUp' : 'chevronDown'" :size="20" />
              </button>
              <span class="level l2">{{ $t('detail.tx.level', { n: 2 }) }}</span>
              <div class="node-card sub" @click="openChainCard(n2)">
                <span class="pill mono">
                  <AppIcon name="lock" :size="15" />
                  {{ n2.card }}
                </span>
                <span class="pill amount mono">{{ n2.amount }}</span>
                <span class="pill mono muted">{{ n2.date }}</span>
                <span class="pill muted">{{ n2.bank }}</span>
                <div class="spacer" />
                <span class="node-open">
                  {{ $t('detail.tx.open') }}
                  <AppIcon name="chevronRight" :size="16" />
                </span>
              </div>
            </div>

            <!-- 3-daraja -->
            <div v-if="openNodes.has(n2.id)" class="kids">
              <div v-for="n3 in n2.children" :key="n3.id" class="node-row">
                <span class="node-gap" />
                <span class="level l3">{{ $t('detail.tx.level', { n: 3 }) }}</span>
                <div class="node-card sub" @click="openChainCard(n3)">
                  <span class="pill mono">{{ n3.card }}</span>
                  <span class="pill amount mono">{{ n3.amount }}</span>
                  <span class="pill mono muted">{{ n3.date }}</span>
                  <span class="pill muted">{{ n3.bank }}</span>
                  <div class="spacer" />
                  <span class="node-open">
                    {{ $t('detail.tx.open') }}
                    <AppIcon name="chevronRight" :size="16" />
                  </span>
                </div>
              </div>
            </div>
          </div>

          <button
            v-if="hiddenKids(n1)"
            type="button"
            class="tx-more"
            @click="showMore(n1.id)"
          >{{ $t('detail.tx.more', hiddenKids(n1)) }}</button>
        </div>
      </div>

      <EmptyState
        v-if="!chainRows.length"
        compact
        icon="searchOff"
        :title="$t('detail.tx.noMatch')"
      />
    </div>
  </template>
  </DetailPanel>

  <TransactionPanel v-if="txNode" :node="txNode" @close="txNode = null" />
</template>

<style scoped>

.tx-cat {
  position: relative;
  display: flex;
  align-items: center;
  gap: 9px;
  height: 36px;
  padding: 0 12px;
  border-radius: 8px;
  border: 1px solid var(--ce2e8f1);
  background: var(--s-card);
  color: var(--ca3adbd);
  cursor: pointer;
}


.tx-cat-select {
  appearance: none;
  border: 0;
  outline: none;
  background: transparent;
  font-family: inherit;
  font-size: 14.5px;
  color: var(--c3d4d66);
  cursor: pointer;
}


.tx-more {
  align-self: flex-start;
  border: 0;
  padding: 2px 0 4px;
  background: transparent;
  font-size: 14px;
  font-weight: 500;
  color: var(--c23568f);
  cursor: pointer;
}


.tx-more:hover {
  text-decoration: underline;
}


.tx-stats {
  display: flex;
  gap: 20px;
  padding: 12px 18px;
  background: var(--cf8fafc);
  border-bottom: 1px solid var(--ce2e8f1);
  flex-wrap: wrap;
}


.stat-label {
  display: block;
  font-size: 13px;
  color: var(--c8b95a6);
}


.stat-value {
  display: block;
  margin-top: 3px;
  font-size: 18px;
  font-weight: 600;
  color: var(--c16233d);
}


.tx-file {
  display: flex;
  align-items: center;
  gap: 13px;
  padding: 13px 18px;
  border-bottom: 1px solid var(--ce2e8f1);
  flex-wrap: wrap;
}


.file-ico {
  width: 38px;
  height: 38px;
  flex: 0 0 38px;
  border-radius: 9px;
  background: var(--ce6f2ec);
  color: var(--c1a6e4b);
  display: flex;
  align-items: center;
  justify-content: center;
}


.file-body {
  min-width: 0;
}


.file-head {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}


.file-name {
  font-size: 16px;
  font-weight: 600;
  color: var(--c1c2b45);
}


.file-tag {
  padding: 2px 7px;
  border-radius: 5px;
  background: var(--ce6f2ec);
  border: 1px solid var(--cc8e2d4);
  font-size: 12.5px;
  font-weight: 600;
  color: var(--c1a6e4b);
}


.file-meta {
  margin-top: 4px;
  font-size: 13.5px;
  color: var(--c8b95a6);
}


.tx-tools {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 18px 4px;
  flex-wrap: wrap;
}


.tx-search {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  min-width: 260px;
  height: 36px;
  padding: 0 12px;
  border-radius: 8px;
  border: 1px solid var(--ce2e8f1);
  background: var(--s-card);
  color: var(--c8b95a6);
}


.tx-input {
  flex: 1;
  min-width: 0;
  border: 0;
  background: transparent;
  font-size: 14.5px;
  color: var(--c1c2b45);
}


.tx-input:focus {
  outline: none;
}


.tx-sort {
  display: flex;
  align-items: center;
  gap: 8px;
  height: 36px;
  padding: 0 12px;
  border-radius: 8px;
  border: 1px solid var(--ce2e8f1);
  background: var(--s-card);
  color: var(--c3d4d66);
  font-size: 14.5px;
  cursor: pointer;
}


.sort-label {
  font-weight: 600;
  color: var(--c1c2b45);
}


.chain {
  padding: 14px 18px 18px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}


.victim {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 13px 15px;
  border-radius: 9px;
  background: var(--ce8eef7);
  border: 2px solid var(--k3d7cc0);
  flex-wrap: wrap;
}


.victim-label {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  height: 26px;
  padding: 0 10px;
  border-radius: 5px;
  background: var(--s-card);
  border: 1px solid var(--kc9d9ec);
  font-size: 12.5px;
  font-weight: 700;
  letter-spacing: .06em;
  text-transform: uppercase;
  color: var(--c1b4272);
}


.victim-label :deep(.app-icon) {
  color: var(--c23568f);
}


.victim-sum {
  display: inline-flex;
  align-items: center;
  height: 34px;
  padding: 0 12px;
  border-radius: 7px;
  background: var(--s-card);
  border: 1px solid var(--k3d7cc0);
  font-size: 16px;
  font-weight: 600;
}


.victim-sum {
  border-color: var(--cf2cfcd);
  color: var(--ca52220);
}


.victim-taken {
  font-size: 14.5px;
  color: var(--c3d4d66);
}


.node {
  display: flex;
  flex-direction: column;
  gap: 9px;
}


.node-row {
  display: flex;
  align-items: center;
  gap: 10px;
}


.node-tog {
  width: 34px;
  height: 34px;
  flex: 0 0 34px;
  border-radius: 9px;
  border: 1px solid var(--ce2e8f1);
  background: var(--s-card);
  color: var(--c66748c);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}


.node-tog.on {
  background: var(--ce8eef7);
  border-color: var(--kc9d9ec);
  color: var(--c23568f);
}


.node-gap {
  width: 34px;
  flex: 0 0 34px;
}


.level {
  flex: 0 0 auto;
  padding: 4px 9px;
  border-radius: 5px;
  font-size: 13px;
  font-weight: 700;
  white-space: nowrap;
}


.level.l1 {
  background: var(--ce8eef7);
  border: 1px solid var(--kc9d9ec);
  color: var(--c1b4272);
}


.level.l2 {
  background: var(--cedf1f8);
  border: 1px solid var(--cd5e0ee);
  color: var(--c3d4d66);
}


.level.l3 {
  background: var(--cf0f3f8);
  border: 1px solid var(--ce2e8f1);
  color: var(--c66748c);
}


.node-card {
  flex: 1;
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 9px 11px;
  border: 1px solid var(--cd5e0ee);
  border-radius: 8px;
  background: var(--s-card);
  cursor: pointer;
  flex-wrap: wrap;
  transition: border-color .16s ease, background .16s ease;
}


.node-card:hover {
  border-color: var(--c23568f);
  background: var(--cf7fafd);
}


.node-card.sub {
  border-color: var(--ce6ebf3);
  padding: 8px 11px;
}


.pill {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  height: 32px;
  padding: 0 11px;
  border: 1px solid var(--ce2e8f1);
  border-radius: 6px;
  font-size: 14px;
  color: var(--c3d4d66);
  white-space: nowrap;
}


.pill.strong {
  border-color: var(--kc9d9ec);
  background: var(--cf7fafd);
  font-size: 14.5px;
  font-weight: 600;
  color: var(--c16233d);
}


.pill.amount {
  justify-content: flex-end;
  min-width: 124px;
  font-weight: 600;
  color: var(--c16233d);
}


.pill.soft {
  background: var(--s-card);
}


.pill.muted {
  color: var(--c8b95a6);
}


.node-op {
  font-size: 14px;
  color: var(--c8b95a6);
  white-space: nowrap;
}


.node-open {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 14.5px;
  font-weight: 600;
  color: var(--c23568f);
  white-space: nowrap;
}


.kids {
  margin: 9px 0 2px 38px;
  padding-left: 16px;
  border-left: 2px dashed var(--ka3bad6, var(--cc8cdd6));
  display: flex;
  flex-direction: column;
  gap: 9px;
}
</style>
