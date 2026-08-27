<script setup>
import { applyMask } from '@/data/form'
import { computed, ref, watch } from 'vue'
import AppIcon from '@/components/ui/AppIcon.vue'
import { pageList, lastPageOf } from '@/utils/table'

const props = defineProps({
  modelValue: { type: Number, default: 1 },
  perPage: { type: Number, default: 10 },
  total: { type: Number, default: 0 }
})

const emit = defineEmits(['update:modelValue', 'update:perPage'])

const PER_PAGE = [10, 20, 50]
const perPageOpen = ref(false)

const lastPage = computed(() => lastPageOf(props.total, props.perPage))

const pages = computed(() => pageList(props.modelValue, lastPage.value))

const jump = ref(String(props.modelValue))
watch(() => props.modelValue, (p) => { jump.value = String(p) })

// jami sahifa kamaysa (filtrdan keyin) — oxirgi sahifaga qaytamiz
watch(lastPage, (last) => {
  if (props.modelValue > last) emit('update:modelValue', last)
})

// maydonga faqat raqam kiritiladi (harf yozilsa DOM da qolib ketmasin)
function onJump(e) {
  jump.value = applyMask(e.target, (v) => String(v).replace(/\D/g, '').slice(0, 6))
}

function go(page) {
  const p = Math.min(Math.max(1, Number(page) || 1), lastPage.value)
  jump.value = String(p)
  emit('update:modelValue', p)
}

function setPerPage(n) {
  perPageOpen.value = false
  emit('update:perPage', n)
}
</script>

<template>
  <div class="pager">
    <span class="hint range mono">{{ $t('pager.range', { from: total ? (modelValue - 1) * perPage + 1 : 0, to: Math.min(modelValue * perPage, total) }) }}</span>

    <div class="spacer" />

    <div class="per-wrap">
      <button type="button" class="per-page" @click="perPageOpen = !perPageOpen">
        <span>{{ $t('pager.perPage', perPage) }}</span>
        <AppIcon name="chevronDown" :size="12" />
      </button>
      <Transition name="fade">
        <div v-if="perPageOpen" class="per-menu">
          <button
            v-for="n in PER_PAGE"
            :key="n"
            type="button"
            class="per-item"
            :class="{ on: n === perPage }"
            @click="setPerPage(n)"
          >{{ $t('pager.perPage', n) }}</button>
        </div>
      </Transition>
    </div>

    <button type="button" class="sq" :disabled="modelValue <= 1" @click="go(modelValue - 1)">
      <AppIcon name="chevronLeft" :size="15" />
    </button>

    <template v-for="(p, i) in pages" :key="`${p}-${i}`">
      <span v-if="p === '…'" class="gap">…</span>
      <button
        v-else
        type="button"
        class="page"
        :class="{ on: p === modelValue }"
        @click="go(p)"
      >{{ p }}</button>
    </template>

    <button type="button" class="sq" :disabled="modelValue >= lastPage" @click="go(modelValue + 1)">
      <AppIcon name="chevronRight" :size="15" />
    </button>

    <span class="hint">{{ $t('pager.jump') }}</span>
    <input
      :value="jump"
      class="jump mono"
      inputmode="numeric"
      @input="onJump"
      @keydown.enter="go(jump)"
      @blur="go(jump)"
    />
    <span class="hint">{{ $t('pager.total', { n: total }) }}</span>
  </div>
</template>
<style scoped>
.pager {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
  padding: 13px 18px;
  border-top: 1px solid var(--ceef1f6);
}

.per-page,
.sq,
.page,
.jump {
  height: 32px;
  border-radius: 6px;
  border: 1px solid var(--ce2e8f1);
  background: var(--s-card);
  cursor: pointer;
  transition: background .16s ease, border-color .16s ease, color .16s ease, transform .16s var(--ease);
}

.per-page {
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 0 11px;
  font-size: 14.5px;
  color: var(--c4b5a73);
}

.sq {
  width: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--ca3adbd);
}

.sq:disabled {
  opacity: .5;
  cursor: default;
}

.page {
  min-width: 32px;
  padding: 0 9px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-mono);
  font-size: 14.5px;
  font-weight: 600;
  color: var(--c4b5a73);
}

.per-page:hover,
.sq:not(:disabled):hover,
.page:hover {
  border-color: var(--cc3cbd8);
  transform: translateY(-1px);
}

.page.on {
  background: var(--btn);
  border-color: var(--btn);
  color: #fff;
}

.jump {
  width: 46px;
  text-align: center;
  font-size: 14.5px;
  outline: none;
}

.hint {
  font-size: 14.5px;
  color: var(--c66748c);
  margin-left: 6px;
}

@media (max-width: 720px) {
  .pager {
    justify-content: center;
  }

  .spacer,
  .per-page,
  .hint,
  .jump {
    display: none;
  }
}

/* ---------- yangi elementlar ---------- */
.per-wrap {
  position: relative;
}

.per-menu {
  position: absolute;
  bottom: calc(100% + 6px);
  left: 0;
  z-index: 20;
  min-width: 100%;
  padding: 5px;
  border-radius: 9px;
  border: 1px solid var(--ce2e8f1);
  background: var(--s-card);
  box-shadow: var(--shadow-pop);
}

.per-item {
  display: block;
  width: 100%;
  padding: 8px 12px;
  border: 0;
  border-radius: 7px;
  background: transparent;
  color: var(--c3d4d66);
  font-size: 13.5px;
  text-align: left;
  white-space: nowrap;
  cursor: pointer;
}

.per-item:hover {
  background: var(--cf4f7fb);
}

.per-item.on {
  background: var(--ce8eef7);
  color: var(--c23568f);
  font-weight: 600;
}

.gap {
  padding: 0 4px;
  color: var(--c98a3b6);
}

.hint.range {
  margin-right: auto;
}

@media (max-width: 720px) {
  .hint.range {
    display: none;
  }
}
</style>
