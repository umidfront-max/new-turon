<script setup>
import { ref, reactive, computed, onBeforeUnmount } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import AppIcon from '@/components/ui/AppIcon.vue'
import { LANGS } from '@/i18n'
import { EIMZO_KEYS } from '@/data/keys'
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
const selectedKey = ref(EIMZO_KEYS[1].id)
const pin = ref('')
const showPin = ref(false)

const activeKey = computed(() => EIMZO_KEYS.find((k) => k.id === selectedKey.value))

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

function submitEimzo() {
  if (loading.value) return
  errors.pin = pin.value.replace(/\D/g, '').length < 4
  if (errors.pin) {
    toast(t('login.errors.pin'), 'bad')
    return
  }
  go({
    name: activeKey.value.name,
    role: activeKey.value.role,
    method: 'eimzo',
    login: activeKey.value.idMasked,
    remember: true
  })
}

function startScan() {
  if (scanning.value || loading.value) return
  scanning.value = true
  scanTimer = setTimeout(() => {
    scanning.value = false
    go({
      name: EIMZO_KEYS[0].name,
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

function onPin(e) {
  pin.value = e.target.value.replace(/\D/g, '').slice(0, 6)
  delete errors.pin
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

          <!-- ---------- login / parol ---------- -->
          <form v-if="tab === 'password'" class="form" @submit.prevent="submitPassword">
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
                  <AppIcon v-if="form.remember" name="check" :size="13" :width="2.6" />
                </span>
                {{ $t('login.remember') }}
              </label>
              <div class="spacer" />
              <button type="button" class="link" @click="forgot">{{ $t('login.forgot') }}</button>
            </div>

            <button type="submit" class="submit" :disabled="loading">
              <span v-if="loading" class="spinner" />
              {{ loading ? $t('login.signingIn') : $t('login.submit') }}
              <AppIcon v-if="!loading" name="arrowRight" :size="16" :width="1.9" />
            </button>
          </form>

          <!-- ---------- e-imzo ---------- -->
          <form v-else-if="tab === 'eimzo'" class="form" @submit.prevent="submitEimzo">
            <div class="status">
              <span class="status-dot" />
              {{ $t('login.eimzo.connected') }}
            </div>

            <button
              v-for="k in EIMZO_KEYS"
              :key="k.id"
              type="button"
              class="key"
              :class="{ on: selectedKey === k.id }"
              @click="selectedKey = k.id"
            >
              <span class="key-ico"><AppIcon :name="k.icon" :size="18" /></span>
              <span class="key-text">
                <span class="key-name">{{ k.name }}</span>
                <span class="key-meta mono">
                  {{ k.idLabel }} {{ k.idMasked }} · {{ $t('login.eimzo.expires', { date: k.expires }) }}
                </span>
              </span>
              <span class="radio"><span class="radio-dot" /></span>
            </button>

            <label class="field">
              <span class="label">{{ $t('login.eimzo.pin') }}</span>
              <span class="input-wrap" :class="{ bad: errors.pin }">
                <input
                  :value="pin"
                  class="input bare mono"
                  :type="showPin ? 'text' : 'password'"
                  inputmode="numeric"
                  :placeholder="$t('login.eimzo.pinPh')"
                  @input="onPin"
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

            <button type="submit" class="submit" :disabled="loading">
              <span v-if="loading" class="spinner" />
              {{ loading ? $t('login.signingIn') : $t('login.submit') }}
              <AppIcon v-if="!loading" name="arrowRight" :size="16" :width="1.9" />
            </button>
          </form>

          <!-- ---------- Face ID ---------- -->
          <div v-else class="form face">
            <div class="face-circle" :class="{ scanning }">
              <AppIcon name="face" :size="52" :width="1.3" />
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
.form {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-top: 30px;
  animation: riseIn .26s var(--ease);
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
