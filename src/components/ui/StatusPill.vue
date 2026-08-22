<script setup>
import { computed } from 'vue'
import { STATUS } from '@/data/applications'

const props = defineProps({
  status: { type: String, required: true },
  size: { type: String, default: 'md' }, // md | sm
  short: { type: Boolean, default: false }
})

const meta = computed(() => STATUS[props.status] || STATUS.new)
const statusKey = computed(() => (STATUS[props.status] ? props.status : 'new'))
</script>

<template>
  <span
    class="pill"
    :class="size"
    :style="{ background: meta.bg, color: meta.fg, borderColor: meta.bd }"
  >
    <span class="pill-dot" :style="{ background: meta.fg }" />
    {{ $t(`status.${statusKey}.${short ? 'short' : 'label'}`) }}
  </span>
</template>

<style scoped>
.pill {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  border: 1px solid;
  white-space: nowrap;
}

.pill.sm {
  font-size: 12.5px;
  padding: 3px 8px;
  gap: 5px;
}

.pill-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  flex: none;
}
</style>
