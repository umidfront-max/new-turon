<script setup>
/*
  Ovozli fabula — namuna yozuv: mikrofon so'ralmaydi, faqat interfeys holatlari.
  Uch holat: idle (yozishga tayyor) -> recording -> saved/playing.
*/
import { reactive, onBeforeUnmount } from 'vue'
import { useI18n } from 'vue-i18n'
import AppIcon from '@/components/ui/AppIcon.vue'
import { useUi } from '@/stores/useUi'

const { t } = useI18n()
const { toast } = useUi()

const rec = reactive({ state: 'idle', seconds: 0, length: 0, playing: 0 })
let recTimer = null
let playTimer = null

// to'lqin ustunlari balandligi (piksel)
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

onBeforeUnmount(() => {
  clearInterval(recTimer)
  clearInterval(playTimer)
})
</script>

<template>
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
</template>

<style scoped>

.btn-soft {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  height: 36px;
  padding: 0 16px;
  border-radius: 8px;
  border: 1px solid var(--ce2e8f1);
  background: var(--cf8fafc);
  color: var(--c3d4d66);
  font-size: 14.5px;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  transition: filter .16s ease, background .16s ease, transform .16s var(--ease);
}

.btn-soft:hover {
  background: var(--ce8eef7);
  color: var(--c23568f);
}

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
@keyframes recPulse {
  0%, 100% { opacity: 1 }
  50% { opacity: .25 }
}

@keyframes recWave {
  0%, 100% { transform: scaleY(.28) }
  50% { transform: scaleY(1) }
}
</style>
