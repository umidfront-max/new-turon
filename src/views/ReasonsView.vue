<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import AppIcon from '@/components/ui/AppIcon.vue'
import { BLOCK_REASONS } from '@/data/reasons'

const router = useRouter()
const { t } = useI18n()

const search = ref('')

const rows = computed(() => {
  const q = search.value.trim().toLowerCase()
  if (!q) return BLOCK_REASONS
  return BLOCK_REASONS.filter((r) => {
    const name = t(`reasons.items.${r.key}.name`).toLowerCase()
    const text = t(`reasons.items.${r.key}.text`).toLowerCase()
    return r.code.toLowerCase().includes(q) || name.includes(q) || text.includes(q)
  })
})
</script>

<template>
  <div class="screen">
    <div class="head card-surface">
      <div class="head-text">
        <div class="crumbs">
          <button type="button" class="crumb" @click="router.push('/')">{{ $t('modules.cardblock') }}</button>
          <span>/</span>
          <span class="crumb-now">{{ $t('reasons.title') }}</span>
        </div>
        <div class="head-row">
          <span class="head-title">{{ $t('reasons.title') }}</span>
          <span class="chip">{{ $t('reasons.chip', BLOCK_REASONS.length) }}</span>
        </div>
      </div>

      <div class="spacer" />

      <span class="search">
        <AppIcon name="search" :size="17" class="search-ico" />
        <input v-model="search" class="search-input" :placeholder="$t('common.search')" />
      </span>
    </div>

    <section class="card-surface list">
      <div class="list-head">
        <AppIcon name="book" :size="18" />
        <span class="list-title">{{ $t('reasons.listTitle') }}</span>
        <div class="spacer" />
        <span class="list-note">{{ $t('reasons.note') }}</span>
      </div>

      <div class="table-scroll thin-scroll">
        <table class="grid">
          <thead>
            <tr>
              <th style="width:96px">{{ $t('reasons.colCode') }}</th>
              <th style="width:auto">{{ $t('reasons.colName') }}</th>
              <th style="width:150px">{{ $t('reasons.colTerm') }}</th>
              <th style="width:130px" class="right">{{ $t('reasons.colCount') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(r, i) in rows"
              :key="r.code"
              class="row"
              :style="{ animationDelay: `${i * 26}ms` }"
            >
              <td><span class="code mono">{{ r.code }}</span></td>
              <td>
                <div class="name">{{ $t(`reasons.items.${r.key}.name`) }}</div>
                <div class="sub">{{ $t(`reasons.items.${r.key}.text`) }}</div>
              </td>
              <td>
                <span class="term" :class="{ fast: r.term <= 2, slow: r.term >= 10 }">
                  <AppIcon name="clock" :size="14" />
                  {{ $t('reasons.term', r.term) }}
                </span>
              </td>
              <td class="right mono count">{{ r.count }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-if="!rows.length" class="empty">
        <span class="empty-icon"><AppIcon name="search" :size="26" /></span>
        <div class="empty-title">{{ $t('reasons.emptyTitle') }}</div>
        <div class="empty-text">{{ $t('reasons.emptyText') }}</div>
      </div>
    </section>
  </div>
</template>

<style scoped>

.head {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 18px;
  flex-wrap: wrap;
}

.crumb:hover {
  color: var(--c23568f);
}

.chip {
  display: inline-flex;
  align-items: center;
  padding: 3px 10px;
  border-radius: 20px;
  background: var(--cf0f3f8);
  border: 1px solid var(--ce2e8f1);
  font-size: 13.5px;
  color: var(--c66748c);
}

.search {
  display: flex;
  align-items: center;
  gap: 9px;
  height: 40px;
  padding: 0 13px;
  border-radius: 8px;
  border: 1px solid var(--ce2e8f1);
  background: var(--s-card);
  min-width: 240px;
}

.search:focus-within {
  border-color: var(--c23568f);
  box-shadow: 0 0 0 3px var(--ce8eef7);
}

.search-ico {
  color: var(--c8b95a6);
}

.search-input {
  flex: 1;
  min-width: 0;
  border: 0;
  background: transparent;
  font-size: 14.5px;
  color: var(--c16233d);
}

.search-input:focus {
  outline: none;
}

.list {
  overflow: hidden;
}

.list-head {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 18px;
  border-bottom: 1px solid var(--ceef1f6);
  color: var(--c16233d);
}

.list-title {
  font-size: 14.5px;
  font-weight: 600;
}

.list-note {
  font-size: 13.5px;
  color: var(--c8b95a6);
}

.grid {
  width: 100%;
  min-width: 720px;
  table-layout: fixed;
}

th {
  padding: 13px;
  font-size: 13.5px;
  font-weight: 600;
  color: var(--c3d4d66);
  text-align: left;
}

.right {
  text-align: right;
}

.row {
  border-top: 1px solid var(--cf2f5f9);
  animation: riseIn .3s var(--ease) backwards;
  transition: background .16s ease;
}

.row:hover {
  background: var(--cf4f7fb);
}

.row td {
  padding: 13px;
  vertical-align: top;
}

.code {
  display: inline-flex;
  align-items: center;
  padding: 3px 9px;
  border-radius: 7px;
  background: var(--ce8eef7);
  color: var(--c23568f);
  font-size: 13px;
  font-weight: 600;
}

.name {
  font-size: 15px;
  font-weight: 600;
  color: var(--c16233d);
}

.sub {
  margin-top: 3px;
  font-size: 13.5px;
  line-height: 1.5;
  color: var(--c8b95a6);
}

.term {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  border-radius: 20px;
  background: var(--cfdf3e3);
  color: var(--c96620a);
  font-size: 13.5px;
  white-space: nowrap;
}

.term.fast {
  background: var(--ce3f2e9);
  color: var(--c1a6e4b);
}

.term.slow {
  background: var(--cf0f3f8);
  color: var(--c4b5a73);
}

.count {
  font-size: 15px;
  font-weight: 600;
  color: var(--c3d4d66);
}

.empty {
  padding: 44px 20px;
  text-align: center;
}

.empty-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: var(--cf0f3f8);
  color: var(--c8b95a6);
  margin-bottom: 12px;
}

.empty-title {
  font-size: 15.5px;
  font-weight: 600;
  color: var(--c16233d);
}

.empty-text {
  margin-top: 4px;
  font-size: 14px;
  color: var(--c8b95a6);
}

@media (max-width: 640px) {
  .search {
    width: 100%;
  }
}
</style>
