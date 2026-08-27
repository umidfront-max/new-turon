<script setup>
import { onMounted, onBeforeUnmount } from 'vue'
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
        <div class="ask-title">{{ ui.confirm.title }}</div>
        <div class="ask-text">{{ ui.confirm.text }}</div>
        <div class="ask-actions">
          <button type="button" class="btn-ghost" @click="closeConfirm">
            {{ ui.confirm.cancel || $t('common.cancel') }}
          </button>
          <!-- ixtiyoriy uchinchi amal: masalan «saqlamasdan chiqish» -->
          <button v-if="ui.confirm.alt" type="button" class="btn-ghost alt" @click="runConfirmAlt">
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
/* uchinchi amal asosiysidan sokinroq, lekin bekor qilishdan ajralib tursin */
.btn-ghost.alt {
  border-color: var(--cf2cfcd);
  color: var(--ca52220);
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
  width: 466px;
  max-width: calc(100vw - 40px);
  background: var(--s-card);
  border-radius: 18px;
  box-shadow: 0 20px 48px rgba(5, 12, 28, .30);
  padding: 26px 28px 22px;
  display: flex;
  flex-direction: column;
  gap: 11px;
  animation: askPop .16s ease-out;
}

.ask-title {
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
  justify-content: flex-end;
  gap: 10px;
  margin-top: 12px;
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
