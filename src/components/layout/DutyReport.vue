<script setup>
/*
  Navbatchilik hisoboti — topbar'dagi navbatchilik tugmasidan ochiladi.
  Ko'rinishi faza va rolga bog'liq:
    navbatchi  on/returned -> tahrirlanadi, «Rahbarga yuborish»
               review/closed -> faqat o'qish
    rahbar     review -> «Qaytarish» (sabab bilan) va «Tasdiqlash va yopish»
*/
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import AppIcon from '@/components/ui/AppIcon.vue'
import { CODE, STATS, DONE, LEFT, TARGETS, REASONS, TAG_TONE } from '@/data/duty'
import { useUi } from '@/stores/useUi'

const { t } = useI18n()
const { state, isExec, toast } = useUi()

const target = ref(0)
const note = ref('')
const reason = ref(null)
const returning = ref(false)

const phase = computed(() => state.dutyPhase)

// navbatchi hisobotni faqat qoralama yoki qaytarilgan holatda tahrirlaydi
const editable = computed(() => !isExec.value && (phase.value === 'on' || phase.value === 'returned'))

const banner = computed(() => {
  if (phase.value === 'returned') return { key: 'returned', bg: 'var(--cfceceb)', ring: 'var(--cf2cfcd)', fg: 'var(--ce0452f)' }
  if (isExec.value && phase.value === 'review') return { key: 'check', bg: 'var(--cfff5e9)', ring: 'var(--cf6dfc0)', fg: 'var(--cb45309)' }
  return null
})

const meta = computed(() => [
  { k: 'officer', v: t('profile.staff.name') },
  { k: 'shift', v: '09:00 – 21:00' },
  { k: 'hours', v: t('dutyReport.hoursValue', { n: 12 }) },
  { k: 'receiver', v: TARGETS[target.value].name }
])

const mainAction = computed(() => {
  if (isExec.value) {
    return phase.value === 'review' ? { key: 'approve', icon: 'check' } : null
  }
  if (!editable.value) return null
  return { key: phase.value === 'returned' ? 'resend' : 'send', icon: 'send' }
})

const footNote = computed(() => {
  if (isExec.value) return returning.value ? 'returnHint' : 'sentAt'
  if (phase.value === 'review') return 'waiting'
  if (phase.value === 'closed') return 'archived'
  return 'editHint'
})

function close() {
  state.dutyModal = false
  returning.value = false
}

function runMain() {
  if (isExec.value) {
    state.dutyPhase = 'closed'
    close()
    toast(t('duty.toast.approved'))
    return
  }
  state.dutyPhase = 'review'
  close()
  toast(t('duty.toast.sent'))
}

const retNote = ref('')

function runReturn() {
  if (!returning.value) {
    returning.value = true
    return
  }
  if (!reason.value) {
    toast(t('dutyReport.pickReason'), 'bad')
    return
  }
  state.dutyPhase = 'returned'
  close()
  toast(t('dutyReport.returned'))
}
</script>

