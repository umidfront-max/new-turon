<script setup>
import { ref, computed, onBeforeUnmount, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import AppIcon from '@/components/ui/AppIcon.vue'
import StatusPill from '@/components/ui/StatusPill.vue'
import BlockedRequisites from '@/components/detail/BlockedRequisites.vue'
import TransactionPanel from '@/components/detail/TransactionPanel.vue'
import { detailFor, formatAmount } from '@/data/detail'
import { buildChain, chainStats, chainMatches } from '@/data/chain'
import { useApplications } from '@/stores/useApplications'
import { useUi } from '@/stores/useUi'

const route = useRoute()
const router = useRouter()
const { t } = useI18n()
const { toast } = useUi()
const { byId } = useApplications()

// manzilda id bo'lmasa yoki topilmasa — alohida holat ko'rsatamiz
const found = computed(() => byId(route.query.id))

const TABS = [
  { key: 'complaint', icon: 'doc' },
  { key: 'bank', icon: 'bank' },
  { key: 'sanctions', icon: 'shield' },
  { key: 'transactions', icon: 'swap' },
  { key: 'workflow', icon: 'refresh' }
]

// hodisa turi -> rang
const TONE = {
  info: { fg: 'var(--c23568f)', bg: 'var(--ce8eef7)' },
  ok: { fg: 'var(--c1a6e4b)', bg: 'var(--ce3f2e9)' },
  bad: { fg: 'var(--ca52220)', bg: 'var(--cfceceb)' },
  idle: { fg: 'var(--c66748c)', bg: 'var(--cf0f3f8)' }
}

// tab URL'da turadi — havolani ulashish va orqaga qaytish uchun
const tab = ref(TABS.some((x) => x.key === route.query.tab) ? route.query.tab : 'complaint')

function pickTab(key) {
  tab.value = key
  router.replace({ query: { ...route.query, tab: key } })
}

watch(() => route.query.tab, (next) => {
  tab.value = TABS.some((x) => x.key === next) ? next : 'complaint'
})
const data = computed(() => detailFor(found.value || route.query.id))
const row = computed(() => data.value.row)

/* ---------- rekvizitlar ochilishi ---------- */
const opened = ref(new Set([0]))

/* ---------- bloklangan rekvizitlar ---------- */
const blockedOpen = ref(false)
const blockedTop = computed(() => data.value.blocked.slice(0, 5))
const blockedShown = computed(() => formatAmount(blockedTop.value.reduce((s, r) => s + r.raw, 0)))

function toggleReq(i) {
  const next = new Set(opened.value)
  if (next.has(i)) next.delete(i)
  else next.add(i)
  opened.value = next
}

/* ---------- ovozli fabula (namuna pleyer) ---------- */
const playing = ref(false)
const played = ref(0)
const total = 209 // 03:29
let ticker = null

function clock(sec) {
  const m = Math.floor(sec / 60)
  const s = Math.floor(sec % 60)
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

function togglePlay() {
  playing.value = !playing.value
  clearInterval(ticker)
  if (!playing.value) return
  ticker = setInterval(() => {
    played.value += 1
    if (played.value >= total) {
      played.value = 0
      playing.value = false
      clearInterval(ticker)
    }
  }, 1000)
}

function stopPlayer() {
  clearInterval(ticker)
  playing.value = false
  played.value = 0
}

watch(() => route.query.id, stopPlayer)
onBeforeUnmount(() => clearInterval(ticker))

/* ---------- sanksiyalar: qaror hujjati ---------- */
// hujjat faqat bank rekvizitni bloklagach paydo bo'ladi
const hasDecision = computed(() => ['blocked', 'done', 'autopayment'].includes(row.value.status))
const docName = computed(() => `qaror_${row.value.id.replace(/\D/g, '').slice(-8)}.pdf`)
const docPage = ref(1)
const zoom = ref(92)

/* ---------- tranzaksiyalar zanjiri ---------- */
// zanjir bank javobidan keyin ko'rinadi
const hasChain = computed(() => row.value.status !== 'new')
const chain = computed(() => buildChain(data.value))
const stats = computed(() => chainStats(chain.value))

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

/* ---------- amallar ---------- */
const facts = computed(() => [
  { key: 'id', icon: null, value: row.value.id, mono: true },
  { key: 'material', icon: 'bookmark', value: row.value.material || t('table.noMaterial'), mono: true },
  { key: 'date', icon: 'calendar', value: row.value.time, mono: true },
  { key: 'source', icon: 'phone', value: t(`sources.${data.value.source}`) },
  { key: 'method', icon: null, value: t(`methods.${row.value.method}`) }
])

function close() {
  router.push('/')
}

function onAction() {
  toast(data.value.action === 'fix' ? t('detail.fixToast') : t('detail.sent'))
}

// daraxtni tekis ro'yxatga yozamiz — chuqurlik chekinish uchun
const workflowRows = computed(() => {
  const out = []
  const walk = (nodes, depth) => nodes.forEach((n) => {
    out.push({ ...n, depth })
    if (n.children && n.children.length) walk(n.children, depth + 1)
  })
  walk(data.value.workflow, 0)
  return out
})

function exportXlsx() {
  toast(t('detail.exportToast'))
}
</script>

<template>
  <div v-if="!found" class="screen">
    <section class="card-surface soon">
      <span class="soon-icon"><AppIcon name="search" :size="26" /></span>
      <div class="not-found-title">{{ $t('detail.notFound') }}</div>
      <p class="soon-text">{{ $t('detail.notFoundText') }}</p>
      <button type="button" class="btn-light back-btn" @click="close">
        <AppIcon name="back" :size="16" />
        {{ $t('common.backToList') }}
      </button>
    </section>
  </div>

  <div v-else class="screen">
    <!-- ---------- amal satri ---------- -->
    <div class="bar card-surface">
      <span class="bar-label">{{ $t('detail.label') }}</span>
      <span class="bar-id mono">{{ row.id }}</span>
      <span class="chip">{{ row.flow === '102' ? '102' : $t('detail.manual') }}</span>

      <div class="spacer" />

      <span v-if="data.deadline" class="deadline" :class="data.deadline.tone">
        <span class="deadline-dot" />
        {{ data.deadline.overdue
          ? $t('detail.overdue', data.deadline.days)
          : $t('detail.deadline', data.deadline.days) }}
      </span>

      <button type="button" class="btn-light" @click="exportXlsx">
        <AppIcon name="download" :size="16" />
        {{ $t('detail.export') }}
      </button>

      <button v-if="data.action" type="button" class="btn-dark" @click="onAction">
        {{ $t(`detail.${data.action}`) }}
        <AppIcon name="chevronRight" :size="15" />
      </button>

      <button type="button" class="icon-btn" :title="$t('detail.close')" @click="close">
        <AppIcon name="close" :size="18" />
      </button>
    </div>

    <!-- ---------- sarlavha kartasi ---------- -->
    <section class="card-surface sum">
      <div class="sum-top">
        <div class="sum-id">
          <div class="sum-name-row">
            <h1 class="sum-name">{{ data.shortName }}</h1>
            <StatusPill :status="row.status" />
          </div>
          <div class="sum-sub mono">
            {{ row.material || $t('table.noMaterial') }} · {{ row.time }}
          </div>
        </div>

        <div class="spacer" />

        <div class="damage">
          <div class="damage-label">{{ $t('detail.damage') }}</div>
          <div class="damage-value mono">
            {{ data.total }}<span class="damage-cur">{{ $t('detail.sum') }}</span>
          </div>
        </div>
      </div>

      <div class="steps">
        <template v-for="(st, i) in data.steps" :key="st.key">
          <span v-if="i" class="step-line" />
          <div class="step" :class="st.tone">
            <span class="step-icon"><AppIcon :name="st.icon" :size="18" /></span>
            <span class="step-text">
              <span class="step-title">{{ $t(`detail.steps.${st.key}`) }}</span>
              <span class="step-meta mono">
                <template v-if="st.time">{{ st.time }}</template>
                <template v-else-if="st.days">{{ $t('detail.steps.daysLeft', st.days) }}</template>
                <template v-else-if="st.metaKey">{{ $t(`detail.steps.${st.metaKey}`) }}</template>
                <template v-else>—</template>
              </span>
            </span>
          </div>
        </template>
      </div>
    </section>

    <!-- ---------- tablar ---------- -->
    <div class="tabs card-surface">
      <button
        v-for="tb in TABS"
        :key="tb.key"
        type="button"
        class="tab"
        :class="{ on: tab === tb.key }"
        @click="pickTab(tb.key)"
      >
        <AppIcon :name="tb.icon" :size="17" />
        {{ $t(`detail.tabs.${tb.key}`) }}
      </button>
    </div>

    <!-- ---------- Murojaat tabi ---------- -->
    <template v-if="tab === 'complaint'">
      <section class="card-surface facts">
        <div v-for="f in facts" :key="f.key" class="fact">
          <div class="fact-label">{{ $t(`detail.fields.${f.key}`) }}</div>
          <div class="fact-value" :class="{ mono: f.mono }">
            <AppIcon v-if="f.icon" :name="f.icon" :size="15" class="fact-icon" />
            {{ f.value }}
          </div>
        </div>
      </section>

      <section class="card-surface block">
        <div class="block-side">
          <span class="side-icon"><AppIcon name="user" :size="18" /></span>
          <span class="side-title">{{ $t('detail.applicant.title') }}</span>
        </div>
        <div class="block-body">
          <div class="field-grid">
            <div class="field">
              <div class="field-label">{{ $t('detail.applicant.fio') }}</div>
              <div class="field-value">{{ row.name }}</div>
            </div>
            <div class="field">
              <div class="field-label">{{ $t('detail.applicant.phone') }}</div>
              <div class="field-value mono">{{ data.phone }}</div>
            </div>
            <div class="field">
              <div class="field-label">{{ $t('detail.applicant.region') }}</div>
              <div class="field-value">{{ $t(`regions.${data.region}`) }}</div>
            </div>
            <div class="field wide">
              <div class="field-label">{{ $t('detail.applicant.address') }}</div>
              <div class="field-value">{{ $t('detail.applicant.addressValue') }}</div>
            </div>
          </div>
        </div>
      </section>

      <section class="card-surface block">
        <div class="block-side">
          <span class="side-icon"><AppIcon name="chat" :size="18" /></span>
          <span class="side-title">{{ $t('detail.fabula.title') }}</span>
        </div>
        <div class="block-body">
          <p class="fabula">{{ $t('detail.fabula.text', { amount: data.total }) }}</p>

          <div class="voice-label">{{ $t('detail.fabula.voice') }}</div>
          <div class="player">
            <button
              type="button"
              class="play"
              :aria-label="$t('detail.fabula.voice')"
              @click="togglePlay"
            >
              <AppIcon :name="playing ? 'pause' : 'play'" :size="17" />
            </button>
            <span class="player-time mono">{{ clock(played) }}</span>
            <span class="player-sep mono">/</span>
            <span class="player-time mono dim">{{ data.audio.length }}</span>
            <span class="player-track">
              <span class="player-fill" :style="{ width: `${(played / total) * 100}%` }" />
            </span>
            <AppIcon name="volume" :size="17" class="player-ico" />
            <AppIcon name="download" :size="17" class="player-ico" />
          </div>
        </div>
      </section>

      <section class="card-surface block">
        <div class="block-side">
          <span class="side-icon"><AppIcon name="card" :size="18" /></span>
          <span class="side-title">{{ $t('detail.requisites.title') }}</span>
          <span class="side-note">
            {{ $t('detail.requisites.cards', data.requisites.length) }} ·
            {{ $t('detail.requisites.tx', data.txTotal) }}
          </span>
        </div>

        <div class="block-body">
          <div v-for="(r, i) in data.requisites" :key="r.card" class="req">
            <div class="req-head">
              <span class="req-icon"><AppIcon name="card" :size="26" /></span>
              <div class="req-main">
                <div class="req-card mono">{{ r.card }}</div>
                <div class="req-meta">
                  <span class="req-bank"><span class="bank-dot" />{{ r.bank }}</span>
                  <span class="req-sys">{{ r.system }}</span>
                  <span class="req-count">{{ $t('detail.requisites.tx', r.tx.length) }}</span>
                  <span class="req-sum mono">
                    {{ r.sum }}<span class="dim"> {{ $t('detail.sum') }}</span>
                  </span>
                </div>
              </div>
              <button type="button" class="req-toggle" @click="toggleReq(i)">
                {{ $t('detail.requisites.transactions') }}
                <span class="req-badge mono">{{ r.tx.length }}</span>
                <AppIcon
                  name="chevronUp"
                  :size="18"
                  class="req-caret"
                  :class="{ down: !opened.has(i) }"
                />
              </button>
            </div>

            <div v-if="opened.has(i)" class="req-tx">
              <div v-for="x in r.tx" :key="x.n" class="tx">
                <span class="tx-n mono">{{ x.n }}</span>
                <span class="tx-amount mono">{{ x.amount }}<span class="dim"> {{ $t('detail.sum') }}</span></span>
                <div class="spacer" />
                <span class="tx-time mono">{{ x.time }}</span>
              </div>
            </div>
          </div>

          <div class="req-total">
            <span class="dim">
              {{ $t('detail.requisites.cards', data.requisites.length) }} ·
              {{ $t('detail.requisites.tx', data.txTotal) }}
            </span>
            <div class="spacer" />
            <span class="total-value mono">
              {{ data.total }}<span class="dim"> {{ $t('detail.sum') }}</span>
            </span>
          </div>
        </div>
      </section>
    </template>

    <!-- ---------- Bank amaliyotlari ---------- -->
    <section v-else-if="tab === 'bank'" class="card-surface panel">
      <header class="panel-head dark-bar">
        <AppIcon name="bank" :size="18" />
        <span class="panel-title">{{ $t('detail.bank.title') }}</span>
      </header>

      <div class="panel-body">
        <article
          v-for="(e, i) in data.exchange"
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
                  {{ $t('blocked.allCount', data.blocked.length) }}
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
              <button v-if="data.action === 'fix'" type="button" class="note-fix" @click="onAction">
                {{ $t('detail.bank.fixField') }}
              </button>
            </div>
          </div>
        </article>

        <div v-if="!data.exchange.length" class="empty-box">
          <span class="soon-icon"><AppIcon name="send" :size="24" /></span>
          <div class="empty-title">{{ $t('detail.bank.emptyTitle') }}</div>
          <div class="empty-text">{{ $t('detail.bank.emptyText') }}</div>
        </div>
      </div>
    </section>

    <!-- ---------- Ish jarayoni ---------- -->
    <section v-else-if="tab === 'workflow'" class="card-surface panel">
      <header class="panel-head dark-bar">
        <AppIcon name="refresh" :size="18" />
        <span class="panel-title">{{ $t('detail.workflow.title') }}</span>
      </header>

      <div class="panel-body">
        <div
          v-for="(n, i) in workflowRows"
          :key="`${n.badge}-${i}`"
          class="wf-row"
          :style="{ marginLeft: `${n.depth * 26}px`, animationDelay: `${i * 60}ms` }"
        >
          <span class="wf-caret">▾</span>
          <span class="wf-time mono">
            <AppIcon name="clock" :size="13" />
            {{ n.time || '—' }}
          </span>
          <span class="wf-actor">
            {{ n.actor === 'bank' ? $t('detail.workflow.bank') : $t('detail.workflow.officer') }}
          </span>
          <span v-if="n.actor === 'staff' && !n.depth" class="wf-role">
            ({{ $t('detail.workflow.staffRole') }})
          </span>
          <span class="wf-badge" :class="n.actor">{{ $t(`detail.workflow.badges.${n.badge}`) }}</span>
          <span v-if="n.code" class="tag code mono">{{ n.code }}</span>
        </div>
      </div>
    </section>

    <!-- ---------- Sanksiyalar ---------- -->
    <section v-else-if="tab === 'sanctions'" class="card-surface panel">
      <header class="panel-head dark-bar">
        <AppIcon name="shield" :size="24" />
        <span class="panel-title">{{ $t('detail.doc.title') }}</span>
      </header>

      <div v-if="!hasDecision" class="empty-box">
        <span class="empty-ico"><AppIcon name="shield" :size="26" /></span>
        <div class="empty-title">{{ $t('detail.doc.emptyTitle') }}</div>
        <div class="empty-text">{{ $t('detail.doc.emptyText') }}</div>
      </div>

      <template v-else>
        <div class="doc-bar">
          <AppIcon name="swapVert" :size="20" />
          <span class="doc-name mono">{{ docName }}</span>
          <div class="spacer" />
          <span class="doc-pages mono">{{ docPage }} / 2</span>
          <span class="doc-sep" />
          <button type="button" class="doc-zoom" @click="zoom = Math.max(50, zoom - 8)">−</button>
          <span class="doc-scale mono">{{ zoom }}%</span>
          <button type="button" class="doc-zoom" @click="zoom = Math.min(200, zoom + 8)">+</button>
          <span class="doc-sep" />
          <button type="button" class="doc-act" :title="$t('detail.doc.download')" @click="toast($t('detail.doc.downloaded', { file: docName }))">
            <AppIcon name="download" :size="20" />
          </button>
          <button type="button" class="doc-act" :title="$t('detail.doc.print')" @click="toast($t('detail.doc.printing'))">
            <AppIcon name="print" :size="20" />
          </button>
        </div>

        <div class="doc-body">
          <div class="doc-thumbs">
            <button
              v-for="n in 2"
              :key="n"
              type="button"
              class="thumb"
              :class="{ on: n === docPage }"
              @click="docPage = n"
            />
            <span class="thumb-nums mono">
              <span v-for="n in 2" :key="n" :class="{ on: n === docPage }">{{ n }}</span>
            </span>
          </div>
          <div class="doc-page">
            <div class="page-sheet" :style="{ transform: `scale(${zoom / 100})` }">
              <div class="page-title mono">{{ $t('detail.doc.sheet') }}</div>
              <div class="page-text">{{ $t('detail.doc.sheetText') }}</div>
            </div>
          </div>
        </div>
      </template>
    </section>

    <!-- ---------- Tranzaksiyalar ---------- -->
    <section v-else-if="tab === 'transactions'" class="card-surface panel">
      <header class="panel-head dark-bar">
        <AppIcon name="swap" :size="24" />
        <span class="panel-title">{{ $t('detail.tx.title') }}</span>
      </header>

      <div v-if="!hasChain" class="empty-box">
        <span class="empty-ico"><AppIcon name="swap" :size="26" /></span>
        <div class="empty-title">{{ $t('detail.tx.emptyTitle') }}</div>
        <div class="empty-text">{{ $t('detail.tx.emptyText') }}</div>
      </div>

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
            <span class="victim-label">{{ $t('detail.tx.victim') }}</span>
            <span class="pill mono">{{ chain.victim.card }}</span>
            <span class="pill soft">{{ chain.victim.bank }}</span>
            <div class="spacer" />
            <span class="victim-sum mono">
              {{ $t('detail.tx.taken') }} {{ chain.victim.amount }} <span class="dim">{{ $t('detail.sum') }}</span>
            </span>
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

          <div v-if="!chainRows.length" class="empty-box small">
            <span class="empty-ico"><AppIcon name="searchOff" :size="24" /></span>
            <div class="empty-title">{{ $t('detail.tx.noMatch') }}</div>
          </div>
        </div>
      </template>
    </section>

    <!-- ---------- qolgan tablar ---------- -->
    <section v-else class="card-surface soon">
      <span class="soon-icon"><AppIcon :name="TABS.find((x) => x.key === tab).icon" :size="26" /></span>
      <p class="soon-text">{{ $t(`detail.soon.${tab}`) }}</p>
    </section>

    <BlockedRequisites v-if="blockedOpen" :rows="data.blocked" @close="blockedOpen = false" />

    <TransactionPanel v-if="txNode" :node="txNode" @close="txNode = null" />
  </div>
</template>

<style scoped>
.screen {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.dim {
  color: var(--c8b95a6);
}

/* ---------- amal satri ---------- */
.bar {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 14px;
  flex-wrap: wrap;
}

.bar-label {
  font-size: 14px;
  color: var(--c8b95a6);
}

.bar-id {
  font-size: 17px;
  font-weight: 600;
  color: var(--c16233d);
  letter-spacing: .01em;
}

.chip {
  display: inline-flex;
  align-items: center;
  padding: 3px 10px;
  border-radius: 20px;
  background: var(--cf0f3f8);
  border: 1px solid var(--ce2e8f1);
  font-size: 13px;
  color: var(--c66748c);
}

.deadline {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  height: 38px;
  padding: 0 14px;
  border-radius: 8px;
  border: 1px solid var(--ce2e8f1);
  background: var(--s-card);
  color: var(--c3d4d66);
  font-size: 14px;
  font-weight: 500;
  white-space: nowrap;
}

/* ---------- bloklangan rekvizitlar jadvali ---------- */
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

@media (max-width: 900px) {
  .blk-grid {
    grid-template-columns: 40px minmax(140px, 1fr) 104px 120px 70px;
  }

  .blk-grid > span.blk-bank,
  .blk-grid.head > span:nth-child(4) {
    display: none;
  }
}

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

.deadline-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--c96620a);
}

.deadline.bad .deadline-dot {
  background: var(--ca52220);
}

.btn-light,
.btn-dark {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  height: 38px;
  padding: 0 15px;
  border-radius: 8px;
  font-size: 14.5px;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  transition: filter .16s ease, background .16s ease, transform .16s var(--ease);
}

.btn-light {
  border: 1px solid var(--ce2e8f1);
  background: var(--s-card);
  color: var(--c3d4d66);
}

.btn-light:hover {
  background: var(--cf8fafc);
}

.btn-dark {
  border: 1px solid var(--btn);
  background: var(--btn);
  color: #fff;
}

.btn-dark:hover {
  filter: brightness(1.14);
  transform: translateY(-1px);
}

.icon-btn {
  width: 38px;
  height: 38px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  border: 1px solid var(--ce2e8f1);
  background: var(--s-card);
  color: var(--c66748c);
  cursor: pointer;
  transition: background .16s ease, color .16s ease;
}

.icon-btn:hover {
  background: var(--cfceceb);
  color: var(--ca52220);
}

/* ---------- sarlavha kartasi ---------- */
.sum {
  padding: 16px 18px 14px;
}

.sum-top {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  flex-wrap: wrap;
}

.sum-name-row {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.sum-name {
  margin: 0;
  font-size: 23px;
  font-weight: 700;
  color: var(--c16233d);
}

.sum-sub {
  margin-top: 6px;
  font-size: 13.5px;
  color: var(--c8b95a6);
}

.damage {
  text-align: right;
}

.damage-label {
  font-size: 13.5px;
  color: var(--c8b95a6);
}

.damage-value {
  margin-top: 2px;
  font-size: 27px;
  font-weight: 700;
  color: var(--ca52220);
  letter-spacing: .01em;
}

.damage-cur {
  margin-left: 7px;
  font-size: 14px;
  font-weight: 500;
  color: var(--c98a3b6);
}

/* ---------- qadamlar ---------- */
.steps {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-top: 16px;
  padding-top: 14px;
  border-top: 1px solid var(--ceef1f6);
  flex-wrap: wrap;
}

.step {
  display: flex;
  align-items: center;
  gap: 11px;
  color: var(--c98a3b6);
}

/* qadam holati: done/ok — ko'k-yashil, wait — sariq, bad — qizil, idle — kulrang */
.step.wait .step-icon {
  background: var(--cfdf3e3);
  color: var(--c96620a);
}

.step.ok .step-icon {
  background: var(--ce3f2e9);
  color: var(--c1a6e4b);
}

.step.bad .step-icon {
  background: var(--cfceceb);
  color: var(--ca52220);
}

.step.wait .step-title,
.step.ok .step-title,
.step.bad .step-title {
  color: var(--c16233d);
}

.step-icon {
  width: 38px;
  height: 38px;
  flex: 0 0 38px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--cf0f3f8);
  color: var(--c98a3b6);
}

.step.done .step-icon {
  background: var(--ce8eef7);
  color: var(--c23568f);
}

.step-text {
  display: flex;
  flex-direction: column;
  line-height: 1.3;
}

.step-title {
  font-size: 15px;
  font-weight: 600;
  color: var(--c98a3b6);
}

.step.done .step-title {
  color: var(--c16233d);
}

.step-meta {
  font-size: 13px;
  color: var(--c98a3b6);
}

.step-line {
  width: 62px;
  height: 1px;
  background: var(--cdfe4ec);
}

/* ---------- tablar ---------- */
.tabs {
  display: flex;
  gap: 6px;
  padding: 8px;
  overflow-x: auto;
  scrollbar-width: none;
}

.tabs::-webkit-scrollbar {
  display: none;
}

.tab {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  height: 40px;
  padding: 0 15px;
  border: 0;
  border-radius: 8px;
  background: transparent;
  color: var(--c3d4d66);
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  white-space: nowrap;
  transition: background .16s ease, color .16s ease;
}

.tab:hover {
  background: var(--cf4f7fb);
}

.tab.on {
  background: var(--brand-a);
  color: #fff;
  font-weight: 600;
}

/* ---------- faktlar satri ---------- */
.facts {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
}

.fact {
  padding: 13px 16px;
  border-left: 1px solid var(--ceef1f6);
  min-width: 0;
}

.fact:first-child {
  border-left: 0;
}

.fact-label {
  font-size: 13.5px;
  color: var(--c8b95a6);
}

.fact-value {
  display: flex;
  align-items: center;
  gap: 7px;
  margin-top: 5px;
  font-size: 15px;
  color: var(--c16233d);
  overflow-wrap: anywhere;
}

.fact-icon {
  color: var(--c98a3b6);
}

/* ---------- blok ---------- */
.block {
  display: flex;
  align-items: stretch;
  overflow: hidden;
}

.block-side {
  flex: 0 0 232px;
  display: flex;
  align-items: flex-start;
  gap: 10px;
  flex-wrap: wrap;
  padding: 16px;
  border-right: 1px solid var(--ceef1f6);
  background: var(--cf8fafc);
}

.side-icon {
  width: 30px;
  height: 30px;
  flex: 0 0 30px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--ce8eef7);
  color: var(--c23568f);
}

