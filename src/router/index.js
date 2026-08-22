import { createRouter, createWebHistory } from 'vue-router'
import { watch } from 'vue'
import i18n, { t } from '@/i18n'
import { queueFromSlug } from '@/data/queues'
import ApplicationsView from '@/views/ApplicationsView.vue'
import ApplicationDetailView from '@/views/ApplicationDetailView.vue'
import NewApplicationView from '@/views/NewApplicationView.vue'
import DraftsView from '@/views/DraftsView.vue'
import ReasonsView from '@/views/ReasonsView.vue'
import StubView from '@/views/StubView.vue'

const routes = [
  {
    path: '/',
    name: 'applications',
    component: ApplicationsView,
    meta: { titleKey: 'nav.all' }
  },
  {
    // navbatlar: /queue/new, /queue/in-bank, /queue/blocked ...
    path: '/queue/:queue',
    name: 'queue',
    component: ApplicationsView
  },
  {
    path: '/application',
    name: 'application-detail',
    component: ApplicationDetailView,
    meta: { titleKey: 'stub.detail.title' }
  },
  {
    path: '/application/new',
    name: 'application-new',
    component: NewApplicationView,
    meta: { titleKey: 'form.title' }
  },
  {
    path: '/drafts',
    name: 'drafts',
    component: DraftsView,
    meta: { titleKey: 'drafts.title' }
  },
  {
    path: '/reasons',
    name: 'reasons',
    component: ReasonsView,
    meta: { titleKey: 'reasons.title' }
  },
  {
    path: '/dashboard',
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

function screenTitle(route) {
  if (route?.name === 'queue') return t(`queues.${queueFromSlug(route.params.queue)}`)
  return route?.meta?.titleKey ? t(route.meta.titleKey) : null
}

function applyTitle(route) {
  const title = screenTitle(route)
  document.title = title ? `${title} · TURON CYBER` : t('app.defaultTitle')
}

router.afterEach(applyTitle)

// til almashganda sarlavha ham yangilansin
watch(i18n.global.locale, () => applyTitle(router.currentRoute.value))

export default router
