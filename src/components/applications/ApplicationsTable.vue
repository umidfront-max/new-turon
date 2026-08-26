<script setup>
import AppIcon from '@/components/ui/AppIcon.vue'
import StatusPill from '@/components/ui/StatusPill.vue'
import { flowStyle } from '@/data/applications'

defineProps({
  rows: { type: Array, required: true }
})

defineEmits(['open'])

// label/ph — i18n kalitlari (table.*)
const COLS = [
  { key: 'n', label: 'n', w: '40px' },
  { key: 'id', label: 'id', w: '160px', ph: 'phId' },
  { key: 'flow', label: 'flow', w: '98px', ph: 'phFlow' },
  { key: 'name', label: 'applicant', w: '206px', ph: 'phApplicant' },
  { key: 'card', label: 'card', w: '178px', ph: 'phCard' },
  { key: 'amount', label: 'amount', w: '112px', align: 'right', ph: 'phAmount' },
  { key: 'status', label: 'status', w: '162px', control: 'select' },
  { key: 'time', label: 'time', w: '96px', control: 'date' },
  { key: 'chev', label: null, w: '36px' }
]
</script>

<template>
  <!-- ---------- desktop jadval ---------- -->
  <div class="table-scroll thin-scroll">
    <table class="grid">
      <thead>
        <tr>
          <th
            v-for="c in COLS"
            :key="c.key"
            :style="{ width: c.w, textAlign: c.align || 'left' }"
          >
            {{ c.label ? $t(`table.${c.label}`) : '' }}
          </th>
        </tr>
      </thead>

      <tbody>
        <tr
          v-for="(r, i) in rows"
          :key="r.id"
          class="row"
          :class="{ overdue: r.overdue }"
          :style="{ animationDelay: `${Math.min(i, 12) * 28}ms` }"
          tabindex="0"
          @click="$emit('open', r)"
          @keydown.enter="$emit('open', r)"
        >
          <td class="num mono">{{ r.n }}</td>

          <td>
            <div class="app-id mono">{{ r.id }}</div>
            <div class="sub">{{ r.material || $t('table.noMaterial') }}</div>
          </td>

          <td>
            <span
              class="flow"
              :style="{ background: flowStyle(r.flow).bg, color: flowStyle(r.flow).fg, borderColor: flowStyle(r.flow).bd }"
            >{{ r.flow === '102' ? '102' : $t('flow.duty') }}</span>
          </td>

          <td class="clip">
            <div class="name truncate">{{ r.name }}</div>
            <div class="sub truncate">{{ r.methodLabel || $t(`methods.${r.method}`) }}</div>
            <div class="more">{{ $t('common.details') }}</div>
          </td>

          <td>
            <div class="mono card-no">{{ r.card }}</div>
            <div class="sub">{{ r.bank }}</div>
          </td>

          <td class="right">
            <div class="amount mono">{{ r.amount }}</div>
            <div class="cur mono">{{ r.cur }}</div>
          </td>

          <td><StatusPill :status="r.status" /></td>

          <td class="time mono">{{ r.time }}</td>

          <td class="right">
            <AppIcon name="chevronRight" :size="17" class="chev" />
          </td>
        </tr>
      </tbody>
    </table>
  </div>

  <!-- ---------- mobil kartalar ---------- -->
  <div class="cards">
    <button
      v-for="(r, i) in rows"
      :key="r.id"
      type="button"
      class="mcard"
      :class="{ overdue: r.overdue }"
      :style="{ animationDelay: `${Math.min(i, 10) * 40}ms` }"
      @click="$emit('open', r)"
    >
      <div class="mcard-top">
        <span class="app-id mono">{{ r.id }}</span>
        <StatusPill :status="r.status" size="sm" short />
      </div>
      <div class="name truncate">{{ r.name }}</div>
      <div class="sub">{{ r.methodLabel || $t(`methods.${r.method}`) }}</div>
      <div class="mcard-grid">
        <div>
          <div class="mlabel">{{ $t('table.card') }}</div>
          <div class="mono card-no">{{ r.card }}</div>
          <div class="sub">{{ r.bank }}</div>
        </div>
        <div class="right">
          <div class="mlabel">{{ $t('table.amount') }}</div>
          <div class="amount mono">{{ r.amount }}</div>
          <div class="cur mono">{{ r.cur }}</div>
        </div>
      </div>
      <div class="mcard-foot">
        <span class="flow" :style="{ background: flowStyle(r.flow).bg, color: flowStyle(r.flow).fg, borderColor: flowStyle(r.flow).bd }">{{ r.flow === '102' ? '102' : $t('flow.duty') }}</span>
        <span class="time mono">{{ r.time }}</span>
      </div>
    </button>
  </div>
