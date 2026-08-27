<script setup>
/*
  «Karta, hisob raqam qo'shish» paneli.
  Rekvizitlar ro'yxati v-model orqali ota-komponentga qaytadi; qolgan holat
  (kiritish qoralamasi, tranzaksiya tahriri) shu yerda saqlanadi.
*/
import { ref, reactive, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import AppIcon from '@/components/ui/AppIcon.vue'
import {
  maskCard, maskAccount, maskAmount, maskDateTime, applyMask,
  digitsOnly, cardSystem, isValidDateTime
} from '@/data/form'
import { useUi } from '@/stores/useUi'

const requisites = defineModel({ type: Array, required: true })

const props = defineProps({
  // serverdan aniqlangan bank nomi; bo'lmasa raqamdan tizim hisoblanadi
  bankLabel: { type: String, default: '' },
  // /cards/identify/ topgan bankning id'si — ariza saqlanganda serverga ketadi
  bankId: { type: Number, default: null }
})

// kiritilayotgan raqam — ota-komponentdagi takroriylik ogohlantirishi uchun
const emit = defineEmits(['card'])

const { t } = useI18n()
const { toast } = useUi()

const errors = reactive({})
const draft = reactive({ kind: 'card', number: '', amount: '', time: '' })

// serverdagi javob ustun: u haqiqiy bankni biladi, cardSystem faqat BIN dan taxmin qiladi
const system = computed(() => {
  if (props.bankLabel) return props.bankLabel
  return draft.kind === 'card' ? cardSystem(draft.number) : null
})

function onCard(e) {
  draft.number = applyMask(e.target, draft.kind === 'card' ? maskCard : maskAccount)
  delete errors.number
  verified.value = false
  emit('card', draft.number)
}

function onAmount(e) {
  draft.amount = applyMask(e.target, maskAmount)
  delete errors.amount
  verified.value = false
}

function onTime(e) {
  draft.time = applyMask(e.target, maskDateTime)
  delete errors.time
  verified.value = false
}

/* tranzaksiya formasi — o'sha niqoblar */
function onTxAmount(e) { txForm.amount = applyMask(e.target, maskAmount) }
function onTxTime(e) { txForm.time = applyMask(e.target, maskDateTime) }

function pickKind(kind) {
  draft.kind = kind
  clearRequisite()
}

/* ---------- rekvizit ---------- */
const requiredLength = computed(() => (draft.kind === 'card' ? 16 : 20))

const canAdd = computed(() =>
  digitsOnly(draft.number).length === requiredLength.value
  && digitsOnly(draft.amount).length > 0
  && isValidDateTime(draft.time))

let seq = 0

// dizayndagi ikki bosqich: avval «Tekshirish», so'ng «Briktirish»
const verified = ref(false)

function markErrorsRequisite() {
  if (digitsOnly(draft.number).length !== requiredLength.value) errors.number = true
  else delete errors.number
  if (!digitsOnly(draft.amount)) errors.amount = true
  else delete errors.amount
  if (!isValidDateTime(draft.time)) errors.time = true
  else delete errors.time

  return !(errors.number || errors.amount || errors.time)
}

function checkRequisite() {
  if (!markErrorsRequisite()) {
    toast(t('form.invalid'), 'bad')
    return
  }
  verified.value = true
  toast(t('form.requisite.checked', { bank: system.value || t('form.requisite.bank') }))
}

// bitta rekvizitga bir nechta tranzaksiya biriktiriladi
function addRequisite() {
  if (!markErrorsRequisite()) {
    toast(t('form.invalid'), 'bad')
    return
  }

  seq += 1
  const exists = requisites.value.find((r) => digitsOnly(r.number) === digitsOnly(draft.number))

  if (exists) {
    // shu raqam allaqachon bor — tranzaksiya sifatida qo'shiladi
    exists.txs = [...exists.txs, { id: `t${seq}`, amount: draft.amount, time: draft.time }]
    toast(t('form.requisite.txAdded'))
  } else {
    requisites.value = [...requisites.value, {
      id: `r${seq}`,
      kind: draft.kind,
      number: draft.number,
      system: system.value,
      bank: props.bankId,
      open: true,
      txs: [{ id: `t${seq}`, amount: draft.amount, time: draft.time }]
    }]
    toast(t('form.requisite.addedToast'))
  }

  clearRequisite()
}

function clearRequisite() {
  draft.number = ''
  emit('card', '')
  draft.amount = ''
  draft.time = ''
  verified.value = false
  Object.keys(errors).forEach((k) => { if (['number', 'amount', 'time'].includes(k)) delete errors[k] })
}

function removeRequisite(id) {
  requisites.value = requisites.value.filter((r) => r.id !== id)
}

function toggleRequisite(r) {
  r.open = !r.open
}

const sumOf = (r) => maskAmount(String(r.txs.reduce((acc, x) => acc + Number(digitsOnly(x.amount)), 0)))

/* ---------- rekvizit ichidagi tranzaksiya ---------- */
// { reqId, txId | null } — yangi qo'shish yoki tahrirlash
const txForm = reactive({ reqId: null, txId: null, amount: '', time: '' })

function openTxForm(r, tx = null) {
  txForm.reqId = r.id
  txForm.txId = tx ? tx.id : null
  txForm.amount = tx ? tx.amount : ''
  txForm.time = tx ? tx.time : ''
}

function closeTxForm() {
  txForm.reqId = null
  txForm.txId = null
  txForm.amount = ''
  txForm.time = ''
}

const canSaveTx = computed(() => digitsOnly(txForm.amount).length > 0 && isValidDateTime(txForm.time))

function saveTx() {
  if (!canSaveTx.value) {
    toast(t('form.invalid'), 'bad')
    return
  }
  const r = requisites.value.find((x) => x.id === txForm.reqId)
  if (!r) return
  if (txForm.txId) {
    r.txs = r.txs.map((x) => (x.id === txForm.txId ? { ...x, amount: txForm.amount, time: txForm.time } : x))
    toast(t('form.requisite.txUpdated'))
  } else {
    seq += 1
    r.txs = [...r.txs, { id: `t${seq}`, amount: txForm.amount, time: txForm.time }]
    toast(t('form.requisite.txAdded'))
  }
  closeTxForm()
}

function removeTx(r, txId) {
  if (r.txs.length === 1) {
    removeRequisite(r.id)
    toast(t('form.requisite.removed'))
    return
  }
  r.txs = r.txs.filter((x) => x.id !== txId)
  toast(t('form.requisite.txRemoved'))
}

const txCount = computed(() => requisites.value.reduce((n, r) => n + r.txs.length, 0))

const total = computed(() => {
  const sum = requisites.value.reduce(
    (acc, r) => acc + r.txs.reduce((a, x) => a + Number(digitsOnly(x.amount)), 0), 0
  )
  return maskAmount(String(sum))
})
</script>

<template>
  <section class="card-surface block">
    <header class="block-head dark-bar">
      <AppIcon name="card" :size="18" />
      <span class="block-title">{{ $t('form.requisite.title') }}</span>
    </header>

    <div class="block-body">
      <div class="seg">
        <button
          v-for="k in ['card', 'account']"
          :key="k"
          type="button"
          class="seg-btn"
          :class="{ on: draft.kind === k }"
          @click="pickKind(k)"
        >
          <AppIcon :name="k === 'card' ? 'card' : 'bank'" :size="16" />
          {{ $t(`form.requisite.${k}`) }}
        </button>
      </div>

      <label class="field">
        <span class="label">
          {{ draft.kind === 'card' ? $t('form.requisite.cardNumber') : $t('form.requisite.accountNumber') }}
          <i class="req">*</i>
          <span class="spacer" />
          <i class="hint-text">{{ $t('form.requisite.digits', { n: requiredLength }) }}</i>
        </span>
        <span class="input-wrap" :class="{ bad: errors.number }">
          <AppIcon :name="draft.kind === 'card' ? 'card' : 'bank'" :size="17" class="input-ico" />
          <input
            :value="draft.number"
            class="input bare mono"
            :placeholder="draft.kind === 'card' ? '0000 0000 0000 0000' : '0000 0000 0000 0000 0000'"
            @input="onCard"
          />
          <span class="sys" :class="{ on: system }">
            <span class="sys-dot" />{{ system || $t('form.requisite.bank') }}
          </span>
        </span>
      </label>

      <div class="grid-2">
        <label class="field">
          <span class="label">{{ $t('form.requisite.amount') }} <i class="req">*</i></span>
          <span class="input-wrap" :class="{ bad: errors.amount }">
            <input
              :value="draft.amount"
              class="input bare mono"
              placeholder="0"
              @input="onAmount"
            />
            <span class="unit">{{ $t('form.requisite.sum') }}</span>
          </span>
        </label>

        <label class="field">
          <span class="label">{{ $t('form.requisite.time') }} <i class="req">*</i></span>
          <span class="input-wrap" :class="{ bad: errors.time }">
            <input
              :value="draft.time"
              class="input bare mono"
              :placeholder="$t('form.requisite.timePh')"
              @input="onTime"
            />
            <AppIcon name="clock" :size="16" class="input-ico right" />
          </span>
        </label>
      </div>

      <div class="block-actions">
        <button
          v-if="!verified"
          type="button"
          class="btn-dark"
          :disabled="!canAdd"
          @click="checkRequisite"
        >
          <AppIcon name="scan" :size="16" />
          {{ $t('form.requisite.check') }}
        </button>
        <button v-else type="button" class="btn-dark" @click="addRequisite">
          <AppIcon name="plus" :size="16" />
          {{ $t('form.requisite.attach') }}
        </button>
        <button type="button" class="btn-light" @click="clearRequisite">{{ $t('common.cancel') }}</button>
      </div>

      <!-- qo'shilganlar -->
      <div class="added">
        <div class="added-head">
          <span class="label">{{ $t('form.requisite.added') }}</span>
          <div class="spacer" />
          <span v-if="requisites.length" class="added-count mono">{{ $t('form.requisite.summary', { n: requisites.length, tx: txCount }) }}</span>
        </div>

        <div v-if="!requisites.length" class="added-empty">{{ $t('form.requisite.empty') }}</div>

        <div v-for="r in requisites" :key="r.id" class="req-card">
          <button type="button" class="req-head" @click="toggleRequisite(r)">
            <span class="added-ico">
              <AppIcon :name="r.kind === 'card' ? 'card' : 'accountBank'" :size="20" />
            </span>
            <span class="added-main">
              <span class="mono added-num">{{ r.number }}</span>
              <span class="added-meta">
                <span v-if="r.system" class="tag">{{ r.system }}</span>
                <span>{{ $t('form.requisite.txCount', r.txs.length) }}</span>
                <span class="mono">{{ sumOf(r) }} {{ $t('form.requisite.sum') }}</span>
              </span>
            </span>
            <AppIcon :name="r.open ? 'chevronUp' : 'chevronDown'" :size="20" class="req-chev" />
          </button>

          <div v-if="r.open" class="req-body">
            <div v-for="(tx, i) in r.txs" :key="tx.id" class="tx-row">
              <span class="tx-n mono">{{ i + 1 }}</span>
              <span class="tx-main">
                <span class="tx-amount mono">{{ tx.amount }} <span class="dim">{{ $t('form.requisite.sum') }}</span></span>
                <span class="tx-date mono">{{ tx.time }}</span>
              </span>
              <button type="button" class="icon-btn" :title="$t('admin.banks.edit')" @click="openTxForm(r, tx)">
                <AppIcon name="edit" :size="16" />
              </button>
              <button type="button" class="icon-btn danger" :title="$t('common.remove')" @click="removeTx(r, tx.id)">
                <AppIcon name="trash" :size="16" />
              </button>
            </div>

            <!-- tranzaksiya qo'shish / tahrirlash -->
            <div v-if="txForm.reqId === r.id" class="tx-form">
              <span class="input-wrap">
                <input
                  :value="txForm.amount"
                  class="input bare mono"
                  placeholder="0"
                  @input="onTxAmount"
                />
                <span class="unit">{{ $t('form.requisite.sum') }}</span>
              </span>
              <span class="input-wrap">
                <input
                  :value="txForm.time"
                  class="input bare mono"
                  :placeholder="$t('form.requisite.timePh')"
                  @input="onTxTime"
                />
                <AppIcon name="clock" :size="16" class="input-ico" />
              </span>
              <button type="button" class="btn-dark sm" :disabled="!canSaveTx" @click="saveTx">
                <AppIcon name="check" :size="16" />
                {{ txForm.txId ? $t('form.requisite.save') : $t('form.requisite.add') }}
              </button>
              <button type="button" class="icon-btn" @click="closeTxForm">
                <AppIcon name="close" :size="16" />
              </button>
            </div>

            <button v-else type="button" class="tx-add" @click="openTxForm(r)">
              <AppIcon name="plus" :size="16" />
              {{ $t('form.requisite.addTx') }}
            </button>
          </div>
        </div>

        <div v-if="requisites.length" class="added-total">
          <span>{{ $t('form.requisite.total') }}</span>
          <div class="spacer" />
          <span class="mono total-value">{{ total }} <span class="dim">{{ $t('form.requisite.sum') }}</span></span>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>

.dim {
  color: var(--c8b95a6);
}


.hint-text {
  font-style: normal;
  font-size: 13px;
  color: var(--c98a3b6);
}


.sys {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 13.5px;
  color: var(--c98a3b6);
  white-space: nowrap;
}


.sys-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--cc8cdd6);
}


