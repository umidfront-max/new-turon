<script setup>
import { QUEUES } from '@/data/applications'

defineProps({
  modelValue: { type: String, default: 'all' }
})

defineEmits(['update:modelValue'])
</script>

<template>
  <div class="queues thin-scroll">
    <button
      v-for="(q, i) in QUEUES"
      :key="q.key"
      type="button"
      class="queue"
      :class="{ on: q.key === modelValue }"
      :style="{ animationDelay: `${i * 35}ms` }"
      @click="$emit('update:modelValue', q.key)"
    >
      <span>{{ $t(`queues.${q.key}`) }}</span>
      <span class="q-count mono">{{ q.count }}</span>
    </button>
  </div>
</template>

<style scoped>
.queues {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px 6px;
}

.queue {
  display: flex;
  flex: 0 0 auto;
  white-space: nowrap;
  align-items: center;
  gap: 8px;
  height: 38px;
  padding: 0 15px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14.5px;
  font-weight: 500;
  background: var(--s-card);
  color: var(--c4b5a73);
  border: 1px solid var(--ce2e8f1);
  animation: riseIn .34s var(--ease) backwards;
  transition: background .18s ease, color .18s ease, border-color .18s ease, transform .18s var(--ease);
}

.queue:hover {
  border-color: var(--cc3cbd8);
  transform: translateY(-1px);
}

.queue.on {
  background: var(--btn);
  border-color: var(--btn);
  color: #fff;
  font-weight: 600;
}

.q-count {
  font-size: 13px;
  font-weight: 600;
  padding: 1px 7px;
  border-radius: 20px;
  background: var(--cf0f3f8);
  color: var(--c66748c);
  transition: background .18s ease, color .18s ease;
}

.queue.on .q-count {
  background: rgba(255, 255, 255, .18);
  color: #fff;
}

@media (max-width: 720px) {
  .queues {
    flex-wrap: nowrap;
    overflow-x: auto;
    padding-bottom: 4px;
    scrollbar-width: thin;
  }
}
</style>
