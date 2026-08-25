<script setup>
import { ref, reactive, computed, watch, onBeforeUnmount } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import AppIcon from '@/components/ui/AppIcon.vue'
import { LANGS } from '@/i18n'
import { loginPfx, serverToken, verifySignature, maskId, EriError } from '@/services/eriLogin'
import { collectKeys, canPickFolder } from '@/services/dsKeys'
import { listKeys as isignerKeys, hash as isignerHash, sign as isignerSign, ISignerError } from '@/services/isigner'
import { useUi } from '@/stores/useUi'
import { useAuth } from '@/stores/useAuth'

const route = useRoute()
const router = useRouter()
const { t } = useI18n()
const { state: ui, setLanguage, toast } = useUi()
const { signIn } = useAuth()

const TABS = [
  { key: 'password', icon: 'user' },
  { key: 'eimzo', icon: 'key' },
  { key: 'faceId', icon: 'face' }
]

const FEATURES = [
  { key: 'one', icon: 'gear' },
  { key: 'two', icon: 'radar' },
  { key: 'three', icon: 'broadcast' }
]

// tabni manzildan ham ochish mumkin: /login?tab=eimzo
const tab = ref(TABS.some((x) => x.key === route.query.tab) ? route.query.tab : 'password')

/* ---------- login / parol ---------- */
const form = reactive({ login: '', password: '', remember: true })
const showPassword = ref(false)
const errors = reactive({})

/* ---------- e-imzo ---------- */
// ISigner ishlab tursa — kalitlar ro'yxati shundan olinadi va kirish imzo
// orqali tekshiriladi (/token -> hash -> sign -> /verify).
// ISigner bo'lmasa — foydalanuvchi .pfx faylni tanlaydi, kirish /login-pfx orqali.
const signerState = ref('loading') // loading | ready | off
const signerKeys = ref([])
const signerPick = ref('')

const pfxPass = ref('')
const showPin = ref(false)
const dragOver = ref(false)
const eriError = ref('')

const fileInput = ref(null)
const folderInput = ref(null)
const folderSupported = canPickFolder()

// ISigner yo'q bo'lganda foydalanuvchi tanlagan fayllar
const files = ref([])
const selectedKey = ref('')

const activeSignerKey = computed(
  () => signerKeys.value.find((k) => k.serial === signerPick.value) || null
)

const pfxFile = computed(() => files.value.find((f) => f.key === selectedKey.value)?.file || null)

async function loadSignerKeys() {
  signerState.value = 'loading'
  eriError.value = ''
  try {
    const found = await isignerKeys()
    // faqat amal muddati tugamagan kalitlar ko'rsatiladi
    const live = found.filter((k) => !k.expired)
    signerKeys.value = live
    signerState.value = live.length ? 'ready' : 'off'
    signerPick.value = live.length ? live[0].serial : ''
    if (found.length && !live.length) eriError.value = t('login.eri.errors.allExpired')
  } catch {
    signerKeys.value = []
    signerState.value = 'off'
  }
}

// tab ochilganda ro'yxat yuklanadi
watch(tab, (next) => {
  if (next === 'eimzo' && signerState.value !== 'ready') loadSignerKeys()
}, { immediate: true })

function onSignerPick() {
  eriError.value = ''
  pfxPass.value = ''
  delete errors.pfxPass
}

/* ---------- kalit fayllari ---------- */

function pickFile() {
  fileInput.value?.click()
}

function pickFolder() {
  folderInput.value?.click()
}

function addFiles(list) {
  const found = collectKeys(list)
  if (!found.length) {
    eriError.value = t('login.eri.errors.noKeys')
    return
  }

  const seen = new Set(files.value.map((f) => f.key))
  files.value = [...files.value, ...found.filter((f) => !seen.has(f.key))]
    .sort((a, b) => a.name.localeCompare(b.name))

  if (!selectedKey.value) selectedKey.value = found[0].key
  eriError.value = ''
  delete errors.pfx
}

