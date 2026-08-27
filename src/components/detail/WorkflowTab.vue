<script setup>
/* «Ish jarayoni» tabi — hodisalar daraxti tekis ro'yxatga yoyiladi. */
import { computed } from 'vue'
import AppIcon from '@/components/ui/AppIcon.vue'
import DetailPanel from '@/components/detail/DetailPanel.vue'

const props = defineProps({
  // detailFor().workflow — ichma-ich joylashgan daraxt (namuna)
  tree: { type: Array, default: () => [] },
  // serverdan kelgan hodisalar — tekis ro'yxat, yangisi tepada
  events: { type: Array, default: null },
  // status o'zgarishlari tarixi — /complaints/<id>/history/
  history: { type: Array, default: null }
})

const rows = computed(() => {
  if (props.events) return props.events

  const out = []
  const walk = (nodes, depth) => nodes.forEach((n) => {
    out.push({ ...n, depth })
    if (n.children && n.children.length) walk(n.children, depth + 1)
  })
  walk(props.tree, 0)
  return out
})
</script>

<template>
  <DetailPanel icon="refresh" :title="$t('detail.workflow.title')">
    <!--
      Chap tomondagi tasma voqealarni zanjir qilib bog'laydi. Namuna
      ma'lumotda daraxt chuqurligi bor (`depth`), serverdan esa tekis ro'yxat
      keladi — ikkalasi ham shu ko'rinishga tushadi.
    -->
    <div class="wf-line">
      <div
        v-for="(n, i) in rows"
        :key="`${n.badge}-${i}`"
        class="wf-item"
        :style="{ marginLeft: `${n.depth * 26}px`, animationDelay: `${i * 60}ms` }"
      >
        <span class="wf-dot" :class="n.actor" />

        <div class="wf-row">
          <span class="wf-time mono">
            <AppIcon name="clock" :size="13" />
            {{ n.time || '—' }}
          </span>
          <span class="wf-actor">
            {{ n.person || (n.actor === 'bank' ? $t('detail.workflow.bank') : $t('detail.workflow.officer')) }}
          </span>
          <span v-if="n.position" class="wf-role">({{ n.position }})</span>
          <span v-else-if="n.actor === 'staff' && !n.depth" class="wf-role">
            ({{ $t('detail.workflow.staffRole') }})
          </span>
          <span class="wf-badge" :class="n.actor">{{ n.label || $t(`detail.workflow.badges.${n.badge}`) }}</span>
          <span v-if="n.code" class="tag code mono">{{ n.code }}</span>
        </div>

        <!-- status o'zgarishi va izoh: serverda bor, avval ko'rsatilmasdi -->
        <div v-if="n.from || n.comment" class="wf-note">
          <span v-if="n.from" class="wf-move">
            {{ $t(`status.${n.from}.label`) }}
            <AppIcon name="arrowRight" :size="12" />
            <strong>{{ $t(`status.${n.to}.label`) }}</strong>
          </span>
          <span v-if="n.comment" class="wf-comment">{{ n.comment }}</span>
        </div>
      </div>
    </div>
    <!-- status tarixi: serverdan alohida endpoint bilan keladi -->
    <template v-if="history">
      <div class="hist-head">{{ $t('detail.workflow.history') }}</div>

      <div v-if="!history.length" class="hist-empty">
        {{ $t('detail.workflow.historyEmpty') }}
      </div>

      <div v-for="h in history" :key="h.id" class="hist-row">
        <span class="wf-time mono">
          <AppIcon name="clock" :size="13" />
          {{ h.time || '—' }}
        </span>
        <span class="hist-move">
          <template v-if="h.from">
            {{ $t(`status.${h.from}.label`) }}
            <AppIcon name="arrowRight" :size="13" />
          </template>
          <template v-else>{{ $t('detail.workflow.created') }} →</template>
          <strong>{{ $t(`status.${h.to}.label`) }}</strong>
        </span>
        <span v-if="h.person" class="hist-person">{{ h.person }}</span>
        <span v-if="h.comment" class="hist-comment">{{ h.comment }}</span>
      </div>
    </template>
  </DetailPanel>
</template>

<style scoped>
/* ---------- voqealar zanjiri ---------- */
.wf-line {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding-left: 18px;
}

/* chapdagi uzluksiz tasma */
.wf-line::before {
  content: '';
  position: absolute;
  left: 5px;
  top: 10px;
  bottom: 10px;
  width: 2px;
  border-radius: 2px;
  background: var(--ce2e8f1);
}

.wf-item {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 10px 12px;
  border: 1px solid var(--ce2e8f1);
  border-radius: 10px;
  background: var(--s-card);
  animation: riseIn .26s var(--ease) backwards;
}

.wf-dot {
  position: absolute;
  left: -17px;
  top: 16px;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: var(--c23568f);
  box-shadow: 0 0 0 3px var(--s-card);
}

.wf-dot.bank {
  background: var(--c96620a);
}

.wf-note {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 6px 12px;
  padding-left: 2px;
  font-size: 13px;
  color: var(--c8b95a6);
}

.wf-move {
  display: inline-flex;
  align-items: center;
  gap: 5px;
}

.wf-move strong {
  color: var(--c16233d);
}

.wf-comment {
  font-style: italic;
}

/* ---------- status tarixi ---------- */
.hist-head {
  margin: 18px 0 10px;
  padding-top: 14px;
  border-top: 1px solid var(--ceef1f6);
  font-size: 14px;
  font-weight: 600;
  color: var(--c16233d);
}

.hist-empty {
  font-size: 13.5px;
  color: var(--c98a3b6);
}

.hist-row {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
  padding: 8px 0;
  border-bottom: 1px dashed var(--ceef1f6);
  font-size: 13.5px;
  color: var(--c3d4d66);
}

.hist-row:last-child {
  border-bottom: 0;
}

.hist-move {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: var(--c66748c);
}

.hist-move strong {
  color: var(--c16233d);
}

.hist-person {
  color: var(--c8b95a6);
}

.hist-comment {
  flex: 1 0 100%;
  color: var(--c8b95a6);
}


/* karta o'rami endi .wf-item da — bu yerda faqat qatorning tuzilishi */
.wf-row {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px 10px;
}

.wf-time {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 3px 9px;
  border-radius: 7px;
  background: var(--cf0f3f8);
  border: 1px solid var(--ce2e8f1);
  font-size: 13.5px;
  color: var(--c66748c);
  white-space: nowrap;
}

.wf-actor {
  font-size: 15px;
  font-weight: 600;
  color: var(--c16233d);
}

.wf-role {
  font-size: 13.5px;
  font-style: italic;
  color: var(--c8b95a6);
}

.wf-badge {
  padding: 5px 11px;
  border-radius: 7px;
  background: var(--brand-a);
  color: #fff;
  font-size: 13.5px;
  font-weight: 600;
}

.wf-badge.bank {
  background: var(--ce8eef7);
  color: var(--c23568f);
}
.tag {
  padding: 3px 9px;
  border-radius: 8px;
  background: rgba(102, 112, 128, .16);
  border: 0;
  font-size: 13.5px;
  color: var(--c667080);
  white-space: nowrap;
}

.tag.code {
  padding: 3px 8px;
  border-radius: 4px;
  background: var(--ce8eef7);
  font-size: 12.5px;
  font-weight: 600;
  color: var(--c23568f);
}
</style>
