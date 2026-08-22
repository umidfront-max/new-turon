<script setup>
import AppTopbar from './AppTopbar.vue'
import AppSidebar from './AppSidebar.vue'
import { useUi } from '@/stores/useUi'

const { ui, setMobileNav } = useUi()
</script>

<template>
  <div class="shell">
    <AppTopbar />

    <div class="body">
      <AppSidebar />

      <Transition name="fade">
        <div v-if="ui.mobileNavOpen" class="nav-scrim" @click="setMobileNav(false)" />
      </Transition>

      <main class="content thin-scroll">
        <RouterView v-slot="{ Component, route }">
          <Transition name="screen" mode="out-in">
            <component :is="Component" :key="route.path" />
          </Transition>
        </RouterView>
      </main>
    </div>
  </div>
</template>

<style scoped>
.shell {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  color: var(--c1c2b45);
}

.body {
  flex: 1;
  display: flex;
  align-items: stretch;
  min-height: 0;
}

.content {
  flex: 1;
  min-width: 0;
  background: var(--ceceff5);
  padding: 16px 20px 40px;
  position: relative;
}

.nav-scrim {
  position: fixed;
  inset: 0;
  z-index: 110;
  background: rgba(5, 12, 28, .5);
}

@media (max-width: 640px) {
  .content {
    padding: 12px 12px 32px;
  }
}
</style>
