<script setup>
/*
  «Sanksiyalar» tabi — bank rekvizitni bloklagach paydo bo'ladigan qaror hujjati.

  Hujjatning o'zi serverdan keladi: sanksiya yozuvidagi `file_url`. Ilgari bu
  yerda hujjat o'rniga namuna varaq turardi (soxta sahifa raqami, kichraytirish
  va eskizlar bilan). Endi PDF brauzerning o'z ko'ruvchisida ochiladi — sahifa
  raqami, kichraytirish va eskizlar ham o'shanikidir, shuning uchun bizning
  ustimizdagi soxta boshqaruvlar olib tashlandi.
*/
import { computed } from 'vue'
import AppIcon from '@/components/ui/AppIcon.vue'
import DetailPanel from '@/components/detail/DetailPanel.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import { fileUrl } from '@/services/api'

const props = defineProps({
  row: { type: Object, required: true },
  // serverdan kelgan sanksiyalar ro'yxati
  api: { type: Array, default: null }
})

// hujjati bor birinchi sanksiya
const doc = computed(() => props.api?.find((s) => s.file) || null)

// serverdagi ro'yxat bo'lsa — hujjat shunda bor-yo'qligiga qaraladi
const hasDecision = computed(() => (props.api
  ? !!doc.value
  : ['blocked', 'done', 'autopayment'].includes(props.row.status)))

const docUrl = computed(() => fileUrl(doc.value?.file))

const docName = computed(() => {
  const path = doc.value?.file
  if (path) return decodeURIComponent(String(path).split('/').pop())
  return `qaror_${String(props.row.id).replace(/[^0-9]/g, '').slice(-8)}.pdf`
})
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
        <AppIcon name="shield" :size="20" />
        <span class="doc-name mono truncate">{{ docName }}</span>
        <div class="spacer" />
        <a
          class="doc-act"
          :href="docUrl"
          :download="docName"
          :title="$t('detail.doc.download')"
        >
          <AppIcon name="download" :size="20" />
        </a>
        <a
          class="doc-act"
          :href="docUrl"
          target="_blank"
          rel="noopener"
          :title="$t('detail.doc.openNew')"
        >
          <AppIcon name="openInNew" :size="20" />
        </a>
      </div>

      <!-- PDF brauzerning o'z ko'ruvchisida chiziladi -->
      <iframe
        v-if="docUrl"
        class="doc-frame"
        :src="`${docUrl}#view=FitH`"
        :title="docName"
      />
      <div v-else class="doc-missing">{{ $t('detail.doc.missing') }}</div>

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
  color: var(--ce8ebf0);
  padding: 2px 7px;
  border: 1px solid var(--c4b5058);
  border-radius: 4px;
}

.doc-act {
  display: flex;
  border: 0;
  background: transparent;
  color: var(--cc8cdd6);
  cursor: pointer;
  transition: color .16s ease;
}

.doc-act:hover {
  color: #fff;
}

.doc-frame {
  display: block;
  width: 100%;
  height: min(72vh, 720px);
  border: 0;
  background: var(--c54595f);
}

.doc-missing {
  padding: 40px 22px;
  text-align: center;
  font-size: 14.5px;
  color: var(--c98a3b6);
  background: var(--c54595f);
}
</style>
