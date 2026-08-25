<script setup>
import { computed } from 'vue'
import AppIcon from './AppIcon.vue'
import { useUi } from '@/stores/useUi'

const { ui, closeToast } = useUi()

const dot = computed(() => ({
  warn: '#d9a03f',
  bad: '#d9483f',
  ok: '#1fc24a'
}[ui.toast?.kind || 'ok']))

const icon = computed(() => ({
  warn: 'warn',
  bad: 'close',
  ok: 'check'
}[ui.toast?.kind || 'ok']))
</script>

<template>
  <Transition name="fade">
    <div v-if="ui.toast" class="toast" role="status">
      <span class="toast-dot" :style="{ background: dot }">
        <AppIcon :name="icon" :size="16" />
      </span>
      <span class="toast-msg">{{ ui.toast.msg }}</span>
      <button type="button" class="toast-close" @click="closeToast">{{ $t('common.close') }}</button>
    </div>
  </Transition>
</template>

<style scoped>
.toast {
  position: fixed;
  left: 50%;
  bottom: 34px;
  transform: translate(-50%, 0);
  z-index: 160;
  display: flex;
  align-items: center;
  gap: 14px;
  min-height: 60px;
  padding: 0 22px 0 18px;
  border-radius: 15px;
  background: #0b1220;
  box-shadow: 0 14px 34px rgba(5, 12, 28, .34);
  animation: toastUp .2s ease-out;
}

.toast-dot {
  width: 28px;
  height: 28px;
  flex: 0 0 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
}

.toast-msg {
  font-size: 17px;
  color: #fff;
}

.toast-close {
  border: 0;
  background: transparent;
  font-size: 16.5px;
  color: #8b929c;
  cursor: pointer;
  margin-left: 8px;
  transition: color .16s ease;
}

.toast-close:hover {
  color: #fff;
}

@media (max-width: 560px) {
  .toast {
    left: 12px;
    right: 12px;
    bottom: 16px;
    transform: none;
    padding: 12px 16px;
    animation: none;
  }

  .toast-msg {
    font-size: 15px;
    flex: 1;
  }
}
</style>