.sys.on {
  color: var(--c23568f);
  font-weight: 600;
}


.sys.on .sys-dot {
  background: var(--c23568f);
}


.block-actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  flex-wrap: wrap;
}


.seg {
  display: flex;
  gap: 4px;
  padding: 4px;
  border-radius: 9px;
  background: var(--cf0f3f8);
}


.seg-btn {
  flex: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  height: 38px;
  border: 0;
  border-radius: 7px;
  background: transparent;
  color: var(--c66748c);
  font-size: 14.5px;
  font-weight: 600;
  cursor: pointer;
  transition: background .18s ease, color .18s ease, box-shadow .18s ease;
}


.seg-btn.on {
  background: var(--s-card);
  color: var(--c16233d);
  box-shadow: 0 1px 3px rgba(5, 12, 28, .14);
}


.added {
  border-top: 1px solid var(--ceef1f6);
  padding-top: 14px;
  display: flex;
  flex-direction: column;
  gap: 9px;
}


.added-head {
  display: flex;
  align-items: center;
}


.added-count {
  min-width: 22px;
  height: 22px;
  padding: 0 7px;
  border-radius: 20px;
  background: var(--ce8eef7);
  color: var(--c23568f);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 12.5px;
  font-weight: 600;
}


.added-empty {
  padding: 16px;
  border: 1px dashed var(--cc8cdd6);
  border-radius: 9px;
  text-align: center;
  font-size: 13.5px;
  color: var(--c98a3b6);
}


