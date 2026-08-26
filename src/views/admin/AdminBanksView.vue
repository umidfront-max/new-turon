<script setup>
import { ref, reactive, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import AppIcon from '@/components/ui/AppIcon.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import { binSystem } from '@/data/banks'
import { useAdmin } from '@/stores/useAdmin'
import { useUi } from '@/stores/useUi'

const { t } = useI18n()
const { toast, ask } = useUi()
const { banks, binCount, addBank, updateBank, removeBank, importBanks } = useAdmin()

const query = ref('')
const page = ref(1)
const perPage = ref(10)

const filtered = computed(() => {
  const q = query.value.trim().toLowerCase()
  if (!q) return banks.value
  return banks.value.filter((b) =>
    b.name.toLowerCase().includes(q)
    || b.mfo.includes(q)
    || b.bins.some((x) => x.includes(q)))
})

const lastPage = computed(() => Math.max(1, Math.ceil(filtered.value.length / perPage.value)))

const rows = computed(() => {
  const start = (Math.min(page.value, lastPage.value) - 1) * perPage.value
  return filtered.value.slice(start, start + perPage.value)
})

function go(p) {
  page.value = Math.min(Math.max(1, p), lastPage.value)
}

function cyclePerPage() {
  perPage.value = perPage.value === 10 ? 20 : perPage.value === 20 ? 50 : 10
  page.value = 1
}

/* ---------- qo'shish / tahrirlash oynasi ---------- */
const form = reactive({ id: null, name: '', mfo: '', bins: [''] })
const formOpen = ref(false)

function openAdd() {
  Object.assign(form, { id: null, name: '', mfo: '', bins: [''] })
  formOpen.value = true
}

function openEdit(bank) {
  Object.assign(form, { id: bank.id, name: bank.name, mfo: bank.mfo, bins: [...bank.bins] })
  formOpen.value = true
}

function addBin() {
  form.bins = [...form.bins, '']
}

function setBin(i, value) {
  const next = [...form.bins]
  next[i] = value.replace(/\D/g, '').slice(0, 6)
  form.bins = next
}

function removeBin(i) {
  form.bins = form.bins.filter((_, k) => k !== i)
  if (!form.bins.length) form.bins = ['']
}

const canSave = computed(() => form.name.trim() && form.mfo.trim() && form.bins.some((b) => b.length >= 6))

function save() {
  if (!canSave.value) {
    toast(t('admin.banks.invalid'), 'bad')
    return
  }
  const payload = { name: form.name, mfo: form.mfo, bins: form.bins.filter((b) => b.length >= 6) }
  if (form.id) {
    updateBank(form.id, payload)
    toast(t('admin.banks.updated', { name: payload.name }))
  } else {
    addBank(payload)
    toast(t('admin.banks.added', { name: payload.name }))
  }
  formOpen.value = false
}

function confirmRemove(bank) {
  ask({
    title: t('admin.banks.removeTitle'),
    text: t('admin.banks.removeText', { name: bank.name }),
    ok: t('common.remove'),
    danger: true,
    run: () => {
      removeBank(bank.id)
      toast(t('admin.banks.removed', { name: bank.name }))
    }
  })
}

/* ---------- Excel importi (namuna) ---------- */
const importOpen = ref(false)

const IMPORT_SAMPLE = [
  { name: 'Yangi bank', mfo: '01200', bins: ['860100'] },
  { name: 'Milliy karta bank', mfo: '01201', bins: ['860101', '986030'] },
  { name: 'Innovatsiya bank', mfo: '01202', bins: ['860102'] }
]

function runImport() {
  const n = importBanks(IMPORT_SAMPLE)
  importOpen.value = false
  toast(t('admin.banks.imported', { n }))
}
</script>

<template>
  <div class="screen">
    <section class="card-surface panel">
      <header class="panel-head dark-bar">
        <AppIcon name="accountBank" :size="26" />
        <span class="panel-title">{{ $t('admin.banks.title') }}</span>
        <span class="panel-count mono">{{ $t('admin.banks.count', { n: banks.length, bins: binCount }) }}</span>
        <div class="spacer" />

        <span class="search">
          <AppIcon name="search" :size="18" />
          <input v-model="query" class="search-input" :placeholder="$t('admin.banks.search')" @input="page = 1" />
        </span>

        <button type="button" class="head-btn" @click="importOpen = true">
          <AppIcon name="upload" :size="17" />
          <span>{{ $t('admin.banks.import') }}</span>
        </button>
        <button type="button" class="head-btn primary" @click="openAdd">
          <AppIcon name="plus" :size="17" />
          <span>{{ $t('admin.banks.add') }}</span>
        </button>
      </header>

      <div class="table-scroll thin-scroll">
        <div class="grid">
          <div class="row head">
            <span>{{ $t('admin.banks.colName') }}</span>
            <span>{{ $t('admin.banks.colMfo') }}</span>
            <span>{{ $t('admin.banks.colBins') }}</span>
            <span class="right" />
          </div>

          <div v-for="b in rows" :key="b.id" class="row" :class="{ off: !b.active }">
            <div class="bank">
              <span class="bank-ico"><AppIcon name="accountBank" :size="20" /></span>
              <span class="bank-name truncate">{{ b.name }}</span>
            </div>
            <span class="mono mfo">{{ b.mfo }}</span>
            <span class="bins">
              <span v-for="bin in b.bins" :key="bin" class="bin mono">
                <span class="bin-sys">{{ binSystem(bin) }}</span>
                {{ bin }}
              </span>
            </span>
            <span class="actions">
              <button type="button" class="icon-btn" :title="$t('admin.banks.edit')" @click="openEdit(b)">
                <AppIcon name="edit" :size="18" />
              </button>
              <button type="button" class="icon-btn danger" :title="$t('common.remove')" @click="confirmRemove(b)">
                <AppIcon name="trash" :size="18" />
              </button>
            </span>
          </div>
        </div>
      </div>

      <EmptyState
        v-if="!rows.length"
        :icon="banks.length ? 'searchOff' : 'accountBank'"
        :title="banks.length ? $t('admin.banks.emptyTitle') : $t('admin.banks.noneTitle')"
        :text="banks.length ? $t('admin.banks.emptyText', { q: query }) : $t('admin.banks.noneText')"
      >
        <div v-if="!banks.length" class="empty-actions">
          <button type="button" class="btn-dark" @click="openAdd">
            <AppIcon name="plus" :size="16" />
            {{ $t('admin.banks.add') }}
          </button>
          <button type="button" class="btn-light" @click="importOpen = true">
            <AppIcon name="upload" :size="16" />
            {{ $t('admin.banks.import') }}
          </button>
        </div>
      </EmptyState>

      <div v-if="rows.length" class="pager">
        <div class="spacer" />
        <button type="button" class="per-page" @click="cyclePerPage">
          <span>{{ $t('pager.perPage', perPage) }}</span>
          <AppIcon name="chevronDown" :size="14" />
        </button>
        <button type="button" class="sq" :disabled="page <= 1" @click="go(page - 1)">
          <AppIcon name="chevronLeft" :size="16" />
        </button>
        <button
          v-for="p in lastPage"
          :key="p"
          type="button"
          class="page"
          :class="{ on: p === page }"
          @click="go(p)"
        >{{ p }}</button>
        <button type="button" class="sq" :disabled="page >= lastPage" @click="go(page + 1)">
          <AppIcon name="chevronRight" :size="16" />
        </button>
        <span class="hint">{{ $t('pager.total', { n: filtered.length }) }}</span>
      </div>
    </section>

    <!-- ---------- bank qo'shish / tahrirlash ---------- -->
    <Transition name="fade">
      <div v-if="formOpen" class="modal-root" @click.self="formOpen = false">
        <div class="modal">
          <div class="modal-head">
            <span class="modal-title">{{ form.id ? $t('admin.banks.editTitle') : $t('admin.banks.addTitle') }}</span>
            <div class="spacer" />
            <button type="button" class="icon-btn" @click="formOpen = false">
              <AppIcon name="close" :size="18" />
            </button>
          </div>

          <div class="modal-body thin-scroll">
            <label class="field">
              <span class="label">{{ $t('admin.banks.colName') }} <i class="req">*</i></span>
              <input v-model="form.name" class="input" :placeholder="$t('admin.banks.namePh')" />
            </label>

            <label class="field">
              <span class="label">{{ $t('admin.banks.colMfo') }} <i class="req">*</i></span>
              <input
                :value="form.mfo"
                class="input mono"
                placeholder="00000"
                @input="form.mfo = $event.target.value.replace(/\D/g, '').slice(0, 5)"
              />
            </label>

            <div class="field">
              <span class="label">
                {{ $t('admin.banks.colBins') }} <i class="req">*</i>
                <span class="spacer" />
                <button type="button" class="link" @click="addBin">
                  <AppIcon name="plus" :size="15" />
                  {{ $t('admin.banks.addBin') }}
                </button>
              </span>
              <div class="bin-list">
                <span v-for="(bin, i) in form.bins" :key="i" class="bin-row">
                  <input
                    :value="bin"
                    class="input mono"
                    placeholder="860000"
                    @input="setBin(i, $event.target.value)"
                  />
                  <span v-if="bin.length >= 4" class="bin-sys chip">{{ binSystem(bin) }}</span>
                  <button type="button" class="icon-btn" @click="removeBin(i)">
                    <AppIcon name="close" :size="16" />
                  </button>
                </span>
              </div>
              <span class="hint-text">{{ $t('admin.banks.binHint') }}</span>
            </div>
          </div>

          <div class="modal-foot">
            <div class="spacer" />
            <button type="button" class="btn-light" @click="formOpen = false">{{ $t('common.cancel') }}</button>
            <button type="button" class="btn-dark" :disabled="!canSave" @click="save">
              <AppIcon name="check" :size="16" />
              {{ $t('admin.banks.save') }}
            </button>
          </div>
        </div>
      </div>
    </Transition>

    <!-- ---------- Excel importi ---------- -->
    <Transition name="fade">
      <div v-if="importOpen" class="modal-root" @click.self="importOpen = false">
        <div class="modal">
          <div class="modal-head">
            <AppIcon name="upload" :size="22" />
            <span class="modal-title">{{ $t('admin.banks.importTitle') }}</span>
            <div class="spacer" />
            <button type="button" class="icon-btn" @click="importOpen = false">
              <AppIcon name="close" :size="18" />
            </button>
          </div>

          <div class="modal-body thin-scroll">
            <div class="file">
              <AppIcon name="excel" :size="20" />
              <span class="file-name mono">banklar_2026.xlsx</span>
              <span class="chip">{{ $t('admin.banks.importCount', { n: IMPORT_SAMPLE.length }) }}</span>
            </div>

            <div class="grid preview">
              <div class="row head">
                <span>{{ $t('admin.banks.colName') }}</span>
                <span>{{ $t('admin.banks.colBins') }}</span>
              </div>
              <div v-for="r in IMPORT_SAMPLE" :key="r.mfo" class="row">
                <span class="bank-name">{{ r.name }}</span>
                <span class="bins">
                  <span v-for="bin in r.bins" :key="bin" class="bin mono">
                    <span class="bin-sys">{{ binSystem(bin) }}</span>
                    {{ bin }}
                  </span>
                </span>
              </div>
            </div>
          </div>

          <div class="modal-foot">
            <div class="spacer" />
            <button type="button" class="btn-light" @click="importOpen = false">{{ $t('common.cancel') }}</button>
            <button type="button" class="btn-dark" @click="runImport">
              <AppIcon name="plus" :size="16" />
              {{ $t('admin.banks.importDo') }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>

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

.panel-count {
  font-size: 13.5px;
  color: #8fa4c2;
}

.search {
  display: flex;
  align-items: center;
  gap: 8px;
  height: 34px;
  padding: 0 12px;
  border-radius: 6px;
  border: 1px solid rgba(255, 255, 255, .34);
  background: rgba(255, 255, 255, .10);
  color: #c9d9ec;
  min-width: 220px;
}

.search-input {
  flex: 1;
  min-width: 0;
  border: 0;
  background: transparent;
  color: #fff;
  font-size: 14px;
}

.search-input::placeholder {
  color: #8fa4c2;
}

.search-input:focus {
  outline: none;
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
  transition: background .16s ease;
}

.head-btn:hover {
  background: rgba(255, 255, 255, .2);
}

.head-btn.primary {
  background: #2f6fd0;
  border-color: #2f6fd0;
}

/* ---------- jadval ---------- */

.grid {
  min-width: 720px;
}

.row {
  display: grid;
  grid-template-columns: 1.6fr 110px 1.4fr 92px;
  gap: 16px;
  align-items: center;
  padding: 0 18px;
  min-height: 58px;
  border-bottom: 1px solid var(--ceef1f6);
}

.row.head {
  min-height: 42px;
  background: var(--cf8fafc);
  border-bottom: 1px solid var(--ce5e7eb);
  font-size: 12.5px;
  font-weight: 700;
  letter-spacing: .05em;
  text-transform: uppercase;
  color: var(--c8b95a6);
}

.row.off {
  opacity: .55;
}

.bank {
  display: flex;
  align-items: center;
  gap: 11px;
  min-width: 0;
}

.bank-ico {
  width: 34px;
  height: 34px;
  flex: 0 0 34px;
  border-radius: 9px;
  background: var(--ce8eef7);
  color: var(--c23568f);
  display: flex;
  align-items: center;
  justify-content: center;
}

.bank-name {
  font-size: 14.5px;
  font-weight: 500;
  color: var(--c16233d);
}

.mfo {
  font-size: 14px;
  color: var(--c3d4d66);
}

.bins {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.bin {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 3px 10px;
  border-radius: 20px;
  background: var(--cf0f3f8);
  border: 1px solid var(--ce2e8f1);
  font-size: 13px;
  color: var(--c16233d);
}

.bin-sys {
  font-size: 11.5px;
  font-weight: 600;
  letter-spacing: .04em;
  text-transform: uppercase;
  color: var(--c8b95a6);
}

.actions {
  display: flex;
  gap: 6px;
  justify-content: flex-end;
}

.icon-btn {
  width: 34px;
  height: 34px;
  border-radius: 8px;
  border: 1px solid var(--ce2e8f1);
  background: var(--s-card);
  color: var(--c66748c);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background .16s ease, color .16s ease;
}

.icon-btn:hover {
  background: var(--cf4f7fb);
  color: var(--c23568f);
}

.icon-btn.danger:hover {
  background: var(--cfceceb);
  color: var(--ca52220);
}

/* ---------- bo'sh holat ---------- */

/* ---------- sahifalagich ---------- */
.pager {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  flex-wrap: wrap;
}

.per-page,
.sq,
.page {
  height: 32px;
  min-width: 32px;
  padding: 0 10px;
  border-radius: 7px;
  border: 1px solid var(--ce2e8f1);
  background: var(--s-card);
  color: var(--c4b5a73);
  font-size: 13.5px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.page.on {
  background: var(--btn);
  border-color: var(--btn);
  color: #fff;
  font-weight: 600;
}

.sq:disabled {
  opacity: .45;
  cursor: not-allowed;
}

.hint {
  font-size: 13.5px;
  color: var(--c8b95a6);
  white-space: nowrap;
}

/* ---------- oyna ---------- */
.modal-root {
  position: fixed;
  inset: 0;
  z-index: 120;
  background: rgba(5, 12, 28, .42);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
}

.modal {
  width: 560px;
  max-width: 100%;
  max-height: 88vh;
  display: flex;
  flex-direction: column;
  background: var(--s-card);
  border-radius: 14px;
  box-shadow: 0 14px 34px rgba(5, 12, 28, .16);
  overflow: hidden;
}

.modal-head {
  display: flex;
  align-items: center;
  gap: 11px;
  padding: 18px 20px 16px;
  border-bottom: 1px solid var(--ce5e7eb);
  color: var(--c23568f);
}

.modal-title {
  font-size: 17.5px;
  font-weight: 600;
  color: var(--c16233d);
}

.modal-body {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: 16px 20px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.modal-foot {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 20px;
  background: var(--cfafbfc);
  border-top: 1px solid var(--ce5e7eb);
}

.field {
  display: flex;
  flex-direction: column;
  gap: 7px;
}

.label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  color: var(--c3d4d66);
}

.req {
  color: var(--ca52220);
  font-style: normal;
}

.input {
  width: 100%;
  height: 44px;
  padding: 0 13px;
  border-radius: 8px;
  border: 1px solid var(--ce2e8f1);
  background: var(--s-card);
  color: var(--c16233d);
  font-size: 15px;
}

.input:focus {
  outline: none;
  border-color: var(--c23568f);
  box-shadow: 0 0 0 3px var(--ce8eef7);
}

.link {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  border: 0;
  background: transparent;
  color: var(--c23568f);
  font-size: 13.5px;
  font-weight: 600;
  cursor: pointer;
}

.bin-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.bin-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.chip {
  padding: 4px 10px;
  border-radius: 20px;
  background: var(--cf0f3f8);
  border: 1px solid var(--ce2e8f1);
  font-size: 12.5px;
  color: var(--c66748c);
  white-space: nowrap;
}

.hint-text {
  font-size: 13px;
  color: var(--c98a3b6);
}

.file {
  display: flex;
  align-items: center;
  gap: 11px;
  padding: 13px 14px;
  border-radius: 10px;
  background: var(--cf2f9f5);
  border: 1px solid var(--cc8e2d4);
  color: var(--c1a6e4b);
}

.file-name {
  flex: 1;
  min-width: 0;
  font-size: 14.5px;
  color: var(--c16233d);
}

.preview .row {
  grid-template-columns: 1.4fr 1fr;
  min-height: 50px;
  padding: 0 12px;
}

.preview {
  min-width: 0;
  border: 1px solid var(--ce2e8f1);
  border-radius: 10px;
  overflow: hidden;
}

.empty-actions {
  display: flex;
  gap: 10px;
  margin-top: 14px;
  flex-wrap: wrap;
  justify-content: center;
}

.btn-light,
.btn-dark {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  height: 42px;
  padding: 0 18px;
  border-radius: 10px;
  font-size: 14.5px;
  font-weight: 600;
  cursor: pointer;
}

.btn-light {
  border: 1px solid var(--ce5e7eb);
  background: var(--s-card);
  color: var(--c3d4d66);
}

.btn-light:hover {
  background: var(--cf6f8fb);
}

.btn-dark {
  border: 1px solid var(--btn);
  background: var(--btn);
  color: #fff;
}

.btn-dark:disabled {
  opacity: .5;
  cursor: not-allowed;
}

@media (max-width: 720px) {
  .search {
    min-width: 100%;
    order: 5;
  }

  .hint {
    display: none;
  }
}
</style>
