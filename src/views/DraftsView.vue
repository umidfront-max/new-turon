<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import AppIcon from '@/components/ui/AppIcon.vue'
import PageHead from '@/components/ui/PageHead.vue'
import { useApplications } from '@/stores/useApplications'
import { useUi } from '@/stores/useUi'

const router = useRouter()
const { t } = useI18n()
const { ask, toast } = useUi()

const AGO_KEY = { min: 'time.minAgo', hour: 'time.hourAgo', day: 'time.dayAgo' }

function ago(a) {
  if (!a || !a.n) return t('time.now')
  return t(AGO_KEY[a.unit] || AGO_KEY.day, a.n)
}

const { drafts, removeDraft } = useApplications()

const rows = computed(() => drafts.value.map((d, i) => ({ ...d, n: i + 1 })))

function resume(draft) {
  router.push({ path: '/application/new', query: { draft: draft.id } })
}

function barColor(done) {
  if (done >= 80) return 'var(--c1a6e4b)'
  if (done >= 50) return 'var(--c96620a)'
  return 'var(--ca52220)'
}

function remove(id) {
  ask({
    title: t('drafts.askTitle'),
    text: t('drafts.askText'),
    ok: t('common.remove'),
    danger: true,
    run: () => {
      removeDraft(id)
      toast(t('drafts.removed'))
    }
  })
}
</script>

<template>
  <div class="screen">
    <PageHead :title="$t('drafts.title')">
      <template #chips>
        <span class="chip">{{ $t('drafts.chip', rows.length) }}</span>
      </template>
      <template #actions>
        <button type="button" class="btn-dark" @click="router.push('/application/new')">
          <AppIcon name="plus" :size="16" />
          {{ $t('drafts.newApplication') }}
        </button>
      </template>
    </PageHead>

    <section class="card-surface list">
      <div class="list-head">
        <span class="list-title">{{ $t('drafts.listTitle') }}</span>
        <div class="spacer" />
        <span class="list-note">{{ $t('drafts.listNote') }}</span>
      </div>

      <div class="table-scroll thin-scroll">
        <table class="grid">
          <thead>
            <tr>
              <th style="width:44px">{{ $t('table.n') }}</th>
              <th style="width:176px">{{ $t('drafts.colId') }}</th>
              <th style="width:240px">{{ $t('drafts.colApplicant') }}</th>
              <th style="width:210px">{{ $t('drafts.colCard') }}</th>
              <th style="width:150px">{{ $t('drafts.colDone') }}</th>
              <th style="width:140px">{{ $t('drafts.colEdited') }}</th>
              <th style="width:196px" />
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(d, i) in rows"
              :key="d.id + d.time"
              class="row"
              :style="{ animationDelay: `${i * 30}ms` }"
            >
              <td class="mono muted">{{ d.n }}</td>
              <td>
                <div class="mono strong" :class="{ dim: d.id === '—' }">{{ d.id }}</div>
                <div class="sub">{{ d.material || $t('drafts.noNumber') }}</div>
              </td>
              <td class="clip">
                <div class="name truncate" :class="{ dim: d.name === '—' }">{{ d.name }}</div>
                <div class="sub truncate">{{ $t(`methods.${d.method}`) }}</div>
              </td>
              <td>
                <div class="mono" :class="{ dim: d.card === '—' }">{{ d.card }}</div>
                <div class="sub">
                  {{ d.tx ? `${d.bank} · ${$t('drafts.tx', d.tx)}` : $t('drafts.noRequisite') }}
                </div>
              </td>
              <td>
                <div class="bar"><span :style="{ width: d.done + '%', background: barColor(d.done) }" /></div>
                <div class="sub">{{ d.done }}% · {{ $t(`drafts.missing.${d.missing}`) }}</div>
              </td>
              <td>
                <div class="mono time">{{ d.time }}</div>
                <div class="sub">{{ ago(d.ago) }}</div>
              </td>
              <td>
                <div class="actions">
                  <button type="button" class="btn-dark sm" @click="resume(d)">
                    {{ $t('common.continue') }}
                    <AppIcon name="chevronRight" :size="15" />
                  </button>
                  <button type="button" class="icon-btn" :title="$t('common.remove')" @click="remove(d.id)">
                    <AppIcon name="trash" :size="16" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-if="!rows.length" class="empty">
        <span class="empty-icon"><AppIcon name="doc" :size="27" /></span>
        <div class="empty-title">{{ $t('drafts.emptyTitle') }}</div>
        <div class="empty-text">{{ $t('drafts.emptyText') }}</div>
      </div>
    </section>
  </div>
</template>

<style scoped>

.crumb:hover {
  color: var(--c23568f);
}

.chip {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 3px 10px;
  border-radius: 20px;
  background: var(--cf0f3f8);
  border: 1px solid var(--ce2e8f1);
  font-size: 13.5px;
  color: var(--c66748c);
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
}

.list-title {
  font-size: 14.5px;
  font-weight: 600;
  color: var(--c16233d);
}

.list-note {
  font-size: 13.5px;
  color: var(--c8b95a6);
}

.grid {
  width: 100%;
  min-width: 1060px;
  table-layout: fixed;
}

th {
  padding: 14px 13px 7px;
  font-size: 13.5px;
  font-weight: 600;
  color: var(--c3d4d66);
  text-align: left;
}

.row {
  border-top: 1px solid var(--cf2f5f9);
  animation: riseIn .3s var(--ease) backwards;
  transition: background .16s ease;
}

.row:nth-child(even) {
  background: var(--cfbfcfe);
}

.row:hover {
  background: var(--cf4f7fb);
}

.row td {
  padding: 14px 13px;
  vertical-align: middle;
}

.clip {
  max-width: 0;
  overflow: hidden;
}

.muted {
  font-size: 14px;
  color: var(--c98a3b6);
}

.strong {
  font-size: 15px;
  font-weight: 600;
}

.dim {
  color: var(--ca3adbd);
}

.name {
  font-size: 15px;
  font-weight: 500;
}

.sub {
  margin-top: 3px;
  font-size: 13px;
  color: var(--c98a3b6);
}

.time {
  font-size: 14px;
  color: var(--c3d4d66);
}

.bar {
  height: 6px;
  border-radius: 20px;
  background: var(--cf0f3f8);
  overflow: hidden;
}

.bar span {
  display: block;
  height: 100%;
  border-radius: 20px;
  transition: width .5s var(--ease);
}

.actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 9px;
}

.btn-dark {
  display: flex;
  align-items: center;
  gap: 8px;
  height: 40px;
  padding: 0 18px;
  border-radius: 8px;
  border: 1px solid var(--btn);
  background: var(--btn);
  color: #fff;
  font-size: 14.5px;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  transition: filter .16s ease, transform .16s var(--ease);
}

.btn-dark.sm {
  height: 36px;
  padding: 0 14px;
  font-size: 13.5px;
}

.btn-dark:hover {
  filter: brightness(1.2);
  transform: translateY(-1px);
}

.icon-btn {
  width: 36px;
  height: 36px;
  flex: 0 0 36px;
  border-radius: 8px;
  border: 1px solid var(--ce2e8f1);
  background: var(--s-card);
  color: var(--c66748c);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background .16s ease, border-color .16s ease, color .16s ease;
}

.icon-btn:hover {
  background: var(--cfef7f6);
  border-color: var(--cf2cfcd);
  color: var(--ca52220);
}

.empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 13px;
  padding: 64px 18px 70px;
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

@media (max-width: 640px) {
  .head {
    flex-wrap: wrap;
  }

  .btn-dark {
    width: 100%;
    justify-content: center;
  }
}
</style>
