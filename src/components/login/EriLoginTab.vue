<script setup>
/*
  Kirish ekranining E-imzo tabi.
  Kalitlar ro'yxati ISigner'dan keladi, kirish esa /login-pfx orqali —
  batafsil izoh services/isigner.js va services/keyStore.js da.
*/
import { ref, reactive, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import AppIcon from '@/components/ui/AppIcon.vue'
import { loginPfxB64, fileToBase64, maskId, EriError } from '@/services/eriLogin'
import { collectKeys, canPickFolder } from '@/services/dsKeys'
import { canRemember, restoreFolder, regrantFolder, chooseFolder } from '@/services/keyStore'
import { listKeys as isignerKeys } from '@/services/isigner'
import { logKey, logLogin } from '@/services/keyLog'
import { useUi } from '@/stores/useUi'
import { useAuth } from '@/stores/useAuth'

const props = defineProps({
  // tab ko'rinib turibdimi — ro'yxat shunda yuklanadi
  active: { type: Boolean, default: false }
})

const route = useRoute()
const router = useRouter()
const { t } = useI18n()
const { toast } = useUi()
const { signIn } = useAuth()

const errors = reactive({})
const loading = ref(false)

/* ---------- e-imzo ---------- */
// Kalitlar ro'yxati ISigner'dan olinadi, kirish esa /login-pfx orqali bo'ladi.
// ISigner kalit faylini bermaydi, lekin uning ro'yxati DSKEYS papkasidagi
// fayllar tartibiga aynan mos keladi — shu bog'lanish ishlatiladi.
// Papka «Kirish» bosilganda bir marta so'raladi (brauzer talabi).
const signerState = ref('loading') // loading | ready | off
const signerKeys = ref([])
const signerPick = ref('')
const signerTotal = ref(0) // muddati o'tganlari bilan birga — fayl tartibini solishtirish uchun

const pfxPass = ref('')
const showPin = ref(false)
const dragOver = ref(false)
const eriError = ref('')

const fileInput = ref(null)
const folderInput = ref(null)
const folderSupported = canPickFolder()

// foydalanuvchi ruxsat bergan kalit fayllari
const files = ref([])
const selectedKey = ref('')

const activeSignerKey = computed(
  () => signerKeys.value.find((k) => k.serial === signerPick.value) || null
)

// ISigner ro'yxatidagi o'rin -> papkadagi fayl.
// Tartib mos kelishiga ishonish uchun sonlar teng bo'lishi shart; teng bo'lmasa
// fayl nomidagi JSHSHIR/STIR bo'yicha qidiriladi.
const activeFile = computed(() => {
  const key = activeSignerKey.value
  if (!key || !files.value.length) return null

  if (files.value.length === signerTotal.value) {
    const hit = files.value[key.index]
    if (hit) return hit.file
  }

  const byId = files.value.find(
    (f) => f.idValue && (f.idValue === key.pinfl || f.idValue === key.tin)
  )
  return byId ? byId.file : null
})

const manualFile = computed(() => files.value.find((f) => f.key === selectedKey.value)?.file || null)
const pfxFile = computed(() => (signerState.value === 'ready' ? activeFile.value : manualFile.value))

// Tanlangan kalit fayli o'qilgan holda tayyor turadi: «Kirish» bosilganda
// hech narsa kutilmaydi — base64 allaqachon hisoblangan.
const pfxB64 = ref('')
const reading = ref(false)

async function prepareFile(file) {
  pfxB64.value = ''
  if (!file) {
    logKey(activeSignerKey.value, null)
    return
  }

  reading.value = true
  try {
    pfxB64.value = await fileToBase64(file)
  } catch {
    eriError.value = t('login.eri.errors.read')
  } finally {
    reading.value = false
  }

  // tanlangan kalit haqidagi hamma ma'lumot konsolda
  logKey(activeSignerKey.value, file, pfxB64.value)
}

// kalit almashsa yoki papka o'qilsa — yangi fayl darhol tayyorlanadi
watch(pfxFile, (file) => { prepareFile(file) }, { immediate: true })

// fayl hali yo'q bo'lsa ham, tanlangan kalit ma'lumoti chiqsin
watch(activeSignerKey, (key) => {
  if (key && !pfxFile.value) logKey(key, null)
})

const keyReady = computed(() => !!pfxB64.value)

async function loadSignerKeys() {
  signerState.value = 'loading'
  eriError.value = ''
  try {
    const found = await isignerKeys()
    // faqat amal muddati tugamagan kalitlar ko'rsatiladi
    // (index — ISigner ro'yxatidagi asl o'rin, fayl bilan bog'lash uchun kerak)
    const live = found.filter((k) => !k.expired)
    signerTotal.value = found.length
    signerKeys.value = live
    signerState.value = live.length ? 'ready' : 'off'
    signerPick.value = live.length ? live[0].serial : ''
    if (found.length && !live.length) eriError.value = t('login.eri.errors.allExpired')
  } catch {
    signerKeys.value = []
    signerTotal.value = 0
    signerState.value = 'off'
  }
}

function onSignerPick() {
  eriError.value = ''
  pfxPass.value = ''
  delete errors.pfxPass
}

/* ---------- kalit fayllari ---------- */

// papka ruxsati eslab qolinadimi (https yoki localhost kerak)
const rememberSupported = canRemember()

let awaitingFiles = null

// sahifa ochilganda saqlangan papkani jimgina o'qishga urinamiz
async function restoreKeys() {
  if (!rememberSupported) return
  const found = await restoreFolder()
  if (found?.length) addFiles(found)
}

function pickFile() {
  fileInput.value?.click()
}

function pickFolder() {
  folderInput.value?.click()
}

/**
 * Kalit fayllariga ruxsat oladi. Eng yengil yo'ldan boshlanadi:
 * saqlangan papkaga qayta ruxsat -> papka tanlash -> eski uslubdagi input.
 */
async function requestFolder() {
  if (rememberSupported) {
    // avval saqlangan papka: brauzer faqat «Ruxsat berish» so'raydi
    const again = await regrantFolder()
    if (again?.length) return addFiles(again)

    const picked = await chooseFolder()
    if (picked?.length) return addFiles(picked)
    if (picked) return false
  }

  // zaxira: <input webkitdirectory>
  return new Promise((resolve) => {
    awaitingFiles = resolve
    if (folderSupported) pickFolder()
    else pickFile()
    // oyna yopilib, hech narsa tanlanmasa — kutib qolmaslik uchun
    setTimeout(() => {
      if (awaitingFiles === resolve) {
        awaitingFiles = null
        resolve(false)
      }
    }, 120000)
  })
}

function addFiles(list) {
  const found = collectKeys(list)
  if (!found.length) {
    eriError.value = t('login.eri.errors.noKeys')
    return false
  }

  // ISigner bilan bir xil tartib bo'lishi uchun nom bo'yicha saralanadi
  const seen = new Set(files.value.map((f) => f.key))
  files.value = [...files.value, ...found.filter((f) => !seen.has(f.key))]
    .sort((a, b) => a.name.localeCompare(b.name))

  if (!selectedKey.value) selectedKey.value = found[0].key
  eriError.value = ''
  delete errors.pfx
  return true
}

function onFile(e) {
  const ok = addFiles(e.target.files)
  e.target.value = '' // bir xil faylni qayta tanlash mumkin bo'lsin
  if (awaitingFiles) {
    const done = awaitingFiles
    awaitingFiles = null
    done(ok)
  }
}

function onDrop(e) {
  dragOver.value = false
  addFiles(e.dataTransfer?.files)
}

function selectKey(key) {
  selectedKey.value = key
  pfxPass.value = ''
  eriError.value = ''
  delete errors.pfx
  delete errors.pfxPass
}

function clearKeys() {
  files.value = []
  selectedKey.value = ''
  pfxPass.value = ''
  eriError.value = ''
}

async function submitEimzo() {
  if (loading.value) return

  const key = activeSignerKey.value
  if (signerState.value === 'ready' && !key) {
    eriError.value = t('login.eri.errors.noKey')
    return
  }

  if (!pfxPass.value) {
    errors.pfxPass = true
    eriError.value = t('login.eri.errors.noPassword')
    return
  }

  // fayl hali o'qilmagan bo'lsa — papkaga ruxsat so'raymiz
  if (!pfxB64.value) {
    eriError.value = ''
    const granted = await requestFolder()
    if (granted) await prepareFile(pfxFile.value)

    if (!pfxB64.value) {
      errors.pfx = true
      if (!eriError.value) eriError.value = t('login.eri.errors.noFile')
      return
    }
  }

  loading.value = true
  eriError.value = ''

  try {
    const result = await loginPfxB64(pfxB64.value, pfxPass.value)
    logLogin(result)
    const cert = result.user

    // tanlangan kalit bilan qaytgan sertifikat bir xil odamnikimi
    if (key && key.pinfl && cert.pinfl && key.pinfl !== cert.pinfl) {
      throw new EriError('mismatch')
    }

    const name = cert.name || key?.name || t('login.eri.unknownOwner')
    const shown = cert.pinfl || cert.tin || key?.pinfl || key?.tin

    signIn({
      name,
      role: 'staff',
      method: 'eimzo',
      login: shown ? maskId(shown) : '',
      remember: true
    })

    toast(t('login.welcome', { name }))
    router.push(typeof route.query.next === 'string' ? route.query.next : '/')
  } catch (e) {
    const code = e instanceof EriError ? e.key : 'server'
    // serverning o'z xabari bo'lsa — o'shani ko'rsatamiz
    eriError.value = e instanceof EriError && e.detail ? e.detail : t(`login.eri.errors.${code}`)
    errors.pfxPass = code === 'rejected'
  } finally {
    loading.value = false
  }
}

function onPass(e) {
  pfxPass.value = e.target.value
  eriError.value = ''
  delete errors.pfxPass
}

// tab ochilganda ro'yxat va saqlangan papka yuklanadi
// (kuzatuvchi shu yerda — chaqiradigan funksiyalari yuqorida e'lon qilingan)
watch(() => props.active, (on) => {
  if (!on) return
  if (signerState.value !== 'ready') loadSignerKeys()
  if (!files.value.length) restoreKeys()
}, { immediate: true })
</script>

<template>
  <form class="form" :class="{ hidden: !active }" :inert="!active" @submit.prevent="submitEimzo">
    <input
      ref="fileInput"
      type="file"
      accept=".pfx,.p12"
      multiple
      class="file-input"
      @change="onFile"
    />
    <input ref="folderInput" type="file" webkitdirectory class="file-input" @change="onFile" />

    <!-- ISigner ulanmoqda -->
    <div v-if="signerState === 'loading'" class="signer-wait">
      <span class="spinner dark" />
      {{ $t('login.eri.connecting') }}
    </div>

    <!-- ISigner ishlayapti: kalitlar ro'yxati -->
    <template v-else-if="signerState === 'ready'">
      <div class="status">
        <span class="status-dot" />
        {{ $t('login.eri.connected', signerKeys.length) }}
      </div>

      <label class="field">
        <span class="label">{{ $t('login.eri.selectKey') }}</span>
        <span class="select-wrap">
          <select v-model="signerPick" class="input select" @change="onSignerPick">
            <option v-for="k in signerKeys" :key="k.serial" :value="k.serial">
              {{ k.name }} ({{ k.validFrom }} - {{ k.validTo }})
            </option>
          </select>
          <AppIcon name="chevronDown" :size="18" class="select-caret" />
        </span>
      </label>

      <div v-if="activeSignerKey" class="key on">
        <span class="key-ico">
          <AppIcon :name="activeSignerKey.isOrg ? 'bank' : 'user'" :size="18" />
        </span>
        <span class="key-text">
          <span class="key-name truncate">{{ activeSignerKey.name }}</span>
          <span class="key-meta mono">
            {{ $t(`login.eri.ids.${activeSignerKey.isOrg ? 'tin' : 'pinfl'}`) }}
            {{ maskId(activeSignerKey.pinfl || activeSignerKey.tin) }}
            · {{ $t('login.eimzo.expires', { date: activeSignerKey.validTo }) }}
          </span>
        </span>
        <span class="key-state" :class="{ ok: keyReady }">
          <span v-if="reading" class="spinner dark small" />
          <AppIcon v-else-if="keyReady" name="check" :size="16" />
          <AppIcon v-else name="folder" :size="16" />
        </span>
      </div>
    </template>

    <!-- ISigner yo'q: faylni qo'lda tanlash -->
    <template v-else>
      <div class="signer-off">
        <AppIcon name="warn" :size="16" />
        <span>{{ $t('login.eri.signerOff') }}</span>
        <button type="button" class="keys-link" @click="loadSignerKeys">
          {{ $t('login.eri.retry') }}
        </button>
      </div>

      <div
        v-if="!files.length"
        class="drop"
        :class="{ over: dragOver, bad: errors.pfx }"
        @dragover.prevent="dragOver = true"
        @dragleave="dragOver = false"
        @drop.prevent="onDrop"
      >
        <span class="drop-ico"><AppIcon name="key" :size="24" /></span>
        <span class="drop-text">
          <span class="drop-title">{{ $t('login.eri.pick') }}</span>
          <span class="drop-note">{{ $t('login.eri.pickNote') }}</span>
        </span>
        <span class="drop-acts">
          <button v-if="folderSupported" type="button" class="drop-btn primary" @click="pickFolder">
            <AppIcon name="folder" :size="16" />
            {{ $t('login.eri.openFolder') }}
          </button>
          <button type="button" class="drop-btn" @click="pickFile">
            {{ $t('login.eri.openFile') }}
          </button>
        </span>
      </div>

      <template v-else>
        <div class="keys-head">
          <span class="keys-count">{{ $t('login.eri.found', files.length) }}</span>
          <div class="spacer" />
          <button type="button" class="keys-link" @click="folderSupported ? pickFolder() : pickFile()">
            {{ $t('login.eri.change') }}
          </button>
          <button type="button" class="keys-link" @click="clearKeys">{{ $t('common.clear') }}</button>
        </div>

        <div class="keys thin-scroll">
          <button
            v-for="f in files"
            :key="f.key"
            type="button"
            class="key"
            :class="{ on: selectedKey === f.key }"
            @click="selectKey(f.key)"
          >
            <span class="key-ico">
              <AppIcon :name="f.idKind === 'tin' ? 'bank' : 'user'" :size="18" />
            </span>
            <span class="key-text">
              <span class="key-name truncate">{{ f.title }}</span>
              <span class="key-meta mono">
                <template v-if="f.idKind">
                  {{ $t(`login.eri.ids.${f.idKind}`) }} {{ f.idValue }}<template v-if="f.idSeq"> · {{ f.idSeq }}</template>
                </template>
                <template v-else>{{ f.name }}</template>
                · {{ f.size }}
              </span>
            </span>
            <span class="radio"><span class="radio-dot" /></span>
          </button>
        </div>
      </template>
    </template>

    <label class="field">
      <span class="label">{{ $t('login.eri.password') }}</span>
      <span class="input-wrap" :class="{ bad: errors.pfxPass }">
        <input
          :value="pfxPass"
          class="input bare"
          :type="showPin ? 'text' : 'password'"
          autocomplete="off"
          :disabled="signerState === 'ready' ? !activeSignerKey : !pfxFile"
          :placeholder="$t('login.eri.passwordPh')"
          @keyup.enter="submitEimzo"
          @input="onPass"
        />
        <button
          type="button"
          class="eye"
          :title="$t(showPin ? 'login.hide' : 'login.show')"
          @click="showPin = !showPin"
        >
          <AppIcon :name="showPin ? 'eye' : 'eyeOff'" :size="17" />
        </button>
      </span>
    </label>

    <p v-if="eriError" class="eri-error">
      <AppIcon name="warn" :size="16" />
      {{ eriError }}
    </p>

    <button type="submit" class="submit" :disabled="loading || signerState === 'loading'">
      <span v-if="loading" class="spinner" />
      {{ loading ? $t('login.eri.checking') : $t('login.submit') }}
      <AppIcon v-if="!loading" name="arrowRight" :size="16" />
    </button>
  </form>
</template>

<style scoped>

.status {
  display: inline-flex;
  align-items: center;
  gap: 9px;
  font-size: 14px;
  color: #3d4d66;
}


.status-dot {
  width: 9px;
  height: 9px;
  border-radius: 50%;
  background: #1fc24a;
  animation: pulseDot 2.6s infinite;
}


.eri-lead {
  margin: 0;
  font-size: 13.5px;
  line-height: 1.6;
  color: #66748c;
}


.file-input {
  display: none;
}


.drop {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 15px 14px;
  border: 1.6px dashed #c8cdd6;
  border-radius: 12px;
  background: #f8fafc;
  text-align: left;
  flex-wrap: wrap;
  transition: border-color .18s ease, background .18s ease;
}


.drop.over {
  border-color: #16233d;
  background: #f1f4f9;
}


.drop-acts {
  display: flex;
  gap: 8px;
  flex: 1 0 100%;
}


.drop-btn {
  flex: 1;
  height: 36px;
  border-radius: 9px;
  border: 1px solid #e7ecf3;
  background: #fff;
  color: #3d4d66;
  font-size: 13.5px;
  font-weight: 600;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
}


.drop-btn:hover {
  border-color: #16233d;
}


.drop-btn.primary {
  background: #16233d;
  border-color: #16233d;
  color: #fff;
}


.signer-wait {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px;
  border-radius: 12px;
  background: #f8fafc;
  border: 1px solid #e7ecf3;
  font-size: 14px;
  color: #3d4d66;
}


.signer-off {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  border-radius: 10px;
  border: 1px solid #f6dfc0;
  background: #fff5e9;
  font-size: 13px;
  line-height: 1.5;
  color: #b45309;
  flex-wrap: wrap;
}


.select-wrap {
  position: relative;
  display: block;
}


.select {
  width: 100%;
  appearance: none;
  padding-right: 38px;
  cursor: pointer;
}


.select-caret {
  position: absolute;
  top: 50%;
  right: 12px;
  transform: translateY(-50%);
  color: #98a3b6;
  pointer-events: none;
}


.key.dim {
  opacity: .65;
}


.key-warn {
  flex: 0 0 auto;
  padding: 2px 8px;
  border-radius: 6px;
  background: #fceceb;
  border: 1px solid #f2cfcd;
  font-size: 12px;
  font-weight: 600;
  color: #a52220;
}


.hint-text {
  margin-left: 7px;
  font-size: 12px;
  font-style: normal;
  font-weight: 400;
  color: #98a3b6;
}


.key-state {
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  color: #98a3b6;
}


.key-state.ok {
  color: #1a6e4b;
}


.keys-head {
  display: flex;
  align-items: center;
  gap: 10px;
}


.keys-count {
  font-size: 13px;
  font-weight: 600;
  color: #3d4d66;
}


.keys-link {
  border: 0;
  padding: 0;
  background: transparent;
  font-size: 13px;
  color: #23568f;
  cursor: pointer;
}


.keys-link:hover {
  text-decoration: underline;
}


.keys {
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 224px;
  overflow-y: auto;
  padding-right: 2px;
}


.drop.bad {
  border-color: #d9483f;
}


.drop-ico {
  width: 38px;
  height: 38px;
  flex: 0 0 38px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #e8eef7;
  color: #23568f;
}


.drop-text {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 3px;
}


.drop-title {
  font-size: 14.5px;
  font-weight: 600;
  color: #16233d;
}


.drop-note {
  font-size: 12.5px;
  color: #8b95a6;
}


.key-clear {
  border: 0;
  padding: 0;
  background: transparent;
  color: #98a3b6;
  cursor: pointer;
  display: flex;
}


.key-clear:hover {
  color: #d9483f;
}


.eri-error {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  margin: 0;
  padding: 10px 12px;
  border-radius: 10px;
  border: 1px solid #f2cfcd;
  background: #fceceb;
  font-size: 13.5px;
  line-height: 1.5;
  color: #a52220;
}


.key {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 13px 14px;
  border: 1.6px solid #e7ecf3;
  border-radius: 12px;
  background: #fff;
  cursor: pointer;
  text-align: left;
  transition: border-color .18s ease, background .18s ease;
}


.key:hover {
  background: #f8fafc;
}


.key.on {
  border-color: #16233d;
}


.key-ico {
  width: 38px;
  height: 38px;
  flex: 0 0 38px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f1f4f9;
  color: #66748c;
}


.key.on .key-ico {
  background: #16233d;
  color: #fff;
}


.key-text {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 3px;
}


.key-name {
  font-size: 15px;
  font-weight: 600;
  color: #16233d;
}


.key-meta {
  font-size: 12.5px;
  color: #8b95a6;
}


.radio {
  width: 20px;
  height: 20px;
  flex: 0 0 20px;
  border-radius: 50%;
  border: 1.6px solid #d3dbe6;
  display: flex;
  align-items: center;
  justify-content: center;
}


.key.on .radio {
  border-color: #16233d;
}


.radio-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: transparent;
  transform: scale(.4);
  transition: transform .18s var(--ease), background .18s ease;
}


.key.on .radio-dot {
  background: #16233d;
  transform: scale(1);
}
</style>
