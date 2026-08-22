import { createRouter, createWebHistory } from 'vue-router'
import { watch } from 'vue'
import i18n, { t } from '@/i18n'
import ApplicationsView from '@/views/ApplicationsView.vue'
import DraftsView from '@/views/DraftsView.vue'
import ApplicationDetailView from '@/views/ApplicationDetailView.vue'
import StubView from '@/views/StubView.vue'

const routes = [
  {
    path: '/',
    name: 'applications',
    component: ApplicationsView,
    meta: { titleKey: 'nav.all' }
  },
  {
    path: '/qoralamalar',
    name: 'drafts',
    component: DraftsView,
    meta: { titleKey: 'drafts.title' }
  },
  {
    path: '/ariza',
    name: 'application-detail',
    component: ApplicationDetailView,
    meta: { titleKey: 'stub.detail.title' }
  },
  {
    path: '/yangi',
    name: 'application-new',
    component: StubView,
    props: {
      screen: 'new',
      icon: 'docPlus',
      blocks: ['info', 'applicant', 'requisite']
    },
    meta: { titleKey: 'stub.new.title' }
  },
  {
    path: '/rahbar',
    name: 'dashboard',
    component: StubView,
    props: {
      screen: 'dashboard',
      icon: 'chart',
      blocks: ['kpi', 'rating', 'split', 'feed']
    },
    meta: { titleKey: 'stub.dashboard.title' }
  },
  { path: '/:pathMatch(.*)*', redirect: '/' }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior: () => ({ top: 0 })
})

function applyTitle(route) {
  document.title = route?.meta?.titleKey
    ? `${t(route.meta.titleKey)} · TURON CYBER`
    : t('app.defaultTitle')
}

router.afterEach(applyTitle)

// til almashganda sarlavha ham yangilansin
watch(i18n.global.locale, () => applyTitle(router.currentRoute.value))

export default router
