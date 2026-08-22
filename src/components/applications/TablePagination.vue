<script setup>
import { ref } from 'vue'
import AppIcon from '@/components/ui/AppIcon.vue'

const props = defineProps({
  modelValue: { type: Number, default: 1 },
  pages: { type: Array, default: () => [1, 2, 3, 13] },
  total: { type: Number, default: 128 }
})

const emit = defineEmits(['update:modelValue'])
const jump = ref(String(props.modelValue))

function go(page) {
  const p = Math.min(Math.max(1, Number(page) || 1), 13)
  jump.value = String(p)
  emit('update:modelValue', p)
}
</script>

<template>
  <div class="pager">
    <div class="spacer" />

    <button type="button" class="per-page">
      <span>{{ $t('pager.perPage', 10) }}</span>
      <AppIcon name="chevronDown" :size="12" />
    </button>

    <button type="button" class="sq" :disabled="modelValue <= 1" @click="go(modelValue - 1)">
      <AppIcon name="chevronLeft" :size="15" />
    </button>

    <button
      v-for="p in pages"
      :key="p"
      type="button"
      class="page"
      :class="{ on: p === modelValue }"
      @click="go(p)"
    >{{ p }}</button>

    <button type="button" class="sq" @click="go(modelValue + 1)">
      <AppIcon name="chevronRight" :size="15" />
    </button>

    <span class="hint">{{ $t('pager.jump') }}</span>
    <input v-model="jump" class="jump mono" @keydown.enter="go(jump)" />
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
</style>