.side-title {
  flex: 1;
  min-width: 0;
  font-size: 15.5px;
  font-weight: 600;
  color: var(--c16233d);
  line-height: 1.35;
}

.side-note {
  flex: 0 0 100%;
  padding-left: 40px;
  font-size: 13px;
  color: var(--c8b95a6);
}

.block-body {
  flex: 1;
  min-width: 0;
  padding: 16px;
}

/* ---------- maydonlar ---------- */
.field-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px 22px;
}

.field.wide {
  grid-column: 1 / -1;
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

/* ---------- fabula ---------- */
.fabula {
  margin: 0;
  padding: 14px 16px;
  border-left: 3px solid var(--c23568f);
  border-radius: 0 8px 8px 0;
  background: var(--cf8fafc);
  font-size: 15px;
  line-height: 1.62;
  color: var(--c3d4d66);
}

.voice-label {
  margin: 16px 0 7px;
  font-size: 13.5px;
  color: var(--c8b95a6);
}

.player {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 14px;
  border: 1px solid var(--ce2e8f1);
  border-radius: 10px;
  background: var(--cf8fafc);
}

.play {
  width: 40px;
  height: 40px;
  flex: 0 0 40px;
  border: 0;
  border-radius: 50%;
  background: var(--brand-a);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: filter .16s ease, transform .16s var(--ease);
}

.play:hover {
  filter: brightness(1.2);
  transform: scale(1.05);
}

.player-time {
  font-size: 14px;
  color: var(--c3d4d66);
}

.player-sep {
  color: var(--cc8cdd6);
}

.player-track {
  flex: 1;
  min-width: 60px;
  height: 4px;
  border-radius: 4px;
  background: var(--ce2e8f1);
  overflow: hidden;
}

.player-fill {
  display: block;
  height: 100%;
  background: var(--c23568f);
  transition: width .9s linear;
}

.player-ico {
  color: var(--c98a3b6);
  cursor: pointer;
}

.player-ico:hover {
  color: var(--c23568f);
}

/* ---------- rekvizitlar ---------- */
.req {
  border: 1px solid var(--ce2e8f1);
  border-radius: 10px;
  margin-bottom: 12px;
  overflow: hidden;
}

.req-head {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  flex-wrap: wrap;
}

.req-icon {
  width: 44px;
  height: 44px;
  flex: 0 0 44px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--ce8eef7);
  color: var(--c23568f);
}

