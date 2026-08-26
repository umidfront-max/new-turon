<script setup>
/*
  Tizim sozlamalari (Super admin) — yangi dizaynda bu ekran hali bo'sh
  qoldirilgan (faqat joy ajratilgan). Shuning uchun bu yerda ham
  keyingi bosqichda to'ldiriladigan bloklar ro'yxati turadi.
*/
import AppIcon from '@/components/ui/AppIcon.vue'

const BLOCKS = [
  { key: 'integrations', icon: 'swap' },
  { key: 'rights', icon: 'shield' },
  { key: 'deadlines', icon: 'clock' },
  { key: 'notifications', icon: 'bell' }
]
</script>

<template>
  <div class="screen">
    <section class="card-surface stub">
      <span class="stub-icon"><AppIcon name="settings" :size="30" /></span>
      <h2 class="stub-title">{{ $t('admin.settings.title') }}</h2>
      <p class="stub-text">{{ $t('admin.settings.text') }}</p>

      <ul class="blocks">
        <li v-for="b in BLOCKS" :key="b.key">
          <AppIcon :name="b.icon" :size="18" />
          {{ $t(`admin.settings.blocks.${b.key}`) }}
        </li>
      </ul>
    </section>
  </div>
</template>

<style scoped>

.stub {
  padding: 54px 24px;
  text-align: center;
}

.stub-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 62px;
  height: 62px;
  border-radius: 16px;
  background: var(--ce8eef7);
  color: var(--c23568f);
  margin-bottom: 14px;
}

.stub-title {
  margin: 0;
  font-size: 21px;
  font-weight: 700;
  color: var(--c16233d);
}

.stub-text {
  margin: 8px auto 0;
  max-width: 520px;
  font-size: 15px;
  line-height: 1.6;
  color: var(--c8b95a6);
}

.blocks {
  list-style: none;
  margin: 22px auto 0;
  padding: 0;
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  justify-content: center;
  max-width: 660px;
}

.blocks li {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 9px 14px;
  border-radius: 20px;
  border: 1px solid var(--ce2e8f1);
  background: var(--cf8fafc);
  font-size: 14px;
  color: var(--c3d4d66);
}
</style>
