<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import AppIcon from '@/components/ui/AppIcon.vue'
import SidebarLink from './SidebarLink.vue'
import { useUi } from '@/stores/useUi'
import { useApplications } from '@/stores/useApplications'
import { BLOCK_REASONS } from '@/data/reasons'

const route = useRoute()
const { t } = useI18n()
const { state, isExec, isStaff, toggleSidebar, setMobileNav, toast } = useUi()
const { counts, drafts } = useApplications()

function otherModule() {
  toast(t('modules.soon'), 'warn')
}

// mobil rejimda menyu doim to'liq ko'rinadi
const compact = computed(() => !state.sidebarOpen && !state.mobileNavOpen)

const collapseTip = computed(() => (state.sidebarOpen ? t('nav.collapse') : t('nav.expand')))

const isActive = (path) => route.path === path

function go() {
  setMobileNav(false)
}
</script>

<template>
  <aside class="sidebar" :class="{ compact, 'mobile-open': state.mobileNavOpen }">
    <!-- skroll qismi: yig'ish tugmasi undan tashqarida turadi, aks holda kesiladi -->
    <div class="nav-scroll thin-scroll">
      <!-- modul almashtirgich -->
      <div class="module" :class="{ compact }">
        <template v-if="!compact">
          <button type="button" class="mod-btn" @click="otherModule">{{ $t('modules.complaint') }}</button>
          <button type="button" class="mod-btn on">{{ $t('modules.cardblock') }}</button>
        </template>
        <div v-else class="mod-mini">{{ $t('modules.short') }}</div>
      </div>

      <SidebarLink
        v-if="isExec"
        icon="chart"
        :label="$t('nav.dashboard')"
        to="/dashboard"
        :active="isActive('/dashboard')"
        :compact="compact"
        @click="go"
      />

      <SidebarLink
        icon="list"
        :label="$t('nav.all')"
        :count="counts.all"
        to="/"
        :active="isActive('/')"
        :compact="compact"
        @click="go"
      />

      <template v-if="isStaff">
        <SidebarLink
          icon="docPlus"
          :label="$t('nav.add')"
          to="/application/new"
          :active="isActive('/application/new')"
          :compact="compact"
          @click="go"
        />
        <SidebarLink
          icon="docLines"
          :label="$t('nav.drafts')"
          :count="drafts.length"
          to="/drafts"
          :active="isActive('/drafts')"
          :compact="compact"
          @click="go"
        />
      </template>

      <div class="rule" :class="{ visible: compact }" />
      <div v-if="!compact" class="group-label">
        {{ isExec ? $t('nav.groupAttention') : $t('nav.groupTasks') }}
      </div>

      <SidebarLink
        icon="inbox"
        :label="$t('nav.newApps')"
        :count="counts.new || 0"
        count-tone="danger"
        to="/queue/new"
        :active="isActive('/queue/new')"
        :compact="compact"
        @click="go"
      />
      <SidebarLink
        icon="back"
        :label="$t('nav.returned')"
        :count="counts.error || 0"
        count-tone="danger"
        to="/queue/returned"
        :active="isActive('/queue/returned')"
        :compact="compact"
        @click="go"
      />

      <div class="rule" :class="{ visible: compact }" />
      <div v-if="!compact" class="group-label">{{ $t('nav.groupStatus') }}</div>

      <SidebarLink
        icon="bank"
        :label="$t('nav.inBank')"
        :count="counts.pending || 0"
        to="/queue/in-bank"
        :active="isActive('/queue/in-bank')"
        :compact="compact"
        @click="go"
      />
      <SidebarLink
        icon="lock"
        :label="$t('nav.blocked')"
        :count="counts.blocked || 0"
        count-tone="success"
        to="/queue/blocked"
        :active="isActive('/queue/blocked')"
        :compact="compact"
        @click="go"
      />
      <SidebarLink
        icon="refresh"
        :label="$t('nav.autopayment')"
        :count="counts.autopayment || 0"
        to="/queue/autopayment"
        :active="isActive('/queue/autopayment')"
        :compact="compact"
        @click="go"
      />

      <template v-if="isStaff">
        <div class="rule" :class="{ visible: compact }" />
        <div v-if="!compact" class="group-label">{{ $t('nav.groupReference') }}</div>
        <SidebarLink
          icon="book"
          :label="$t('nav.reasons')"
          :count="BLOCK_REASONS.length"
          to="/reasons"
          :active="isActive('/reasons')"
          :compact="compact"
          @click="go"
        />
      </template>
    </div>

    <!-- yig'ish tugmasi (faqat desktopda) -->
    <button
      type="button"
      class="collapse"
      :title="collapseTip"
      @click="toggleSidebar"
    >
      <AppIcon :name="state.sidebarOpen ? 'collapseLeft' : 'collapseRight'" :size="18" />
    </button>

    <!-- mobil yopish -->
    <button type="button" class="close-mobile" :aria-label="$t('nav.closeMenu')" @click="setMobileNav(false)">
      <AppIcon name="close" :size="20" />
    </button>
  </aside>
