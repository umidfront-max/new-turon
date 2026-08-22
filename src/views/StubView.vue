<script setup>
import { useRouter } from 'vue-router'
import AppIcon from '@/components/ui/AppIcon.vue'

defineProps({
  screen: { type: String, required: true },   // stub.<screen>.* i18n bo'limi
  icon: { type: String, default: 'doc' },
  blocks: { type: Array, default: () => [] }  // stub.<screen>.blocks.<key>
})

const router = useRouter()
</script>

<template>
  <div class="screen">
    <div class="head card-surface">
      <div>
        <div class="crumbs">
          <button type="button" class="crumb" @click="router.push('/')">{{ $t('modules.cardblock') }}</button>
          <span>/</span>
          <span class="crumb-now">{{ $t(`stub.${screen}.title`) }}</span>
        </div>
        <div class="head-title">{{ $t(`stub.${screen}.title`) }}</div>
      </div>
      <div class="spacer" />
      <button type="button" class="btn-light" @click="router.push('/')">
        <AppIcon name="back" :size="16" />
        {{ $t('common.backToList') }}
      </button>
    </div>

    <section class="card-surface stub">
      <span class="stub-icon"><AppIcon :name="icon" :size="30" /></span>
      <h2 class="stub-title">{{ $t('stub.heading') }}</h2>
      <p class="stub-text">{{ $t(`stub.${screen}.text`) }}</p>

      <ul v-if="blocks.length" class="blocks">
        <li v-for="b in blocks" :key="b">
          <AppIcon name="check" :size="15" :width="2" />
          {{ $t(`stub.${screen}.blocks.${b}`) }}
        </li>
      </ul>
    </section>
  </div>
</template>

<style scoped>
.screen {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.head {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 18px;
}

.crumbs {
  display: flex;
  align-items: center;
  gap: 7px;
  font-size: 13.5px;
  color: var(--c8b95a6);
}

.crumb {
  border: 0;
  background: none;
  padding: 0;
  color: inherit;
  font-size: inherit;
  cursor: pointer;
}

.crumb:hover {
  color: var(--c23568f);
}

.crumb-now {
  color: var(--c3d4d66);
}

.head-title {
  margin-top: 6px;
  font-size: 20px;
  font-weight: 600;
  color: var(--c16233d);
}

.btn-light {
  display: flex;
  align-items: center;
  gap: 8px;
  height: 38px;
  padding: 0 15px;
  border-radius: 8px;
  border: 1px solid var(--ce2e8f1);
  background: var(--s-card);
  color: var(--c4b5a73);
  font-size: 14.5px;
  cursor: pointer;
  white-space: nowrap;
  transition: background .16s ease, border-color .16s ease;
}

.btn-light:hover {
  background: var(--cf4f7fb);
  border-color: var(--cc3cbd8);
}

.stub {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 60px 24px 66px;
  text-align: center;
}

.stub-icon {
  width: 64px;
  height: 64px;
  border-radius: 16px;
  background: var(--ce8eef7);
  color: var(--c23568f);
  display: flex;
  align-items: center;
  justify-content: center;
  animation: riseIn .4s var(--ease);
}

.stub-title {
  margin: 0;
  font-size: 19px;
  font-weight: 600;
  color: var(--c16233d);
}

.stub-text {
  margin: 0;
  max-width: 520px;
  font-size: 14.5px;
  line-height: 1.65;
  color: var(--c8b95a6);
}

.blocks {
  list-style: none;
  margin: 10px 0 0;
  padding: 0;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 8px;
}

.blocks li {
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 7px 13px;
  border-radius: 20px;
  background: var(--cf4f7fb);
  border: 1px solid var(--ce2e8f1);
  font-size: 13.5px;
  color: var(--c3d4d66);
}

.blocks svg {
  color: var(--c1a6e4b);
}
</style>
