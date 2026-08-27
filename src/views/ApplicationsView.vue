<script setup>
import { ref, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import AppIcon from '@/components/ui/AppIcon.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import KpiCards from '@/components/applications/KpiCards.vue'
import QueueTabs from '@/components/applications/QueueTabs.vue'
import FilterPanel from '@/components/applications/FilterPanel.vue'
import ApplicationsTable from '@/components/applications/ApplicationsTable.vue'
import TablePagination from '@/components/applications/TablePagination.vue'
import { useApplications } from '@/stores/useApplications'
import { useRegistry } from '@/stores/useRegistry'
import { filterApplications, pageSlice } from '@/utils/table'
import { exportApplications } from '@/utils/export'
import { useUi } from '@/stores/useUi'

const router = useRouter()
const route = useRoute()
const { t } = useI18n()
const { toast } = useUi()
const { items, counts, duplicateCards } = useApplications()

// Serverdagi reyestr. Javob bo'lmasa (masalan JWT hali sozlanmagan) —
// quyidagi namuna ma'lumot ishlatiladi, ekran bir xil ko'rinadi.
const registry = useRegistry()

const filterOpen = ref(false)
const exporting = ref(false)

/*
  Ekranning butun holati manzilda turadi — reyestr bitta sahifa:

    /?tab=blocked&q=karimov&page=2&per=20&af=5&at=20&f_status=new,error&f_bank=1

  Shu sababli tabdan tabga o'tganda komponent qayta yuklanmaydi, sahifa
  yangilanganda holat o'zi tiklanadi va havolani ulashish mumkin.
  Filtr guruhlari `f_` prefiksi bilan yoziladi — guruh kalitlari serverdan
  keladi, shuning uchun ular boshqa parametrlar bilan chalkashmasligi kerak.
*/
const FILTER_PREFIX = 'f_'

const asText = (v) => (typeof v === 'string' ? v : Array.isArray(v) ? v[0] || '' : '')
const asList = (v) => asText(v).split(',').map((x) => x.trim()).filter(Boolean)

/**
 * Manzilni yangilaydi. Bo'sh qiymat parametrni butunlay olib tashlaydi.
 * @param {object} patch o'zgaradigan parametrlar
 * @param {boolean} [push] tarixga yangi yozuv (tab almashganda — «orqaga» ishlashi uchun)
 */
function setQuery(patch, push = false) {
  const next = { ...route.query }

  Object.entries(patch).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') delete next[key]
    else next[key] = String(value)
  })

  // bir xil manzilga qayta o'tmaymiz
  const same = Object.keys({ ...next, ...route.query })
    .every((k) => String(next[k] ?? '') === String(route.query[k] ?? ''))
  if (same) return

  const to = { path: '/', query: next }
  if (push) router.push(to)
  else router.replace(to)
}

const queue = computed(() => asText(route.query.tab) || 'all')

const page = computed({
  get: () => Math.max(1, Number(asText(route.query.page)) || 1),
  set: (value) => setQuery({ page: value > 1 ? value : undefined })
})

const perPage = computed({
  get: () => Number(asText(route.query.per)) || 10,
  // ro'yxat uzunligi o'zgarsa birinchi sahifaga qaytamiz
  set: (value) => setQuery({ per: value === 10 ? undefined : value, page: undefined })
})

// jadval sarlavhasidagi umumiy qidiruv
const query = computed({
  get: () => asText(route.query.q),
  set: (value) => setQuery({ q: value, page: undefined })
})

// filtr panelidan qo'llangan tanlovlar: { guruh: [qiymat, ...] }
const picked = computed(() => {
  const out = {}
  Object.entries(route.query).forEach(([key, value]) => {
    if (!key.startsWith(FILTER_PREFIX)) return
    const list = asList(value)
    if (list.length) out[key.slice(FILTER_PREFIX.length)] = list
  })
  return out
})

// zarar summasi oralig'i (mln so'm) — ro'yxat emas, shuning uchun alohida
const amount = computed(() => ({
  from: asText(route.query.af),
  to: asText(route.query.at)
}))

// hudud filtri manzildan keladi: /?region=tashkentCity (admin panelidan o'tiladi)
const region = computed(() => (typeof route.query.region === 'string' ? route.query.region : ''))