<template>
  <Transition name="fade">
    <div v-if="state.dutyModal" class="root" @click.self="close">
      <div class="sheet">
        <!-- sarlavha -->
        <header class="head dark-bar">
          <span class="head-ico"><AppIcon name="doc" :size="28" /></span>
          <div class="head-text">
            <span class="title">{{ $t('dutyReport.title') }}</span>
            <span class="code mono">{{ CODE }}</span>
          </div>
          <span class="tag">{{ $t(`dutyReport.phase.${phase}`) }}</span>
          <button type="button" class="close" :title="$t('common.close')" @click="close">
            <AppIcon name="close" :size="20" />
          </button>
        </header>

        <div class="body thin-scroll">
          <!-- rahbar/qaytarish ogohlantirishi -->
          <div
            v-if="banner"
            class="banner"
            :style="{ background: banner.bg, borderColor: banner.ring }"
          >
            <AppIcon name="error" :size="22" :style="{ color: banner.fg }" />
            <div class="banner-body">
              <span class="banner-title" :style="{ color: banner.fg }">
                {{ $t(`dutyReport.banner.${banner.key}.title`) }}
              </span>
              <span class="banner-text">{{ $t(`dutyReport.banner.${banner.key}.text`) }}</span>
            </div>
          </div>

          <!-- meta -->
          <div class="meta">
            <div v-for="m in meta" :key="m.k" class="meta-item">
              <span class="meta-k">{{ $t(`dutyReport.meta.${m.k}`) }}</span>
              <span class="meta-v">{{ m.v }}</span>
            </div>
          </div>

          <!-- natijalar -->
          <section class="group">
            <span class="group-title">{{ $t('dutyReport.results') }}</span>
            <div class="stats">
              <div v-for="s in STATS" :key="s.key" class="stat">
                <span class="stat-v mono" :style="{ color: s.fg || 'var(--c1c2b45)' }">{{ s.v }}</span>
                <span class="stat-k">{{ $t(`dutyReport.stats.${s.key}`) }}</span>
              </div>
            </div>
          </section>

          <!-- bajarilgan ishlar -->
          <section class="group">
            <span class="group-title">
              {{ $t('dutyReport.done') }}
              <span class="count">{{ $t('dutyReport.items', DONE.length) }}</span>
            </span>
            <div class="rows">
              <div v-for="d in DONE" :key="d.id" class="row">
                <span class="row-id mono">{{ d.id }}</span>
                <span class="row-title">{{ $t(`dutyReport.doneItems.${d.key}`) }}</span>
                <span class="row-tag" :style="{ background: TAG_TONE[d.tag].bg, color: TAG_TONE[d.tag].fg }">
                  {{ $t(`dutyReport.tags.${d.tag}`) }}
                </span>
                <span class="row-time mono">{{ d.time }}</span>
              </div>
            </div>
          </section>

          <!-- qolgan ishlar -->
          <section class="group">
            <span class="group-title">
              {{ $t('dutyReport.left') }}
              <span class="count">{{ $t('dutyReport.items', LEFT.length) }}</span>
            </span>
            <div class="rows">
              <div v-for="l in LEFT" :key="l.id" class="row">
                <span class="row-id mono">{{ l.id }}</span>
                <span class="row-title">{{ $t(`dutyReport.leftItems.${l.key}`) }}</span>
                <div class="spacer" />
                <span class="row-next">{{ $t(`dutyReport.next.${l.next}`) }}</span>
              </div>
            </div>
          </section>

          <!-- izoh -->
          <section class="group">
            <span class="group-title">{{ $t('dutyReport.note') }}</span>
            <textarea
              v-if="editable"
              v-model="note"
              class="note"
              :placeholder="$t('dutyReport.notePh')"
            />
            <div v-else class="note ro">{{ note || $t('dutyReport.noteEmpty') }}</div>
          </section>

          <!-- kimga topshiriladi -->
          <section class="group">
            <span class="group-title">
              {{ editable ? $t('dutyReport.handTo') : $t('dutyReport.handedTo') }}
            </span>

            <div v-if="editable" class="targets">
              <button
                v-for="(tg, i) in TARGETS"
                :key="tg.ini"
                type="button"
                class="target"
                :class="{ on: i === target }"
                @click="target = i"
              >
                <span class="radio"><span class="dot" /></span>
                <span class="avatar">{{ tg.ini }}</span>
                <span class="target-text">
                  <span class="target-name">{{ tg.name }}</span>
                  <span class="target-note">{{ tg.note }}</span>
                </span>
              </button>
            </div>

            <div v-else class="target static">
              <span class="avatar">{{ TARGETS[target].ini }}</span>
              <span class="target-text">
                <span class="target-name">{{ TARGETS[target].name }}</span>
                <span class="target-note">{{ TARGETS[target].note }}</span>
              </span>
              <div class="spacer" />
              <span class="pass">{{ $t('dutyReport.passing', { n: LEFT.length }) }}</span>
            </div>
          </section>

          <!-- qaytarish sababi -->
          <section v-if="returning" class="ret">
            <span class="ret-title">{{ $t('dutyReport.reason') }}</span>
            <div class="reasons">
              <button
                v-for="r in REASONS"
                :key="r"
                type="button"
                class="reason"
                :class="{ on: reason === r }"
                @click="reason = r"
              >{{ $t(`dutyReport.reasons.${r}`) }}</button>
            </div>
            <textarea
              v-model="retNote"
              class="ret-note"
              :placeholder="$t('dutyReport.reasonPh')"
            />
          </section>
        </div>

        <footer class="foot">
          <span class="foot-note">{{ $t(`dutyReport.foot.${footNote}`) }}</span>
          <div class="spacer" />
          <button type="button" class="btn-light" @click="close">
            {{ isExec || editable ? $t('common.cancel') : $t('common.close') }}
          </button>
          <button v-if="isExec && phase === 'review'" type="button" class="btn-warn" @click="runReturn">
            <AppIcon name="reply" :size="17" />
            {{ returning ? $t('dutyReport.returnConfirm') : $t('dutyReport.return') }}
          </button>
          <button v-if="mainAction" type="button" class="btn-dark" @click="runMain">
            <AppIcon :name="mainAction.icon" :size="17" />
            {{ $t(`dutyReport.actions.${mainAction.key}`) }}
          </button>
        </footer>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.root {
  position: fixed;
  inset: 0;
  z-index: 130;
  background: rgba(5, 12, 28, .42);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
}

