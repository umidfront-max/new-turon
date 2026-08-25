<script setup>
/* Tranzaksiya tafsilotlari — zanjirdagi kartaga bosilganda ochiladigan yon panel. */
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import AppIcon from '@/components/ui/AppIcon.vue'

const props = defineProps({
  node: { type: Object, required: true }
})

const emit = defineEmits(['close'])

const { t } = useI18n()

const n = computed(() => props.node)

const summary = computed(() =>
  `${n.value.amount} ${t('detail.sum')} · ${n.value.op} · ${n.value.date}`
)

const chips = computed(() => [
  t(n.value.male ? 'detail.txPanel.male' : 'detail.txPanel.female'),
  t('detail.txPanel.age', { n: n.value.age }),
  t('detail.txPanel.citizen')
])

// label / value / mono — dizayndagi F() yordamchisi kabi
const f = (key, value, mono = false) => ({ key, value, mono })

const personRows = computed(() => [
  f('pinfl', n.value.pinfl, true),
  f('passport', n.value.passport, true),
  f('birth', n.value.birth, true),
  f('birthPlace', n.value.birthPlace),
  f('issued', n.value.issued, true),
  f('expires', n.value.expires, true)
])

const isCrypto = computed(() => n.value.op === 'Kripto ayirboshlash')

const sections = computed(() => [
  {
    key: 'base',
    fields: [
      f('amount', `${n.value.amount} ${t('detail.sum')}`, true),
      f('currency', t('detail.txPanel.uzs')),
      f('date', n.value.date, true),
      f('type', n.value.op),
      f('cardType', isCrypto.value ? '—' : n.value.system)
    ]
  },
  {
    key: 'requisite',
    fields: [
      f('card', n.value.card, true),
      f('bank', n.value.bank),
      f('kind', t(isCrypto.value ? 'detail.txPanel.wallet' : 'blocked.kinds.card')),
      f('owner', t('detail.txPanel.ownerOk'))
    ]
  },
  {
    key: 'merchant',
    fields: [
      f('category', n.value.op),
      f('merchantId', n.value.merchant, true),
      f('terminal', n.value.dev, true),
      f('note', t('detail.txPanel.noteOk'))
    ]
  },
  {
    key: 'digital',
    fields: [
      f('ip', n.value.ip, true),
      f('device', n.value.dev, true),
      f('os', n.value.os),
      f('mobile', n.value.app)
    ]
  },
  {
    key: 'system',
    fields: [
      f('reqId', n.value.reqId, true),
      f('key', n.value.key, true),
      f('keyCard', `UZ-${n.value.card.slice(-4)}`, true),
      f('extra', t('detail.txPanel.extraNote'))
    ]
  }
])
</script>

<template>
  <div class="root">
    <div class="scrim" @click="emit('close')" />

    <aside class="panel">
      <header class="head">
        <div class="head-text">
          <span class="kicker">{{ $t('detail.txPanel.title') }}</span>
          <span class="tx-id mono">{{ n.txId }}</span>
          <span class="summary">{{ summary }}</span>
        </div>
        <button type="button" class="close" :title="$t('common.close')" @click="emit('close')">
          <AppIcon name="close" :size="19" />
        </button>
      </header>

      <div class="body thin-scroll">
        <!-- karta egasi -->
        <section class="person-card">
          <div class="person-top">
            <div class="photo-wrap">
              <span class="photo"><AppIcon name="user" :size="42" /></span>
              <span class="photo-note">{{ $t('detail.txPanel.photo') }}</span>
            </div>

            <div class="person-main">
              <span class="person-name">{{ n.name }}</span>
              <div class="chips">
                <span v-for="c in chips" :key="c" class="chip">{{ c }}</span>
              </div>

              <div class="person-grid">
                <div v-for="r in personRows" :key="r.key" class="cell">
                  <span class="cell-k">{{ $t(`detail.txPanel.fields.${r.key}`) }}</span>
                  <span class="cell-v" :class="{ mono: r.mono, nowrap: r.mono }">{{ r.value }}</span>
                </div>
              </div>
            </div>
          </div>

          <div class="person-foot">
            <div class="cell">
              <span class="cell-k">{{ $t('detail.txPanel.address') }}</span>
              <span class="cell-v">{{ n.addr }}</span>
            </div>
            <div class="cell">
              <span class="cell-k">{{ $t('detail.txPanel.phone') }}</span>
              <span class="cell-v phone">
                <AppIcon name="phone" :size="22" />
                <span class="mono">{{ n.phone }}</span>
              </span>
            </div>
          </div>
        </section>

        <!-- bo'limlar -->
        <section v-for="s in sections" :key="s.key" class="group">
          <div class="group-head">
            <span class="group-title">{{ $t(`detail.txPanel.sections.${s.key}.title`) }}</span>
            <span class="group-hint">{{ $t(`detail.txPanel.sections.${s.key}.hint`) }}</span>
          </div>
          <div class="group-grid">
            <div v-for="x in s.fields" :key="x.key" class="gcell">
              <span class="cell-k">{{ $t(`detail.txPanel.fields.${x.key}`) }}</span>
              <span class="cell-v" :class="{ mono: x.mono }">{{ x.value }}</span>
            </div>
          </div>
        </section>

        <p class="hint">{{ $t('detail.txPanel.hint') }}</p>
      </div>
    </aside>
  </div>
