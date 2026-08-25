<script setup>
import { computed } from 'vue'

/*
  Ikonkalar src/assets/icons/*.svg fayllarida — asl dizayndan olingan.
  Fayllar qurilish vaqtida o'qiladi, ichki markup ajratib olinadi va
  o'lcham/qalinlik props orqali beriladi. Yangi ikonka qo'shish uchun
  shu papkaga .svg fayl tashlash kifoya.
*/
const FILES = import.meta.glob('@/assets/icons/*.svg', { query: '?raw', import: 'default', eager: true })

const ICONS = {}
for (const [path, raw] of Object.entries(FILES)) {
  const name = path.split('/').pop().replace('.svg', '')
  const open = raw.slice(0, raw.indexOf('>') + 1)
  const inner = raw.slice(raw.indexOf('>') + 1, raw.lastIndexOf('</svg>')).trim()
  const box = /viewBox="([^"]+)"/.exec(open)
  const fill = /fill="([^"]+)"/.exec(open)
  ICONS[name] = {
    inner,
    viewBox: box ? box[1] : '0 0 24 24',
    // fayldagi root qiymatlar: to'ldirilgan (play) yoki chiziqli (qolganlari)
    fill: fill ? fill[1] : 'none',
    stroked: /stroke="/.test(open)
  }
}

const props = defineProps({
  name: { type: String, required: true },
  size: { type: [Number, String], default: 20 },
  width: { type: [Number, String], default: 1.5 }
})

const icon = computed(() => ICONS[props.name] || { inner: '', viewBox: '0 0 24 24', fill: 'none', stroked: false })
</script>

<template>
  <svg
    class="app-icon"
    :width="size"
    :height="size"
    :viewBox="icon.viewBox"
    :fill="icon.fill"
    :stroke="icon.stroked ? 'currentColor' : undefined"
    :stroke-width="icon.stroked ? width : undefined"
    aria-hidden="true"
    focusable="false"
    v-html="icon.inner"
  />
</template>

<style scoped>
.app-icon {
  display: block;
  flex: none;
}
</style>
