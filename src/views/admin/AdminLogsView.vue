<script setup>
import { computed } from 'vue'
import AppIcon from '@/components/ui/AppIcon.vue'
import { LOG_TONE } from '@/data/admin'
import { useAdmin } from '@/stores/useAdmin'

const { logs } = useAdmin()

const rows = computed(() => logs.value.map((l) => ({ ...l, style: LOG_TONE[l.tone] || LOG_TONE.gray })))
</script>

<template>
  <div class="screen">
    <section class="card-surface panel">
      <header class="panel-head dark-bar">
        <AppIcon name="clock" :size="26" />
        <span class="panel-title">{{ $t('admin.logs.title') }}</span>
        <span class="panel-count mono">{{ $t('admin.logs.count', { n: rows.length }) }}</span>
      </header>

      <div class="table-scroll thin-scroll">
        <div class="grid">
          <div class="row head">
            <span>{{ $t('admin.logs.colTime') }}</span>
            <span>{{ $t('admin.logs.colWho') }}</span>
            <span>{{ $t('admin.logs.colAct') }}</span>
            <span>{{ $t('admin.logs.colObj') }}</span>
            <span>{{ $t('admin.logs.colIp') }}</span>
          </div>

          <div v-for="(l, i) in rows" :key="i" class="row">
            <span class="mono time">{{ l.time }}</span>
            <span class="who">{{ l.who }}</span>
            <span class="act">
              <span class="act-dot" :style="{ background: l.style.fg }" />
              {{ $t(`admin.logs.acts.${l.act}`) }}
            </span>
            <span class="mono obj">{{ l.obj }}</span>
            <span class="mono ip">{{ l.ip }}</span>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>

.panel {
  overflow: hidden;
}

.panel-head {
  height: 46px;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 0 18px;
  color: #c9d9ec;
}

.panel-title {
  font-size: 16px;
  font-weight: 600;
  letter-spacing: .07em;
  text-transform: uppercase;
  color: #fff;
}

.panel-count {
  font-size: 13.5px;
  color: #8fa4c2;
}

.grid {
  min-width: 760px;
}

.row {
  display: grid;
  grid-template-columns: 86px 1fr 1.6fr 1.2fr 120px;
  gap: 16px;
  align-items: center;
  padding: 0 18px;
  height: 54px;
  border-bottom: 1px solid var(--ceef1f6);
}

.row.head {
  height: 42px;
  background: var(--cf8fafc);
  border-bottom: 1px solid var(--ce5e7eb);
  font-size: 12.5px;
  font-weight: 700;
  letter-spacing: .05em;
  text-transform: uppercase;
  color: var(--c8b95a6);
}

.row:last-child {
  border-bottom: 0;
}

.time {
  font-size: 14px;
  color: var(--c66748c);
}

.who {
  font-size: 14.5px;
  font-weight: 500;
  color: var(--c16233d);
}

.act {
  display: inline-flex;
  align-items: center;
  gap: 9px;
  font-size: 14.5px;
  color: var(--c3d4d66);
  min-width: 0;
}

.act-dot {
  width: 8px;
  height: 8px;
  flex: 0 0 8px;
  border-radius: 50%;
}

.obj {
  font-size: 13.5px;
  color: var(--c3d4d66);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.ip {
  font-size: 13.5px;
  color: var(--c8b95a6);
}
</style>