.req-main {
  flex: 1;
  min-width: 0;
}

.req-card {
  font-size: 17px;
  font-weight: 600;
  color: var(--c16233d);
  letter-spacing: .02em;
}

.req-meta {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 6px;
  flex-wrap: wrap;
  font-size: 13.5px;
  color: var(--c66748c);
}

.req-bank {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 2px 10px;
  border-radius: 20px;
  background: var(--cefeafa);
  color: var(--c5b3fa8);
  font-weight: 500;
}

.bank-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: currentColor;
}

.req-sys {
  padding: 2px 10px;
  border-radius: 20px;
  background: var(--cf0f3f8);
  border: 1px solid var(--ce2e8f1);
}

.req-sum {
  font-weight: 600;
  color: var(--c16233d);
}

.req-toggle {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  border: 0;
  background: transparent;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  color: var(--c23568f);
  white-space: nowrap;
}

.req-badge {
  min-width: 20px;
  height: 20px;
  padding: 0 6px;
  border-radius: 20px;
  background: var(--ce8eef7);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 12.5px;
}

.req-caret {
  color: var(--c1c2b45);
  transition: transform .18s var(--ease);
}

.req-caret.down {
  transform: rotate(180deg);
}

.req-tx {
  border-top: 1px solid var(--ceef1f6);
  background: var(--cfafbfc);
}

