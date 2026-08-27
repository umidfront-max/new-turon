<script setup>
/*
  Kirishning 2-bosqichi: kamera orqali yuz tekshiruvi.
  Butun aloqa services/faceAuth.js da — bu yerda faqat ko'rinish va holatlar.

  Muvaffaqiyat: `done` (face_proof) — chaqiruvchi uni /auth/complete ga beradi.
  Bekor qilish: `cancel` — kamera va ws darhol yopiladi.
*/
import { ref, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { useI18n } from 'vue-i18n'
import AppIcon from '@/components/ui/AppIcon.vue'
import { startFaceCheck, FaceError } from '@/services/faceAuth'
import { promptKey } from '@/services/facePrompts'

const props = defineProps({
  wsUrl: { type: String, default: '' },
  ticket: { type: String, default: '' },
  owner: { type: String, default: '' }
})

const emit = defineEmits(['done', 'cancel'])

const { t } = useI18n()

const video = ref(null)
const phase = ref('camera')  // camera | connecting | scanning | done | error
const prompt = ref('')       // serverning ko'rsatmasi ("boshingizni buring")
const hint = ref('')         // bosqich holati
const error = ref('')
const score = ref(0)

// serverdan kelayotgan holatlar uchun tarjima kalitlari
const STATES = ['liveness', 'no_face', 'spoof', 'no_match', 'match']

/** Ko'rsatmani tarjima qiladi; tanilmasa serverning o'z matni qoladi. */
function translatePrompt(text) {
  const raw = String(text || '').trim()
  if (!raw) return ''

  const key = promptKey(raw)
  return key ? t(`login.faceCheck.prompts.${key}`) : raw
}

let session = null

function onState(status, msg) {
  if (typeof msg?.score === 'number') score.value = msg.score

  if (status === 'camera') {
    phase.value = 'camera'
    hint.value = t('login.faceCheck.camera')
    return
  }
  if (status === 'connecting' || status === 'connected') {
    phase.value = 'connecting'
    hint.value = t('login.faceCheck.connecting')
    return
  }
  if (status === 'ready') {
    phase.value = 'scanning'
    hint.value = t('login.faceCheck.scanning')
    return
  }

  phase.value = phase.value === 'done' ? 'done' : 'scanning'
  if (STATES.includes(status)) hint.value = t(`login.faceCheck.states.${status}`)
}

async function start() {
  if (session) return

  error.value = ''
  prompt.value = ''
  score.value = 0
  phase.value = 'camera'
  hint.value = t('login.faceCheck.camera')

  await nextTick()
  if (!video.value) return

  session = startFaceCheck({
    url: props.wsUrl,
    ticket: props.ticket,
    video: video.value,
    onState,
    onPrompt: (text) => { prompt.value = translatePrompt(text) }
  })

  const current = session
  try {
    const proof = await current.result
    phase.value = 'done'
    prompt.value = ''
    hint.value = t('login.faceCheck.states.match')
    emit('done', proof)
  } catch (e) {
    if (e?.key === 'cancelled') return  // foydalanuvchi o'zi to'xtatdi
    phase.value = 'error'
    prompt.value = ''
    hint.value = ''
    error.value = e instanceof FaceError && e.detail
      ? e.detail
      : t(`login.faceCheck.errors.${e?.key || 'camera'}`)
  } finally {
    if (session === current) session = null
  }
}

function stop() {
  const current = session
  session = null
  current?.stop()
}

function cancel() {
  stop()
  emit('cancel')
}

function retry() {
  stop()
  start()
}

onMounted(start)
onBeforeUnmount(stop)
</script>

<template>
  <div class="face-check">
    <div v-if="owner" class="who">
      <AppIcon name="user" :size="16" />
      <span class="truncate">{{ owner }}</span>
    </div>

    <div class="frame" :class="phase">
      <video ref="video" class="cam" autoplay playsinline muted />
      <span class="mask" />
      <span v-if="phase === 'done'" class="seal"><AppIcon name="check" :size="34" /></span>
    </div>

    <p class="prompt">{{ prompt || hint }}</p>

    <p v-if="score" class="score mono">{{ $t('login.faceCheck.score', { n: score.toFixed(3) }) }}</p>

    <p v-if="error" class="eri-error">
      <AppIcon name="warn" :size="16" />
      {{ error }}
    </p>

    <div class="acts">
      <button v-if="phase === 'error'" type="button" class="submit" @click="retry">
        <AppIcon name="face" :size="17" />
        {{ $t('login.faceCheck.retry') }}
      </button>
      <!-- yuz tasdiqlangach JWT so'raladi — bekor qilib bo'lmaydi -->
      <button v-else-if="phase === 'done'" type="button" class="submit" disabled>
        <span class="spinner" />
        {{ $t('login.signingIn') }}
      </button>

      <button v-else type="button" class="submit ghost" @click="cancel">
        {{ $t('common.cancel') }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.face-check {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.who {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  max-width: 100%;
  padding: 6px 12px;
  border-radius: 999px;
  background: #f1f4f9;
  font-size: 13px;
  font-weight: 600;
  color: #3d4d66;
}

.frame {
  position: relative;
  width: 100%;
  max-width: 340px;
  aspect-ratio: 4 / 3;
  border-radius: 14px;
  overflow: hidden;
  background: #0f1d36;
  border: 2px solid #e7ecf3;
  transition: border-color .2s ease;
}

.frame.scanning { border-color: #23568f; }
.frame.done { border-color: #1a6e4b; }
.frame.error { border-color: #d9483f; }

/*
  Ko'zgu (scaleX(-1)) qo'yilmaydi: serverga ketadigan kadr ko'zgulanmaydi,
  shuning uchun "o'ngga buriling" ko'rsatmasi ekrandagi tomonga to'g'ri kelishi
  uchun tasvir ham asl holida turishi kerak.
*/
.cam {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

/* yuz joylashadigan oval */
.mask {
  position: absolute;
  inset: 12% 22%;
  border: 2px dashed rgba(255, 255, 255, .55);
  border-radius: 50%;
  pointer-events: none;
}

.frame.done .mask { border-color: rgba(70, 220, 150, .8); }

.seal {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(15, 29, 54, .55);
  color: #46dc96;
}

.prompt {
  margin: 0;
  min-height: 20px;
  text-align: center;
  font-size: 14.5px;
  font-weight: 600;
  color: #16233d;
}

.score {
  margin: -6px 0 0;
  font-size: 12.5px;
  color: #8b95a6;
}

.acts {
  width: 100%;
}

.acts .submit {
  width: 100%;
}

.submit.ghost {
  background: #fff;
  border: 1.6px solid #e7ecf3;
  color: #3d4d66;
}

.submit.ghost:hover:not(:disabled) {
  border-color: #16233d;
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
</style>