.sheet {
  width: 860px;
  max-width: calc(100vw - 48px);
  max-height: calc(100vh - 72px);
  display: flex;
  flex-direction: column;
  background: var(--s-card);
  border-radius: 14px;
  box-shadow: 0 18px 44px rgba(5, 12, 28, .28);
  overflow: hidden;
}

.head {
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  gap: 13px;
  padding: 0 20px;
  height: 66px;
  color: #c9d9ec;
}

.head-ico {
  width: 38px;
  height: 38px;
  flex: 0 0 38px;
  border-radius: 10px;
  background: rgba(255, 255, 255, .09);
  border: 1px solid rgba(255, 255, 255, .16);
  display: flex;
  align-items: center;
  justify-content: center;
}

.head-text {
  min-width: 0;
  flex: 1;
  display: flex;
  flex-direction: column;
  line-height: 1.3;
}

.title {
  font-size: 17.5px;
  font-weight: 600;
  color: #fff;
}

.code {
  font-size: 13px;
  color: #8fa4c2;
}

.tag {
  display: flex;
  align-items: center;
  gap: 7px;
  height: 28px;
  padding: 0 11px;
  border-radius: 20px;
  background: rgba(255, 255, 255, .10);
  border: 1px solid rgba(255, 255, 255, .20);
  font-size: 13px;
  font-weight: 600;
  color: #fff;
  white-space: nowrap;
}

.spacer {
  flex: 1;
}

.close {
  border: 0;
  background: transparent;
  color: #c9d9ec;
  cursor: pointer;
  display: flex;
}

.close:hover {
  color: #fff;
}

