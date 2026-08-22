<script setup>
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { FILTER_GROUPS } from '@/data/applications'

const { t } = useI18n()
const emit = defineEmits(['apply', 'clear'])

// tanlangan qiymatlar: { [guruh kaliti]: Set(qiymat kaliti) }
const selected = ref(
  Object.fromEntries(FILTER_GROUPS.map((g) => [g.key, new Set(g.checked)]))
)

// qiymat matni: xom (bank nomlari) yoki i18n kaliti orqali
function valueLabel(group, value) {
  if (group.raw) return value
  const suffix = group.suffix ? `.${group.suffix}` : ''
  return t(`${group.i18n}.${value}${suffix}`)
}

function toggle(group, value) {
  const set = new Set(selected.value[group])
  if (set.has(value)) set.delete(value)
  else set.add(value)
  selected.value = { ...selected.value, [group]: set }
}

function clearAll() {
  selected.value = Object.fromEntries(FILTER_GROUPS.map((g) => [g.key, new Set()]))
  emit('clear')
}

function apply() {
  const picked = FILTER_GROUPS
    .filter((g) => selected.value[g.key].size)
    .map((g) => ({
      key: g.key,
      title: t(`filters.groups.${g.key}`),
      values: [...selected.value[g.key]].map((v) => valueLabel(g, v))
    }))
  emit('apply', picked)
}
</script>

<template>
  <div class="filter-panel">
    <div class="filter-grid">
      <div v-for="(g, i) in FILTER_GROUPS" :key="g.key" class="fgroup" :style="{ animationDelay: `${i * 30}ms` }">
        <div class="fgroup-head">{{ $t(`filters.groups.${g.key}`) }}</div>
        <div class="fgroup-body thin-scroll">
          <label v-for="[value, count] in g.values" :key="value" class="fitem">
            <input
              type="checkbox"
              class="sr-only"
              :checked="selected[g.key].has(value)"
              @change="toggle(g.key, value)"
            />
            <span class="box" :class="{ on: selected[g.key].has(value) }" />
            <span class="truncate">{{ valueLabel(g, value) }}</span>
            <span class="fcount mono">{{ count }}</span>
          </label>
        </div>
      </div>
    </div>

    <div class="filter-actions">
      <button type="button" class="btn-light" @click="clearAll">{{ $t('common.clear') }}</button>
      <button type="button" class="btn-dark" @click="apply">{{ $t('common.apply') }}</button>
    </div>
  </div>
</template>

<style scoped>
.filter-panel {
  padding: 16px 18px;
  background: var(--cf8fafc);
  border-bottom: 1px solid var(--ceef1f6);
}

.filter-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(230px, 1fr));
  gap: 12px;
}

.fgroup {
  background: var(--s-card);
  border: 1px solid var(--ce2e8f1);
  border-radius: 9px;
  overflow: hidden;
  animation: riseIn .3s var(--ease) backwards;
}

.fgroup-head {
  padding: 9px 12px;
  background: var(--cf4f7fb);
  border-bottom: 1px solid var(--ceef1f6);
  font-size: 13.5px;
  font-weight: 600;
  color: var(--c3d4d66);
  letter-spacing: .03em;
}

.fgroup-body {
  padding: 10px 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 170px;
  overflow: auto;
}

.fitem {
  display: flex;
  align-items: center;
  gap: 9px;
  font-size: 14.5px;
  color: var(--c3d4d66);
  cursor: pointer;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  opacity: 0;
  pointer-events: none;
}

.box {
  width: 15px;
  height: 15px;
  flex: 0 0 15px;
  border-radius: 4px;
  border: 1.5px solid var(--cc3cbd8);
  background: var(--s-card);
  position: relative;
  transition: background .16s ease, border-color .16s ease;
}

.box.on {
  background: var(--c23568f);
  border-color: var(--c23568f);
}

.box.on::after {
  content: '';
  position: absolute;
  left: 4px;
  top: 1px;
  width: 4px;
  height: 8px;
  border: solid #fff;
  border-width: 0 2px 2px 0;
  transform: rotate(45deg);
}

.fitem:hover .box {
  border-color: var(--c23568f);
}

.fcount {
  font-size: 13px;
  color: var(--ca3adbd);
}

.filter-actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 14px;
}

.btn-light,
.btn-dark {
  height: 34px;
  border-radius: 7px;
  font-size: 14.5px;
  cursor: pointer;
  transition: filter .16s ease, background .16s ease;
}

.btn-light {
  padding: 0 15px;
  border: 1px solid var(--ce2e8f1);
  background: var(--s-card);
  color: var(--c66748c);
}

.btn-light:hover {
  background: var(--cf0f3f8);
}

.btn-dark {
  padding: 0 17px;
  border: 1px solid var(--btn);
  background: var(--btn);
  color: #fff;
  font-weight: 600;
}

.btn-dark:hover {
  filter: brightness(1.15);
}
</style>