/*
  Hudud chipi: admin panelidan mahalliy kalit (`tashkentCity`) bilan ham,
  serverdagi raqamli id bilan ham kelishi mumkin — nomi avval facets'dan
  qidiriladi, topilmasa tarjimadan.
*/
const regionLabel = computed(() => {
  const key = region.value
  if (!key) return ''

  const facet = registry.facetGroups.value.find((g) => g.key === 'region')
  const hit = facet?.options.find((o) => String(o.value) === String(key))
  return hit ? hit.label : t(`regions.${key}`)
})

function clearRegion() {
  setQuery({ region: undefined, page: undefined })
}

// har qanday o'zgarishda serverdan qayta so'raymiz
watch([queue, picked, amount, perPage, query, page, region], () => {
  registry.load({
    queue: queue.value,
    query: query.value,
    region: region.value,
    picked: picked.value,
    amount: amount.value,
    page: page.value,
    perPage: perPage.value
  })
}, { deep: true, immediate: true })

const filtered = computed(() => filterApplications(items.value, {
  queue: queue.value,
  region: region.value,
  picked: picked.value,
  amount: amount.value,
  query: query.value,
  dups: duplicateCards.value,
  labels: {
    flow: (a) => (a.flow === '102' ? '102' : t('flow.duty')),
    method: (a) => t(`methods.${a.method}`)
  }
}))

// serverdan kelgan bo'lsa — o'sha, aks holda namuna ma'lumot
const total = computed(() => (registry.live.value ? registry.state.total : filtered.value.length))

const rows = computed(() => (registry.live.value
  ? registry.state.rows
  : pageSlice(filtered.value, page.value, perPage.value)))

const activeFilters = computed(() =>
  Object.values(picked.value).reduce((n, list) => n + list.length, 0)
  + (amount.value.from || amount.value.to ? 1 : 0)
  + (query.value.trim() ? 1 : 0)
  + (region.value ? 1 : 0))

function openApplication(row) {
  // serverdagi yozuv bo'lsa raqamli identifikator ketadi — tafsilot shu bilan so'raladi
  router.push({ path: '/application', query: { id: row.apiId ?? row.id } })
}

// navbat almashuvi tarixga yoziladi — «orqaga» oldingi tabga qaytaradi
function pickQueue(key) {
  setQuery({ tab: key === 'all' ? undefined : key, page: undefined }, true)
}

/** Manzildagi barcha `f_*` parametrlarini o'chirish uchun bo'sh patch. */
function filterPatch() {
  const patch = {}
  Object.keys(route.query).forEach((k) => {
    if (k.startsWith(FILTER_PREFIX)) patch[k] = undefined
  })
  return patch
}

function onFilters({ groups, amount: range }) {
  const patch = filterPatch()
  groups.forEach((g) => { patch[FILTER_PREFIX + g.key] = g.values.join(',') })

  patch.af = range.from
  patch.at = range.to
  patch.page = undefined

  setQuery(patch)
  filterOpen.value = false

  // activeFilters manzilga bog'liq — yangi qiymatni shu yerda sanaymiz
  const n = groups.reduce((sum, g) => sum + g.values.length, 0)
    + (range.from || range.to ? 1 : 0)
    + (query.value.trim() ? 1 : 0)
    + (region.value ? 1 : 0)

  toast(n ? t('applications.filtersApplied', { n }) : t('applications.filtersCleared'))
}

function clearFilters() {
  setQuery({ ...filterPatch(), af: undefined, at: undefined, q: undefined, region: undefined, page: undefined })
  toast(t('applications.filtersCleared'))
}

const EXPORT_LIMIT = 1000

