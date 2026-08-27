<script setup>
import { useRoute } from 'vue-router'
import AppLayout from '@/components/layout/AppLayout.vue'
import AppToast from '@/components/ui/AppToast.vue'
import ConfirmDialog from '@/components/ui/ConfirmDialog.vue'
import { useLangRefresh } from '@/composables/useLangRefresh'

const route = useRoute()

// til almashganda serverdan kelgan matnlar qaytadan so'raladi
useLangRefresh()
</script>

<template>
  <!-- login kabi sahifalar layoutsiz ochiladi -->
  <RouterView v-if="route.meta.blank" v-slot="{ Component, route: current }">
    <Transition name="screen" mode="out-in">
      <component :is="Component" :key="current.path" />
    </Transition>
  </RouterView>

  <AppLayout v-else />

  <AppToast />
  <ConfirmDialog />
</template>
