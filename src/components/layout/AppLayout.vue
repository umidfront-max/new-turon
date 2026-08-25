<script setup>
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import AppTopbar from './AppTopbar.vue'
import AppSidebar from './AppSidebar.vue'
import { useUi } from '@/stores/useUi'

const route = useRoute()
const { ui, setMobileNav } = useUi()

// Faqat shu qism aylanadi — topbar va sidebar joyida qotib turadi
const content = ref(null)
const scrolled = ref(false)

function onScroll(e) {
  scrolled.value = e.target.scrollTop > 4
}

// ekran almashganda tepaga qaytamiz (oyna emas, shu blok aylangani uchun)
watch(() => route.fullPath, () => {
  scrolled.value = false
  content.value?.scrollTo({ top: 0, behavior: 'auto' })
})
</script>

<template>
  <div class="shell">
    <AppTopbar :class="{ raised: scrolled }" />

    <div class="body">
      <AppSidebar />

      <Transition name="fade">
        <div v-if="ui.mobileNavOpen" class="nav-scrim" @click="setMobileNav(false)" />
      </Transition>

      <main ref="content" class="content thin-scroll" @scroll.passive="onScroll">
        <RouterView v-slot="{ Component, route: current }">
          <Transition name="screen" mode="out-in">
            <component :is="Component" :key="current.path" />
          </Transition>
        </RouterView>
      </main>
    </div>
  </div>
</template>

<style scoped>
.shell {
  /* dvh — mobil brauzerdagi manzil satri hisobga olinadi */
  height: 100vh;
  height: 100dvh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
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
  height: 100%;
  overflow-y: auto;
  overscroll-behavior: contain;
  scrollbar-gutter: stable;
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