async function exportXlsx() {
  if (exporting.value) return

  // namuna rejimida ro'yxat qo'lda, server rejimida esa so'rov bilan olinadi
  if (!registry.live.value && !filtered.value.length) {
    toast(t('applications.exportEmpty'), 'warn')
    return
  }

  exporting.value = true
  toast(t('applications.exportToast'))

  try {
    let rows = filtered.value
    let cut = 0

    if (registry.live.value) {
      const all = await registry.loadAll({
        queue: queue.value,
        query: query.value,
        region: region.value,
        picked: picked.value,
        amount: amount.value
      }, EXPORT_LIMIT)

      rows = all.rows
      cut = Math.max(0, all.total - all.rows.length)
    }

    if (!rows.length) {
      toast(t('applications.exportEmpty'), 'warn')
      return
    }

    const name = await exportApplications(rows, t)
    toast(t('applications.exportDone', { file: name }))
    if (cut) toast(t('applications.exportPartial', { n: rows.length }), 'warn')
  } catch {
    toast(t('applications.exportFailed'), 'bad')
  } finally {
    exporting.value = false
  }
}
</script>

<template>
  <div class="screen">
    <KpiCards @pick="pickQueue" />

    <QueueTabs :model-value="queue" @update:model-value="pickQueue" />

    <section class="table-card card-surface">
      <header class="card-head dark-bar">
        <AppIcon name="list" :size="19" />
        <span class="card-title">{{ $t('applications.title') }}</span>
        <span class="card-count mono">{{ total }}</span>

        <label class="search">
          <AppIcon name="search" :size="18" />
          <input
            v-model="query"
            type="search"
            class="search-input"
            :placeholder="$t('applications.search')"
          />
          <button
            v-if="query"
            type="button"
            class="search-clear"
            :title="$t('common.clear')"
            @click="query = ''"
          >
            <AppIcon name="close" :size="15" />
          </button>
        </label>

        <div class="head-acts">
          <button
            v-if="activeFilters"
            type="button"
            class="head-btn"
            @click="clearFilters"
          >
            <AppIcon name="close" :size="15" />
            <span>{{ $t('common.clear') }}</span>
          </button>
          <button type="button" class="head-btn" :class="{ on: filterOpen }" @click="filterOpen = !filterOpen">
            <AppIcon name="filter" :size="16" />
            <span>{{ $t('applications.filters') }}</span>
            <span v-if="activeFilters" class="head-badge mono">{{ activeFilters }}</span>
          </button>
          <button
            type="button"
            class="head-btn"
            :disabled="exporting"
            :title="$t('applications.exportTitle', { n: total })"
            @click="exportXlsx"
          >
            <span v-if="exporting" class="head-spin" />
            <AppIcon v-else name="download" :size="16" />
            <span>{{ $t('applications.export') }}</span>
            <span v-if="total" class="head-badge mono">{{ total }}</span>
          </button>
        </div>
      </header>

      <div v-if="region" class="region-bar">
        <span class="region-label">{{ $t('applications.regionFilter') }}</span>
        <span class="region-chip">
          {{ regionLabel }}
          <button
            type="button"
            class="region-clear"
            :title="$t('applications.regionClear')"
            @click="clearRegion"
          >
            <AppIcon name="close" :size="14" />
          </button>
        </span>
      </div>

      <Transition name="collapse">
        <FilterPanel
          v-if="filterOpen"
          :selected="picked"
          :amount="amount"
          @clear="clearFilters"
          @apply="onFilters"
        />
      </Transition>

      <ApplicationsTable :rows="rows" @open="openApplication" />

      <EmptyState
        v-if="!rows.length"
        icon="doc"
        :title="$t('applications.emptyTitle')"
        :text="$t('applications.emptyText')"
      />

      <TablePagination
        v-if="total"
        v-model="page"
        v-model:per-page="perPage"
        :total="total"
      />
    </section>
  </div>
</template>

<style scoped>
/* ---------- umumiy qidiruv ---------- */
.search {
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 1 1 260px;
  max-width: 520px;
  height: 38px;
  margin: 0 14px;
  padding: 0 12px;
  border-radius: 9px;
  border: 1px solid rgba(255, 255, 255, .16);
  background: rgba(255, 255, 255, .07);
  color: #8fa4c2;
  transition: border-color .16s ease, background .16s ease;
}

.search:focus-within {
  border-color: rgba(255, 255, 255, .38);
  background: rgba(255, 255, 255, .12);
}

.search-input {
  flex: 1;
  min-width: 0;
  height: 100%;
  border: 0;
  outline: none;
  background: transparent;
  font-family: inherit;
  font-size: 14.5px;
  color: #fff;
}

.search-input::placeholder {
  color: #8fa4c2;
}