.tx {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 11px 14px 11px 16px;
  border-top: 1px solid var(--cf2f5f9);
  font-size: 15px;
}

.tx:first-child {
  border-top: 0;
}

.tx-n {
  width: 22px;
  height: 22px;
  flex: 0 0 22px;
  border-radius: 6px;
  border: 1px solid var(--ce2e8f1);
  background: var(--s-card);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 12.5px;
  color: var(--c66748c);
}

.tx-amount {
  font-weight: 600;
  color: var(--c16233d);
}

.tx-time {
  font-size: 13.5px;
  color: var(--c8b95a6);
}

.req-total {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  border: 1px solid var(--ce2e8f1);
  border-radius: 10px;
  background: var(--cf8fafc);
  font-size: 14px;
}

.total-value {
  font-size: 17px;
  font-weight: 700;
  color: var(--c16233d);
}

/* ---------- panel (bank / ish jarayoni) ---------- */
.panel {
  overflow: hidden;
}

.panel-head {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 13px 16px;
  color: #fff;
}

.panel-title {
  font-size: 14px;
  font-weight: 700;
  letter-spacing: .09em;
  text-transform: uppercase;
}

.panel-body {
  padding: 14px 16px;
}

/* ---------- almashinuv hodisasi ---------- */
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
  font-size: 15.5px;
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

