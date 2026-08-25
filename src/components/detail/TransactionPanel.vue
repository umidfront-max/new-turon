<script setup>
/* Tranzaksiya tafsilotlari — zanjirdagi «Ko'rish» dan ochiladigan yon panel. */
import { computed } from 'vue'
import AppIcon from '@/components/ui/AppIcon.vue'

const props = defineProps({
  node: { type: Object, required: true },
  applicant: { type: String, default: '' }
})

const emit = defineEmits(['close'])

// karta egasi — namuna ma'lumot (real tizimda bank javobidan keladi)
const person = computed(() => ({
  name: props.node.level === 1 ? props.applicant : `Karta egasi · ${props.node.card.slice(-4)}`,
  pinfl: `3${'•'.repeat(7)}${props.node.card.slice(-2)}`,
  passport: `AA ${props.node.card.replace(/\D/g, '').slice(0, 7)}`,
  addr: 'Toshkent shahar, Chilonzor tumani, 19-kvartal',
  phone: '+998 90 123 45 67'
}))

const rows = computed(() => [
  { k: 'amount', v: `${props.node.amount} so'm` },
  { k: 'date', v: props.node.date },
  { k: 'bank', v: props.node.bank },
  { k: 'op', v: props.node.op },
  { k: 'system', v: props.node.system || '—' }
])
</script>

<template>
  <div class="root" @click.self="emit('close')">
    <aside class="panel">
      <header class="head">
        <div class="head-text">
          <span class="title">{{ $t('detail.txPanel.title') }}</span>
          <span class="id mono">{{ node.card }}</span>
        </div>
        <div class="spacer" />
        <button type="button" class="close" @click="emit('close')">
          <AppIcon name="close" :size="20" />
        </button>
      </header>

      <div class="body thin-scroll">
        <section class="person">
          <span class="photo">
            <AppIcon name="user" :size="30" />
            <span class="photo-note">{{ $t('detail.txPanel.photo') }}</span>
          </span>
          <div class="person-text">
            <span class="person-name">{{ person.name }}</span>
            <span class="chips">
              <span class="chip mono">PINFL {{ person.pinfl }}</span>
              <span class="chip mono">{{ person.passport }}</span>
            </span>
          </div>
        </section>

        <section class="group">
          <span class="group-title">{{ $t('detail.txPanel.contacts') }}</span>
          <div class="field">
            <span class="field-k">{{ $t('detail.txPanel.address') }}</span>
            <span class="field-v">{{ person.addr }}</span>
          </div>
          <div class="field">
            <span class="field-k">{{ $t('detail.txPanel.phone') }}</span>
            <span class="field-v mono with-ico">
              <AppIcon name="phone" :size="16" />
              {{ person.phone }}
            </span>
          </div>
        </section>

        <section class="group">
          <span class="group-title">{{ $t('detail.txPanel.operation') }}</span>
          <div v-for="r in rows" :key="r.k" class="field row">
            <span class="field-k">{{ $t(`detail.txPanel.fields.${r.k}`) }}</span>
            <span class="field-v mono">{{ r.v }}</span>
          </div>
        </section>

        <p class="hint">{{ $t('detail.txPanel.hint') }}</p>
      </div>

      <footer class="foot">
        <div class="spacer" />
        <button type="button" class="btn-dark" @click="emit('close')">{{ $t('common.close') }}</button>
      </footer>
    </aside>
  </div>
</template>

<style scoped>
.root {
  position: fixed;
  inset: 0;
  z-index: 130;
  background: rgba(5, 12, 28, .42);
  display: flex;
  justify-content: flex-end;
}

.panel {
  width: 460px;
  max-width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: var(--s-card);
  box-shadow: -12px 0 34px rgba(5, 12, 28, .18);
  animation: slideIn .22s var(--ease);
}

.head {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 16px 18px;
  border-bottom: 1px solid var(--ce5e7eb);
}

.head-text {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.title {
  font-size: 17px;
  font-weight: 700;
  color: var(--c16233d);
}

.id {
  font-size: 13.5px;
  color: var(--c8b95a6);
}

.spacer {
  flex: 1;
}

.close {
  border: 0;
  background: transparent;
  color: var(--c66748c);
  cursor: pointer;
  display: flex;
}

.close:hover {
  color: var(--ca52220);
}

.body {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: 16px 18px;
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.person {
  display: flex;
  gap: 14px;
  align-items: center;
}

.photo {
  width: 84px;
  height: 108px;
  flex: 0 0 84px;
  border-radius: 10px;
  border: 1px dashed var(--cc8cdd6);
  background: var(--cf8fafc);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  color: var(--c98a3b6);
}

.photo-note {
  font-size: 11.5px;
}

.person-text {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.person-name {
  font-size: 16px;
  font-weight: 600;
  color: var(--c16233d);
}

.chips {
  display: flex;
  gap: 7px;
  flex-wrap: wrap;
}

.chip {
  padding: 3px 9px;
  border-radius: 20px;
  background: var(--cf0f3f8);
  border: 1px solid var(--ce2e8f1);
  font-size: 12.5px;
  color: var(--c66748c);
}

.group {
  display: flex;
  flex-direction: column;
  gap: 9px;
}

.group-title {
  font-size: 13px;
  font-weight: 700;
  letter-spacing: .05em;
  text-transform: uppercase;
  color: var(--c8b95a6);
}

.field {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.field.row {
  flex-direction: row;
  align-items: center;
  gap: 12px;
  padding: 9px 11px;
  border-radius: 9px;
  border: 1px solid var(--ce2e8f1);
}

.field.row .field-k {
  flex: 1;
}

.field-k {
  font-size: 13px;
  color: var(--c8b95a6);
}

.field-v {
  font-size: 14.5px;
  color: var(--c16233d);
}

.with-ico {
  display: inline-flex;
  align-items: center;
  gap: 7px;
}

.hint {
  margin: 0;
  font-size: 13.5px;
  line-height: 1.55;
  color: var(--c98a3b6);
}

.foot {
  display: flex;
  padding: 14px 18px;
  background: var(--cfafbfc);
  border-top: 1px solid var(--ce5e7eb);
}

.btn-dark {
  height: 42px;
  padding: 0 20px;
  border-radius: 11px;
  border: 1px solid var(--btn);
  background: var(--btn);
  color: #fff;
  font-size: 14.5px;
  font-weight: 600;
  cursor: pointer;
}

@media (max-width: 560px) {
  .panel {
    width: 100%;
  }
}
</style>
