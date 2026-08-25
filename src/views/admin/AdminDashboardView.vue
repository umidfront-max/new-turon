<script setup>
/*
  Respublika admini paneli — yangi dizayndan (cardBlock_new.html).
  Hududlar matritsasi: viloyat qatori ochilganda tumanlar chiqadi,
  ustunlar guruhlanadi, pastda jami qatori turadi.
*/
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import AppIcon from '@/components/ui/AppIcon.vue'
import { MTX_COLS, regionRows, districtRows, totalsOf } from '@/data/admin'
import { PERIODS, PERIOD_DATA, formatNumber } from '@/data/dashboard'
import { useUi } from '@/stores/useUi'

const router = useRouter()
const { t } = useI18n()
const { toast } = useUi()

const period = ref('week')
const opened = ref(new Set())
const syncAt = ref('09:41')
const syncing = ref(false)
const exported = ref(false)

const regions = computed(() => regionRows())

const kpi = computed(() => {
  const sum = (k) => regions.value.reduce((n, r) => n + r[k], 0)
  const loss = regions.value.reduce((n, r) => n + r.loss, 0)
  return [
    { key: 'apps', v: formatNumber(sum('apps')), fg: 'var(--c23568f)', bg: 'var(--ce8eef7)', icon: 'card' },
    { key: 'blocked', v: formatNumber(sum('blocked')), fg: 'var(--c1a6e4b)', bg: 'var(--ce3f2e9)', icon: 'lock' },
    { key: 'loss', v: (loss / 1000).toFixed(1).replace('.', ','), fg: 'var(--c96620a)', bg: 'var(--cfdf3e3)', icon: 'accountBank' },
    { key: 'staff', v: String(sum('staff')), fg: 'var(--c5b3fa8)', bg: 'var(--cefeafa)', icon: 'badge' }
  ]
})

// ustun guruhlari: "Shundan" va "Muddati" sarlavhalari birlashadi
const groups = computed(() => {
  const out = []
  let i = 0
  while (i < MTX_COLS.length) {
    const g = MTX_COLS[i].grp
    let n = 1
    while (g && i + n < MTX_COLS.length && MTX_COLS[i + n].grp === g) n += 1
    const w = MTX_COLS.slice(i, i + n).reduce((s, c) => s + c.w, 0)
    out.push({ key: g || `x${i}`, label: g, w })
    i += n
  }
  return out
})

const rows = computed(() => {
  const out = []
  regions.value.forEach((r, i) => {
    const isOpen = opened.value.has(r.name)
    out.push({ ...r, kind: 'region', open: isOpen, districts: (districtRows(r, i) || []).length })
    if (isOpen) districtRows(r, i).forEach((d) => out.push({ ...d, kind: 'district' }))
  })
  return out
})

const totals = computed(() => totalsOf(regions.value))

function cellValue(row, col) {
  return formatNumber(row[col.k] || 0)
}

function cellStyle(col, row, bold) {
  return {
    width: `${col.w}px`,
    background: col.warn ? 'var(--cfdf4f3)' : 'transparent',
    color: col.warn && row[col.k] > 0 ? 'var(--ca52220)' : col.fg || (bold ? 'var(--c1c2b45)' : 'var(--c3d4d66)'),
    fontWeight: col.bold || bold ? '600' : '500'
  }
}

/* ---------- hisobot uchun tanlash ---------- */
const picked = ref(new Set())

const allPicked = computed(() =>
  regions.value.length > 0 && regions.value.every((r) => picked.value.has(r.name))
)

// bir qismi tanlangan bo'lsa — belgi o'rniga chiziqcha
const somePicked = computed(() => picked.value.size > 0 && !allPicked.value)

function togglePick(name) {
  const next = new Set(picked.value)
  if (next.has(name)) next.delete(name)
  else next.add(name)
  picked.value = next
}

function toggleAll() {
  picked.value = allPicked.value ? new Set() : new Set(regions.value.map((r) => r.name))
}

function exportMatrix() {
  const n = picked.value.size || regions.value.length
  toast(t('admin.matrix.exported', { n }))
}

