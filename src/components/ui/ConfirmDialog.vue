<script setup>
import { onMounted, onBeforeUnmount } from 'vue'
import AppIcon from '@/components/ui/AppIcon.vue'
import { useUi } from '@/stores/useUi'

const { ui, closeConfirm, runConfirm, runConfirmAlt } = useUi()

function onKey(e) {
  if (e.key === 'Escape' && ui.confirm) closeConfirm()
}

onMounted(() => document.addEventListener('keydown', onKey))
onBeforeUnmount(() => document.removeEventListener('keydown', onKey))
</script>

<template>
  <Transition name="fade">
    <div v-if="ui.confirm" class="ask-root">
      <div class="ask-backdrop" @click="closeConfirm" />
      <div class="ask" role="dialog" aria-modal="true">
        <!-- yopish: «qolish» degani, shuning uchun alohida tugma kerak emas -->
        <button type="button" class="ask-close" :title="$t('common.close')" @click="closeConfirm">
          <AppIcon name="close" :size="18" />
        </button>

        <div class="ask-title">{{ ui.confirm.title }}</div>
        <div class="ask-text">{{ ui.confirm.text }}</div>

        <div class="ask-actions">
          <!--
            Uchinchi amal bo'lsa (masalan «saqlamasdan chiqish») bekor qilish
            tugmasi chiqmaydi — burchakdagi X uning o'rnini bosadi, aks holda
            uchta tugma bir-biriga siqilib qoladi.
          -->
          <button v-if="!ui.confirm.alt" type="button" class="btn-ghost" @click="closeConfirm">
            {{ ui.confirm.cancel || $t('common.cancel') }}
          </button>

          <button v-else type="button" class="btn-ghost alt" @click="runConfirmAlt">
            {{ ui.confirm.alt }}
          </button>

          <button
            type="button"
            class="btn-main"
            :style="{ background: ui.confirm.danger ? 'var(--cc0392b)' : 'var(--btn)' }"
            @click="runConfirm"
          >
            {{ ui.confirm.ok || $t('common.confirm') }}
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
/* uchinchi amal — sokin, lekin xavfli ekani rangidan bilinadi */
.btn-ghost.alt {
  background: transparent;
  color: var(--ca52220);
}

.btn-ghost.alt:hover {
  background: var(--cfceceb);
}

.ask-close {
  position: absolute;
  top: 14px;
  right: 14px;
  width: 34px;
  height: 34px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 0;
  border-radius: 10px;
  background: transparent;
  color: var(--c98a3b6);
  cursor: pointer;
  transition: background .16s ease, color .16s ease;
}

.ask-close:hover {
  background: var(--cf0f3f8);
  color: var(--c16233d);
}

.ask-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(5, 12, 28, .44);
  z-index: 150;
}

.ask {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 151;
  width: 520px;
  max-width: calc(100vw - 40px);
  background: var(--s-card);
  border-radius: 18px;
  box-shadow: 0 20px 48px rgba(5, 12, 28, .30);
  padding: 28px 30px 24px;
  display: flex;
  flex-direction: column;
  gap: 11px;
  animation: askPop .16s ease-out;
}

.ask-title {
  padding-right: 34px;
  font-size: 25px;
  font-weight: 700;
  color: var(--c16233d);
  line-height: 1.25;
  letter-spacing: -.01em;
}

.ask-text {
  font-size: 16.5px;
  line-height: 1.55;
  color: var(--c8b95a6);
  text-wrap: pretty;
}

.ask-actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 16px;
}

/* tugma matni ikki qatorga bo'linib ketmasin */
.ask-actions button {
  white-space: nowrap;
}

.btn-ghost,
.btn-main {
  height: 44px;
  padding: 0 20px;
  border: 0;
  border-radius: 11px;
  display: flex;
  align-items: center;
  cursor: pointer;
  font-size: 16.5px;
  font-weight: 500;
  transition: background .16s ease, filter .16s ease;
}

.btn-ghost {
  background: var(--cf0f3f8);
  color: var(--c1c2b45);
}

.btn-ghost:hover {
  background: var(--ce9edf3);
}

.btn-main {
  color: #fff;
}

.btn-main:hover {
  filter: brightness(1.08);
}

@media (max-width: 520px) {
  .ask {
    padding: 22px 20px 18px;
  }

  .ask-title {
    font-size: 21px;
  }

  .ask-actions {
    flex-direction: column-reverse;
  }

  .btn-ghost,
  .btn-main {
    justify-content: center;
  }
}
</style>
