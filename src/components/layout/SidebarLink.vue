<script setup>
import AppIcon from '@/components/ui/AppIcon.vue'

defineProps({
  icon: { type: String, required: true },
  label: { type: String, required: true },
  count: { type: [String, Number], default: null },
  // sanoq hali kelmagan — raqam o'rniga skelet turadi
  loading: { type: Boolean, default: false },
  to: { type: String, default: null },
  active: { type: Boolean, default: false },
  compact: { type: Boolean, default: false },   // yig'ilgan menyu
  countTone: { type: String, default: 'muted' } // muted | danger | success | active
})

defineEmits(['click'])
</script>

<template>
  <component
    :is="to ? 'router-link' : 'button'"
    :to="to || undefined"
    :type="to ? undefined : 'button'"
    class="nav-link"
    :class="[{ active, compact }, `count-${countTone}`]"
    :title="compact ? label : undefined"
    @click="$emit('click')"
  >
    <AppIcon :name="icon" :size="22" />
    <span v-if="!compact" class="label">{{ label }}</span>
    <span v-if="loading && !compact" class="count sk" />
    <span v-else-if="count !== null && !compact" class="count mono">{{ count }}</span>
  </component>
</template>

<style scoped>
/* skelet nishoncha sanoq bilan bir o'lchamda tursin */
.count.sk {
  width: 26px;
  height: 18px;
  border-radius: 999px;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 13px;
  height: 50px;
  margin: 0 10px 3px;
  padding: 0 14px;
  border: 0;
  border-radius: 10px;
  background: transparent;
  color: var(--brand-muted);
  cursor: pointer;
  text-decoration: none;
  width: calc(100% - 20px);
  transition: background .18s ease, color .18s ease, transform .18s var(--ease);
}

.nav-link:hover {
  background: rgba(255, 255, 255, .07);
  color: #fff;
  text-decoration: none;
}

.nav-link:active {
  transform: scale(.985);
}

.nav-link.active {
  background: var(--brand-active);
  color: #fff;
}

.nav-link.compact {
  justify-content: center;
  padding: 0;
}

.label {
  flex: 1;
  font-size: 16.5px;
  font-weight: 500;
  white-space: nowrap;
  text-align: left;
  animation: fadeLabel .22s ease;
}

@keyframes fadeLabel {
  from { opacity: 0; transform: translateX(-4px) }
  to { opacity: 1; transform: none }
}

.count {
  font-size: 14px;
  font-weight: 600;
  padding: 3px 9px;
  border-radius: 20px;
  background: rgba(255, 255, 255, .09);
  color: var(--brand-dim);
  transition: background .18s ease, color .18s ease;
}

.nav-link.active .count {
  background: var(--brand-ring);
  color: #fff;
}

.count-danger .count {
  background: var(--cd9483f);
  color: #fff;
}

.count-success .count {
  background: rgba(58, 168, 120, .20);
  color: var(--c7fd3a8);
}
</style>