function toggleRegion(name) {
  const next = new Set(opened.value)
  if (next.has(name)) next.delete(name)
  else next.add(name)
  opened.value = next
}

function openRegion(row) {
  if (!row.region) return
  router.push({ path: '/', query: { region: row.region } })
  toast(t('admin.matrix.opened', { name: row.name }))
}

function refresh() {
  if (syncing.value) return
  syncing.value = true
  setTimeout(() => {
    const d = new Date()
    const p = (n) => String(n).padStart(2, '0')
    syncAt.value = `${p(d.getHours())}:${p(d.getMinutes())}`
    syncing.value = false
    toast(t('admin.matrix.synced', { time: syncAt.value }))
  }, 900)
}

function exportReport() {
  exported.value = true
  toast(t('admin.exportDone', { file: `hududlar_${period.value}.xlsx` }))
}
</script>

<template>
  <div class="screen">
    <!-- ---------- sarlavha ---------- -->
    <div class="head card-surface">
      <div class="head-text">
        <span class="head-title">{{ $t('admin.title') }}</span>
        <span class="head-stamp">{{ PERIOD_DATA[period].stamp }}</span>
      </div>

      <div class="spacer" />

      <span v-if="exported" class="ready">
        <AppIcon name="check" :size="16" />
        {{ $t('admin.exportReady', { file: `hududlar_${period}.xlsx` }) }}
      </span>

      <button type="button" class="btn-export" @click="exportReport">
        <AppIcon name="download" :size="18" />
        {{ $t('dashboard.export') }}
      </button>

      <div class="periods">
        <button
          v-for="p in PERIODS"
          :key="p"
          type="button"
          class="period"
          :class="{ on: p === period }"
          @click="period = p"
        >{{ $t(`dashboard.periods.${p}`) }}</button>
      </div>
    </div>

    <!-- ---------- KPI ---------- -->
    <div class="kpi-grid">
      <div v-for="k in kpi" :key="k.key" class="kpi card-surface">
        <span class="kpi-ico" :style="{ background: k.bg, color: k.fg }">
          <AppIcon :name="k.icon" :size="22" />
        </span>
        <span class="kpi-body">
          <span class="kpi-label">{{ $t(`admin.kpi.${k.key}.label`) }}</span>
          <span class="kpi-row">
            <span class="kpi-value mono" :style="{ color: k.fg }">{{ k.v }}</span>
            <span class="kpi-unit">{{ $t(`admin.kpi.${k.key}.unit`) }}</span>
          </span>
        </span>
      </div>
    </div>

    <!-- ---------- hududlar matritsasi ---------- -->
    <section class="card-surface panel">
      <header class="panel-head dark-bar">
        <AppIcon name="chart" :size="24" />
        <span class="panel-title">{{ $t('admin.matrix.title') }}</span>
        <div class="spacer" />
        <button type="button" class="head-btn" :title="$t('admin.matrix.exportTip')" @click="exportMatrix">
          <AppIcon name="excel" :size="17" />
          <span>{{ $t('admin.matrix.export') }}</span>
        </button>
        <span class="sync mono">{{ $t('admin.matrix.sync', { time: syncAt }) }}</span>
        <button type="button" class="head-btn" :disabled="syncing" @click="refresh">
          <AppIcon name="refresh" :size="17" />
          <span>{{ syncing ? $t('admin.matrix.syncing') : $t('admin.matrix.refresh') }}</span>
        </button>
      </header>

      <div class="table-scroll thin-scroll">
        <table class="mtx">
          <thead>
            <tr class="groups">
              <th class="name-col" />
              <th
                v-for="g in groups"
                :key="g.key"
                :colspan="g.label ? 2 : 1"
                :style="{ width: `${g.w}px` }"
                :class="{ grouped: g.label }"
              >{{ g.label ? $t(`admin.matrix.groups.${g.label}`) : '' }}</th>
            </tr>
            <tr class="cols">
              <th class="name-col">
                <span class="name-cell">
                  <button
                    type="button"
                    class="pick"
                    :class="{ on: allPicked, some: somePicked }"
                    :title="$t('admin.matrix.pickAll')"
                    @click.stop="toggleAll"
                  >
                    <span v-if="somePicked" class="dash" />
                    <AppIcon v-else name="check" :size="14" />
                  </button>
                  {{ $t('admin.matrix.colName') }}
                </span>
              </th>
              <th
                v-for="c in MTX_COLS"
                :key="c.k"
                :style="{ width: `${c.w}px`, background: c.warn ? 'var(--cfdf4f3)' : 'var(--cf8fafc)' }"
              >{{ $t(`admin.matrix.cols.${c.k}`) }}</th>
            </tr>
          </thead>

          <tbody>
            <tr
              v-for="r in rows"
              :key="`${r.kind}-${r.name}`"
              class="mtx-row"
              :class="r.kind"
              @click="r.kind === 'region' ? toggleRegion(r.name) : openRegion(r)"
            >
              <td class="name-col">
                <span class="name-cell" :style="{ paddingLeft: r.kind === 'district' ? '28px' : '0' }">
                  <button
                    v-if="r.kind === 'region'"
                    type="button"
                    class="pick"
                    :class="{ on: picked.has(r.name) }"
                    :title="$t('admin.matrix.pickRow')"
                    @click.stop="togglePick(r.name)"
                  >
                    <AppIcon name="check" :size="14" />
                  </button>
                  <AppIcon
                    :name="r.kind === 'region' && r.open ? 'chevronUp' : 'chevronRight'"
                    :size="18"
                    class="row-chev"
                  />
                  <span class="name-text">
                    <span class="name" :class="{ sub: r.kind === 'district' }">{{ r.name }}</span>
                    <span class="name-note">
                      {{ r.kind === 'region'
                        ? $t('admin.matrix.districts', { n: r.districts })
                        : $t('admin.matrix.openList') }}
                    </span>
                  </span>
                </span>
              </td>
              <td
                v-for="c in MTX_COLS"
                :key="c.k"
                class="mono num"
                :style="cellStyle(c, r, r.kind === 'region')"
              >{{ cellValue(r, c) }}</td>
            </tr>
          </tbody>

          <tfoot>
            <tr class="total">
              <td class="name-col">{{ $t('admin.matrix.total') }}</td>
              <td v-for="c in MTX_COLS" :key="c.k" class="mono num">{{ cellValue(totals, c) }}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </section>
  </div>
