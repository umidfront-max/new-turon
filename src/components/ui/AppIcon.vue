<script setup>
import { computed } from 'vue'
import { glyphOf } from './icons'

/*
  Material Symbols Rounded — dizayndagi ikonka to'plami.
  Shrift index.html da ulanadi, umumiy uslub base.css da.
  name — loyihadagi qisqa nom (icons.js dagi jadvaldan glifga o'giriladi),
  size — piksel, weight — chiziq qalinligi (dizaynda 300), fill — to'ldirilgan.
*/
const props = defineProps({
  name: { type: String, required: true },
  size: { type: [Number, String], default: 20 },
  weight: { type: [Number, String], default: 300 },
  fill: { type: Boolean, default: false }
})

const glyph = computed(() => glyphOf(props.name))

const style = computed(() => ({
  fontSize: `${props.size}px`,
  width: `${props.size}px`,
  height: `${props.size}px`,
  fontVariationSettings: `'FILL' ${props.fill ? 1 : 0}, 'wght' ${props.weight}, 'GRAD' 0, 'opsz' 24`
}))
</script>

<template>
  <span class="material-symbols-rounded app-icon" :style="style" aria-hidden="true">{{ glyph }}</span>
</template>

<style scoped>
.app-icon {
  flex: none;
  overflow: hidden;
}
</style>