function onFile(e) {
  addFiles(e.target.files)
  e.target.value = '' // bir xil faylni qayta tanlash mumkin bo'lsin
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

/* ---------- Face ID ---------- */
const scanning = ref(false)
let scanTimer = null

/* ---------- umumiy ---------- */
// tugmadagi yuklanish holati: haqiqiy so'rov o'rniga qisqa kutish
const loading = ref(false)
let goTimer = null

onBeforeUnmount(() => {
  clearTimeout(scanTimer)
  clearTimeout(goTimer)
})

function go(user) {
  if (loading.value) return
  loading.value = true
  goTimer = setTimeout(() => {
    signIn(user)
    toast(t('login.welcome', { name: user.name }))
    const next = typeof route.query.next === 'string' ? route.query.next : '/'
    router.push(next)
    loading.value = false
  }, 900)
}

function submitPassword() {
  if (loading.value) return
  errors.login = !form.login.trim()
  errors.password = form.password.length < 4
  if (errors.login || errors.password) {
    toast(t('login.errors.credentials'), 'bad')
    return
  }
  go({
    name: form.login.trim().split('@')[0],
    role: 'staff',
    method: 'password',
    login: form.login.trim(),
    remember: form.remember
  })
}

// ISigner orqali: server tokeni -> hash -> imzo -> /verify
// ISigner orqali: server tokeni -> hash -> imzo -> /verify
async function signInWithSigner() {
  const key = activeSignerKey.value
  if (!key) {
    eriError.value = t('login.eri.errors.noKey')
    return
  }

  loading.value = true
  eriError.value = ''

  try {
    const { token, challenge } = await serverToken()
    const digest = await isignerHash(challenge)
    // parol bo'sh qoldirilsa ISigner o'z oynasida so'raydi
    const signed = await isignerSign({
      token,
      digest,
      serial: key.serial,
      password: pfxPass.value
    })

    const signature = typeof signed === 'string' ? signed : (signed?.signature || signed?.sign || '')
    if (!signature) throw new EriError('server')

    const res = await verifySignature({
      signature,
      data: challenge,
      certificate: typeof signed === 'object' ? (signed.certificate || '') : ''
    })
    if (!res.valid) throw new EriError('rejected', res.message)

    signIn({
      name: key.name,
      role: 'staff',
      method: 'eimzo',
      login: maskId(key.pinfl || key.tin),
      remember: true
    })
    toast(t('login.welcome', { name: key.name }))
    router.push(typeof route.query.next === 'string' ? route.query.next : '/')
  } catch (e) {
    if (e instanceof ISignerError) {
      eriError.value = t(`login.eri.errors.${e.key}`)
      errors.pfxPass = e.key === 'wrongPassword'
    } else {
      const code = e instanceof EriError ? e.key : 'server'
      eriError.value = e instanceof EriError && e.detail ? e.detail : t(`login.eri.errors.${code}`)
    }
  } finally {
    loading.value = false
  }
}

// ISigner yo'q: yuklangan .pfx fayli -> /login-pfx
async function signInWithFile() {
  if (!pfxFile.value) {
    errors.pfx = true
    eriError.value = t('login.eri.errors.noFile')
    return
  }
  if (!pfxPass.value) {
    errors.pfxPass = true
    eriError.value = t('login.eri.errors.noPassword')
    return
  }

  loading.value = true
  eriError.value = ''

  try {
    const result = await loginPfx(pfxFile.value, pfxPass.value)
    const cert = result.user
    const name = cert.name || t('login.eri.unknownOwner')
    const shown = cert.pinfl || cert.tin

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
    eriError.value = e instanceof EriError && e.detail ? e.detail : t(`login.eri.errors.${code}`)
    errors.pfxPass = code === 'rejected'
  } finally {
    loading.value = false
  }
}

function submitEimzo() {
  if (loading.value) return
  return signerState.value === 'ready' ? signInWithSigner() : signInWithFile()
}

function startScan() {
  if (scanning.value || loading.value) return
  scanning.value = true
  scanTimer = setTimeout(() => {
    scanning.value = false
    go({
      name: t('profile.staff.name'),
      role: 'staff',
      method: 'faceId',
      login: '',
      remember: true
    })
  }, 2200)
}

function forgot() {
  toast(t('login.forgotToast'), 'warn')
}

function onPass(e) {
  pfxPass.value = e.target.value
  eriError.value = ''
  delete errors.pfxPass
}
</script>

<template>
  <div class="login-page">
    <div class="card">
      <!-- ---------- chap panel ---------- -->
      <aside class="side">
        <div class="side-top">
          <img src="/logo.webp" :alt="$t('app.logoAlt')" class="logo" />
          <div class="brand">{{ $t('login.brand') }}</div>
          <div class="org">{{ $t('login.org') }}</div>
        </div>

        <div class="rule" />

        <ul class="features">
          <li v-for="f in FEATURES" :key="f.key" class="feature">
            <span class="feature-ico"><AppIcon :name="f.icon" :size="19" /></span>
            <span class="feature-text">{{ $t(`login.features.${f.key}`) }}</span>
          </li>
        </ul>
      </aside>

      <!-- ---------- o'ng panel ---------- -->
      <main class="panel">
        <div class="lang">
          <button
            v-for="l in LANGS"
            :key="l.value"
            type="button"
            class="lang-btn"
            :class="{ on: ui.lang === l.value }"
            :title="$t(`lang.${l.value}.full`)"
            @click="setLanguage(l.value)"
          >
            {{ $t(`login.lang.${l.value}`) }}
          </button>
        </div>

        <div class="panel-body">
          <h1 class="title">{{ $t('login.title') }}</h1>
          <p class="subtitle">{{ $t('login.subtitle') }}</p>

          <div class="tabs">
            <button
              v-for="tb in TABS"
              :key="tb.key"
              type="button"
              class="tab"
              :class="{ on: tab === tb.key }"
              @click="tab = tb.key"
            >
              <AppIcon :name="tb.icon" :size="17" />
              {{ $t(`login.tabs.${tb.key}`) }}
            </button>
          </div>

          <!-- Uchala tab bir katakda turadi: balandlik eng balandiga teng
               bo'ladi, shuning uchun tab almashganda karta qimirlamaydi. -->
          <div class="forms">
          <!-- ---------- login / parol ---------- -->
          <form class="form" :class="{ hidden: tab !== 'password' }" :inert="tab !== 'password'" @submit.prevent="submitPassword">
            <label class="field">
              <span class="label">{{ $t('login.loginLabel') }}</span>
              <input
                v-model="form.login"
                class="input"
                :class="{ bad: errors.login }"
                :placeholder="$t('login.loginPh')"
                autocomplete="username"
                @input="delete errors.login"
              />
            </label>

            <label class="field">
              <span class="label">{{ $t('login.password') }}</span>
              <span class="input-wrap" :class="{ bad: errors.password }">
                <input
                  v-model="form.password"
                  class="input bare"
                  :type="showPassword ? 'text' : 'password'"
                  :placeholder="$t('login.passwordPh')"
                  autocomplete="current-password"
                  @input="delete errors.password"
                />
                <button
                  type="button"
                  class="eye"
                  :title="$t(showPassword ? 'login.hide' : 'login.show')"
                  @click="showPassword = !showPassword"
                >
                  <AppIcon :name="showPassword ? 'eye' : 'eyeOff'" :size="17" />
                </button>
              </span>
            </label>

            <div class="row">
              <label class="check">
                <input v-model="form.remember" type="checkbox" class="sr-only" />
                <span class="box" :class="{ on: form.remember }">
                  <AppIcon v-if="form.remember" name="check" :size="13" />
                </span>
                {{ $t('login.remember') }}
              </label>
              <div class="spacer" />
              <button type="button" class="link" @click="forgot">{{ $t('login.forgot') }}</button>
            </div>

            <button type="submit" class="submit" :disabled="loading">
              <span v-if="loading" class="spinner" />
              {{ loading ? $t('login.signingIn') : $t('login.submit') }}
              <AppIcon v-if="!loading" name="arrowRight" :size="16" />
            </button>
          </form>

          <!-- ---------- e-imzo ---------- -->
          <form class="form" :class="{ hidden: tab !== 'eimzo' }" :inert="tab !== 'eimzo'" @submit.prevent="submitEimzo">
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

          <!-- ---------- Face ID ---------- -->
          <div class="form face" :class="{ hidden: tab !== 'faceId' }" :inert="tab !== 'faceId'">
            <div class="face-circle" :class="{ scanning }">
              <AppIcon name="face" :size="52" />
              <span v-if="scanning" class="scan-line" />
            </div>

            <div class="face-title">{{ $t('login.face.title') }}</div>
            <p class="face-text">{{ $t('login.face.text') }}</p>

            <button type="button" class="submit" :disabled="scanning || loading" @click="startScan">
              <span v-if="scanning || loading" class="spinner" />
              <AppIcon v-else name="face" :size="17" />
              {{ loading ? $t('login.signingIn') : (scanning ? $t('login.face.scanning') : $t('login.face.start')) }}
            </button>
          </div>

          </div>

          <p class="note">{{ $t('login.note') }}</p>
        </div>
      </main>
    </div>
  </div>
</template>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 28px 20px;
  background: #2b364f;
  background-image: radial-gradient(circle at 20% 15%, #35415e 0%, #2b364f 45%, #232c42 100%);
}

.card {
  width: min(1060px, 100%);
  display: grid;
  grid-template-columns: 46% 54%;
  border-radius: 18px;
  overflow: hidden;
  background: #fff;
  box-shadow: 0 30px 70px rgba(5, 12, 28, .45);
  animation: riseIn .4s var(--ease);
}

/* ---------- chap panel ---------- */
.side {
  position: relative;
  padding: 46px 40px 40px;
  display: flex;
  flex-direction: column;
  background: linear-gradient(160deg, #16294a 0%, #0f1d36 55%, #0b1729 100%);
  color: #fff;
}

.side::after {
  content: '';
  position: absolute;
  inset: 0;
  background-image: radial-gradient(rgba(255, 255, 255, .16) 1px, transparent 1px);
  background-size: 22px 22px;
  opacity: .35;
  pointer-events: none;
}

.side-top {
  position: relative;
  z-index: 1;
  text-align: center;
}

.logo {
  width: 210px;
  max-width: 62%;
  height: auto;
  margin: 0 auto;
  display: block;
  filter: drop-shadow(0 10px 26px rgba(0, 0, 0, .45));
}

.brand {
  margin-top: 18px;
  font-family: var(--font-display);
  font-size: 34px;
  font-weight: 700;
  letter-spacing: .10em;
}

.org {
  margin: 10px auto 0;
  max-width: 260px;
  font-size: 14.5px;
  line-height: 1.5;
  color: #a9bad3;
}

.rule {
  position: relative;
  z-index: 1;
  height: 1px;
  margin: 34px 0 24px;
  background: rgba(255, 255, 255, .16);
}

.features {
  position: relative;
  z-index: 1;
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.feature {
  display: flex;
  align-items: center;
  gap: 14px;
}

.feature-ico {
  width: 38px;
  height: 38px;
  flex: 0 0 38px;
  border-radius: 11px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, .09);
  border: 1px solid rgba(255, 255, 255, .14);
  color: #cfe0f5;
}

.feature-text {
  font-size: 15px;
  line-height: 1.45;
  color: #e6edf7;
}

/* ---------- o'ng panel ---------- */
.panel {
  position: relative;
  padding: 22px 46px 34px;
  display: flex;
  flex-direction: column;
  background: #fff;
  color: #16233d;
}

.lang {
  align-self: flex-end;
  display: flex;
  gap: 3px;
  padding: 4px;
  border-radius: 20px;
  background: #f1f4f9;
}

.lang-btn {
  min-width: 40px;
  height: 30px;
  padding: 0 12px;
  border: 0;
  border-radius: 20px;
  background: transparent;
  color: #7b879b;
  font-size: 13.5px;
  font-weight: 600;
  cursor: pointer;
  transition: background .18s ease, color .18s ease;
}

.lang-btn.on {
  background: #16233d;
  color: #fff;
}

.panel-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  max-width: 390px;
  width: 100%;
  margin: 0 auto;
  padding-top: 18px;
}

.title {
  margin: 0;
  text-align: center;
  font-size: 27px;
  font-weight: 700;
  color: #16233d;
}

.subtitle {
  margin: 8px 0 22px;
  text-align: center;
  font-size: 14.5px;
  color: #8b95a6;
}

/* ---------- tablar ---------- */
.tabs {
  display: flex;
  gap: 4px;
  padding: 5px;
  border-radius: 12px;
  background: #f1f4f9;
}

.tab {
  flex: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  height: 42px;
  border: 0;
  border-radius: 9px;
  background: transparent;
  color: #66748c;
  font-size: 14.5px;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  transition: background .2s ease, color .2s ease, box-shadow .2s ease;
}

.tab:hover {
  color: #16233d;
}

.tab.on {
  background: #16233d;
  color: #fff;
  box-shadow: 0 4px 12px rgba(11, 23, 41, .28);
}

/* ---------- forma ---------- */
.forms {
  display: grid;
  margin-top: 30px;
}

/* uchala forma ustma-ust: katak balandligi eng balandiga teng */
.forms > * {
  grid-area: 1 / 1;
}

.form {
  display: flex;
  flex-direction: column;
  gap: 16px;
  transition: opacity .18s ease;
}

.form.hidden {
  visibility: hidden;
  opacity: 0;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 7px;
}

.label {
  font-size: 14px;
  color: #3d4d66;
}

.input {
  width: 100%;
  height: 48px;
  padding: 0 14px;
  border-radius: 10px;
  border: 1px solid #dde4ee;
  background: #fff;
  color: #16233d;
  font-size: 15px;
  transition: border-color .16s ease, box-shadow .16s ease;
}

.input::placeholder {
  color: #aab4c4;
}

.input:focus {
  outline: none;
  border-color: #23568f;
  box-shadow: 0 0 0 3px #e8eef7;
}

.input.bad,
.input-wrap.bad {
  border-color: #a52220;
  background: #fef7f6;
}

.input-wrap {
  display: flex;
  align-items: center;
  gap: 8px;
  height: 48px;
  padding: 0 12px 0 14px;
  border-radius: 10px;
  border: 1px solid #dde4ee;
  background: #fff;
  transition: border-color .16s ease, box-shadow .16s ease;
}

.input-wrap:focus-within {
  border-color: #23568f;
  box-shadow: 0 0 0 3px #e8eef7;
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

.eye {
  border: 0;
  background: transparent;
  padding: 4px;
  color: #98a3b6;
  cursor: pointer;
  display: flex;
}

.eye:hover {
  color: #23568f;
}

/* ---------- qator ---------- */
.row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.check {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  font-size: 14.5px;
  color: #3d4d66;
  cursor: pointer;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
  white-space: nowrap;
}

.box {
  width: 21px;
  height: 21px;
  flex: 0 0 21px;
  border-radius: 6px;
  border: 1.6px solid #c8d0dd;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  transition: background .16s ease, border-color .16s ease;
}

.box.on {
  background: #16233d;
  border-color: #16233d;
}

.spacer {
  flex: 1;
}

.link {
  border: 0;
  background: transparent;
  padding: 0;
  font-size: 14px;
  color: #23568f;
  cursor: pointer;
}

.link:hover {
  text-decoration: underline;
}

/* ---------- yuborish ---------- */
.submit {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 9px;
  height: 52px;
  margin-top: 4px;
  border: 0;
  border-radius: 10px;
  background: #16233d;
  color: #fff;
  font-size: 15.5px;
  font-weight: 600;
  cursor: pointer;
  transition: filter .16s ease, transform .16s var(--ease);
}

.submit:hover:not(:disabled) {
  filter: brightness(1.18);
  transform: translateY(-1px);
}

.submit:disabled {
  opacity: .75;
  cursor: not-allowed;
}

.spinner {
  width: 17px;
  height: 17px;
  flex: 0 0 17px;
  border-radius: 50%;
  border: 2px solid rgba(255, 255, 255, .35);
  border-top-color: #fff;
  animation: spin .7s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg) }
}

