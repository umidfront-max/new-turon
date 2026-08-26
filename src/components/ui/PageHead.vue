<script setup>
/*
  Ekran sarlavhasi: non ushoqlari (CardBlock / sahifa) + sarlavha va o'ng tomonda amallar.
  Beshta ekranda bir xil takrorlanardi.
*/
import { useRouter } from 'vue-router'

defineProps({
  title: { type: String, required: true },
  // non ushoqlaridagi oxirgi bo'lak sarlavhadan farq qilsa
  crumb: { type: String, default: '' }
})

const router = useRouter()
</script>

<template>
  <div class="head card-surface">
    <div class="head-text">
      <div class="crumbs">
        <button type="button" class="crumb" @click="router.push('/')">
          {{ $t('modules.cardblock') }}
        </button>
        <span>/</span>
        <span class="crumb-now">{{ crumb || title }}</span>
      </div>

      <div class="head-row">
        <span class="head-title">{{ title }}</span>
        <slot name="chips" />
      </div>
    </div>

    <div class="spacer" />

    <slot name="actions" />
  </div>
</template>

<style scoped>
.head {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 18px;
  flex-wrap: wrap;
}

.head-text {
  min-width: 0;
}
</style>
