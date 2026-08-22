<script setup>
import { useRouter } from 'vue-router'
import AppIcon from '@/components/ui/AppIcon.vue'

const router = useRouter()
</script>

<template>
  <div class="screen">
    <section class="card-surface box">
      <span class="code mono">404</span>
      <h2 class="title">{{ $t('notFound.title') }}</h2>
      <p class="text">{{ $t('notFound.text') }}</p>
      <button type="button" class="btn-dark" @click="router.push('/')">
        <AppIcon name="back" :size="16" />
        {{ $t('notFound.back') }}
      </button>
    </section>
  </div>
</template>

<style scoped>
.screen {
  display: flex;
  flex-direction: column;
}

.box {
  padding: 62px 24px;
  text-align: center;
}

.code {
  display: inline-block;
  font-size: 46px;
  font-weight: 700;
  letter-spacing: .06em;
  color: var(--cc8cdd6);
}

.title {
  margin: 10px 0 0;
  font-size: 21px;
  font-weight: 700;
  color: var(--c16233d);
}

.text {
  margin: 8px 0 22px;
  font-size: 15px;
  color: var(--c8b95a6);
}

.btn-dark {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  height: 42px;
  padding: 0 18px;
  border-radius: 8px;
  border: 1px solid var(--btn);
  background: var(--btn);
  color: #fff;
  font-size: 14.5px;
  font-weight: 600;
  cursor: pointer;
  transition: filter .16s ease;
}

.btn-dark:hover {
  filter: brightness(1.15);
}
</style>