.added-total {
  display: flex;
  align-items: center;
  padding: 11px 12px;
  border-radius: 9px;
  background: var(--cf8fafc);
  border: 1px solid var(--ce2e8f1);
  font-size: 14px;
  color: var(--c3d4d66);
}


.total-value {
  font-size: 16px;
  font-weight: 700;
  color: var(--c16233d);
}


.req-card {
  border: 1px solid var(--ce2e8f1);
  border-radius: 10px;
  overflow: hidden;
  animation: riseIn .26s var(--ease);
}


.req-head {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 11px;
  padding: 10px 12px;
  border: 0;
  background: var(--s-card);
  cursor: pointer;
  text-align: left;
}


.req-head:hover {
  background: var(--cf8fafc);
}


.tx-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 10px;
  border-radius: 9px;
  border: 1px solid var(--ce2e8f1);
  background: var(--s-card);
}


.tx-n {
  width: 24px;
  height: 24px;
  flex: 0 0 24px;
  border-radius: 7px;
  border: 1px solid var(--ce2e8f1);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 12.5px;
  color: var(--c66748c);
}


.tx-amount {
  font-size: 14.5px;
  font-weight: 600;
  color: var(--c16233d);
}


.tx-form {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}


.tx-form .input-wrap {
  flex: 1;
  min-width: 150px;
  height: 40px;
}


.tx-add {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  height: 36px;
  padding: 0 12px;
  border-radius: 9px;
  border: 1px dashed var(--cc8cdd6);
  background: transparent;
  color: var(--c23568f);
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  align-self: flex-start;
}


.tx-add:hover {
  background: var(--ce8eef7);
  border-style: solid;
}
</style>
