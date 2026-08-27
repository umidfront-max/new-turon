<script setup>
import { ref, reactive, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import { useRoute, useRouter, onBeforeRouteLeave } from 'vue-router'
import { useI18n } from 'vue-i18n'
import AppIcon from '@/components/ui/AppIcon.vue'
import VoiceRecorder from '@/components/form/VoiceRecorder.vue'
import RequisitePanel from '@/components/form/RequisitePanel.vue'
import PageHead from '@/components/ui/PageHead.vue'
import CardHistory from '@/components/form/CardHistory.vue'
import {
  maskPhone, maskCard, maskAccount, maskAmount,
  applyMask, digitsOnly, toIsoDateTime, fromIsoDateTime
} from '@/data/form'
import { createManual } from '@/services/complaints'
import { useUi } from '@/stores/useUi'
import { useApplications } from '@/stores/useApplications'
import { useReferences } from '@/stores/useReferences'
import { useDrafts } from '@/stores/useDrafts'
import { useNumberCheck } from '@/composables/useNumberCheck'

const route = useRoute()
const router = useRouter()
const { t } = useI18n()
const { ask, toast } = useUi()
const { items, draftById, removeDraft } = useApplications()

/*
  Usul, manba va hudud ro'yxatlari serverdan — ariza saqlanganda ularning
  id'lari yuboriladi. Server javob bermasa loyihadagi ro'yxat qoladi.
*/
const refs = useReferences()
refs.load()

const methodOptions = computed(() => refs.exact.value.methods)
const sourceOptions = computed(() => refs.exact.value.sources)
const regionOptions = computed(() => refs.exact.value.regions)

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

/*
  Qoralamadan davom etish: /application/new?draft=<id>.
  Raqamli id — serverdagi qoralama, aks holda namuna ro'yxatidagi yozuv.
*/
const drafts = useDrafts()
const draftId = typeof route.query.draft === 'string' ? route.query.draft : null
const apiDraftId = draftId && /^\d+$/.test(draftId) ? Number(draftId) : null

// serverda saqlangan qoralamaning id'si (saqlagandan keyin ham to'ladi)
const savedDraft = ref(apiDraftId)
const savingDraft = ref(false)

/*
  Avtosaqlash: forma ochiq turganda har 15 soniyada qoralama serverga yoziladi.
  Bo'sh formadan qoralama yasalmaydi va o'zgarmagan holat qayta yuborilmaydi —
  aks holda server bekorga so'rov olaveradi.
*/
const AUTOSAVE_MS = 15000

// oxirgi yuborilgan holat (JSON) — o'zgarganini shu bilan solishtiramiz
let lastSaved = ''
let autosaveTimer = null

// yuborilgandan keyin chiqishda savol berilmasin
let leaving = false

const hasContent = computed(() => Boolean(
  form.id.trim() || form.material.trim() || form.fabula.trim()
  || form.fio.trim() || digitsOnly(form.phone) || form.address.trim()
  || requisites.value.length
))

const unsaved = computed(() => hasContent.value && JSON.stringify(buildPayload()) !== lastSaved)

/** Serverdagi payload'ni forma holatiga qaytaradi. */
function fillFromPayload(payload) {
  if (!payload || typeof payload !== 'object') return

  const applicant = payload.applicant || {}
  form.id = payload.number || ''
  form.material = payload.material_number || ''
  form.method = payload.method ?? ''
  form.source = payload.source ?? ''
  form.fabula = payload.description || ''
  form.fio = applicant.full_name || ''
  form.phone = maskPhone(applicant.phone_number || '')
  form.phone2 = maskPhone(applicant.additional_phone_number || '')
  form.region = applicant.region ?? ''
  form.address = applicant.address || ''

  let seq = 0
  const restore = (list, kind) => (list || []).map((r) => {
    seq += 1
    const mask = kind === 'card' ? maskCard : maskAccount
    return {
      id: `d${seq}`,
      kind,
      number: mask(r.number || ''),
      system: '',
      bank: r.bank ?? null,
      open: true,
      txs: (r.transactions || []).map((x, i) => ({
        id: `d${seq}t${i}`,
        amount: maskAmount(x.amount || ''),
        time: fromIsoDateTime(x.transaction_time)
      }))
    }
  })

  requisites.value = [...restore(payload.cards, 'card'), ...restore(payload.accounts, 'account')]
}

async function loadDraft() {
  if (apiDraftId) {
    try {
      const res = await drafts.one(apiDraftId)
      fillFromPayload(res?.payload)
      lastSaved = JSON.stringify(buildPayload())
      toast(t('form.draftLoaded'))
    } catch (e) {
      toast(e?.detail || t(`api.errors.${e?.key || 'server'}`), 'bad')
    }
    return
  }

  const d = draftId && draftById(draftId)
  if (!d) return
  form.id = d.id && d.id !== '—' ? d.id : ''
  form.material = d.material && d.material !== '—' ? d.material : ''
  form.method = ['vishing', 'phishing', 'fakeShop', 'fakeInvest', 'simSwap', 'apk', 'fakeSupport', 'other']
    .includes(d.method) ? d.method : ''
  form.fio = d.name && d.name !== '—' ? d.name : ''
  // namuna qoralamasida karta niqoblangan (8600 06** **** 1111) va tranzaksiya
  // ma'lumoti yo'q — rekvizitni tiklab bo'lmaydi, foydalanuvchi qayta kiritadi
  toast(t('form.draftLoaded'))
}

onMounted(() => {
  timer = setInterval(() => { elapsed.value += 1 }, 1000)
  autosaveTimer = setInterval(autosave, AUTOSAVE_MS)
  loadDraft()
})
onBeforeUnmount(() => {
  // ovoz yozish va tinglash taymerlari VoiceRecorder komponentining ichida —
  // u o'zi tozalaydi, shu yerda faqat qoralama taymerlari qoladi
  clearInterval(timer)
  clearInterval(autosaveTimer)
})

/* ---------- maskalar ---------- */
function onPhone(e) {
  form.phone = applyMask(e.target, maskPhone)
  delete errors.phone
}

function onPhone2(e) {
  form.phone2 = applyMask(e.target, maskPhone)
}

function openApplication(id) {
  router.push({ path: '/application', query: { id } })
}

// F.I.Sh. — faqat lotin harflari, apostrof, chiziqcha va bo'sh joy
const maskFio = (value) => String(value).toUpperCase().replace(/[^A-Z'\s-]/g, '')

function onFio(e) {
  form.fio = applyMask(e.target, maskFio)
  delete errors.fio
}

/* ---------- karta takroriyligi ---------- */
// rekvizit panelida kiritilayotgan raqam — ogohlantirish shu asosda chiqadi
const typedCard = ref('')

// Serverdagi tekshiruv: raqam to'liq yig'ilgach /complaints/check-number/ ga
// so'rov ketadi. Javob bo'lmasa namuna ro'yxatidan qidiriladi.
const numberCheck = useNumberCheck()

watch(typedCard, (value) => numberCheck.check(value))

const duplicates = computed(() => {
  if (numberCheck.live.value) return numberCheck.earlier.value

  const digits = digitsOnly(typedCard.value)
  if (digits.length < 16) return []
  return items.value.filter((a) => digitsOnly(a.card) === digits)
})

const historyOpen = ref(false)

/* ---------- tekshiruvlar ---------- */
const REQUIRED_APP = ['id', 'method', 'source', 'fabula']
// serverda `applicant.address` ham majburiy
const REQUIRED_APPLICANT = ['fio', 'phone', 'region', 'address']

// fabula shu belgidan qisqa bo'lsa qabul qilinmaydi
const FABULA_MIN = 20

const fabulaLength = computed(() => form.fabula.trim().length)

function markErrors(fields) {
  const bad = []
  fields.forEach((f) => {
    const value = String(form[f] || '').trim()
    const short = f === 'fabula' && value.length < FABULA_MIN
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
  toast(bad.length ? problemOf(bad) : t('form.checked'), bad.length ? 'bad' : 'ok')
}

function clearBlock(block) {
  const fields = block === 'app' ? REQUIRED_APP : REQUIRED_APPLICANT
  fields.concat(block === 'app' ? ['material'] : ['address']).forEach((f) => {
    form[f] = ''
    delete errors[f]
  })
  checked[block] = false
}

/*
  Nima yetishmayotganini aniq aytadi: maydon to'ldirilgan bo'lsa-yu «qizil»
  bo'lib tursa, foydalanuvchi sababini bilmay qoladi.
*/
function problemOf(bad) {
  if (bad.includes('fabula') && fabulaLength.value && fabulaLength.value < FABULA_MIN) {
    return t('form.app.fabulaShort', { n: FABULA_MIN, has: fabulaLength.value })
  }
  if (bad.includes('phone') && digitsOnly(form.phone).length) {
    return t('form.applicant.phoneShort')
  }
  return t('form.invalid')
}

/* ---------- fabula ---------- */
const HINTS = ['asked', 'transfer', 'noticed', 'contact']

function addHint(key) {
  const line = t(`form.app.hints.${key}`)
  form.fabula = form.fabula ? `${form.fabula.trimEnd()}\n${line} ` : `${line} `
  delete errors.fabula
}

/* ---------- yuborish ---------- */
const ready = computed(() =>
  REQUIRED_APP.every((f) => String(form[f] || '').trim())
  && fabulaLength.value >= FABULA_MIN
  && REQUIRED_APPLICANT.every((f) => String(form[f] || '').trim())
  && digitsOnly(form.phone).length === 12
  && requisites.value.length > 0)

const sending = ref(false)

/** Telefon: serverga `+998XXXXXXXXX` ko'rinishida ketadi. */
function phoneFor(value) {
  const digits = digitsOnly(value)
  return digits ? `+${digits}` : ''
}

/**
 * Formani serverdagi ManualComplaintRequest ko'rinishiga o'giradi.
 * Karta va hisob raqamlari ikki alohida ro'yxat; har birida shu raqam bo'yicha
 * qilingan barcha tranzaksiyalar yuboriladi.
 */
function buildPayload() {
  const cards = []
  const accounts = []

  requisites.value.forEach((r) => {
    const item = {
      number: digitsOnly(r.number),
      transactions: r.txs.map((x) => ({
        amount: digitsOnly(x.amount),
        transaction_time: toIsoDateTime(x.time)
      }))
    }

    /*
      Bank: kartada server BIN prefiksidan o'zi topadi, hisob raqamida esa
      aniqlab bo'lmaydi. /cards/identify/ javob bergan bo'lsa id yuboriladi.
    */
    if (r.bank) item.bank = r.bank
    if (r.kind === 'card') cards.push(item)
    else accounts.push(item)
  })

  const applicant = {
    full_name: form.fio.trim(),
    phone_number: phoneFor(form.phone),
    region: form.region,
    address: form.address.trim()
  }
  if (form.phone2.trim()) applicant.additional_phone_number = phoneFor(form.phone2)

  const body = {
    number: form.id.trim(),
    method: form.method,
    source: form.source,
    description: form.fabula.trim(),
    /*
      Bu forma aynan ariza qabul qilish uchun (xabarnoma emas), shuning uchun
      asos doim `application`. `crime_type` esa arizadan arizaga farq qiladi —
      formada bunday maydon yo'q, shuning uchun yuborilmaydi.
    */
    basis: 'application',
    applicant
  }

  if (form.material.trim()) body.material_number = form.material.trim()
  if (cards.length) body.cards = cards
  if (accounts.length) body.accounts = accounts

  return body
}

/** Manzilga qoralama id'sini yozadi — sahifa yangilansa ham davom etadi. */
function syncDraftQuery(id) {
  if (!id || String(route.query.draft || '') === String(id)) return
  router.replace({ path: '/application/new', query: { draft: String(id) } })
}

/**
 * Qoralamani serverga yozadi.
 * @param {boolean} [quiet] avtosaqlashda xabar chiqmaydi
 */
async function storeDraft(quiet = false) {
  if (savingDraft.value || sending.value) return false

  savingDraft.value = true
  try {
    const payload = buildPayload()
    const res = await drafts.save(payload, savedDraft.value)

    savedDraft.value = res?.id ?? savedDraft.value
    lastSaved = JSON.stringify(payload)
    elapsed.value = 0
    syncDraftQuery(savedDraft.value)

    if (!quiet) toast(t('form.draftStored'))
    return true
  } catch (e) {
    // avtosaqlash jimgina o'tadi — keyingi urinishda qayta yoziladi
    if (!quiet) toast(e?.detail || t(`api.errors.${e?.key || 'server'}`), 'bad')
    return false
  } finally {
    savingDraft.value = false
  }
}

/** Qoralama saqlash tugmasi. */
const saveDraftNow = () => storeDraft(false)

/** Har 15 soniyada: forma bo'sh bo'lmasa va o'zgargan bo'lsa. */
function autosave() {
  if (!unsaved.value) return
  storeDraft(true)
}

/** Serverdagi qoralamani o'chiradi (chiqishda «o'chirish» tanlansa). */
async function dropDraft() {
  if (!savedDraft.value) return
  try {
    await drafts.remove(savedDraft.value)
    savedDraft.value = null
  } catch { /* o'chirib bo'lmadi — qoralamalar sahifasidan o'chiriladi */ }
}

/** Tanlovdan keyin sahifadan chiqamiz. */
async function leaveWith(target, mode) {
  if (mode === 'save') await storeDraft(false)
  else await dropDraft()

  leaving = true
  router.push(target.fullPath)
}

/*
  Sahifadan chiqishda: saqlanmagan o'zgarish bo'lsa so'raymiz —
  qoralamaga saqlash, o'chirish yoki formada qolish.
*/
onBeforeRouteLeave((to) => {
  if (leaving || !unsaved.value) return true

  ask({
    title: t('form.leaveTitle'),
    text: t('form.leaveText'),
    ok: t('form.draftStore'),
    run: () => leaveWith(to, 'save'),
    alt: t('form.leaveDrop'),
    altRun: () => leaveWith(to, 'drop')
  })

  return false
})

async function send() {
  if (sending.value) return
  sending.value = true

  try {
    /*
      Qoralamadan davom etilayotgan bo'lsa ariza o'sha qoralamadan yakunlanadi
      (/drafts/<id>/submit/), aks holda to'g'ridan-to'g'ri yaratiladi.
      Backend ikkalasini birga ishlatishni tavsiya qilmaydi.
    */
    const created = savedDraft.value
      ? await drafts.submit(savedDraft.value, buildPayload())
      : await createManual(buildPayload())

    // namuna ro'yxatidagi qoralama (serverdagisini `submit` o'zi olib tashlaydi)
    if (!savedDraft.value && draftId) removeDraft(draftId)

    leaving = true
    toast(t('form.sent'))
    router.push({ path: '/application', query: { id: created.id } })
  } catch (e) {
    // serverning o'z xabari bo'lsa — o'shani ko'rsatamiz, forma joyida qoladi
    toast(e?.detail || t(`api.errors.${e?.key || 'server'}`), 'bad')
  } finally {
    sending.value = false
  }
}

function submit() {
  const bad = [...markErrors(REQUIRED_APP), ...markErrors(REQUIRED_APPLICANT)]
  if (bad.length || !requisites.value.length) {
    toast(bad.length ? problemOf(bad) : t('form.requisite.needOne'), 'bad')
    return
  }
  ask({
    title: t('form.askTitle'),
    text: t('form.askText', { n: requisites.value.length, amount: total.value }),
    ok: t('form.submit'),
    run: send
  })
}

function cancelAll() {
  ask({
    title: t('form.cancelTitle'),
    text: t('form.cancelText'),
    ok: t('common.remove'),
    danger: true,
    run: async () => {
      await dropDraft()
      leaving = true
      toast(t('form.cancelled'), 'warn')
      router.push('/')
    }
  })
}
</script>

<template>
  <div class="screen">
    <!-- ---------- sarlavha ---------- -->
    <PageHead :title="$t('form.title')">
      <template #chips>
        <span class="chip draft">
          <span class="draft-dot" />
          {{ $t('form.draftSaved', { time: draftTime }) }}
        </span>
      </template>
      <template #actions>
        <button type="button" class="btn-light" @click="cancelAll">{{ $t('common.cancel') }}</button>
        <button type="button" class="btn-light" :disabled="savingDraft || sending" @click="saveDraftNow">
          {{ savingDraft ? $t('form.draftSaving') : $t('form.draftStore') }}
        </button>
        <button type="button" class="btn-dark" :disabled="!ready || sending" @click="submit">
          {{ sending ? $t('form.sending') : $t('form.submit') }}
          <AppIcon v-if="!sending" name="chevronRight" :size="15" />
        </button>
      </template>
    </PageHead>

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
                  <span class="dup-card mono">{{ typedCard }}</span>
                  <div class="spacer" />
                  <button type="button" class="dup-more" @click="historyOpen = true">
                    <AppIcon name="history" :size="15" />
                    {{ $t('cardHistory.open') }}
                  </button>
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

            <CardHistory
              v-if="historyOpen && duplicates.length"
              :card="typedCard"
              :rows="duplicates"
              @close="historyOpen = false"
              @open="historyOpen = false; openApplication($event)"
            />

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
                    <option v-for="m in methodOptions" :key="m.value" :value="m.value">{{ m.label }}</option>
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
                    <option v-for="s in sourceOptions" :key="s.value" :value="s.value">{{ s.label }}</option>
                  </select>
                  <AppIcon name="chevronDown" :size="13" class="select-caret" />
                </span>
              </label>
            </div>

            <div class="fabula-head">
              <span class="label">{{ $t('form.app.fabula') }} <i class="req">*</i></span>
              <i class="fabula-count" :class="{ short: fabulaLength && fabulaLength < FABULA_MIN }">
                {{ fabulaLength ? `${fabulaLength} / ${FABULA_MIN}` : $t('form.app.fabulaMin', { n: FABULA_MIN }) }}
              </i>
              <div class="spacer" />

              <VoiceRecorder />
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
                    <option v-for="r in regionOptions" :key="r.value" :value="r.value">{{ r.label }}</option>
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
      <RequisitePanel
        v-model="requisites"
        :bank-label="numberCheck.bankLabel.value"
        :bank-id="numberCheck.identity.value?.bank ?? null"
        @card="typedCard = $event"
      />

    </div>
  </div>
</template>

<style scoped>
/* fabula uzunligi: talab ko'rinib tursin, yetmasa ajralib chiqsin */
.fabula-count {
  margin-left: 8px;
  font-style: normal;
  font-size: 13px;
  color: var(--c98a3b6);
}

.fabula-count.short {
  color: var(--cd9483f);
  font-weight: 600;
}


/* ---------- sarlavha ---------- */

.crumb:hover {
  color: var(--c23568f);
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
  /*
    O'ng ustun — rekvizit paneli. 420px da karta raqami, to'lov tizimi va
    tranzaksiyalar bir-biriga siqilib qolardi; keng ekranda 480px gacha
    kengayadi, tor ekranda esa 380px gacha qisqaradi.
  */
  grid-template-columns: minmax(0, 1fr) clamp(380px, 32vw, 480px);
  gap: 16px;
  align-items: start;
}

.col {
  display: flex;
  flex-direction: column;
  gap: 14px;
  min-width: 0;
}

/* o'ng ustun — panel ildizining o'zi grid katagi */
.cols > .block {
  position: sticky;
  top: 0;
}

/* ---------- blok ---------- */
.block {
  overflow: hidden;
}

:deep(.block-head) {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 13px 16px;
  color: #fff;
}

:deep(.block-title) {
  font-size: 14px;
  font-weight: 700;
  letter-spacing: .09em;
  text-transform: uppercase;
}

:deep(.ok-mark) {
  color: var(--c7fd3a8);
}

:deep(.block-body) {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

:deep(.grid-2) {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px 18px;
}

/* ---------- maydonlar ---------- */
:deep(.field) {
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 0;
}

:deep(.label) {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 14px;
  color: var(--c3d4d66);
}

:deep(.req) {
  color: var(--ca52220);
  font-style: normal;
}

.opt {
  color: var(--c98a3b6);
  font-style: normal;
  font-size: 13.5px;
}

:deep(.input) {
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

:deep(.input:focus) {
  outline: none;
  border-color: var(--c23568f);
  box-shadow: 0 0 0 3px var(--ce8eef7);
}

:deep(.input.bad) {
  border-color: var(--ca52220);
  background: var(--cfef7f6);
}

:deep(.input.area) {
  height: auto;
  padding: 12px 13px;
  font-size: 16px;
  line-height: 1.7;
  resize: vertical;
  min-height: 118px;
}

:deep(.select) {
  appearance: none;
  cursor: pointer;
  padding-right: 34px;
}

:deep(.select.empty) {
  color: var(--ca3adbd);
}

:deep(.select-wrap) {
  position: relative;
  display: block;
}

:deep(.select-caret) {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--c8b95a6);
  pointer-events: none;
}

:deep(.input-wrap) {
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

:deep(.input-wrap:focus-within) {
  border-color: var(--c23568f);
  box-shadow: 0 0 0 3px var(--ce8eef7);
}

:deep(.input-wrap.bad) {
  border-color: var(--ca52220);
  background: var(--cfef7f6);
}

:deep(.input.bare) {
  height: auto;
  padding: 0;
  border: 0;
  background: transparent;
  flex: 1;
  min-width: 0;
}

:deep(.input.bare:focus) {
  box-shadow: none;
}

.input-ico {
  color: var(--c8b95a6);
}

.unit,

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

.dup-more {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 28px;
  padding: 0 10px;
  border-radius: 7px;
  border: 1px solid var(--cf6dfc0);
  background: var(--s-card);
  color: var(--cb45309);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
}

.dup-more:hover {
  background: var(--cfff5e9);
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

:deep(.btn-light),
:deep(.btn-dark) {
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

:deep(.btn-light) {
  border: 1px solid var(--ce2e8f1);
  background: var(--s-card);
  color: var(--c3d4d66);
}

:deep(.btn-light:hover) {
  background: var(--cf8fafc);
}

:deep(.btn-dark) {
  border: 1px solid var(--btn);
  background: var(--btn);
  color: #fff;
}

:deep(.btn-dark:hover:not(:disabled)) {
  filter: brightness(1.14);
  transform: translateY(-1px);
}

:deep(.btn-dark:disabled) {
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

/* ---------- qo'shilgan rekvizitlar ---------- */

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

/* ---------- rekvizit kartasi ---------- */

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

.tx-main {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.tx-date {
  font-size: 12.5px;
  color: var(--c8b95a6);
}

:deep(.btn-dark.sm) {
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