</template>

<style scoped>
/* ---------- jadval ---------- */

.grid {
  width: 100%;
  min-width: 1068px;
  table-layout: fixed;
}

th {
  padding: 14px 13px 7px;
  font-size: 13.5px;
  font-weight: 600;
  color: var(--c3d4d66);
  border-bottom: 0;
}

.cell-fake {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 6px;
  height: 34px;
  border-radius: 6px;
  border: 1px solid var(--ce2e8f1);
  background: var(--cf8fafc);
  padding: 0 9px;
  font-size: 14px;
  color: var(--ca3adbd);
  cursor: pointer;
}

.row {
  cursor: pointer;
  background: var(--s-card);
  border-top: 1px solid var(--ceef1f6);
  animation: riseIn .32s var(--ease) backwards;
  transition: background .16s ease;
}

.row.overdue {
  background: var(--cfefaf9);
}

.row:hover,
.row:focus-visible {
  background: var(--cf4f7fb);
}

.row td {
  padding: 15px 13px;
  vertical-align: top;
}

.row td.right {
  text-align: right;
}

.clip {
  max-width: 0;
  overflow: hidden;
}

.num {
  font-size: 14px;
  color: var(--ca3adbd);
}

.app-id {
  font-size: 14.5px;
  font-weight: 600;
  color: var(--c23568f);
}

.sub {
  font-size: 13px;
  color: var(--ca3adbd);
  margin-top: 3px;
}

.name {
  font-size: 16px;
  font-weight: 500;
}

.more {
  font-size: 13.5px;
  color: var(--c23568f);
  margin-top: 4px;
  font-weight: 500;
}

.flow {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 3px 9px;
  border-radius: 5px;
  font-size: 13.5px;
  font-weight: 600;
  border: 1px solid;
}

.card-no {
  font-size: 14.5px;
}

.amount {
  font-size: 16px;
  font-weight: 600;
}

.cur {
  font-size: 13px;
  color: var(--ca3adbd);
  margin-top: 3px;
  letter-spacing: .03em;
}

.time {
  font-size: 14px;
  color: var(--c4b5a73);
}

.chev {
  display: inline-block;
  color: var(--ca3adbd);
  transition: transform .18s var(--ease), color .18s ease;
}

.row:hover .chev {
  transform: translateX(3px);
  color: var(--c23568f);
}

/* ---------- mobil kartalar ---------- */
.cards {
  display: none;
  flex-direction: column;
}

.mcard {
  display: flex;
  flex-direction: column;
  gap: 4px;
  width: 100%;
  padding: 14px 16px;
  border: 0;
  border-top: 1px solid var(--ceef1f6);
  background: var(--s-card);
  text-align: left;
  cursor: pointer;
  animation: riseIn .32s var(--ease) backwards;
}

.mcard.overdue {
  background: var(--cfefaf9);
}

.mcard:active {
  background: var(--cf4f7fb);
}

.mcard-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 2px;
}

.mcard-grid {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 12px;
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px dashed var(--ceef1f6);
}

.mcard-grid .right {
  text-align: right;
}

.mlabel {
  font-size: 11.5px;
  text-transform: uppercase;
  letter-spacing: .06em;
  color: var(--ca3adbd);
  margin-bottom: 3px;
}

.mcard-foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 10px;
}

@media (max-width: 900px) {
  .table-scroll {
    display: none;
  }

  .cards {
    display: flex;
  }
}
</style>
