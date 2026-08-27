<script setup>
/*
  Bir nechta qiymat tanlanadigan ro'yxat (checkbox'li dropdown).

  Yopiq holatda tanlov qisqacha ko'rsatiladi: hech narsa tanlanmagan bo'lsa
  "Barchasi", bitta bo'lsa o'sha qiymat nomi, ko'p bo'lsa "N ta tanlandi".
  Ro'yxat uzun bo'lsa (bank, hudud, usul) ichida qidiruv chiqadi.

  Tanlov darhol yuqoriga uzatiladi — "Qo'llash" bosilgunicha uni FilterPanel
  o'zida saqlab turadi.
*/
import { ref, computed, watch, onBeforeUnmount, nextTick } from 'vue'
import { useI18n } from 'vue-i18n'
import AppIcon from '@/components/ui/AppIcon.vue'

const props = defineProps({
  label: { type: String, default: '' },
  // [{ value, label, count }]
  options: { type: Array, default: () => [] },
  modelValue: { type: Array, default: () => [] },
  // shuncha qiymatdan boshlab ichida qidiruv chiqadi (0 — doim, Infinity — hech qachon)
  searchFrom: { type: Number, default: 8 },
  // faqat bitta qiymat tanlanadi — serverda bu guruhning `__in` shakli yo'q
  single: { type: Boolean, default: false },
  placeholder: { type: String, default: '' }
})

const emit = defineEmits(['update:modelValue'])

const { t } = useI18n()

const open = ref(false)
const search = ref('')
const root = ref(null)
const control = ref(null)
const searchInput = ref(null)

/*
  Ro'yxat `position: fixed` bilan chiziladi: jadval kartasida `overflow: hidden`
  turibdi, oddiy absolyut joylashuvda ro'yxat karta chekkasida kesilib qolardi.
  Shu sababli o'rni qo'lda hisoblanadi va sahifa siljiganda yangilanadi.
*/
const pop = ref({ top: 0, left: 0, width: 0, maxHeight: 300 })

function place() {
  const box = control.value?.getBoundingClientRect()
  if (!box) return

  const gap = 6
  const below = window.innerHeight - box.bottom - gap - 12
  const above = box.top - gap - 12

  // pastda joy yetmasa — ro'yxat tepaga chiqadi
  const up = below < 200 && above > below
  const maxHeight = Math.min(320, Math.max(160, Math.round(up ? above : below)))

  pop.value = {
    top: up ? Math.max(12, box.top - gap - maxHeight) : box.bottom + gap,
    left: box.left,
    width: box.width,
    maxHeight
  }
}

// qisqa ro'yxatda (status, takroriylik, muddat) qidiruv keraksiz
const withSearch = computed(() => props.options.length >= props.searchFrom)

/*
  Tanlangan qiymatlar manzildan qaytganda satr bo'lib keladi (usul, hudud va
  bank id'lari son), shuning uchun solishtirish har doim satr ustidan boradi.
*/
const chosen = computed(() => new Set(props.modelValue.map(String)))

const visible = computed(() => {
  const q = search.value.trim().toLowerCase()
  if (!q) return props.options
  return props.options.filter((o) =>
    String(o.label).toLowerCase().includes(q) || String(o.value).toLowerCase().includes(q)
  )
})

const summary = computed(() => {
  const n = props.modelValue.length
  if (!n) return props.placeholder || t('filters.all')
  if (n === 1) {
    const hit = props.options.find((o) => String(o.value) === String(props.modelValue[0]))
    return hit ? hit.label : String(props.modelValue[0])
  }
  return t('filters.selected', { n })
})

function toggle(value) {
  const key = String(value)
  const next = new Set(chosen.value)

  if (props.single) {
    // qayta bosilsa tanlov olib tashlanadi, aks holda avvalgisi almashadi
    emit('update:modelValue', next.has(key) ? [] : [value])
    open.value = false
    return
  }

  if (next.has(key)) next.delete(key)
  else next.add(key)
  // tartib options'dagidek qolsin — qayta tanlaganda sakrab ketmasin
  emit('update:modelValue', props.options.filter((o) => next.has(String(o.value))).map((o) => o.value))
}

function onDocument(e) {
  if (!root.value?.contains(e.target)) open.value = false
}

function onKey(e) {
  if (e.key === 'Escape') open.value = false
}

function listen(on) {
  const fn = on ? 'addEventListener' : 'removeEventListener'
  document[fn]('mousedown', onDocument)
  document[fn]('keydown', onKey)
  // true — ichki siljishlar ham ushlanadi
  window[fn]('scroll', place, true)
  window[fn]('resize', place)
}

watch(open, async (on) => {
  if (on) {
    place()
    listen(true)
    await nextTick()
    searchInput.value?.focus()
  } else {
    search.value = ''
    listen(false)
  }
})

onBeforeUnmount(() => { if (open.value) listen(false) })
</script>

