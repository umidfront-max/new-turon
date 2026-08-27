<script setup>
/*
  Reyestr filtrlari.

  Har bir guruh — checkbox'li dropdown (components/ui/MultiSelect.vue), ya'ni
  bir guruhdan bir nechta qiymat tanlash mumkin. Zarar summasi esa ro'yxat emas,
  million so'mdagi oraliq (dan – gacha).

  Guruhlar server bergan `facets` dan olinadi: qiymat, nom va sanoq — hammasi
  o'shandan. Server javob bermagan bo'lsa mahalliy ro'yxatga (FILTER_GROUPS)
  qaytadi, shunda ekran baribir to'liq ko'rinadi.

  Tanlovlar shu yerda saqlanadi va faqat "Qo'llash" bosilganda yuqoriga
  uzatiladi — har bir belgilashda jadval qayta so'ralib ketmasin.
*/
import { ref, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import MultiSelect from '@/components/ui/MultiSelect.vue'
import { FILTER_GROUPS } from '@/data/applications'
import { useApplications } from '@/stores/useApplications'
import { useRegistry } from '@/stores/useRegistry'

const props = defineProps({
  // qo'llangan tanlovlar: { guruh: [qiymat, ...] }
  selected: { type: Object, default: () => ({}) },
  // qo'llangan summa oralig'i (mln): { from, to }
  amount: { type: Object, default: () => ({ from: '', to: '' }) }
})

const emit = defineEmits(['apply', 'clear'])

const { t } = useI18n()
const { filterCounts } = useApplications()
const { facetGroups } = useRegistry()

// tanlovlar guruh kaliti bo'yicha: { status: [...], region: [...] }
function fromProps() {
  return Object.fromEntries(
    Object.entries(props.selected).map(([key, list]) => [key, [...(list || [])]])
  )
}

const chosen = ref(fromProps())
const range = ref({ from: props.amount.from ?? '', to: props.amount.to ?? '' })

// panel qayta ochilganda tashqi holat bilan moslashadi
watch(() => props.selected, () => { chosen.value = fromProps() }, { deep: true })
watch(() => props.amount, (a) => { range.value = { from: a.from ?? '', to: a.to ?? '' } }, { deep: true })

// qiymat matni: xom (bank nomlari) yoki i18n kaliti orqali
function valueLabel(group, value) {
  if (group.raw) return value
  const suffix = group.suffix ? `.${group.suffix}` : ''
  return t(`${group.i18n}.${value}${suffix}`)
}

// mahalliy ro'yxat — server javob bermaganda
const localGroups = computed(() => FILTER_GROUPS.map((g) => ({
  key: g.key,
  options: g.values.map((value) => ({
    value,
    label: valueLabel(g, value),
    count: filterCounts.value[g.key]?.[value] ?? 0
  }))
})))

// dropdown kutadigan ko'rinish: [{ value, label, count }]
const groups = computed(() => (facetGroups.value.length ? facetGroups.value : localGroups.value))

function pick(key, values) {
  chosen.value = { ...chosen.value, [key]: values }
}

/** Faqat musbat butun son qoladi — maydonlar million so'mda. */
function onRange(side, e) {
  const clean = e.target.value.replace(/[^\d]/g, '').slice(0, 9)
  // faqat raqam qoladi; qiymat o'zgarmagan bo'lsa Vue qayta chizmaydi,
  // shuning uchun maydonni o'zimiz tekislaymiz
  if (e.target.value !== clean) e.target.value = clean
  range.value = { ...range.value, [side]: clean }
}

function clearAll() {
  chosen.value = {}
  range.value = { from: '', to: '' }
  emit('clear')
}

function apply() {
  // "dan" "gacha" dan katta bo'lib qolsa — o'rin almashtiramiz
  const { from, to } = range.value
  const flip = from && to && Number(from) > Number(to)
  const span = flip ? { from: to, to: from } : { from, to }
  if (flip) range.value = span

  emit('apply', {
    groups: groups.value
      .filter((g) => chosen.value[g.key]?.length)
      .map((g) => ({ key: g.key, values: chosen.value[g.key] })),
    amount: { ...span }
  })
}
</script>

<template>
  <div class="filter-panel">
    <div class="filter-grid">
      <MultiSelect
        v-for="g in groups"
        :key="g.key"
        :label="$t(`filters.groups.${g.key}`)"
        :options="g.options"
        :model-value="chosen[g.key] || []"
        :single="!!g.single"
        @update:model-value="pick(g.key, $event)"
      />

      <div class="famount">
        <div class="famount-label">
          {{ $t('filters.groups.amount') }} · {{ $t('filters.amountUnit') }}
        </div>
        <div class="famount-row">
          <input
            class="famount-input"
            type="text"
            inputmode="numeric"
            :placeholder="$t('filters.from')"
            :value="range.from"
            @input="onRange('from', $event)"
          />
          <span class="famount-dash">—</span>
          <input
            class="famount-input"
            type="text"
            inputmode="numeric"
            :placeholder="$t('filters.to')"
            :value="range.to"
            @input="onRange('to', $event)"
          />
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
  padding: 18px;
  background: var(--cf8fafc);
  border-bottom: 1px solid var(--ceef1f6);
}

.filter-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 14px 16px;
  align-items: start;
}

/* ---------- zarar summasi oralig'i ---------- */
.famount {
  min-width: 0;
}

.famount-label {
  margin-bottom: 6px;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: .06em;
  text-transform: uppercase;
  color: var(--c8b95a6);
}

.famount-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.famount-input {
  width: 100%;
  min-width: 0;
  height: 44px;
  padding: 0 12px;
  border: 1.5px solid var(--ce2e8f1);
  border-radius: 10px;
  background: var(--s-card);
  color: var(--c16233d);
  font-size: 14.5px;
  font-family: inherit;
  outline: none;
  transition: border-color .16s ease, box-shadow .16s ease;
}

.famount-input::placeholder {
  color: var(--ca3adbd);
}

.famount-input:hover {
  border-color: var(--cc8cdd6);
}

.famount-input:focus {
  border-color: var(--c23568f);
  box-shadow: 0 0 0 3px var(--ce8eef7);
}

.famount-dash {
  flex: 0 0 auto;
  color: var(--ca3adbd);
}

/* ---------- amallar ---------- */
.filter-actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 16px;
}

.btn-light,
.btn-dark {
  height: 38px;
  border-radius: 8px;
  font-size: 14.5px;
  cursor: pointer;
  transition: filter .16s ease, background .16s ease;
}

.btn-light {
  padding: 0 17px;
  border: 1px solid var(--ce2e8f1);
  background: var(--s-card);
  color: var(--c66748c);
}

.btn-light:hover {
  background: var(--cf0f3f8);
}

.btn-dark {
  padding: 0 22px;
  border: 1px solid var(--btn);
  background: var(--btn);
  color: #fff;
  font-weight: 600;
}

.btn-dark:hover {
  filter: brightness(1.15);
}
</style>
