<script setup>
import { computed } from 'vue'

// Barcha ikonkalar asl dizayndagi yo'llardan olingan (24x24, stroke uslubi).
const ICONS = {
  inbox: '<path d="M4 7a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2z" stroke-linejoin="round"/><path d="M4 10h16" stroke-linecap="round"/><path d="M12 12v3.6M9.9 13.4 12 15.6l2.1-2.2" stroke-linecap="round" stroke-linejoin="round"/>',
  clock: '<circle cx="12" cy="12" r="8"/><path d="M12 8.5v3.7l3.4 2" stroke-linecap="round" stroke-linejoin="round"/>',
  lock: '<rect x="4" y="9.5" width="16" height="11.5" rx="4"/><path d="M8 9.5V7.5a4 4 0 0 1 8 0v2"/>',
  refresh: '<path d="M19 12a7 7 0 1 1-2.05-4.95" stroke-linecap="round"/><path d="M19 4.5V9h-4.5" stroke-linecap="round" stroke-linejoin="round"/>',
  alarm: '<path d="M12 4a4 4 0 0 1 4 4l-1 4.2a3 3 0 0 1-6 0L8 8a4 4 0 0 1 4-4z" stroke-linejoin="round"/><circle cx="12" cy="19" r="2"/>',
  list: '<rect x="3" y="5" width="18" height="14" rx="3"/><path d="M3 10h18M7 15h5" stroke-linecap="round"/>',
  docPlus: '<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" stroke-linejoin="round"/><path d="M14 3v5h5"/><path d="M12 12v5.5M9.2 14.7h5.6" stroke-linecap="round"/>',
  docLines: '<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" stroke-linejoin="round"/><path d="M14 3v5h5"/><path d="M8.5 13h7M8.5 16.5h5" stroke-linecap="round"/>',
  doc: '<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" stroke-linejoin="round"/><path d="M14 3v5h5"/>',
  chart: '<path d="M4 19V5M20 19H4" stroke-linecap="round"/><rect x="7" y="12" width="3.4" height="5" rx="1"/><rect x="13" y="8" width="3.4" height="9" rx="1"/>',
  back: '<path d="M9 6 4 11l5 5" stroke-linecap="round" stroke-linejoin="round"/><path d="M4 11h10a6 6 0 0 1 6 6v1" stroke-linecap="round"/>',
  bank: '<path d="M3 5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" stroke-linejoin="round"/><path d="M5 11v10h14V11" stroke-linejoin="round"/><path d="M9.5 21v-4.5a2.5 2.5 0 0 1 5 0V21" stroke-linejoin="round"/>',
  book: '<path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5z" stroke-linejoin="round"/><path d="M9 8h6" stroke-linecap="round"/>',
  bell: '<path d="M18 13.2V10a6 6 0 1 0-12 0v3.2l-2.2 3.6a.5.5 0 0 0 .43.75h15.54a.5.5 0 0 0 .43-.75z" stroke-linejoin="round"/><path d="M9.5 20a2.5 2.5 0 0 0 5 0"/>',
  chevronDown: '<path d="M7 10l5 5 5-5" stroke-linecap="round" stroke-linejoin="round"/>',
  chevronLeft: '<path d="M14.5 6l-6 6 6 6" stroke-linecap="round" stroke-linejoin="round"/>',
  chevronRight: '<path d="M9.5 6l6 6-6 6" stroke-linecap="round" stroke-linejoin="round"/>',
  collapseLeft: '<path d="M14 6l-6 6 6 6" stroke-linecap="round" stroke-linejoin="round"/>',
  collapseRight: '<path d="M10 6l6 6-6 6" stroke-linecap="round" stroke-linejoin="round"/>',
  logout: '<path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" stroke-linecap="round"/><path d="M10 17l5-5-5-5M15 12H3" stroke-linecap="round" stroke-linejoin="round"/>',
  login: '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" stroke-linecap="round"/><path d="M16 17l5-5-5-5M21 12H9" stroke-linecap="round" stroke-linejoin="round"/>',
  filter: '<path d="M5 4v9M5 16.5v3.5M12 4v3M12 11v9M19 4v9M19 17v3" stroke-linecap="round"/><circle cx="5" cy="14.5" r="2"/><circle cx="12" cy="9" r="2"/><circle cx="19" cy="15" r="2"/>',
  download: '<path d="M12 4v11M7.5 10.5 12 15l4.5-4.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M5 20h14" stroke-linecap="round"/>',
  calendar: '<rect x="3" y="6" width="18" height="15" rx="2.5"/><path d="M4 11h16M9 16h6" stroke-linecap="round"/><path d="M8 3v4M16 3v4" stroke-linecap="round"/>',
  sun: '<path d="M12 4.5v2M12 17.5v2M4.5 12h2M17.5 12h2M6.9 6.9l1.4 1.4M15.7 15.7l1.4 1.4M17.1 6.9l-1.4 1.4M8.3 15.7l-1.4 1.4" stroke-linecap="round"/><circle cx="12" cy="12" r="3.6"/>',
  moon: '<path d="M20 14.4A8.5 8.5 0 0 1 9.6 4 8.8 8.8 0 1 0 20 14.4z" stroke-linecap="round" stroke-linejoin="round"/>',
  plus: '<path d="M12 5v14M5 12h14" stroke-linecap="round"/>',
  trash: '<path d="M5.5 7.5h13M9.5 7.5V5.2h5v2.3M7 7.5l.8 12h8.4l.8-12" stroke-linecap="round" stroke-linejoin="round"/>',
  check: '<path d="M5 12.5l4.5 4.5L19 7" stroke-linecap="round" stroke-linejoin="round"/>',
  close: '<path d="M6 6l12 12M18 6 6 18" stroke-linecap="round" stroke-linejoin="round"/>',
  warn: '<path d="M12 7.5v6M12 16.6v.3" stroke-linecap="round" stroke-linejoin="round"/>',
  eye: '<path d="M2.5 12S6 5.8 12 5.8 21.5 12 21.5 12 18 18.2 12 18.2 2.5 12 2.5 12z" stroke-linejoin="round"/><circle cx="12" cy="12" r="3"/>',
  send: '<path d="M4 12l16-7-7 16-2.6-6.4z" stroke-linejoin="round"/>',
  menu: '<path d="M4 7h16M4 12h16M4 17h16" stroke-linecap="round"/>',
  search: '<circle cx="11" cy="11" r="6.5"/><path d="M16 16l4 4" stroke-linecap="round"/>',
  user: '<circle cx="12" cy="8.2" r="3.7"/><path d="M4.8 20a7.2 7.2 0 0 1 14.4 0" stroke-linecap="round"/>',
  card: '<rect x="3" y="5.5" width="18" height="13" rx="3"/><path d="M3 10h18" stroke-linecap="round"/><path d="M6.5 14.6h3.4" stroke-linecap="round"/>',
  chat: '<path d="M20 11.6a6.6 6.6 0 0 1-6.6 6.6H9.2L5 21.2v-4.1a6.6 6.6 0 0 1 1.9-11.4 6.6 6.6 0 0 1 2.3-.4h4.2A6.6 6.6 0 0 1 20 11.6z" stroke-linejoin="round"/>',
  play: '<path d="M9 6.4 18 12l-9 5.6z" stroke-linejoin="round"/>',
  pause: '<rect x="8" y="6" width="3" height="12" rx="1.2"/><rect x="13" y="6" width="3" height="12" rx="1.2"/>',
  shield: '<path d="M12 3.6 19 6.1v5.4c0 4-2.9 7.5-7 8.9-4.1-1.4-7-4.9-7-8.9V6.1z" stroke-linejoin="round"/>',
  swap: '<path d="M4.5 9h12m-3.2-3.4L16.8 9l-3.5 3.4" stroke-linecap="round" stroke-linejoin="round"/><path d="M19.5 15h-12m3.2-3.4L7.2 15l3.5 3.4" stroke-linecap="round" stroke-linejoin="round"/>',
  volume: '<path d="M5 9.6h3L12 6.2v11.6L8 14.4H5z" stroke-linejoin="round"/><path d="M15.4 9.6a3.6 3.6 0 0 1 0 4.8" stroke-linecap="round"/>',
  bookmark: '<path d="M7 4h10v16.2l-5-3.6-5 3.6z" stroke-linejoin="round"/>',
  phone: '<path d="M7.2 4h2.9l1.5 3.9-2 1.5a11.3 11.3 0 0 0 5 5l1.5-2 3.9 1.5v2.9a2 2 0 0 1-2.2 2A15.2 15.2 0 0 1 5.2 6.2 2 2 0 0 1 7.2 4z" stroke-linejoin="round"/>',
  pin: '<path d="M12 20.8s6.6-5.4 6.6-10.4a6.6 6.6 0 1 0-13.2 0c0 5 6.6 10.4 6.6 10.4z" stroke-linejoin="round"/><circle cx="12" cy="10.1" r="2.5"/>'
}

const props = defineProps({
  name: { type: String, required: true },
  size: { type: [Number, String], default: 20 },
  width: { type: [Number, String], default: 1.5 }
})

const markup = computed(() => ICONS[props.name] || '')
</script>

<template>
  <svg
    class="app-icon"
    :width="size"
    :height="size"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    :stroke-width="width"
    aria-hidden="true"
    focusable="false"
    v-html="markup"
  />
</template>

<style scoped>
.app-icon {
  display: block;
  flex: none;
}
</style>