<template>
  <div ref="root" class="ms">
    <div v-if="label" class="ms-label">{{ label }}</div>

    <button
      ref="control"
      type="button"
      class="ms-control"
      :class="{ open, filled: modelValue.length }"
      :aria-expanded="open"
      @click="open = !open"
    >
      <span class="truncate">{{ summary }}</span>
      <AppIcon :name="open ? 'chevronUp' : 'chevronDown'" :size="17" class="ms-caret" />
    </button>

    <div
      v-if="open"
      class="ms-pop"
      :style="{ top: `${pop.top}px`, left: `${pop.left}px`, width: `${pop.width}px` }"
    >
      <label v-if="withSearch" class="ms-search">
        <AppIcon name="search" :size="15" />
        <input
          ref="searchInput"
          v-model="search"
          type="text"
          :placeholder="$t('filters.search')"
        />
      </label>

      <div class="ms-list thin-scroll" :style="{ maxHeight: `${pop.maxHeight - (withSearch ? 56 : 16)}px` }">
        <label
          v-for="o in visible"
          :key="o.value"
          class="ms-item"
          :class="{ zero: o.count === 0 }"
        >
          <input
            type="checkbox"
            class="sr-only"
            :checked="chosen.has(String(o.value))"
            @change="toggle(o.value)"
          />
          <span class="box" :class="{ on: chosen.has(String(o.value)), radio: single }" />
          <span class="truncate">{{ o.label }}</span>
          <span v-if="o.count !== undefined" class="ms-count mono">{{ o.count }}</span>
        </label>

        <p v-if="!visible.length" class="ms-empty">{{ $t('filters.notFound') }}</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.ms {
  position: relative;
  min-width: 0;
}

.ms-label {
  margin-bottom: 6px;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: .06em;
  text-transform: uppercase;
  color: var(--c66748c);
}

.ms-control {
  width: 100%;
  height: 44px;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 12px;
  border: 1.5px solid var(--cd5e0ee);
  border-radius: 10px;
  background: var(--s-card);
  /* bo'sh holatdagi matn ham o'qilarli bo'lsin */
  color: var(--c66748c);
  font-size: 14.5px;
  font-family: inherit;
  text-align: left;
  cursor: pointer;
  transition: border-color .16s ease, box-shadow .16s ease;
}

.ms-control > .truncate {
  flex: 1;
  min-width: 0;
}

.ms-control:hover {
  border-color: var(--cc8cdd6);
}

.ms-control.filled {
  color: var(--c16233d);
  font-weight: 500;
}

.ms-control.open {
  border-color: var(--c23568f);
  box-shadow: 0 0 0 3px var(--ce8eef7);
}

.ms-caret {
  flex: 0 0 auto;
  color: var(--c8b95a6);
}

.ms-pop {
  position: fixed;
  z-index: 60;
  min-width: 200px;
  padding: 6px;
  border: 1px solid var(--ce2e8f1);
  border-radius: 10px;
  background: var(--s-card);
  box-shadow: 0 14px 34px rgba(9, 20, 40, .16);
  animation: riseIn .16s var(--ease);
}

.ms-search {
  display: flex;
  align-items: center;
  gap: 8px;
  height: 36px;
  margin-bottom: 4px;
  padding: 0 10px;
  border: 1px solid var(--ce2e8f1);
  border-radius: 8px;
  background: var(--cf8fafc);
  color: var(--c98a3b6);
}

.ms-search input {
  flex: 1;
  min-width: 0;
  border: 0;
  outline: none;
  background: transparent;
  font-size: 14px;
  font-family: inherit;
  color: var(--c16233d);
}

.ms-list {
  display: flex;
  flex-direction: column;
  overflow-y: auto;
}

.ms-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 8px;
  border-radius: 7px;
  font-size: 14.5px;
  color: var(--c3d4d66);
  cursor: pointer;
}

.ms-item > .truncate {
  flex: 1;
  min-width: 0;
}

.ms-item:hover {
  background: var(--cf4f7fb);
}

.ms-item.zero {
  opacity: .45;
}

.ms-count {
  flex: 0 0 auto;
  font-size: 13px;
  color: var(--ca3adbd);
}

.ms-empty {
  margin: 0;
  padding: 12px 8px;
  font-size: 13.5px;
  text-align: center;
  color: var(--c98a3b6);
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  opacity: 0;
  pointer-events: none;
}

.box {
  width: 16px;
  height: 16px;
  flex: 0 0 16px;
  border-radius: 4px;
  border: 1.5px solid var(--cc3cbd8);
  background: var(--s-card);
  position: relative;
  transition: background .16s ease, border-color .16s ease;
}

.box.on {
  background: var(--c23568f);
  border-color: var(--c23568f);
}

.box.radio {
  border-radius: 50%;
}

.box.radio.on::after {
  left: 3px;
  top: 3px;
  width: 6px;
  height: 6px;
  border: 0;
  border-radius: 50%;
  background: #fff;
  transform: none;
}

.box.on::after {
  content: '';
  position: absolute;
  left: 4px;
  top: 1px;
  width: 4px;
  height: 9px;
  border: solid #fff;
  border-width: 0 2px 2px 0;
  transform: rotate(45deg);
}

.ms-item:hover .box {
  border-color: var(--c23568f);
}
</style>
