<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import AppIcon from '@/components/ui/AppIcon.vue'
import KpiCards from '@/components/applications/KpiCards.vue'
import QueueTabs from '@/components/applications/QueueTabs.vue'
import FilterPanel from '@/components/applications/FilterPanel.vue'
import ApplicationsTable from '@/components/applications/ApplicationsTable.vue'
import TablePagination from '@/components/applications/TablePagination.vue'
import { APPLICATIONS } from '@/data/applications'
import { useUi } from '@/stores/useUi'

const router = useRouter()
const { t } = useI18n()
const { toast } = useUi()

const queue = ref('all')
const filterOpen = ref(false)
const page = ref(1)

// Navbat kaliti -> ro'yxatdagi statuslar
const QUEUE_MAP = {
  new: ['new'],
  pending: ['pending'],
  error: ['error'],
  blocked: ['blocked'],
  autopayment: ['autopayment'],
  cancelled: ['cancelled'],
  done: ['done']
}

const rows = computed(() => {
  const allowed = QUEUE_MAP[queue.value]
  const list = allowed ? APPLICATIONS.filter((a) => allowed.includes(a.status)) : APPLICATIONS
  return list.map((a, i) => ({ ...a, n: i + 1 }))
})

function openApplication(row) {
  router.push({ path: '/ariza', query: { id: row.id } })
}

function pickKpi(key) {
  queue.value = QUEUE_MAP[key] ? key : 'all'
}

function exportXlsx() {
  toast(t('applications.exportToast'))
}

function onFilters(picked) {
  filterOpen.value = false
  toast(t('applications.filtersApplied', { n: picked.length }))
}
</script>

<template>
  <div class="screen">
    <KpiCards @pick="pickKpi" />

    <QueueTabs v-model="queue" />

    <section class="table-card card-surface">
      <header class="card-head dark-bar">
        <AppIcon name="list" :size="19" />
        <span class="card-title">{{ $t('applications.title') }}</span>
        <div class="spacer" />
        <button type="button" class="head-btn" :class="{ on: filterOpen }" @click="filterOpen = !filterOpen">
          <AppIcon name="filter" :size="16" />
          <span>{{ $t('applications.filters') }}</span>
        </button>
        <button type="button" class="head-btn" @click="exportXlsx">
          <AppIcon name="download" :size="16" />
          <span>{{ $t('applications.export') }}</span>
        </button>
      </header>

      <Transition name="collapse">
        <FilterPanel
          v-if="filterOpen"
          @clear="toast($t('applications.filtersCleared'))"
          @apply="onFilters"
        />
      </Transition>

      <ApplicationsTable :rows="rows" @open="openApplication" />

      <div v-if="!rows.length" class="empty">
        <span class="empty-icon"><AppIcon name="doc" :size="27" /></span>
        <div class="empty-title">{{ $t('applications.emptyTitle') }}</div>
        <div class="empty-text">{{ $t('applications.emptyText') }}</div>
      </div>

      <TablePagination v-model="page" :total="128" />
    </section>
  </div>
</template>

<style scoped>
.screen {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.table-card {
  overflow: hidden;
}

.card-head {
  height: 46px;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 0 18px;
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
.empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 13px;
  padding: 56px 18px 60px;
}

.empty-icon {
  width: 58px;
  height: 58px;
  border-radius: 14px;
  background: var(--cf0f3f8);
  border: 1px solid var(--ce2e8f1);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--ca3adbd);
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

@media (max-width: 720px) {
  .card-head {
    padding: 0 12px;
    gap: 8px;
  }

  .card-title {
    font-size: 13.5px;
    letter-spacing: .04em;
  }

  .head-btn span {
    display: none;
  }

  .head-btn {
    padding: 0 10px;
  }
}
</style>
