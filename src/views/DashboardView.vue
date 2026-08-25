<script setup>
/*
  Rahbar paneli — asl dizayndan (cardBlock.html) bir-bir ko'chirilgan.
  Uslublar dizayndagidek inline turadi: shu tariqa o'lcham, rang va
  bo'shliqlar piksel darajasida mos bo'ladi.
*/
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import AppIcon from '@/components/ui/AppIcon.vue'
import { KPI } from '@/data/applications'
import {
  UNASSIGNED, TEAM, PERIODS, PERIOD_DATA, DL_AXIS, DEADLINE_TOTAL,
  deadlineBars, methodRows, teamRows, autoAssign, typeStyle
} from '@/data/dashboard'
import { useApplications } from '@/stores/useApplications'
import { useUi } from '@/stores/useUi'

const router = useRouter()
const { t } = useI18n()
const { toast, ask } = useUi()
const { counts } = useApplications()

const period = ref('week')
const rows = ref(UNASSIGNED.map((u) => ({ ...u })))
const loads = ref(TEAM.map((s) => s.load))
const exported = ref(false)

const autoOpen = ref(false)
const assignFor = ref(null)   // tayinlash oynasidagi qator indeksi
const pick = ref(null)        // tanlangan xodim indeksi

const stamp = computed(() => PERIOD_DATA[period.value].stamp)
const apps = computed(() => PERIOD_DATA[period.value].apps)

const bars = computed(() => deadlineBars())
const methods = computed(() => methodRows(apps.value))
const team = computed(() => teamRows(loads.value))
const cap = computed(() => Math.max(...loads.value, 12) + 3)

const unRows = computed(() => rows.value.map((u, i) => ({
  ...u,
  i,
  left: t('dashboard.unassigned.hours', { n: u.hours }),
  fg: u.hours <= 40 ? 'var(--ce0452f)' : 'var(--c1c2b45)'
})))

const autoRows = computed(() => autoAssign(rows.value, loads.value))

/* ---------- tayinlash oynasi ---------- */
const recIndex = computed(() => loads.value.indexOf(Math.min(...loads.value)))

const modalRow = computed(() => (assignFor.value == null ? null : rows.value[assignFor.value]))

function staffCard(i) {
  const chosen = (pick.value == null ? recIndex.value : pick.value) === i
  return {
    i,
    ini: TEAM[i].ini,
    name: TEAM[i].name,
    role: t(`dashboard.roles.${TEAM[i].role}`),
    pct: `${Math.round(loads.value[i] / cap.value * 100)}%`,
    bg: chosen ? 'var(--ceef2ff)' : 'var(--s-card)',
    ring: chosen ? 'var(--c2d5be3)' : 'var(--ce5e7eb)',
    dot: chosen ? 'var(--c2d5be3)' : 'transparent'
  }
}

const recCard = computed(() => staffCard(recIndex.value))
const otherCards = computed(() => TEAM.map((_, i) => i).filter((i) => i !== recIndex.value).map(staffCard))

function openAssign(i) {
  assignFor.value = i
  pick.value = null
}

function closeAssign() {
  assignFor.value = null
  pick.value = null
}

function confirmAssign() {
  const idx = assignFor.value
  const staff = pick.value == null ? recIndex.value : pick.value
  if (idx == null) return
  const next = loads.value.slice()
  next[staff] += 1
  loads.value = next
  rows.value = rows.value.filter((_, k) => k !== idx)
  closeAssign()
  toast(t('dashboard.assign.done', { name: TEAM[staff].name }))
}

/* ---------- avto-taqsimlash ---------- */
function confirmAuto() {
  const n = rows.value.length
  ask({
    title: t('dashboard.auto.askTitle'),
    text: t('dashboard.auto.askText', { n }),
    ok: t('common.confirm'),
    run: () => {
      const next = loads.value.slice()
      rows.value.forEach(() => {
        const k = next.indexOf(Math.min(...next))
        next[k] += 1
      })
      loads.value = next
      rows.value = []
      autoOpen.value = false
      toast(t('dashboard.auto.done', { n }))
    }
  })
}

