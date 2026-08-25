<script setup>
import { ref, reactive, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import AppIcon from '@/components/ui/AppIcon.vue'
import {
  METHOD_OPTIONS, SOURCE_OPTIONS, REGION_OPTIONS,
  maskCard, maskAccount, maskAmount, maskPhone, maskDateTime,
  digitsOnly, cardSystem, isValidDateTime
} from '@/data/form'
import { useUi } from '@/stores/useUi'
import { useApplications } from '@/stores/useApplications'

const route = useRoute()
const router = useRouter()
const { t } = useI18n()
const { ask, toast } = useUi()
const { items, draftById, removeDraft, addApplication } = useApplications()

/* ---------- forma holati ---------- */
const form = reactive({
  id: '',
  material: '',
  method: '',
  source: '',
  fabula: '',
  fio: '',
  phone: '',
  phone2: '',
  region: '',
  address: ''
})

const requisites = ref([])

const draft = reactive({ kind: 'card', number: '', amount: '', time: '' })

// tekshirilgan bloklar
const checked = reactive({ app: false, applicant: false })
// ko'rsatilgan xatolar: { maydon: true }
const errors = reactive({})

/* ---------- qoralama taymeri ---------- */
const elapsed = ref(0)
let timer = null

const draftTime = computed(() => {
  const m = Math.floor(elapsed.value / 60)
  const s = elapsed.value % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
})

// qoralamadan davom etish: /application/new?draft=<id>
const draftId = typeof route.query.draft === 'string' ? route.query.draft : null

function loadDraft() {
  const d = draftId && draftById(draftId)
  if (!d) return
  form.id = d.id && d.id !== '—' ? d.id : ''
  form.material = d.material && d.material !== '—' ? d.material : ''
  form.method = ['vishing', 'phishing', 'fakeShop', 'fakeInvest', 'simSwap', 'apk', 'fakeSupport', 'other']
    .includes(d.method) ? d.method : ''
  form.fio = d.name && d.name !== '—' ? d.name : ''
  if (d.card && d.card !== '—') {
    draft.number = d.card.replace(/\*/g, '0')
  }
  toast(t('form.draftLoaded'))
}

onMounted(() => {
  timer = setInterval(() => { elapsed.value += 1 }, 1000)
  loadDraft()
})
onBeforeUnmount(() => {
  clearInterval(timer)
  clearInterval(recTimer)
  clearInterval(playTimer)
})

/* ---------- maskalar ---------- */
function onCard(e) {
  draft.number = draft.kind === 'card' ? maskCard(e.target.value) : maskAccount(e.target.value)
  delete errors.number
}

function onAmount(e) {
  draft.amount = maskAmount(e.target.value)
  delete errors.amount
}

function onTime(e) {
  draft.time = maskDateTime(e.target.value)
  delete errors.time
}

function onPhone(e) {
  form.phone = maskPhone(e.target.value)
  delete errors.phone
}

function onPhone2(e) {
  form.phone2 = maskPhone(e.target.value)
}

function openApplication(id) {
  router.push({ path: '/application', query: { id } })
}

function onFio(e) {
  form.fio = e.target.value.toUpperCase().replace(/[^A-Z'\s-]/g, '')
  delete errors.fio
}

const system = computed(() => (draft.kind === 'card' ? cardSystem(draft.number) : null))

/* ---------- karta takroriyligi ---------- */
// kiritilayotgan raqam ro'yxatdagi arizalarda uchrasa — ogohlantiramiz
const duplicates = computed(() => {
  const digits = digitsOnly(draft.number)
  if (digits.length < 16) return []
  return items.value.filter((a) => digitsOnly(a.card) === digits)
})

/* ---------- tekshiruvlar ---------- */
const REQUIRED_APP = ['id', 'method', 'source', 'fabula']
const REQUIRED_APPLICANT = ['fio', 'phone', 'region']

function markErrors(fields) {
  const bad = []
  fields.forEach((f) => {
    const value = String(form[f] || '').trim()
    const short = f === 'fabula' && value.length < 20
    const phone = f === 'phone' && digitsOnly(value).length !== 12
    if (!value || short || phone) {
      errors[f] = true
      bad.push(f)
    } else {
      delete errors[f]
    }
  })
  return bad
}

function checkBlock(block) {
  const fields = block === 'app' ? REQUIRED_APP : REQUIRED_APPLICANT
  const bad = markErrors(fields)
  checked[block] = !bad.length
  toast(bad.length ? t('form.invalid') : t('form.checked'), bad.length ? 'bad' : 'ok')
}

function clearBlock(block) {
  const fields = block === 'app' ? REQUIRED_APP : REQUIRED_APPLICANT
  fields.concat(block === 'app' ? ['material'] : ['address']).forEach((f) => {
    form[f] = ''
    delete errors[f]
  })
  checked[block] = false
}

/* ---------- rekvizit ---------- */
const requiredLength = computed(() => (draft.kind === 'card' ? 16 : 20))

const canAdd = computed(() =>
  digitsOnly(draft.number).length === requiredLength.value
  && digitsOnly(draft.amount).length > 0
  && isValidDateTime(draft.time))

let seq = 0

// bitta rekvizitga bir nechta tranzaksiya biriktiriladi
function addRequisite() {
  if (digitsOnly(draft.number).length !== requiredLength.value) errors.number = true
  else delete errors.number
  if (!digitsOnly(draft.amount)) errors.amount = true
  else delete errors.amount
  if (!isValidDateTime(draft.time)) errors.time = true
  else delete errors.time

  if (errors.number || errors.amount || errors.time) {
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
      open: true,
      txs: [{ id: `t${seq}`, amount: draft.amount, time: draft.time }]
    }]
    toast(t('form.requisite.addedToast'))
  }

  clearRequisite()
}

function clearRequisite() {
  draft.number = ''
  draft.amount = ''
  draft.time = ''
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

/* ---------- fabula ---------- */
const HINTS = ['asked', 'transfer', 'noticed', 'contact']

function addHint(key) {
  const line = t(`form.app.hints.${key}`)
  form.fabula = form.fabula ? `${form.fabula.trimEnd()}\n${line} ` : `${line} `
  delete errors.fabula
}

/* ---------- ovozli fabula ---------- */
// namuna yozuv: mikrofon so'ralmaydi, faqat interfeys holatlari
const rec = reactive({ state: 'idle', seconds: 0, length: 0, playing: 0 })
let recTimer = null
let playTimer = null

const WAVE = [10, 16, 22, 14, 26, 18, 12, 24, 20, 15, 23, 11, 19, 25, 13, 21]

function clock(sec) {
  const m = Math.floor(sec / 60)
  const s = Math.floor(sec % 60)
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

function startRec() {
  rec.state = 'recording'
  rec.seconds = 0
  clearInterval(recTimer)
  recTimer = setInterval(() => { rec.seconds += 1 }, 1000)
}

function cancelRec() {
  clearInterval(recTimer)
  rec.state = 'idle'
  rec.seconds = 0
}

function saveRec() {
  clearInterval(recTimer)
  rec.length = Math.max(1, rec.seconds)
  rec.state = 'saved'
  rec.seconds = 0
  toast(t('form.app.recSaved', { time: clock(rec.length) }))
}

function removeRec() {
  clearInterval(playTimer)
  rec.state = 'idle'
  rec.length = 0
  rec.playing = 0
}

function togglePlay() {
  if (rec.state === 'playing') {
    clearInterval(playTimer)
    rec.state = 'saved'
    return
  }
  rec.state = 'playing'
  playTimer = setInterval(() => {
    rec.playing += 1
    if (rec.playing >= rec.length) {
      clearInterval(playTimer)
      rec.playing = 0
      rec.state = 'saved'
    }
  }, 1000)
}

/* ---------- yuborish ---------- */
const ready = computed(() =>
  REQUIRED_APP.every((f) => String(form[f] || '').trim())
  && form.fabula.trim().length >= 20
  && REQUIRED_APPLICANT.every((f) => String(form[f] || '').trim())
  && digitsOnly(form.phone).length === 12
  && requisites.value.length > 0)

function submit() {
  const bad = [...markErrors(REQUIRED_APP), ...markErrors(REQUIRED_APPLICANT)]
  if (bad.length || !requisites.value.length) {
    toast(requisites.value.length ? t('form.invalid') : t('form.requisite.needOne'), 'bad')
    return
  }
  ask({
    title: t('form.askTitle'),
    text: t('form.askText', { n: requisites.value.length, amount: total.value }),
    ok: t('form.submit'),
    run: () => {
      const first = requisites.value[0]
      const item = addApplication({
        material: form.id.trim() || null,          // KJ-raqami jadvalda material ustunida
        source: form.source,
        name: form.fio.trim(),
        method: form.method,
        card: first.number,
        bank: first.system,
        amount: total.value,
        region: form.region
      })
      if (draftId) removeDraft(draftId)
      toast(t('form.addedToList'))
      router.push({ path: '/application', query: { id: item.id } })
    }
  })
}

function cancelAll() {
  ask({
    title: t('form.cancelTitle'),
    text: t('form.cancelText'),
    ok: t('common.remove'),
    danger: true,
    run: () => {
      toast(t('form.cancelled'), 'warn')
      router.push('/')
    }
  })
}
</script>

<template>
  <div class="screen">
    <!-- ---------- sarlavha ---------- -->
    <div class="head card-surface">
      <div class="head-text">
        <div class="crumbs">
          <button type="button" class="crumb" @click="router.push('/')">{{ $t('modules.cardblock') }}</button>
          <span>/</span>
          <span class="crumb-now">{{ $t('form.title') }}</span>
        </div>
        <div class="head-row">
          <span class="head-title">{{ $t('form.title') }}</span>
          <span class="chip draft">
            <span class="draft-dot" />
            {{ $t('form.draftSaved', { time: draftTime }) }}
          </span>
        </div>
      </div>

      <div class="spacer" />

      <button type="button" class="btn-light" @click="cancelAll">{{ $t('common.cancel') }}</button>
      <button type="button" class="btn-dark" :disabled="!ready" @click="submit">
        {{ $t('form.submit') }}
        <AppIcon name="chevronRight" :size="15" />
      </button>
    </div>

    <div class="cols">
      <!-- ---------- chap ustun ---------- -->
      <div class="col">
        <section class="card-surface block">
          <header class="block-head dark-bar">
            <AppIcon name="doc" :size="18" />
            <span class="block-title">{{ $t('form.app.title') }}</span>
            <div class="spacer" />
            <AppIcon v-if="checked.app" name="check" :size="17" class="ok-mark" />
          </header>

          <div class="block-body">
            <!-- karta bo'yicha takroriylik (yangi dizayn) -->
            <div v-if="duplicates.length" class="dup">
              <AppIcon name="error" :size="22" class="dup-ico" />
              <div class="dup-body">
                <div class="dup-head">
                  <span class="dup-title">{{ $t('form.dup.title') }}</span>
                  <span class="dup-card mono">{{ draft.number }}</span>
                </div>
                <span class="dup-text">{{ $t('form.dup.text', duplicates.length) }}</span>
                <div class="dup-rows">
                  <button
                    v-for="d in duplicates"
                    :key="d.id"
                    type="button"
                    class="dup-row"
                    @click="openApplication(d.id)"
                  >
                    <span class="dup-row-main">
                      <span class="mono dup-id">{{ d.id }}</span>
                      <span class="dup-name truncate">{{ d.name }}</span>
                    </span>
                    <span class="mono dup-sum">{{ d.amount }}</span>
                    <AppIcon name="chevronRight" :size="16" />
                  </button>
                </div>
              </div>
            </div>

            <div class="grid-2">
              <label class="field">
                <span class="label">{{ $t('form.app.id') }} <i class="req">*</i></span>
                <input
                  v-model="form.id"
                  class="input mono"
                  :class="{ bad: errors.id }"
                  :placeholder="$t('form.app.idPh')"
                  @input="delete errors.id"
                />
              </label>

              <label class="field">
                <span class="label">
                  {{ $t('form.app.material') }} <i class="opt">· {{ $t('form.optional') }}</i>
                </span>
                <input v-model="form.material" class="input mono" :placeholder="$t('form.app.materialPh')" />
              </label>

              <label class="field">
                <span class="label">{{ $t('form.app.method') }} <i class="req">*</i></span>
                <span class="select-wrap">
                  <select
                    v-model="form.method"
                    class="input select"
                    :class="{ bad: errors.method, empty: !form.method }"
                    @change="delete errors.method"
                  >
                    <option value="" disabled>{{ $t('form.app.select') }}</option>
                    <option v-for="m in METHOD_OPTIONS" :key="m" :value="m">{{ $t(`methods.${m}`) }}</option>
                  </select>
                  <AppIcon name="chevronDown" :size="13" class="select-caret" />
                </span>
              </label>

              <label class="field">
                <span class="label">{{ $t('form.app.source') }} <i class="req">*</i></span>
                <span class="select-wrap">
                  <select
                    v-model="form.source"
                    class="input select"
                    :class="{ bad: errors.source, empty: !form.source }"
                    @change="delete errors.source"
                  >
                    <option value="" disabled>{{ $t('form.app.select') }}</option>
                    <option v-for="s in SOURCE_OPTIONS" :key="s" :value="s">{{ $t(`sources.${s}`) }}</option>
                  </select>
                  <AppIcon name="chevronDown" :size="13" class="select-caret" />
                </span>
              </label>
            </div>

            <div class="fabula-head">
              <span class="label">{{ $t('form.app.fabula') }} <i class="req">*</i></span>
              <div class="spacer" />

              <!-- yozib olish: bo'sh holat -->
              <button v-if="rec.state === 'idle'" type="button" class="btn-soft" @click="startRec">
                <AppIcon name="mic" :size="16" />
                {{ $t('form.app.voice') }}
              </button>

              <!-- yozilmoqda -->
              <span v-else-if="rec.state === 'recording'" class="rec live">
                <span class="rec-dot" />
                <span class="rec-clock mono">{{ clock(rec.seconds) }}</span>
                <span class="wave">
                  <span
                    v-for="(h, i) in WAVE"
                    :key="i"
                    class="bar"
                    :style="{ height: `${h}px`, animationDelay: `${-i * 0.14}s` }"
                  />
                </span>
                <button type="button" class="rec-btn" :title="$t('common.cancel')" @click="cancelRec">
                  <AppIcon name="close" :size="18" />
                </button>
                <button type="button" class="rec-btn ok" :title="$t('form.requisite.save')" @click="saveRec">
                  <AppIcon name="check" :size="18" />
                </button>
              </span>

              <!-- yozib olingan -->
              <span v-else class="rec saved">
                <button type="button" class="rec-play" @click="togglePlay">
                  <AppIcon :name="rec.state === 'playing' ? 'pause' : 'play'" :size="17" />
                </button>
                <span class="rec-name">{{ $t('form.app.recorded') }}</span>
                <span class="rec-clock mono">
                  {{ clock(rec.state === 'playing' ? rec.playing : rec.length) }}
                </span>
                <button type="button" class="rec-btn" :title="$t('form.app.reRecord')" @click="startRec">
                  <AppIcon name="mic" :size="18" />
                </button>
                <button type="button" class="rec-btn danger" :title="$t('common.remove')" @click="removeRec">
                  <AppIcon name="trash" :size="18" />
                </button>
              </span>
            </div>

            <textarea
              v-model="form.fabula"
              class="input area"
              :class="{ bad: errors.fabula }"
              rows="6"
              :placeholder="$t('form.app.fabulaPh')"
              @input="delete errors.fabula"
            />

            <div class="hints">
              <button v-for="h in HINTS" :key="h" type="button" class="hint" @click="addHint(h)">
                {{ $t(`form.app.hints.${h}`) }}
              </button>
            </div>

            <div class="block-actions">
              <button type="button" class="btn-dark" @click="checkBlock('app')">{{ $t('form.check') }}</button>
              <button type="button" class="btn-light" @click="clearBlock('app')">{{ $t('common.cancel') }}</button>
            </div>
          </div>
        </section>

        <section class="card-surface block">
          <header class="block-head dark-bar">
            <AppIcon name="user" :size="18" />
            <span class="block-title">{{ $t('form.applicant.title') }}</span>
            <div class="spacer" />
            <AppIcon v-if="checked.applicant" name="check" :size="17" class="ok-mark" />
          </header>

          <div class="block-body">
            <label class="field">
              <span class="label">{{ $t('form.applicant.fio') }} <i class="req">*</i></span>
              <input
                :value="form.fio"
                class="input"
                :class="{ bad: errors.fio }"
                :placeholder="$t('form.applicant.fioPh')"
                @input="onFio"
              />
            </label>

            <div class="grid-2">
              <label class="field">
                <span class="label">{{ $t('form.applicant.phone') }} <i class="req">*</i></span>
                <input
                  :value="form.phone"
                  class="input mono"
                  :class="{ bad: errors.phone }"
                  placeholder="+998 __ ___ __ __"
                  @input="onPhone"
                />
              </label>

              <label class="field">
                <span class="label">
                  {{ $t('form.applicant.phone2') }} <i class="opt">· {{ $t('form.optional') }}</i>
                </span>
                <input
                  :value="form.phone2"
                  class="input mono"
                  placeholder="+998 __ ___ __ __"
                  @input="onPhone2"
                />
              </label>

              <label class="field">
                <span class="label">{{ $t('form.applicant.region') }} <i class="req">*</i></span>
                <span class="select-wrap">
                  <select
                    v-model="form.region"
                    class="input select"
                    :class="{ bad: errors.region, empty: !form.region }"
                    @change="delete errors.region"
                  >
                    <option value="" disabled>{{ $t('form.app.select') }}</option>
                    <option v-for="r in REGION_OPTIONS" :key="r" :value="r">{{ $t(`regions.${r}`) }}</option>
                  </select>
                  <AppIcon name="chevronDown" :size="13" class="select-caret" />
                </span>
              </label>
            </div>

            <label class="field">
              <span class="label">
                {{ $t('form.applicant.address') }} <i class="opt">· {{ $t('form.optional') }}</i>
              </span>
              <input v-model="form.address" class="input" :placeholder="$t('form.applicant.addressPh')" />
            </label>

            <div class="block-actions">
              <button type="button" class="btn-dark" @click="checkBlock('applicant')">{{ $t('form.check') }}</button>
              <button type="button" class="btn-light" @click="clearBlock('applicant')">{{ $t('common.cancel') }}</button>
            </div>
          </div>
        </section>
      </div>

      <!-- ---------- o'ng ustun ---------- -->
      <div class="col side">
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
                @click="draft.kind = k; clearRequisite()"
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
              <button type="button" class="btn-dark" :disabled="!canAdd" @click="addRequisite">
                <AppIcon name="plus" :size="16" />
                {{ $t('form.requisite.add') }}
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
                        @input="txForm.amount = maskAmount($event.target.value)"
                      />
                      <span class="unit">{{ $t('form.requisite.sum') }}</span>
                    </span>
                    <span class="input-wrap">
                      <input
                        :value="txForm.time"
                        class="input bare mono"
                        :placeholder="$t('form.requisite.timePh')"
                        @input="txForm.time = maskDateTime($event.target.value)"
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
      </div>
    </div>
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

/* ---------- sarlavha ---------- */
.head {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 18px;
  flex-wrap: wrap;
}

.crumbs {
  display: flex;
  align-items: center;
  gap: 7px;
  font-size: 13.5px;
  color: var(--c8b95a6);
}

.crumb {
  border: 0;
  background: none;
  padding: 0;
  color: inherit;
  font-size: inherit;
  cursor: pointer;
}

.crumb:hover {
  color: var(--c23568f);
}

.crumb-now {
  color: var(--c3d4d66);
}

.head-row {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 6px;
  flex-wrap: wrap;
}

.head-title {
  font-size: 20px;
  font-weight: 600;
  color: var(--c16233d);
}

.chip {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 4px 11px;
  border-radius: 20px;
  background: var(--cf0f3f8);
  border: 1px solid var(--ce2e8f1);
  font-size: 13.5px;
  color: var(--c66748c);
}

.chip.draft {
  background: var(--ce3f2e9);
  border-color: var(--cbfe0ce, var(--ce2e8f1));
  color: var(--c1a6e4b);
}

.draft-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: currentColor;
  animation: pulseDot 2.6s infinite;
}

/* ---------- ustunlar ---------- */
.cols {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 420px;
  gap: 14px;
  align-items: start;
}

.col {
  display: flex;
  flex-direction: column;
  gap: 14px;
  min-width: 0;
}

.col.side {
  position: sticky;
  top: 0;
}

/* ---------- blok ---------- */
.block {
  overflow: hidden;
}

.block-head {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 13px 16px;
  color: #fff;
}

.block-title {
  font-size: 14px;
  font-weight: 700;
  letter-spacing: .09em;
  text-transform: uppercase;
}

.ok-mark {
  color: var(--c7fd3a8);
}

.block-body {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.grid-2 {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px 18px;
}

/* ---------- maydonlar ---------- */
.field {
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 0;
}

.label {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 14px;
  color: var(--c3d4d66);
}

.req {
  color: var(--ca52220);
  font-style: normal;
}

.opt {
  color: var(--c98a3b6);
  font-style: normal;
  font-size: 13.5px;
}

.hint-text {
  font-style: normal;
  font-size: 13px;
  color: var(--c98a3b6);
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
  transition: border-color .16s ease, box-shadow .16s ease;
}

.input:focus {
  outline: none;
  border-color: var(--c23568f);
  box-shadow: 0 0 0 3px var(--ce8eef7);
}

.input.bad {
  border-color: var(--ca52220);
  background: var(--cfef7f6);
}

.input.area {
  height: auto;
  padding: 12px 13px;
  line-height: 1.55;
  resize: vertical;
  min-height: 132px;
}

.select {
  appearance: none;
  cursor: pointer;
  padding-right: 34px;
}

.select.empty {
  color: var(--ca3adbd);
}

.select-wrap {
  position: relative;
  display: block;
}

.select-caret {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--c8b95a6);
  pointer-events: none;
}

.input-wrap {
  display: flex;
  align-items: center;
  gap: 9px;
  height: 44px;
  padding: 0 12px;
  border-radius: 8px;
  border: 1px solid var(--ce2e8f1);
  background: var(--s-card);
  transition: border-color .16s ease, box-shadow .16s ease;
}

.input-wrap:focus-within {
  border-color: var(--c23568f);
  box-shadow: 0 0 0 3px var(--ce8eef7);
}

.input-wrap.bad {
  border-color: var(--ca52220);
  background: var(--cfef7f6);
}

.input.bare {
  height: auto;
  padding: 0;
  border: 0;
  background: transparent;
  flex: 1;
  min-width: 0;
}

.input.bare:focus {
  box-shadow: none;
}

.input-ico {
  color: var(--c8b95a6);
}

.unit,
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

/* ---------- takroriylik ogohlantirishi ---------- */
.dup {
  display: flex;
  gap: 13px;
  padding: 14px;
  border-radius: 10px;
  background: var(--cfff5e9);
  border: 1px solid var(--cf6dfc0);
  animation: riseIn .26s var(--ease);
}

.dup-ico {
  color: var(--ce07c1e);
}

.dup-body {
  min-width: 0;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 9px;
}

.dup-head {
  display: flex;
  align-items: center;
  gap: 9px;
  flex-wrap: wrap;
}

.dup-title {
  font-size: 15px;
  font-weight: 600;
  color: var(--cb45309);
}

.dup-card {
  font-size: 14px;
  padding: 2px 9px;
  border-radius: 6px;
  background: var(--s-card);
  border: 1px solid var(--cf6dfc0);
  color: var(--c1c2b45);
}

.dup-text {
  font-size: 14.5px;
  line-height: 1.6;
  color: var(--c3d4d66);
}

.dup-rows {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.dup-row {
  display: flex;
  align-items: center;
  gap: 11px;
  padding: 9px 11px;
  border-radius: 8px;
  background: var(--s-card);
  border: 1px solid var(--cf6dfc0);
  color: var(--c3d4d66);
  cursor: pointer;
  text-align: left;
  transition: filter .16s ease;
}

.dup-row:hover {
  filter: brightness(.985);
}

.dup-row-main {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.dup-id {
  font-size: 14px;
  font-weight: 600;
  color: var(--c16233d);
}

.dup-name {
  font-size: 13px;
  color: var(--c8b95a6);
}

.dup-sum {
  font-size: 14px;
  font-weight: 600;
  color: var(--c16233d);
  white-space: nowrap;
}

/* ---------- fabula ---------- */
.fabula-head {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.hints {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.hint {
  padding: 7px 13px;
  border-radius: 20px;
  border: 1px solid var(--ce2e8f1);
  background: var(--cf8fafc);
  color: var(--c3d4d66);
  font-size: 13.5px;
  cursor: pointer;
  transition: background .16s ease, border-color .16s ease, color .16s ease;
}

.hint:hover {
  background: var(--ce8eef7);
  border-color: var(--c23568f);
  color: var(--c23568f);
}

/* ---------- tugmalar ---------- */
.block-actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  flex-wrap: wrap;
}

.btn-light,
.btn-dark,
.btn-soft {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  height: 40px;
  padding: 0 16px;
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

.btn-soft {
  height: 36px;
  border: 1px solid var(--ce2e8f1);
  background: var(--cf8fafc);
  color: var(--c3d4d66);
}

.btn-soft:hover {
  background: var(--ce8eef7);
  color: var(--c23568f);
}

.btn-dark {
  border: 1px solid var(--btn);
  background: var(--btn);
  color: #fff;
}

.btn-dark:hover:not(:disabled) {
  filter: brightness(1.14);
  transform: translateY(-1px);
}

.btn-dark:disabled {
  opacity: .45;
  cursor: not-allowed;
}

.icon-btn {
  width: 32px;
  height: 32px;
  flex: 0 0 32px;
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

/* ---------- segment ---------- */
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

/* ---------- qo'shilgan rekvizitlar ---------- */
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

.added-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border: 1px solid var(--ce2e8f1);
  border-radius: 9px;
  animation: riseIn .26s var(--ease);
}

.added-ico {
  width: 34px;
  height: 34px;
  flex: 0 0 34px;
  border-radius: 9px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--ce8eef7);
  color: var(--c23568f);
}

.added-main {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.added-num {
  font-size: 14.5px;
  font-weight: 600;
  color: var(--c16233d);
}

.added-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12.5px;
  color: var(--c8b95a6);
}

.tag {
  padding: 1px 8px;
  border-radius: 20px;
  background: var(--cf0f3f8);
  border: 1px solid var(--ce2e8f1);
  color: var(--c66748c);
}

.added-sum {
  font-size: 14.5px;
  font-weight: 600;
  color: var(--c16233d);
  white-space: nowrap;
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

/* ---------- ovoz yozish ---------- */
.rec {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  height: 40px;
  padding: 0 6px 0 13px;
  border-radius: 11px;
  background: var(--cf0f3f8);
  border: 1px solid var(--cdfe4ec);
}

.rec-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--cc0392b);
  animation: recPulse 1.1s ease-in-out infinite;
}

@keyframes recPulse {
  0%, 100% { opacity: 1 }
  50% { opacity: .25 }
}

.rec-clock {
  font-size: 14px;
  font-weight: 600;
  color: var(--c1c2b45);
}

.wave {
  display: flex;
  align-items: center;
  gap: 2px;
  height: 26px;
  overflow: hidden;
}

.bar {
  display: block;
  width: 2px;
  flex: 0 0 2px;
  border-radius: 2px;
  background: var(--c6b7788);
  transform-origin: center;
  animation: recWave .9s ease-in-out infinite;
}

@keyframes recWave {
  0%, 100% { transform: scaleY(.45) }
  50% { transform: scaleY(1) }
}

.rec-btn {
  width: 30px;
  height: 30px;
  border: 0;
  border-radius: 8px;
  background: var(--s-card);
  color: var(--c66748c);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.rec-btn:hover {
  background: var(--ce6ebf3);
  color: var(--c23568f);
}

.rec-btn.ok:hover {
  background: var(--ce3f2e9);
  color: var(--c1a6e4b);
}

.rec-btn.danger:hover {
  background: var(--cfceceb);
  color: var(--ca52220);
}

.rec-play {
  width: 30px;
  height: 30px;
  border: 0;
  border-radius: 50%;
  background: var(--brand-a);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.rec-name {
  font-size: 14px;
  color: var(--c3d4d66);
  white-space: nowrap;
}

/* ---------- rekvizit kartasi ---------- */
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

.req-chev {
  color: var(--c8b95a6);
}

.req-body {
  padding: 4px 12px 12px;
  border-top: 1px solid var(--ceef1f6);
  background: var(--cfafbfc);
  display: flex;
  flex-direction: column;
  gap: 8px;
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

.tx-main {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.tx-amount {
  font-size: 14.5px;
  font-weight: 600;
  color: var(--c16233d);
}

.tx-date {
  font-size: 12.5px;
  color: var(--c8b95a6);
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

.btn-dark.sm {
  height: 40px;
  padding: 0 14px;
}

.icon-btn.danger:hover {
  background: var(--cfceceb);
  color: var(--ca52220);
}

/* ---------- responsive ---------- */
@media (max-width: 1180px) {
  .cols {
    grid-template-columns: 1fr;
  }

  .col.side {
    position: static;
  }
}

@media (max-width: 640px) {
  .grid-2 {
    grid-template-columns: 1fr;
  }

  .head .btn-light,
  .head .btn-dark {
    flex: 1;
    justify-content: center;
  }
}
</style>
