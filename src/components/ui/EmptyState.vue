<script setup>
/*
  Bo'sh holat — dizayndagi yagona ko'rinish.
  Oldin har bir ekranda bir oz farqli qilib yozilgan edi (46/56/58px ikonka,
  44/56/64px chekka), endi hammasi shu komponentdan keladi.
*/
import AppIcon from '@/components/ui/AppIcon.vue'

defineProps({
  icon: { type: String, required: true },
  title: { type: String, required: true },
  text: { type: String, default: '' },
  // ro'yxat ichida ishlatilsa chekkalar kichrayadi
  compact: { type: Boolean, default: false }
})
</script>

<template>
  <div class="empty" :class="{ compact }">
    <span class="empty-icon"><AppIcon :name="icon" :size="28" /></span>
    <div class="empty-title">{{ title }}</div>
    <div v-if="text" class="empty-text">{{ text }}</div>
    <slot />
  </div>
</template>

<style scoped>
.empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 13px;
  padding: 64px 18px 70px;
}

.empty.compact {
  padding: 40px 18px 44px;
}

.empty-icon {
  width: 58px;
  height: 58px;
  border-radius: 14px;
  background: var(--cf0f3f8);
  border: 1px solid var(--ce2e8f1);
  color: var(--ca3adbd);
  display: flex;
  align-items: center;
  justify-content: center;
}

.empty-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--c3d4d66);
}

.empty-text {
  font-size: 14.5px;
  color: var(--c8b95a6);
  text-align: center;
  max-width: 420px;
  line-height: 1.6;
}
</style>
