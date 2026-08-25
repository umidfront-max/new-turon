import { createRouter, createWebHistory } from 'vue-router'
import { watch } from 'vue'
import i18n, { t } from '@/i18n'
import { queueFromSlug } from '@/data/queues'
import { useAuth } from '@/stores/useAuth'
import LoginView from '@/views/LoginView.vue'
import NotificationsView from '@/views/NotificationsView.vue'
import NotFoundView from '@/views/NotFoundView.vue'
import ApplicationsView from '@/views/ApplicationsView.vue'
import ApplicationDetailView from '@/views/ApplicationDetailView.vue'
import NewApplicationView from '@/views/NewApplicationView.vue'
import DraftsView from '@/views/DraftsView.vue'
import ReasonsView from '@/views/ReasonsView.vue'
import DashboardView from '@/views/DashboardView.vue'
import StubView from '@/views/StubView.vue'

const routes = [
  {
    path: '/login',
    name: 'login',
    component: LoginView,
    // blank: layoutsiz (topbar/sidebar yo'q), public: kirmagan holda ham ochiladi
    meta: { titleKey: 'login.title', blank: true, public: true }
  },
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
    path: '/notifications',
    name: 'notifications',
    component: NotificationsView,
    meta: { titleKey: 'notify.pageTitle' }
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
    component: DashboardView,
    meta: { titleKey: 'stub.dashboard.title' }
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: NotFoundView,
    meta: { titleKey: 'notFound.title' }
  }
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

// kirmagan foydalanuvchi faqat /login ni ko'radi
router.beforeEach((to) => {
  const { isAuthed } = useAuth()
  if (to.meta.public) return isAuthed.value ? { path: '/' } : true
  if (isAuthed.value) return true
  return { path: '/login', query: to.fullPath === '/' ? {} : { next: to.fullPath } }
})

router.afterEach(applyTitle)

// til almashganda sarlavha ham yangilansin
watch(i18n.global.locale, () => applyTitle(router.currentRoute.value))

export default router
