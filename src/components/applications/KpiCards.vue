<script setup>
import { computed } from 'vue'
import AppIcon from '@/components/ui/AppIcon.vue'
import { KPI } from '@/data/applications'
import { useApplications } from '@/stores/useApplications'
import { useRegistry } from '@/stores/useRegistry'

const { counts } = useApplications()
const registry = useRegistry()

defineEmits(['pick'])

// Sanoqlar serverdan (`by_status`) keladi; u yo'q bo'lsa namuna ma'lumotdan.
const shown = computed(() => registry.counts.value || counts.value)

// birinchi javob kelgunicha namuna soni emas, skelet
const pending = registry.pending
</script>

<template>
  <div class="kpi-grid">
    <button
      v-for="(k, i) in KPI"
      :key="k.key"
      type="button"
      class="kpi card-surface"
      :style="{ animationDelay: `${i * 55}ms` }"
      @click="$emit('pick', k.key)"
    >
      <span class="kpi-icon" :style="{ background: k.iconBg, color: k.tone }">
        <AppIcon :name="k.icon" :size="22" />
      </span>
      <span class="kpi-body">
        <span class="kpi-label">{{ $t(`kpi.${k.key}.label`) }}</span>
        <span class="kpi-row">
          <span v-if="pending" class="sk" style="width: 32px; height: 26px" />
          <span v-else class="kpi-value mono" :style="{ color: k.tone }">{{ shown[k.key] || 0 }}</span>
          <span class="kpi-note">{{ $t(`kpi.${k.key}.note`) }}</span>
        </span>
      </span>
    </button>
  </div>
</template>

<style scoped>
.kpi-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(212px, 1fr));
  gap: 12px;
}

.kpi {
  padding: 14px;
  display: flex;
  align-items: center;
  gap: 13px;
  min-width: 0;
  cursor: pointer;
  text-align: left;
  animation: riseIn .38s var(--ease) backwards;
  transition: transform .2s var(--ease), box-shadow .2s ease, border-color .2s ease;
}

.kpi:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 18px rgba(5, 12, 28, .10);
  border-color: var(--cd5e0ee);
}

.kpi-icon {
  width: 42px;
  height: 42px;
  flex: 0 0 42px;
  border-radius: 9px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform .25s var(--ease);
}

.kpi:hover .kpi-icon {
  transform: scale(1.06) rotate(-3deg);
}

.kpi-body {
  min-width: 0;
}

.kpi-label {
  display: block;
  font-size: 13.5px;
  color: var(--c66748c);
  font-weight: 500;
}

.kpi-row {
  display: flex;
  align-items: baseline;
  gap: 6px;
  margin-top: 3px;
}

.kpi-value {
  font-size: 28px;
  font-weight: 600;
  line-height: 1;
}

.kpi-note {
  font-size: 13px;
  color: var(--c98a3b6);
}

@media (max-width: 520px) {
  .kpi-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 8px;
  }

  .kpi {
    padding: 11px;
    gap: 10px;
  }

  .kpi-icon {
    width: 36px;
    height: 36px;
    flex-basis: 36px;
  }

  .kpi-value {
    font-size: 23px;
  }

  .kpi-note {
    display: none;
  }
}
</style>
