<script setup>
/* Ariza tafsilotidagi tab paneli: qora sarlavha satri va tanasi. */
import AppIcon from '@/components/ui/AppIcon.vue'

defineProps({
  icon: { type: String, required: true },
  title: { type: String, required: true },
  // tanasiga o'z chekkasini beradigan tablar uchun (masalan qaror hujjati)
  bare: { type: Boolean, default: false }
})
</script>

<template>
  <section class="panel card-surface">
    <header class="panel-head dark-bar">
      <AppIcon :name="icon" :size="18" />
      <span class="panel-title">{{ title }}</span>
      <slot name="head" />
    </header>

    <div v-if="bare" class="panel-bare">
      <slot />
    </div>
    <div v-else class="panel-body">
      <slot />
    </div>
  </section>
</template>

<style scoped>
.panel {
  overflow: hidden;
}

.panel-head {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 13px 16px;
  color: #fff;
}

.panel-title {
  font-size: 14px;
  font-weight: 700;
  letter-spacing: .09em;
  text-transform: uppercase;
}

.panel-body {
  padding: 14px 16px;
}

.panel-bare {
  display: contents;
}
</style>
