<script setup>
/* «Sanksiyalar» tabi — bank rekvizitni bloklagach paydo bo'ladigan qaror hujjati. */
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import AppIcon from '@/components/ui/AppIcon.vue'
import DetailPanel from '@/components/detail/DetailPanel.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import { useUi } from '@/stores/useUi'

const props = defineProps({
  row: { type: Object, required: true },
  // serverdan kelgan sanksiyalar ro'yxati
  api: { type: Array, default: null }
})

const { t } = useI18n()
const { toast } = useUi()

// serverdagi ro'yxat bo'lsa — hujjat shunda bor-yo'qligiga qaraladi
const hasDecision = computed(() => (props.api
  ? props.api.some((s) => s.file)
  : ['blocked', 'done', 'autopayment'].includes(props.row.status)))

const docName = computed(() => {
  const fromApi = props.api?.find((s) => s.file)?.file
  if (fromApi) return String(fromApi).split('/').pop()
  return `qaror_${String(props.row.id).replace(/\D/g, '').slice(-8)}.pdf`
})

const docPage = ref(1)
const zoom = ref(92)
</script>

<template>
  <DetailPanel icon="shield" :title="$t('detail.doc.title')" bare>
    <EmptyState
      v-if="!hasDecision"
      icon="shield"
      :title="$t('detail.doc.emptyTitle')"
      :text="$t('detail.doc.emptyText')"
    />

    <template v-else>
      <div class="doc-bar">
        <AppIcon name="swapVert" :size="20" />
        <span class="doc-name mono">{{ docName }}</span>
        <div class="spacer" />
        <span class="doc-pages mono">{{ docPage }} / 2</span>
        <span class="doc-sep" />
        <button type="button" class="doc-zoom" @click="zoom = Math.max(50, zoom - 8)">−</button>
        <span class="doc-scale mono">{{ zoom }}%</span>
        <button type="button" class="doc-zoom" @click="zoom = Math.min(200, zoom + 8)">+</button>
        <span class="doc-sep" />
        <button
          type="button"
          class="doc-act"
          :title="$t('detail.doc.download')"
          @click="toast(t('detail.doc.downloaded', { file: docName }))"
        >
          <AppIcon name="download" :size="20" />
        </button>
        <button
          type="button"
          class="doc-act"
          :title="$t('detail.doc.print')"
          @click="toast(t('detail.doc.printing'))"
        >
          <AppIcon name="print" :size="20" />
        </button>
      </div>

      <div class="doc-body">
        <div class="doc-thumbs">
          <button
            v-for="n in 2"
            :key="n"
            type="button"
            class="thumb"
            :class="{ on: n === docPage }"
            @click="docPage = n"
          />
          <span class="thumb-nums mono">
            <span v-for="n in 2" :key="n" :class="{ on: n === docPage }">{{ n }}</span>
          </span>
        </div>
        <div class="doc-page">
          <div class="page-sheet" :style="{ transform: `scale(${zoom / 100})` }">
            <div class="page-title mono">{{ $t('detail.doc.sheet') }}</div>
            <div class="page-text">{{ $t('detail.doc.sheetText') }}</div>
          </div>
        </div>
      </div>
    </template>
  </DetailPanel>
</template>

<style scoped>

.doc-bar {
  display: flex;
  align-items: center;
  gap: 12px;
  height: 44px;
  padding: 0 14px;
  background: var(--c33373d);
  color: var(--cc8cdd6);
}

.doc-name {
  font-size: 14.5px;
  color: var(--ce8ebf0);
}

.doc-scale {
  font-size: 14px;
}

.doc-scale {
  color: var(--ce8ebf0);
  padding: 2px 7px;
  border: 1px solid var(--c4b5058);
  border-radius: 4px;
}

.doc-sep {
  width: 1px;
  height: 20px;
  background: var(--c4b5058);
}

.doc-zoom {
  width: 24px;
  height: 24px;
  border: 0;
  background: transparent;
  color: var(--cc8cdd6);
  font-size: 17px;
  line-height: 1;
  cursor: pointer;
}

.doc-act {
  border: 0;
  background: transparent;
  color: var(--cc8cdd6);
  cursor: pointer;
  display: flex;
}

.doc-zoom:hover {
  color: #fff;
}

.doc-body {
  display: flex;
  height: 470px;
}

.doc-thumbs {
  width: 150px;
  flex: 0 0 150px;
  background: var(--c3f444c);
  padding: 14px 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.thumb {
  width: 96px;
  height: 130px;
  background: var(--s-card);
  border: 1px solid var(--c5a6068);
  border-radius: 2px;
  cursor: pointer;
  padding: 0;
}

.thumb.on {
  border: 2px solid var(--k3d7cc0);
}

.thumb-nums {
  display: flex;
  gap: 84px;
  font-size: 13px;
  color: var(--c8b929c);
  margin-top: -6px;
}

.thumb-nums .on {
  color: var(--cc8cdd6);
}

.doc-page {
  flex: 1;
  background: var(--c54595f);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 22px;
  overflow: hidden;
}

.page-sheet {
  width: 520px;
  height: 100%;
  background: var(--s-card) repeating-linear-gradient(135deg, rgba(28, 43, 69, .04) 0 9px, transparent 9px 18px);
  border-radius: 2px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 9px;
  transition: transform .18s var(--ease);
}

.page-title {
  font-size: 14px;
  color: var(--c66748c);
  letter-spacing: .05em;
}

.page-text {
  font-size: 14.5px;
  color: var(--c98a3b6);
  text-align: center;
  max-width: 330px;
}
</style>