.tag {
  padding: 2px 9px;
  border-radius: 20px;
  background: var(--cf0f3f8);
  border: 1px solid var(--ce2e8f1);
  font-size: 12.5px;
  color: var(--c66748c);
  white-space: nowrap;
}

.tag.code {
  background: var(--ce8eef7);
  border-color: var(--kc9d9ec, var(--ce2e8f1));
  color: var(--c23568f);
  font-weight: 600;
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

/* ---------- ish jarayoni daraxti ---------- */
.wf-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 11px 13px;
  margin-bottom: 8px;
  border: 1px solid var(--ce2e8f1);
  border-radius: 9px;
  background: var(--s-card);
  flex-wrap: wrap;
  animation: riseIn .28s var(--ease) backwards;
}

.wf-caret {
  color: var(--c98a3b6);
  font-size: 11px;
}

.wf-time {
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

.wf-actor {
  font-size: 15px;
  font-weight: 600;
  color: var(--c16233d);
}

.wf-role {
  font-size: 13.5px;
  font-style: italic;
  color: var(--c8b95a6);
}

.wf-badge {
  padding: 5px 11px;
  border-radius: 7px;
  background: var(--brand-a);
  color: #fff;
  font-size: 13.5px;
  font-weight: 600;
}

.wf-badge.bank {
  background: var(--ce8eef7);
  color: var(--c23568f);
}

.empty-box {
  padding: 34px 20px;
  text-align: center;
}

/* ---------- bo'sh holat ---------- */
.empty-box {
  padding: 60px 18px 66px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 13px;
}

.empty-box.small {
  padding: 34px 18px;
}

.empty-ico {
  width: 56px;
  height: 56px;
  border-radius: 14px;
  background: var(--cf0f3f8);
  border: 1px solid var(--ce2e8f1);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--c8b95a6);
}