function exportReport() {
  exported.value = true
  toast(t('dashboard.exportToast'))
}

const goList = () => router.push('/')
</script>

<template>
  <div style="display:flex; flex-direction:column; gap:14px">
    <!-- ============ sarlavha ============ -->
    <div style="background:var(--s-card); border:1px solid var(--ce2e8f1); border-radius:10px; box-shadow:0 1px 3px rgba(5,12,28,.05); display:flex; align-items:center; gap:14px; padding:14px 18px; flex-wrap:wrap">
      <div style="min-width:0">
        <div style="display:flex; align-items:center; gap:7px; font-size:13.5px; color:var(--c8b95a6)">
          <span style="cursor:pointer" @click="goList">{{ $t('modules.cardblock') }}</span>
          <span>/</span>
          <span style="color:var(--c3d4d66)">{{ $t('stub.dashboard.title') }}</span>
        </div>
        <div style="display:flex; align-items:center; gap:12px; margin-top:6px; flex-wrap:wrap">
          <span style="font-size:20px; font-weight:600; color:var(--c16233d)">{{ $t('stub.dashboard.title') }}</span>
          <span style="display:inline-flex; align-items:center; gap:8px; padding:4px 11px; border-radius:20px; background:var(--ce8eef7); border:1px solid var(--kc9d9ec); font-size:13.5px; font-weight:600; color:var(--c23568f)">
            <AppIcon name="pin" :size="14" />
            {{ $t('regions.tashkentCity') }}
          </span>
          <span style="font-size:13.5px; color:var(--c8b95a6)">{{ stamp }}</span>
        </div>
      </div>

      <div style="flex:1" />

      <span
        v-if="exported"
        style="display:inline-flex; align-items:center; gap:8px; height:40px; padding:0 13px; border-radius:9px; background:var(--cf2f9f5); border:1px solid var(--cc8e2d4); font-size:13.5px; color:var(--c1a6e4b)"
      >
        <AppIcon name="check" :size="15" />
        {{ $t('dashboard.exportReady', { file: `hisobot_${period}.xlsx` }) }}
      </span>

      <button
        type="button"
        class="dash-export"
        style="display:flex; align-items:center; gap:9px; height:40px; padding:0 16px; border-radius:9px; border:1px solid var(--cc8e2d4); background:var(--cf2f9f5); color:var(--c1a6e4b); font-size:14px; font-weight:600; cursor:pointer"
        @click="exportReport"
      >
        <AppIcon name="excel" :size="17" />
        {{ $t('dashboard.export') }}
      </button>

      <div style="display:flex; gap:2px; padding:3px; background:var(--cf0f3f8); border-radius:9px">
        <div
          v-for="p in PERIODS"
          :key="p"
          :style="{
            padding: '8px 16px',
            borderRadius: '7px',
            background: p === period ? 'var(--s-card)' : 'transparent',
            boxShadow: p === period ? '0 1px 2px rgba(5,12,28,.08)' : 'none',
            fontSize: '14px',
            fontWeight: p === period ? '600' : '400',
            color: p === period ? 'var(--c16233d)' : 'var(--c66748c)',
            cursor: 'pointer',
            whiteSpace: 'nowrap'
          }"
          @click="period = p"
        >{{ $t(`dashboard.periods.${p}`) }}</div>
      </div>
    </div>

    <!-- ============ KPI ============ -->
    <div style="display:grid; grid-template-columns:repeat(auto-fit,minmax(212px,1fr)); gap:12px">
      <div
        v-for="k in KPI"
        :key="k.key"
        style="background:var(--s-card); border:1px solid var(--ce2e8f1); border-radius:10px; padding:14px; display:flex; align-items:center; gap:13px; min-width:0; box-shadow:0 1px 3px rgba(5,12,28,.05)"
      >
        <div
          :style="{ width: '42px', height: '42px', flex: '0 0 42px', borderRadius: '9px', background: k.iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center' }"
        >
          <AppIcon :name="k.icon" :size="22" :style="{ color: k.tone }" />
        </div>
        <div>
          <div style="font-size:13.5px; color:var(--c66748c); font-weight:500">{{ $t(`kpi.${k.key}.label`) }}</div>
          <div style="display:flex; align-items:baseline; gap:6px; margin-top:3px">
            <span
              class="mono"
              :style="{ fontSize: '28px', fontWeight: '600', lineHeight: '1', color: k.tone }"
            >{{ counts[k.key] || 0 }}</span>
            <span style="font-size:13px; color:var(--c98a3b6)">{{ $t(`kpi.${k.key}.note`) }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- ============ ikki ustun ============ -->
    <div style="display:grid; grid-template-columns:repeat(auto-fit,minmax(560px,1fr)); gap:14px">
      <!-- taqsimlanmagan murojaatlar -->
      <div style="display:flex; flex-direction:column; gap:14px; min-height:100%">
        <div style="flex:1 0 auto; display:flex; flex-direction:column; background:var(--s-card); border:1px solid var(--ce2e8f1); border-radius:10px; box-shadow:0 1px 3px rgba(5,12,28,.05)">
          <div style="display:flex; align-items:center; gap:10px; padding:14px 18px; border-bottom:1px solid var(--ceef1f6); flex:0 0 auto">
            <span style="font-size:14.5px; font-weight:600; color:var(--c16233d)">{{ $t('dashboard.unassigned.title') }}</span>
            <span class="mono" style="font-size:13.5px; padding:3px 10px; border-radius:20px; background:var(--cf0f3f8); border:1px solid var(--ce2e8f1); color:var(--c3d4d66)">{{ rows.length }}</span>
            <div style="flex:1" />
            <button
              type="button"
              class="dash-auto"
              style="display:flex; align-items:center; gap:8px; height:38px; padding:0 15px; border-radius:9px; border:1px solid var(--btn); background:var(--btn); color:#fff; font-size:14px; font-weight:600; cursor:pointer"
              :disabled="!rows.length"
              @click="autoOpen = true"
            >
              <AppIcon name="bolt" :size="16" />
              {{ $t('dashboard.unassigned.auto') }}
            </button>
          </div>

          <div v-if="!rows.length" style="padding:46px 18px 52px; display:flex; flex-direction:column; align-items:center; gap:11px">
            <span style="width:52px; height:52px; border-radius:13px; background:var(--ce6f2ec); border:1px solid var(--cc8e2d4); display:flex; align-items:center; justify-content:center">
              <AppIcon name="check" :size="24" style="color:var(--c1a6e4b)" />
            </span>
            <div style="font-size:15px; font-weight:600; color:var(--c3d4d66)">{{ $t('dashboard.unassigned.empty') }}</div>
          </div>

          <div v-else style="display:flex; flex-direction:column; flex:1 0 auto">
            <div style="width:100%; overflow-x:auto">
              <table style="width:100%; min-width:640px; table-layout:fixed; border-collapse:collapse">
                <thead>
                  <tr style="background:var(--cf8fafc)">
                    <th style="width:216px; padding:12px 14px; font-size:13.5px; font-weight:600; color:var(--c66748c); text-align:left">{{ $t('dashboard.unassigned.colId') }}</th>
                    <th style="padding:12px 14px; font-size:13.5px; font-weight:600; color:var(--c66748c); text-align:left">{{ $t('dashboard.unassigned.colMethod') }}</th>
                    <th style="width:104px; padding:12px 14px; font-size:13.5px; font-weight:600; color:var(--c66748c); text-align:left">{{ $t('dashboard.unassigned.colDeadline') }}</th>
                    <th style="width:132px; padding:12px 14px" />
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="u in unRows" :key="u.id" style="border-top:1px solid var(--cf2f5f9)">
                    <td style="padding:13px 14px">
                      <div class="mono" style="font-size:15px; font-weight:600; color:var(--c16233d)">{{ u.id }}</div>
                      <div class="mono" style="margin-top:3px; font-size:13.5px; color:var(--c98a3b6)">{{ u.material }}</div>
                    </td>
                    <td style="padding:13px 14px; font-size:15px; color:var(--c1c2b45)">{{ $t(`dashboard.methodsShort.${u.method}`) }}</td>
                    <td class="mono" :style="{ padding: '13px 14px', fontSize: '15px', color: u.fg }">{{ u.left }}</td>
                    <td style="padding:13px 14px; position:relative">
                      <button
                        type="button"
                        class="dash-assign"
                        style="width:100%; height:38px; border-radius:9px; border:1px solid var(--ceef1f6); background:var(--cf0f3f8); color:var(--c1c2b45); font-size:14px; font-weight:500; cursor:pointer"
                        @click="openAssign(u.i)"
                      >{{ $t('dashboard.unassigned.assign') }}</button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div style="display:flex; align-items:center; justify-content:flex-end; padding:12px 16px; flex:0 0 auto; border-top:1px solid var(--cf2f5f9)">
              <span style="display:inline-flex; align-items:center; gap:7px; font-size:14px; font-weight:600; color:var(--c23568f); cursor:pointer" @click="goList">
                {{ $t('dashboard.unassigned.viewAll') }}
                <AppIcon name="chevronRight" :size="15" />
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- muddat + jamoa -->
      <div style="display:flex; flex-direction:column; gap:14px; min-height:100%">
        <div style="background:var(--s-card); border:1px solid var(--ce2e8f1); border-radius:10px; box-shadow:0 1px 3px rgba(5,12,28,.05)">
          <div style="display:flex; align-items:center; gap:10px; padding:14px 18px; border-bottom:1px solid var(--ceef1f6)">
            <span style="font-size:14.5px; font-weight:600; color:var(--c16233d)">{{ $t('dashboard.deadline.title') }}</span>
            <span style="padding:3px 10px; border-radius:20px; background:var(--cf0f3f8); border:1px solid var(--ce2e8f1); font-size:13px; color:var(--c66748c)">{{ $t('dashboard.deadline.chip') }}</span>
            <div style="flex:1" />
            <span style="font-size:14px; color:var(--c66748c)">{{ $t('dashboard.deadline.total', { n: DEADLINE_TOTAL }) }}</span>
          </div>
          <div style="padding:20px 18px 16px">
            <div style="display:flex; gap:12px">
              <div style="width:24px; flex:0 0 24px; display:flex; flex-direction:column; justify-content:space-between; height:170px">
                <span v-for="ax in DL_AXIS" :key="ax" class="mono" style="font-size:12.5px; color:var(--ca3adbd); text-align:right; line-height:1">{{ ax }}</span>
              </div>
              <div style="flex:1; min-width:0">
                <div style="position:relative; height:170px">
                  <div style="position:absolute; inset:0; display:flex; flex-direction:column; justify-content:space-between">
                    <div v-for="ax in DL_AXIS" :key="ax" style="height:1px; background:var(--ceef1f6)" />
                  </div>
                  <div style="position:relative; display:flex; align-items:stretch; gap:16px; height:100%">
                    <div
                      v-for="d in bars"
                      :key="d.key"
                      style="flex:1; min-width:0; height:100%; display:flex; flex-direction:column; align-items:center; justify-content:flex-end"
                    >
                      <span class="mono" :style="{ fontSize: '16px', fontWeight: '600', color: d.fg, marginBottom: '6px' }">{{ d.n }}</span>
                      <div :style="{ width: '100%', height: d.h, minHeight: '3px', borderRadius: '8px 8px 0 0', background: d.bar }" />
                    </div>
                  </div>
                </div>
                <div style="display:flex; gap:16px; margin-top:10px">
                  <span
                    v-for="d in bars"
                    :key="d.key"
                    :style="{ flex: '1', minWidth: '0', textAlign: 'center', fontSize: '14px', fontWeight: d.w, color: d.fg }"
                  >{{ $t(`dashboard.deadline.labels.${d.key}`) }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div style="flex:1 0 auto; display:flex; flex-direction:column; background:var(--s-card); border:1px solid var(--ce2e8f1); border-radius:10px; box-shadow:0 1px 3px rgba(5,12,28,.05)">
          <div style="display:flex; align-items:center; gap:10px; padding:14px 18px; border-bottom:1px solid var(--ceef1f6); flex:0 0 auto">
            <span style="font-size:14.5px; font-weight:600; color:var(--c16233d)">{{ $t('dashboard.team.title') }}</span>
            <div style="flex:1" />
            <span style="display:inline-flex; align-items:center; gap:7px; font-size:14px; font-weight:600; color:var(--c23568f); cursor:pointer" @click="goList">
              {{ $t('dashboard.team.link') }}
              <AppIcon name="chevronRight" :size="15" />
            </span>
          </div>
          <div style="flex:1; padding:6px 18px 14px; display:flex; flex-direction:column; justify-content:space-between">
            <div
              v-for="m in team"
              :key="m.name"
              style="display:flex; align-items:center; gap:14px; padding:13px 0; border-bottom:1px solid var(--cf6f8fb); flex:1 1 auto"
            >
              <span style="width:40px; height:40px; flex:0 0 40px; border-radius:50%; background:var(--ce8eef7); border:1px solid var(--cdbe4f0); display:flex; align-items:center; justify-content:center; font-size:14px; font-weight:600; color:var(--c23568f)">{{ m.ini }}</span>
              <div style="flex:1; min-width:0">
                <div style="display:flex; align-items:center; gap:12px">
                  <span style="flex:1; min-width:0; font-size:15.5px; font-weight:500; color:var(--c16233d); white-space:nowrap; overflow:hidden; text-overflow:ellipsis">{{ m.name }}</span>
                  <span class="mono" :style="{ fontSize: '14px', fontWeight: '600', color: m.fg, flex: '0 0 auto' }">{{ $t('dashboard.team.load', { n: m.load }) }}</span>
                </div>
                <div style="display:flex; align-items:center; gap:11px; margin-top:8px">
                  <div style="flex:1; min-width:0; height:8px; border-radius:20px; background:var(--ce6eaf0); overflow:hidden">
                    <div :style="{ width: m.pct, height: '100%', borderRadius: '20px', background: m.fg }" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ============ hujum kanallari ============ -->
    <div style="display:grid; grid-template-columns:repeat(auto-fit,minmax(430px,1fr)); align-items:stretch; gap:14px">
      <div style="background:var(--s-card); border:1px solid var(--ce2e8f1); border-radius:10px; box-shadow:0 1px 3px rgba(5,12,28,.05); display:flex; flex-direction:column">
        <div style="padding:16px 20px 14px; border-bottom:1px solid var(--ceef1f6)">
          <div style="font-size:15px; font-weight:600; color:var(--c16233d)">{{ $t('dashboard.channels.title') }}</div>
          <div style="margin-top:3px; font-size:13.5px; color:var(--c8b95a6)">{{ $t('dashboard.channels.note') }}</div>
        </div>
        <div style="flex:1; padding:16px 20px 20px; display:flex; flex-direction:column; gap:6px">
          <div
            v-for="m in methods"
            :key="m.key"
            style="display:flex; align-items:center; gap:11px; cursor:pointer"
            :title="$t(`dashboard.channels.items.${m.key}`)"
            @click="goList"
          >
            <span class="mono" style="font-size:11.5px; color:var(--ca3adbd); width:16px; flex:0 0 16px">{{ m.rank }}</span>
            <div style="flex:1; min-width:0; position:relative; height:38px; border-radius:7px; background:var(--cf7f9fc)">
              <div :style="{ position: 'absolute', left: '0', top: '0', bottom: '0', width: m.w, borderRadius: '7px', background: m.fill }" />
              <div style="position:absolute; inset:0; display:flex; align-items:center; justify-content:space-between; gap:12px; padding:0 13px">
                <span style="min-width:0; font-size:14px; font-weight:500; color:var(--c16233d); white-space:nowrap; overflow:hidden; text-overflow:ellipsis">{{ $t(`dashboard.channels.items.${m.key}`) }}</span>
                <span style="display:flex; align-items:baseline; gap:8px; flex:0 0 auto">
                  <span class="mono" style="font-size:15px; font-weight:600; color:var(--c1c2b45)">{{ m.n }}</span>
                  <span class="mono" style="font-size:12.5px; color:var(--c98a3b6)">{{ m.pct }}</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ============ avto-taqsimlash oynasi ============ -->
    <Transition name="fade">
      <div v-if="autoOpen" style="position:fixed; inset:0; z-index:120; background:rgba(5,12,28,.42); display:flex; align-items:center; justify-content:center; padding:24px" @click.self="autoOpen = false">
        <div style="width:640px; max-width:100%; max-height:88vh; display:flex; flex-direction:column; background:var(--s-card); border-radius:14px; box-shadow:0 14px 34px rgba(5,12,28,.16); overflow:hidden">
          <div style="flex:0 0 auto; display:flex; gap:14px; padding:20px 22px 18px; border-bottom:1px solid var(--ce5e7eb)">
            <span style="width:44px; height:44px; flex:0 0 44px; border-radius:12px; background:var(--ceef2ff); display:flex; align-items:center; justify-content:center">
              <AppIcon name="users" :size="22" style="color:var(--c2d5be3)" />
            </span>
            <div style="min-width:0">
              <div style="font-size:19px; font-weight:700; color:var(--t-ink)">{{ $t('dashboard.auto.title') }}</div>
              <div style="margin-top:6px; font-size:14.5px; line-height:1.5; color:var(--c6b7280)">{{ $t('dashboard.auto.lead', { n: rows.length }) }}</div>
            </div>
          </div>
          <div class="thin-scroll" style="flex:1; min-height:0; overflow-y:auto; padding:16px 22px; display:flex; flex-direction:column; gap:12px">
            <div v-for="r in autoRows" :key="r.id" style="border:1px solid var(--ce5e7eb); border-radius:12px; padding:14px 16px">
              <div style="display:flex; align-items:center; gap:10px">
                <span class="mono" style="font-size:14.5px; font-weight:600; color:var(--t-ink)">{{ r.material }}</span>
                <span :style="{ padding: '3px 9px', borderRadius: '7px', background: typeStyle(r.type).bg, fontSize: '12.5px', fontWeight: '500', color: typeStyle(r.type).fg }">
                  {{ $t(`dashboard.types.${r.type}`) }}
                </span>
                <div style="flex:1" />
                <span class="mono" :style="{ fontSize: '14px', fontWeight: '500', color: r.hours <= 40 ? 'var(--ce0452f)' : 'var(--c6b7280)' }">
                  {{ $t('dashboard.unassigned.hours', { n: r.hours }) }}
                </span>
              </div>
              <div style="margin-top:7px; font-size:14px; color:var(--c6b7280)">{{ $t(`dashboard.methodsShort.${r.method}`) }}</div>
              <div style="display:flex; align-items:center; gap:12px; margin-top:12px; padding-top:12px; border-top:1px solid var(--ceef1f6)">
                <span style="width:38px; height:38px; flex:0 0 38px; border-radius:50%; background:var(--cf1f1f1); display:flex; align-items:center; justify-content:center; font-size:13px; font-weight:600; color:var(--c5c5c5c)">{{ r.staff.ini }}</span>
                <div style="min-width:0">
                  <div style="font-size:15px; font-weight:600; color:var(--t-ink)">{{ r.staff.name }}</div>
                  <div style="margin-top:3px; font-size:13.5px; color:var(--c8b95a6)">
                    {{ $t(`dashboard.roles.${r.staff.role}`) }} · {{ $t('dashboard.team.load', { n: r.staffLoad }) }}
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div style="flex:0 0 auto; display:flex; align-items:center; gap:12px; padding:16px 22px; background:var(--cfafbfc); border-top:1px solid var(--ce5e7eb)">
            <span style="flex:1; min-width:0; font-size:13.5px; line-height:1.45; color:var(--c98a3b6)">{{ $t('dashboard.auto.note') }}</span>
            <button type="button" class="dash-ghost" style="height:42px; padding:0 18px; border-radius:12px; border:1px solid var(--ce5e7eb); background:var(--s-card); font-size:14.5px; font-weight:500; color:var(--t-ink); cursor:pointer" @click="autoOpen = false">
              {{ $t('common.cancel') }}
            </button>
            <button type="button" style="height:42px; padding:0 20px; border-radius:12px; border:1px solid var(--btn); background:var(--btn); font-size:15px; font-weight:600; color:#fff; cursor:pointer" @click="confirmAuto">
              {{ $t('dashboard.auto.confirm') }}
            </button>
          </div>
        </div>
      </div>
    </Transition>

    <!-- ============ ijrochini tayinlash oynasi ============ -->
    <Transition name="fade">
      <div v-if="modalRow" style="position:fixed; inset:0; z-index:120; background:rgba(5,12,28,.42); display:flex; align-items:center; justify-content:center; padding:24px" @click.self="closeAssign">
        <div style="width:556px; max-width:100%; max-height:88vh; display:flex; flex-direction:column; background:var(--s-card); border-radius:12px; box-shadow:0 14px 34px rgba(5,12,28,.16); overflow:hidden">
          <div style="flex:0 0 auto; padding:20px 20px 16px; border-bottom:1px solid var(--ce5e7eb)">
            <div style="font-size:17px; font-weight:700; color:var(--t-ink)">{{ $t('dashboard.assign.title') }}</div>
            <div style="display:flex; align-items:center; gap:9px; padding:9px 0">
              <span class="mono" style="font-size:13.5px; color:var(--t-ink)">{{ modalRow.material }}</span>
              <span :style="{ padding: '3px 8px', borderRadius: '6px', background: typeStyle(modalRow.type).bg, fontSize: '12px', fontWeight: '500', color: typeStyle(modalRow.type).fg }">
                {{ $t(`dashboard.types.${modalRow.type}`) }}
              </span>
              <span class="mono" style="font-size:13px; color:var(--c6b7280)">{{ $t('dashboard.unassigned.hours', { n: modalRow.hours }) }}</span>
            </div>
            <div style="font-size:13.5px; line-height:18px; color:var(--c5c5c5c)">{{ $t(`dashboard.methodsShort.${modalRow.method}`) }}</div>
          </div>

          <div class="thin-scroll" style="flex:1; min-height:0; overflow-y:auto; padding:14px 20px 18px">
            <div style="font-size:14px; font-weight:600; color:var(--c6b7280)">{{ $t('dashboard.assign.recommend') }}</div>
            <div style="padding:14px 0 0">
              <div
                :style="{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', borderRadius: '12px', background: recCard.bg, boxShadow: `inset 0 0 0 1px ${recCard.ring}`, cursor: 'pointer' }"
                @click="pick = recCard.i"
              >
                <span :style="{ width: '20px', height: '20px', flex: '0 0 20px', borderRadius: '50%', boxShadow: `inset 0 0 0 1.5px ${recCard.ring}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }">
                  <span :style="{ width: '12px', height: '12px', borderRadius: '50%', background: recCard.dot }" />
                </span>
                <span style="width:38px; height:38px; flex:0 0 38px; border-radius:50%; background:var(--cf1f1f1); display:flex; align-items:center; justify-content:center; font-size:13px; font-weight:600; color:var(--c5c5c5c)">{{ recCard.ini }}</span>
                <div style="flex:1; min-width:0; display:flex; flex-direction:column; gap:4px">
                  <span style="font-size:14px; font-weight:600; color:var(--t-ink); white-space:nowrap; overflow:hidden; text-overflow:ellipsis">{{ recCard.name }}</span>
                  <span style="font-size:13px; color:var(--c6b7280); white-space:nowrap; overflow:hidden; text-overflow:ellipsis">{{ recCard.role }}</span>
                </div>
                <span class="mono" style="flex:0 0 auto; font-size:13px; font-weight:600; color:var(--c23568f); padding:5px 10px; border-radius:20px; background:var(--ceef2ff)">{{ recCard.pct }}</span>
              </div>
              <div style="padding:8px 0 0 44px; font-size:13px; color:var(--c98a3b6)">
                {{ $t('dashboard.assign.recNote', { n: loads[recIndex] }) }}
              </div>
            </div>

            <div style="padding:18px 0 12px; font-size:14px; font-weight:600; color:var(--c6b7280)">{{ $t('dashboard.assign.others') }}</div>
            <div style="display:flex; flex-direction:column; gap:8px">
              <div
                v-for="o in otherCards"
                :key="o.name"
                :style="{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', borderRadius: '12px', background: o.bg, boxShadow: `inset 0 0 0 1px ${o.ring}`, cursor: 'pointer' }"
                @click="pick = o.i"
              >
                <span :style="{ width: '20px', height: '20px', flex: '0 0 20px', borderRadius: '50%', boxShadow: `inset 0 0 0 1.5px ${o.ring}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }">
                  <span :style="{ width: '12px', height: '12px', borderRadius: '50%', background: o.dot }" />
                </span>
                <span style="width:38px; height:38px; flex:0 0 38px; border-radius:50%; background:var(--cf1f1f1); display:flex; align-items:center; justify-content:center; font-size:13px; font-weight:600; color:var(--c5c5c5c)">{{ o.ini }}</span>
                <div style="flex:1; min-width:0; display:flex; flex-direction:column; gap:4px">
                  <span style="font-size:14px; font-weight:600; color:var(--t-ink); white-space:nowrap; overflow:hidden; text-overflow:ellipsis">{{ o.name }}</span>
                  <span style="font-size:13px; color:var(--c6b7280); white-space:nowrap; overflow:hidden; text-overflow:ellipsis">{{ o.role }}</span>
                </div>
                <span class="mono" style="flex:0 0 auto; font-size:13px; font-weight:600; color:var(--c66748c); padding:5px 10px; border-radius:20px; background:var(--cf0f3f8)">{{ o.pct }}</span>
              </div>
            </div>
          </div>

          <div style="flex:0 0 auto; display:flex; justify-content:flex-end; gap:8px; padding:14px 20px; background:var(--cfafbfc); border-top:1px solid var(--ce5e7eb)">
            <button type="button" class="dash-ghost" style="height:41px; padding:0 16px; border-radius:12px; border:1px solid var(--ce5e7eb); background:var(--s-card); font-size:14px; font-weight:500; color:var(--t-ink); cursor:pointer" @click="closeAssign">
              {{ $t('common.cancel') }}
            </button>
            <button type="button" style="height:42px; padding:0 16px; border-radius:12px; border:1px solid var(--btn); background:var(--btn); font-size:15px; font-weight:500; color:#fff; cursor:pointer" @click="confirmAssign">
              {{ $t('dashboard.assign.confirm') }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
/* dizayndagi style-hover ekvivalentlari */
.dash-export:hover {
  background: var(--ce6f2ec) !important;
}

.dash-assign:hover {
  background: var(--ce6ebf3) !important;
}

.dash-ghost:hover {
  background: var(--cf6f8fb) !important;
}

.dash-auto:hover:not(:disabled) {
  filter: brightness(1.12);
}

.dash-auto:disabled {
  opacity: .5;
  cursor: not-allowed;
}
</style>