</template>

<style scoped>
.screen {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.spacer {
  flex: 1;
}

/* ---------- sarlavha ---------- */
.head {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 18px;
  flex-wrap: wrap;
}

.head-text {
  display: flex;
  align-items: baseline;
  gap: 12px;
  flex-wrap: wrap;
}

.head-title {
  font-size: 20px;
  font-weight: 600;
  color: var(--c16233d);
}

.head-stamp {
  font-size: 13.5px;
  color: var(--c8b95a6);
}

.ready {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  height: 40px;
  padding: 0 13px;
  border-radius: 9px;
  background: var(--cf2f9f5);
  border: 1px solid var(--cc8e2d4);
  font-size: 13.5px;
  color: var(--c1a6e4b);
}

.btn-export {
  display: flex;
  align-items: center;
  gap: 9px;
  height: 40px;
  padding: 0 16px;
  border-radius: 9px;
  border: 1px solid var(--cc8e2d4);
  background: var(--cf2f9f5);
  color: var(--c1a6e4b);
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
}

.btn-export:hover {
  background: var(--ce6f2ec);
}

.periods {
  display: flex;
  gap: 2px;
  padding: 3px;
  background: var(--cf0f3f8);
  border-radius: 9px;
}

.period {
  padding: 8px 16px;
  border: 0;
  border-radius: 7px;
  background: transparent;
  color: var(--c66748c);
  font-size: 14px;
  cursor: pointer;
  white-space: nowrap;
}

.period.on {
  background: var(--s-card);
  box-shadow: 0 1px 2px rgba(5, 12, 28, .08);
  color: var(--c16233d);
  font-weight: 600;
}

/* ---------- KPI ---------- */
.kpi-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(212px, 1fr));
  gap: 12px;
}

.kpi {
  padding: 14px;
  display: flex;
  align-items: center;
  gap: 13px;
  min-width: 0;
}