.empty-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--c3d4d66);
}

.empty-text {
  font-size: 14.5px;
  color: var(--c8b95a6);
  text-align: center;
  max-width: 420px;
  line-height: 1.6;
}

/* ---------- qaror hujjati ---------- */
.doc-bar {
  display: flex;
  align-items: center;
  gap: 12px;
  height: 44px;
  padding: 0 14px;
  background: var(--c33373d);
  color: var(--cc8cdd6);
}

.doc-name {
  font-size: 14.5px;
  color: var(--ce8ebf0);
}

.doc-pages,
.doc-scale {
  font-size: 14px;
}

.doc-scale {
  color: var(--ce8ebf0);
  padding: 2px 7px;
  border: 1px solid var(--c4b5058);
  border-radius: 4px;
}

.doc-sep {
  width: 1px;
  height: 20px;
  background: var(--c4b5058);
}

.doc-zoom {
  width: 24px;
  height: 24px;
  border: 0;
  background: transparent;
  color: var(--cc8cdd6);
  font-size: 17px;
  line-height: 1;
  cursor: pointer;
}

.doc-act {
  border: 0;
  background: transparent;
  color: var(--cc8cdd6);
  cursor: pointer;
  display: flex;
}

.doc-act:hover,
.doc-zoom:hover {
  color: #fff;
}