</template>

<style scoped>
.sidebar {
  width: var(--sidebar-w);
  flex: 0 0 var(--sidebar-w);
  background: var(--brand-a);
  position: relative;
  /* tugma chetga chiqib turadi — shu sababli aside kesmaydi */
  overflow: visible;
  transition: flex-basis .22s var(--ease), width .22s var(--ease);
}

.nav-scroll {
  height: 100%;
  padding: 16px 0 28px;
  overflow-y: auto;
  overflow-x: hidden;
  scrollbar-width: thin;
}

.sidebar.compact {
  width: var(--sidebar-w-collapsed);
  flex-basis: var(--sidebar-w-collapsed);
}

/* modul almashtirgich */
.module {
  display: flex;
  gap: 7px;
  padding: 0 14px 16px;
  margin-bottom: 8px;
  border-bottom: 1px solid rgba(255, 255, 255, .10);
}

.module.compact {
  justify-content: center;
  padding: 0 10px 16px;
}

.mod-btn {
  flex: 1;
  padding: 11px 0;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, .16);
  background: transparent;
  color: #94a6c2;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: background .18s ease, color .18s ease, border-color .18s ease;
}

.mod-btn:hover {
  background: rgba(255, 255, 255, .07);
  color: #fff;
}

.mod-btn.on {
  border-color: var(--brand-ring);
  background: var(--brand-active);
  color: #fff;
  font-weight: 600;
}

.mod-mini {
  width: 44px;
  height: 44px;
  border-radius: 10px;
  border: 1px solid var(--brand-ring);
  background: var(--brand-active);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
}

.rule {
  height: 0;
  margin: 10px 16px;
  background: rgba(255, 255, 255, .09);
}

.rule.visible {
  height: 1px;
}

.group-label {
  padding: 20px 24px 8px;
  font-size: 13px;
  font-weight: 700;
  letter-spacing: .10em;
  text-transform: uppercase;
  color: var(--brand-label);
  white-space: nowrap;
}

.collapse {
  position: absolute;
  top: 74px;
  right: -15px;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: var(--s-card);
  border: 1px solid var(--cc3cbd8);
  color: var(--c1c2b45);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 2px 6px rgba(5, 12, 28, .18);
  z-index: 6;
  transition: border-color .16s ease, background .16s ease, transform .16s var(--ease);
}

.collapse:hover {
  border-color: var(--c23568f);
  background: var(--cf8fafc);
  transform: scale(1.08);
}

.close-mobile {
  display: none;
  position: absolute;
  top: 14px;
  right: 14px;
  width: 34px;
  height: 34px;
  border-radius: 9px;
  border: 1px solid rgba(255, 255, 255, .18);
  background: rgba(255, 255, 255, .08);
  color: #c9d9ec;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

/* ---------- responsive: chekka menyu ---------- */
@media (max-width: 1024px) {
  .sidebar {
    position: fixed;
    top: 0;
    bottom: 0;
    left: 0;
    z-index: 120;
    width: 272px;
    flex-basis: 272px;
    transform: translateX(-100%);
    transition: transform .26s var(--ease);
    box-shadow: 0 0 40px rgba(5, 12, 28, .4);
  }

  .sidebar.mobile-open {
    transform: translateX(0);
  }

  .nav-scroll {
    padding-top: 60px;
  }

  .collapse {
    display: none;
  }

  .close-mobile {
    display: flex;
  }
}
</style>