.body {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: 16px 18px 18px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.banner {
  display: flex;
  gap: 12px;
  padding: 13px 14px;
  border-radius: 10px;
  border: 1px solid;
}

.banner-body {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.banner-title {
  font-size: 15px;
  font-weight: 600;
}

.banner-text {
  font-size: 14px;
  line-height: 1.55;
  color: var(--c3d4d66);
}

.meta {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 10px 16px;
  padding: 12px 14px;
  border-radius: 10px;
  background: var(--cf8fafc);
  border: 1px solid var(--ce2e8f1);
}

.meta-k {
  display: block;
  font-size: 12.5px;
  color: var(--c8b95a6);
}

.meta-v {
  display: block;
  margin-top: 2px;
  font-size: 14.5px;
  font-weight: 500;
  color: var(--c16233d);
}

.group {
  display: flex;
  flex-direction: column;
  gap: 9px;
}

.group-title {
  display: flex;
  align-items: center;
  gap: 9px;
  font-size: 14px;
  font-weight: 600;
  color: var(--c3d4d66);
}

.count {
  padding: 2px 8px;
  border-radius: 20px;
  background: var(--cf0f3f8);
  border: 1px solid var(--ce2e8f1);
  font-size: 12.5px;
  font-weight: 500;
  color: var(--c66748c);
}

.stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 10px;
}

.stat {
  padding: 11px 13px;
  border-radius: 10px;
  border: 1px solid var(--ce2e8f1);
  background: var(--s-card);
}

.stat-v {
  display: block;
  font-size: 20px;
  font-weight: 600;
  line-height: 1;
}

.stat-k {
  display: block;
  margin-top: 5px;
  font-size: 13px;
  color: var(--c8b95a6);
}

.rows {
  display: flex;
  flex-direction: column;
  gap: 7px;
}

.row {
  display: flex;
  align-items: center;
  gap: 11px;
  padding: 10px 12px;
  border-radius: 9px;
  border: 1px solid var(--ce2e8f1);
  background: var(--s-card);
  flex-wrap: wrap;
}

.row-id {
  font-size: 13.5px;
  font-weight: 600;
  color: var(--c16233d);
}

.row-title {
  flex: 1;
  min-width: 0;
  font-size: 14px;
  color: var(--c3d4d66);
}

.row-tag {
  padding: 3px 9px;
  border-radius: 6px;
  font-size: 12.5px;
  font-weight: 500;
}

.row-time {
  font-size: 13px;
  color: var(--c8b95a6);
}

.row-next {
  font-size: 13.5px;
  font-weight: 600;
  color: var(--cb45309);
  white-space: nowrap;
}

.note {
  width: 100%;
  min-height: 92px;
  resize: vertical;
  padding: 11px 13px;
  border: 1px solid var(--ce5e7eb);
  border-radius: 10px;
  background: var(--s-card);
  color: var(--c1c2b45);
  font-family: inherit;
  font-size: 14.5px;
  line-height: 1.65;
}

.note:focus {
  outline: none;
  border-color: var(--c23568f);
}

.note.ro {
  min-height: 0;
  background: var(--cf8fafc);
  color: var(--c3d4d66);
}

.targets {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.target {
  display: flex;
  align-items: center;
  gap: 11px;
  padding: 11px 12px;
  border: 0;
  border-radius: 10px;
  background: var(--s-card);
  box-shadow: inset 0 0 0 1px var(--ce5e7eb);
  cursor: pointer;
  text-align: left;
}

.target:hover {
  background: var(--cf8fafc);
}

.target.on {
  background: var(--cf4f7fb);
  box-shadow: inset 0 0 0 1px var(--c23568f);
}

.target.static {
  cursor: default;
  box-shadow: inset 0 0 0 1px var(--ce5e7eb);
}

.radio {
  width: 18px;
  height: 18px;
  flex: 0 0 18px;
  border-radius: 50%;
  box-shadow: inset 0 0 0 1.5px var(--ce5e7eb);
  display: flex;
  align-items: center;
  justify-content: center;
}

.target.on .radio {
  box-shadow: inset 0 0 0 1.5px var(--c23568f);
}

.dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: transparent;
  transform: scale(.4);
  transition: transform .18s var(--ease), background .18s ease;
}

.target.on .dot {
  background: var(--c23568f);
  transform: scale(1);
}

.avatar {
  width: 36px;
  height: 36px;
  flex: 0 0 36px;
  border-radius: 50%;
  background: var(--ce8eef7);
  color: var(--c23568f);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: 600;
}

.target-text {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.target-name {
  font-size: 14.5px;
  font-weight: 600;
  color: var(--c16233d);
}

.target-note {
  font-size: 13px;
  color: var(--c8b95a6);
}

.pass {
  font-size: 13.5px;
  color: var(--c8b95a6);
  white-space: nowrap;
}

.reasons {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.ret {
  display: flex;
  flex-direction: column;
  gap: 9px;
  padding: 14px;
  border: 1px solid var(--cf2cfcd);
  border-radius: 10px;
  background: var(--cfceceb);
}

.ret-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--ce0452f);
}

.reason {
  display: flex;
  align-items: center;
  height: 29px;
  padding: 0 11px;
  border-radius: 20px;
  border: 1px solid var(--cf2cfcd);
  background: var(--s-card);
  color: var(--ce0452f);
  font-size: 13.5px;
  cursor: pointer;
}

.ret-note {
  width: 100%;
  min-height: 74px;
  resize: vertical;
  padding: 11px 13px;
  border: 1px solid var(--cf2cfcd);
  border-radius: 9px;
  background: var(--s-card);
  color: var(--c1c2b45);
  font-family: inherit;
  font-size: 14.5px;
  line-height: 1.6;
  outline: none;
}

.reason.on {
  background: var(--ce0452f);
  border-color: var(--ce0452f);
  color: #fff;
}

.foot {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 18px;
  background: var(--cfafbfc);
  border-top: 1px solid var(--ce5e7eb);
  flex-wrap: wrap;
}

.foot-note {
  flex: 1;
  min-width: 200px;
  font-size: 13.5px;
  line-height: 1.45;
  color: var(--c98a3b6);
}

.btn-light,
.btn-dark,
.btn-warn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  height: 42px;
  padding: 0 18px;
  border-radius: 11px;
  font-size: 14.5px;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
}

.btn-light {
  border: 1px solid var(--ce5e7eb);
  background: var(--s-card);
  color: var(--t-ink, var(--c16233d));
}

.btn-light:hover {
  background: var(--cf6f8fb);
}

.btn-warn {
  border: 1px solid var(--cf2cfcd);
  background: var(--cfceceb);
  color: var(--ce0452f);
}

.btn-warn:hover {
  background: var(--cf2cfcd);
}

.btn-dark {
  border: 1px solid var(--btn);
  background: var(--btn);
  color: #fff;
}

.btn-dark:hover {
  filter: brightness(1.12);
}
</style>