/* brauzerning o'z tozalash tugmasi o'rniga o'zimizniki */
.search-input::-webkit-search-cancel-button {
  display: none;
}

.search-clear {
  display: flex;
  flex: 0 0 auto;
  border: 0;
  padding: 0;
  background: transparent;
  color: #8fa4c2;
  cursor: pointer;
}

.search-clear:hover {
  color: #fff;
}

/* ---------- hudud filtri chizig'i ---------- */
.region-bar {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 11px 18px;
  background: var(--cf4f7fb);
  border-bottom: 1px solid var(--cd6e3f2);
}

.region-label {
  font-size: 13.5px;
  font-weight: 700;
  letter-spacing: .05em;
  text-transform: uppercase;
  color: var(--c8b95a6);
}

.region-chip {
  display: flex;
  align-items: center;
  gap: 9px;
  height: 30px;
  padding: 0 6px 0 12px;
  border-radius: 20px;
  background: var(--s-card);
  border: 1px solid var(--c9fc0e4, var(--kc9d9ec));
  font-size: 14.5px;
  font-weight: 600;
  color: var(--c23568f);
}

.region-clear {
  width: 22px;
  height: 22px;
  border: 0;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  background: var(--ce8eef7);
  color: var(--c23568f);
}

.region-clear:hover {
  background: var(--cd6e3f2);
}

.table-card {
  overflow: hidden;
}

.card-head {
  /* balandlik qat'iy emas: vertikal bo'shliq qidiruv va tugmalarga havo beradi */
  min-height: 46px;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
  padding: 9px 18px;
  color: #c9d9ec;
}

.card-title {
  font-size: 16px;
  font-weight: 600;
  letter-spacing: .07em;
  color: #fff;
  text-transform: uppercase;
  white-space: nowrap;
}

/* filtr va eksport tugmalari sarlavhaning o'ng chetida turadi */
.head-acts {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-left: auto;
}

.card-count {
  display: inline-flex;
  align-items: center;
  height: 22px;
  padding: 0 9px;
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, .22);
  background: rgba(255, 255, 255, .12);
  font-size: 13px;
  font-weight: 600;
  color: #fff;
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
  font-weight: 500;
  cursor: pointer;
  white-space: nowrap;
  transition: background .16s ease, transform .16s var(--ease);
}

.head-btn:hover {
  background: rgba(255, 255, 255, .20);
  transform: translateY(-1px);
}

.head-btn.on {
  background: rgba(255, 255, 255, .26);
  border-color: #fff;
}

.head-btn:disabled {
  opacity: .6;
  cursor: progress;
}

.head-btn:disabled:hover {
  background: rgba(255, 255, 255, .10);
  transform: none;
}

/* tugma ichidagi sanoq: nechta ariza eksport qilinadi / nechta filtr yoqilgan */
.head-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 21px;
  height: 21px;
  padding: 0 6px;
  margin-right: -4px;
  border-radius: 999px;
  background: rgba(255, 255, 255, .26);
  font-size: 12.5px;
  font-weight: 600;
  line-height: 1;
  color: #fff;
}

.head-spin {
  width: 15px;
  height: 15px;
  flex: 0 0 15px;
  border-radius: 50%;
  border: 2px solid rgba(255, 255, 255, .35);
  border-top-color: #fff;
  animation: headSpin .7s linear infinite;
}

@keyframes headSpin {
  to { transform: rotate(360deg) }
}

/* filtr panelining ochilishi */
.collapse-enter-active,
.collapse-leave-active {
  transition: max-height .3s var(--ease), opacity .2s ease;
  overflow: hidden;
}

.collapse-enter-from,
.collapse-leave-to {
  max-height: 0;
  opacity: 0;
}

.collapse-enter-to,
.collapse-leave-from {
  max-height: 620px;
  opacity: 1;
}

/* bo'sh holat */

@media (max-width: 720px) {
  .card-head {
    padding: 9px 12px;
    gap: 8px;
  }

  .card-title {
    font-size: 13.5px;
    letter-spacing: .04em;
  }

  .head-btn span:not(.head-badge):not(.head-spin) {
    display: none;
  }

  .head-btn {
    padding: 0 10px;
  }
}
</style>