</template>

<style scoped>
.root {
  position: fixed;
  inset: 0;
  z-index: 130;
}

.scrim {
  position: absolute;
  inset: 0;
  background: rgba(5, 12, 28, .3);
}

.panel {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  width: 660px;
  max-width: calc(100vw - 60px);
  display: flex;
  flex-direction: column;
  background: var(--s-card);
  box-shadow: -8px 0 28px rgba(5, 12, 28, .18);
  animation: slideIn .18s ease-out;
}

/* ---------- sarlavha ---------- */
.head {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  padding: 16px 20px;
  background: linear-gradient(90deg, #050c1c 0%, #12213c 100%);
  color: #fff;
}

.head-text {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.kicker {
  font-size: 13px;
  font-weight: 600;
  letter-spacing: .07em;
  text-transform: uppercase;
  color: #8fa4c2;
}

.tx-id {
  margin-top: 5px;
  font-size: 19px;
  font-weight: 600;
}

.summary {
  margin-top: 4px;
  font-size: 14.5px;
  color: #c9d9ec;
}

.close {
  border: 0;
  background: transparent;
  color: #8fa4c2;
  cursor: pointer;
  display: flex;
  padding: 2px;
}

.close:hover {
  color: #fff;
}

/* ---------- tanasi ---------- */
.body {
  flex: 1;
  min-height: 0;
  overflow: auto;
  padding: 16px 20px 28px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* ---------- karta egasi ---------- */
.person-card {
  border: 1px solid var(--ce2e8f1);
  border-radius: 11px;
  overflow: hidden;
  background: var(--s-card);
}

.person-top {
  display: flex;
  gap: 18px;
  padding: 18px;
}

.photo-wrap {
  flex: 0 0 96px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 7px;
}

.photo {
  width: 96px;
  height: 124px;
  border: 1px solid var(--ce2e8f1);
  border-radius: 8px;
  background: var(--cf8fafc);
  color: var(--cc3cbd8);
  display: flex;
  align-items: center;
  justify-content: center;
}

.photo-note {
  font-size: 12px;
  color: var(--ca3adbd);
}

.person-main {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.person-name {
  font-size: 18px;
  font-weight: 700;
  line-height: 1.3;
  letter-spacing: -.01em;
  color: var(--c16233d);
}

.chips {
  display: flex;
  flex-wrap: wrap;
  gap: 7px;
}

.chip {
  height: 27px;
  padding: 0 11px;
  border-radius: 20px;
  background: var(--cf0f3f8);
  display: flex;
  align-items: center;
  font-size: 13.5px;
  color: var(--c3d4d66);
  white-space: nowrap;
}

.person-grid {
  display: grid;
  grid-template-columns: 1.25fr 1fr 1fr;
  gap: 14px 18px;
  margin-top: 4px;
  padding-top: 12px;
  border-top: 1px solid var(--ceef1f6);
}

.cell {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.cell-k {
  font-size: 12.5px;
  color: var(--c8b95a6);
}

.cell-v {
  font-size: 14.5px;
  font-weight: 500;
  line-height: 1.45;
  color: var(--c1c2b45);
}

.cell-v.nowrap {
  white-space: nowrap;
}

.person-foot {
  display: grid;
  grid-template-columns: 1.5fr 1fr;
  gap: 18px;
  padding: 14px 18px;
  border-top: 1px solid var(--ceef1f6);
  background: var(--cf8fafc);
}

.phone {
  display: flex;
  align-items: center;
  gap: 7px;
  color: var(--c23568f);
}

.phone .mono {
  color: var(--c1c2b45);
}

/* ---------- bo'limlar ---------- */
.group-head {
  display: flex;
  align-items: center;
  gap: 10px;
  padding-bottom: 8px;
  border-bottom: 1px solid var(--ce2e8f1);
}

.group-title {
  font-size: 13.5px;
  font-weight: 700;
  letter-spacing: .06em;
  text-transform: uppercase;
  color: var(--c16233d);
}

.group-hint {
  font-size: 13.5px;
  color: var(--ca3adbd);
}

.group-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1px;
  margin-top: 1px;
  background: var(--ceef1f6);
}

.gcell {
  min-width: 0;
  padding: 10px 12px;
  background: var(--s-card);
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.gcell .cell-k {
  font-size: 13px;
}

.gcell .cell-v {
  word-break: break-word;
}

.hint {
  margin: 0;
  font-size: 13.5px;
  line-height: 1.55;
  color: var(--c98a3b6);
}

@media (max-width: 760px) {
  .panel {
    width: 100%;
    max-width: 100%;
  }

  .person-grid {
    grid-template-columns: 1fr 1fr;
  }

  .person-foot,
  .group-grid {
    grid-template-columns: 1fr;
  }
}
</style>