.doc-body {
  display: flex;
  height: 470px;
}

.doc-thumbs {
  width: 150px;
  flex: 0 0 150px;
  background: var(--c3f444c);
  padding: 14px 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.thumb {
  width: 96px;
  height: 130px;
  background: var(--s-card);
  border: 1px solid var(--c5a6068);
  border-radius: 2px;
  cursor: pointer;
  padding: 0;
}

.thumb.on {
  border: 2px solid var(--k3d7cc0, #3d7cc0);
}

.thumb-nums {
  display: flex;
  gap: 84px;
  font-size: 13px;
  color: var(--c8b929c);
  margin-top: -6px;
}

.thumb-nums .on {
  color: var(--cc8cdd6);
}

.doc-page {
  flex: 1;
  background: var(--c54595f);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 22px;
  overflow: hidden;
}

.page-sheet {
  width: 520px;
  height: 100%;
  background: var(--s-card) repeating-linear-gradient(135deg, rgba(28, 43, 69, .04) 0 9px, transparent 9px 18px);
  border-radius: 2px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 9px;
  transition: transform .18s var(--ease);
}

.page-title {
  font-size: 14px;
  color: var(--c66748c);
  letter-spacing: .05em;
}

.page-text {
  font-size: 14.5px;
  color: var(--c98a3b6);
  text-align: center;
  max-width: 330px;
}

/* ---------- tranzaksiyalar zanjiri ---------- */
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
  gap: 10px;
  padding: 11px 13px;
  border-radius: 9px;
  background: var(--cfff5e9);
  border: 1px solid var(--cf6dfc0);
  flex-wrap: wrap;
}

.victim-label {
  font-size: 13.5px;
  font-weight: 600;
  color: var(--cb45309);
}

.victim-sum {
  font-size: 14.5px;
  font-weight: 600;
  color: var(--c16233d);
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
  margin: 0 0 2px 38px;
  padding-left: 16px;
  border-left: 2px dashed var(--ka3bad6, var(--cc8cdd6));
  display: flex;
  flex-direction: column;
  gap: 9px;
}

.btn-light,
.btn-dark {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  height: 34px;
  padding: 0 13px;
  border-radius: 7px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
}

.btn-light {
  border: 1px solid var(--ce2e8f1);
  background: var(--s-card);
  color: var(--c3d4d66);
}

.btn-light:hover {
  border-color: var(--cc3cbd8);
  background: var(--cf8fafc);
}

.btn-dark {
  border: 1px solid var(--btn);
  background: var(--btn);
  color: #fff;
}

@media (max-width: 900px) {
  .doc-thumbs {
    display: none;
  }

  .page-sheet {
    width: 100%;
  }
}

/* ---------- keyingi bosqich ---------- */
.soon {
  padding: 46px 20px;
  text-align: center;
}

.soon-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 58px;
  height: 58px;
  border-radius: 50%;
  background: var(--cf0f3f8);
  color: var(--c8b95a6);
  margin-bottom: 12px;
}

.soon-text {
  margin: 0;
  font-size: 15px;
  color: var(--c66748c);
}

.not-found-title {
  font-size: 17px;
  font-weight: 700;
  color: var(--c16233d);
  margin-bottom: 6px;
}

.back-btn {
  margin-top: 16px;
}

/* ---------- responsive ---------- */
@media (max-width: 1180px) {
  .facts {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .fact:nth-child(3n + 1) {
    border-left: 0;
  }
}

@media (max-width: 900px) {
  .block {
    flex-direction: column;
  }

  .block-side {
    flex: none;
    border-right: 0;
    border-bottom: 1px solid var(--ceef1f6);
  }

  .field-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 640px) {
  .facts {
    grid-template-columns: 1fr;
  }

  .fact {
    border-left: 0;
    border-top: 1px solid var(--ceef1f6);
  }

  .fact:first-child {
    border-top: 0;
  }

  .field-grid {
    grid-template-columns: 1fr;
  }

  .btn-light,
  .btn-dark {
    flex: 1;
    justify-content: center;
  }

  .damage-value {
    font-size: 23px;
  }

  .step-line {
    display: none;
  }
}
</style>