.kpi-ico {
  width: 42px;
  height: 42px;
  flex: 0 0 42px;
  border-radius: 9px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.kpi-body {
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.kpi-label {
  font-size: 13.5px;
  color: var(--c66748c);
  font-weight: 500;
}

.kpi-row {
  display: flex;
  align-items: baseline;
  gap: 6px;
  margin-top: 3px;
}

.kpi-value {
  font-size: 28px;
  font-weight: 600;
  line-height: 1;
}

.kpi-unit {
  font-size: 13px;
  color: var(--c98a3b6);
}

/* ---------- matritsa ---------- */
.panel {
  overflow: hidden;
}

.panel-head {
  min-height: 46px;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 18px;
  color: #c9d9ec;
  flex-wrap: wrap;
}

.panel-title {
  font-size: 16px;
  font-weight: 600;
  letter-spacing: .07em;
  text-transform: uppercase;
  color: #fff;
}

.sync {
  font-size: 13px;
  color: #8fa4c2;
  white-space: nowrap;
}

.head-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  height: 34px;
  padding: 0 13px;
  border-radius: 6px;
  border: 1px solid rgba(255, 255, 255, .34);
  background: rgba(255, 255, 255, .10);
  color: #fff;
  font-size: 14.5px;
  cursor: pointer;
  white-space: nowrap;
}

.head-btn:hover:not(:disabled) {
  background: rgba(255, 255, 255, .2);
}

.head-btn:disabled {
  opacity: .6;
  cursor: default;
}

.table-scroll {
  width: 100%;
  overflow-x: auto;
}

.mtx {
  width: 100%;
  min-width: 1180px;
  border-collapse: collapse;
}

.mtx th,
.mtx td {
  padding: 10px 12px;
  text-align: right;
  font-size: 13.5px;
}

.name-col {
  text-align: left !important;
  min-width: 260px;
}

.groups th {
  height: 34px;
  font-size: 12.5px;
  font-weight: 600;
  color: var(--c8b95a6);
  text-transform: uppercase;
  letter-spacing: .05em;
  background: var(--s-card);
}

.groups th.grouped {
  background: var(--cf4f7fb);
  border: 1px solid var(--ce5e7eb);
  border-bottom: 0;
  text-align: center;
}

.cols th {
  height: 42px;
  font-size: 12.5px;
  font-weight: 700;
  letter-spacing: .04em;
  text-transform: uppercase;
  color: var(--c8b95a6);
  border-bottom: 1px solid var(--ce5e7eb);
  vertical-align: bottom;
}

.mtx-row {
  border-bottom: 1px solid var(--cf2f5f9);
  cursor: pointer;
  transition: background .14s ease;
}

.mtx-row.region:hover {
  background: var(--cf7fafd);
}

.mtx-row.district {
  background: var(--cfbfcfe);
}

.mtx-row.district:hover {
  background: var(--cf4f7fb);
}

.pick {
  width: 18px;
  height: 18px;
  flex: 0 0 18px;
  border-radius: 5px;
  border: 1px solid var(--cc8cdd6);
  background: var(--s-card);
  color: transparent;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background .14s ease, border-color .14s ease;
}

.pick.on {
  background: var(--c23568f);
  border-color: var(--c23568f);
  color: #fff;
}

.pick.some {
  border-color: var(--c23568f);
}

.dash {
  width: 9px;
  height: 2.5px;
  border-radius: 2px;
  background: var(--btn);
}

.name-cell {
  display: flex;
  align-items: center;
  gap: 9px;
}

.row-chev {
  color: var(--c8b95a6);
}

.name-text {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.name {
  font-size: 15px;
  font-weight: 600;
  color: var(--c16233d);
}

.name.sub {
  font-size: 14.5px;
  font-weight: 500;
}

.name-note {
  font-size: 12.5px;
  color: var(--c98a3b6);
}

.num {
  font-variant-numeric: tabular-nums;
}

.total td {
  height: 52px;
  background: var(--cf8fafc);
  border-top: 1px solid var(--ce5e7eb);
  font-size: 14.5px;
  font-weight: 700;
  color: var(--c16233d);
}

@media (max-width: 720px) {
  .sync {
    display: none;
  }
}
</style>