/* ---------- e-imzo ---------- */
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

.spinner.dark {
  border-color: #c8cdd6;
  border-top-color: #16233d;
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

/* ---------- Face ID ---------- */
.face {
  align-items: center;
  justify-content: center;
  text-align: center;
}

.face-circle {
  position: relative;
  width: 132px;
  height: 132px;
  border-radius: 50%;
  border: 1px solid #e7ecf3;
  background: #fbfcfe;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #16233d;
  overflow: hidden;
  margin: 6px 0 4px;
}

.face-circle.scanning {
  border-color: #23568f;
  box-shadow: 0 0 0 6px #e8eef7;
}

.scan-line {
  position: absolute;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, transparent, #23568f, transparent);
  animation: scan 1.1s linear infinite;
}

@keyframes scan {
  0% { top: 14% }
  50% { top: 84% }
  100% { top: 14% }
}

.face-title {
  margin-top: 12px;
  font-size: 17px;
  font-weight: 700;
  color: #16233d;
}

.face-text {
  margin: 8px 0 6px;
  font-size: 14.5px;
  line-height: 1.5;
  color: #8b95a6;
}

.face .submit {
  width: 100%;
}

/* ---------- izoh ---------- */
.note {
  margin: auto 0 0;
  padding-top: 30px;
  text-align: center;
  font-size: 13px;
  color: #a3adbd;
}

/* ---------- responsive ---------- */
@media (max-width: 900px) {
  .card {
    grid-template-columns: 1fr;
  }

  .side {
    padding: 30px 24px 26px;
  }

  .logo {
    width: 128px;
  }

  .brand {
    font-size: 26px;
    margin-top: 12px;
  }

  .rule {
    margin: 22px 0 18px;
  }

  .features {
    gap: 12px;
  }

  .panel {
    padding: 18px 22px 26px;
  }
}

@media (max-width: 480px) {
  .login-page {
    padding: 0;
  }

  .card {
    border-radius: 0;
    min-height: 100vh;
  }

  .tab span {
    display: none;
  }

  .features {
    display: none;
  }
}
</style>
