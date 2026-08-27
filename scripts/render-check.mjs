// Barcha sahifalarni uch tilda chizib, yo'qolgan kalit va xatolarni topadi.
const mem = () => { const m = new Map(); return { getItem: k => m.has(k) ? m.get(k) : null, setItem: (k, v) => m.set(k, String(v)), removeItem: k => m.delete(k) } }
globalThis.localStorage = mem(); globalThis.sessionStorage = mem()
globalThis.document = {
  body: { dataset: {} }, documentElement: { style: {} }, title: '',
  addEventListener() {}, removeEventListener() {},
  createElement: () => ({ webkitdirectory: false, innerHTML: '', content: {}, setAttribute() {}, style: {} }),
  createElementNS: () => ({ setAttribute() {}, style: {} }),
  createTextNode: () => ({}), createComment: () => ({}), querySelector: () => null
}
globalThis.location = { pathname: '/', search: '', hash: '', href: 'http://localhost/', origin: 'http://localhost' }
// vue-router history.state ni o'qiydi va almashtiradi — u hech qachon undefined bo'lmasligi kerak
let _historyState = {}
globalThis.history = {
  get state() { return _historyState },
  pushState(s) { _historyState = s || {} },
  replaceState(s) { _historyState = s || {} },
  scrollRestoration: 'auto',
  go() {}
}
globalThis.addEventListener = () => {}; globalThis.removeEventListener = () => {}; globalThis.scrollTo = () => {}
globalThis.window = globalThis

const { createServer } = await import('vite')
const { renderToString } = await import('vue/server-renderer')
const { createSSRApp } = await import('vue')

const vite = await createServer({ server: { middlewareMode: true }, appType: 'custom', logLevel: 'silent' })
const { default: App } = await vite.ssrLoadModule('/src/App.vue')
const { default: i18n, setLang } = await vite.ssrLoadModule('/src/i18n/index.js')
const router = (await vite.ssrLoadModule('/src/router/index.js')).default
const { useAuth } = await vite.ssrLoadModule('/src/stores/useAuth.js')
const { useApplications, toNumber } = await vite.ssrLoadModule('/src/stores/useApplications.js')

const auth = useAuth()
const store = useApplications()

async function render(path) {
  const app = createSSRApp(App)
  app.use(i18n).use(router)
  await router.push(path).catch(() => {})
  await router.isReady()
  return { html: await renderToString(app), at: router.currentRoute.value.fullPath }
}

const problems = []

// Vue ogohlantirishlari (yo'q komponent, aniqlanmagan o'zgaruvchi) ham xato hisoblanadi
const vueWarnings = new Set()
const realWarn = console.warn
console.warn = (...args) => {
  const text = args.map(String).join(' ')
  if (text.includes('[Vue warn]')) vueWarnings.add(text.split(String.fromCharCode(10))[0].trim())
  else realWarn(...args)
}
let n = 0

/* guard */
auth.signOut()
const guard = await render('/drafts')
if (!guard.at.startsWith('/login')) problems.push('guard ishlamadi: ' + guard.at)

auth.signIn({ name: 'Test', role: 'staff', method: 'password', login: 't@t.uz', remember: true })

const PATHS = [
  '/', '/queue/new', '/queue/in-bank', '/queue/returned', '/queue/blocked',
  '/queue/autopayment', '/queue/cancelled', '/queue/completed', '/queue/overdue',
  '/application?id=' + encodeURIComponent('M0126284/2026-10008') + '&tab=bank',
  '/application?id=' + encodeURIComponent('M0126279/2026-10004') + '&tab=bank',
  '/application?id=' + encodeURIComponent('M0126290/2026-10011') + '&tab=workflow',
  '/application?id=' + encodeURIComponent('M0126279/2026-10004') + '&tab=sanctions',
  '/application?id=' + encodeURIComponent('M0126279/2026-10004') + '&tab=transactions',
  '/application?id=' + encodeURIComponent('M0126291/2026-10012') + '&tab=transactions',
  '/application?id=yoq-bunday-ariza',
  '/application/new', '/drafts', '/reasons', '/notifications', '/dashboard',
  '/admin', '/admin/users', '/admin/logs', '/admin/banks', '/admin/settings',
  '/bunday-sahifa-yoq'
]

for (const lang of ['uz', 'uzk', 'ru']) {
  setLang(lang)
  for (const role of ['staff', 'exec', 'admin', 'sadmin']) {
    auth.signIn({ name: 'Test', role, method: 'password', login: 't@t.uz', remember: true })
    for (const path of PATHS) {
      const { html } = await render(path)
      n += 1
      const body = html.slice(html.indexOf('class="content'))
      if (/\{\{|undefined|NaN|\[object/.test(body)) problems.push(`${lang}/${role} ${path}: shubhali matn`)
      // bo'sh ikonka = jadvalda topilmagan glif
      const emptyIcons = (body.match(/material-symbols-rounded[^>]*><\/span>/g) || []).length
      if (emptyIcons) problems.push(`${lang}/${role} ${path}: ${emptyIcons} ta bo'sh ikonka`)
      const small = path.includes('yoq') || path.includes('sahifa-yoq')
      if (body.length < (small ? 600 : 1200)) problems.push(`${lang}/${role} ${path}: juda qisqa (${body.length})`)
    }
  }
}

/* jadval: bir sahifada 10 qator va sahifalagich raqamlari */
auth.signIn({ name: 'Test', role: 'staff', method: 'password', login: 't@t.uz', remember: true })
setLang('uz')
const list = await render('/')
const rowCount = (list.html.match(/class="num mono"/g) || []).length
if (rowCount !== 10) problems.push(`bosh sahifada ${rowCount} qator (10 kutilgan)`)
const pagerPages = (list.html.match(/class="page"/g) || []).length
if (pagerPages < 3) problems.push(`sahifalagichda ${pagerPages} raqam`)
if (!list.html.includes('1&ndash;10') && !list.html.includes('1–10')) problems.push('oraliq ko\'rsatkichi yo\'q')

/* navbat sahifasi sanoq bilan mos */
const blocked = await render('/queue/blocked')
const blockedRows = (blocked.html.match(/class="num mono"/g) || []).length
const expected = Math.min(10, store.counts.value.blocked)
if (blockedRows !== expected) problems.push(`bloklangan navbatda ${blockedRows} qator (${expected} kutilgan)`)

/*
  Holat manzilda: reyestr bitta sahifa, tab/qidiruv/filtr/sahifa hammasi
  `?...` da turadi. Sahifa yangilanganda shu qiymatlar tiklanishi kerak.
*/
const rows = (r) => (r.html.match(/class="num mono"/g) || []).length

const byTab = await render('/?tab=blocked')
if (rows(byTab) !== expected) problems.push(`?tab=blocked: ${rows(byTab)} qator (${expected} kutilgan)`)

const wide = await render('/?tab=blocked&per=20')
const wideExpected = Math.min(20, store.counts.value.blocked)
if (rows(wide) !== wideExpected) problems.push(`?per=20: ${rows(wide)} qator (${wideExpected} kutilgan)`)

const second = await render('/?page=2&per=5')
if (rows(second) !== 5) problems.push(`?page=2&per=5: ${rows(second)} qator (5 kutilgan)`)
if (!second.html.includes('6–10') && !second.html.includes('6&ndash;10')) {
  problems.push('?page=2&per=5: oraliq 6-10 emas')
}

const searched = await render('/?q=karimova')
if (!rows(searched)) problems.push('?q=karimova: hech narsa topilmadi')

const byFilter = await render('/?f_status=blocked')
if (rows(byFilter) !== expected) problems.push(`?f_status=blocked: ${rows(byFilter)} qator (${expected} kutilgan)`)

// summa oralig'i ham manzildan: af — million so'mda
const bigCount = store.items.value.filter((a) => toNumber(a.amount) >= 20 * 1000000).length
const byAmount = await render('/?af=20')
if (rows(byAmount) !== Math.min(10, bigCount)) {
  problems.push(`?af=20: ${rows(byAmount)} qator (${Math.min(10, bigCount)} kutilgan)`)
}

/* topilmagan ariza */
const missing = await render('/application?id=yoq')
if (!missing.html.includes('not-found-title')) problems.push('ariza topilmadi holati chiqmadi')

/* 404 */
const nf = await render('/qwerty')
if (!nf.html.includes('404')) problems.push('404 sahifasi chiqmadi')

console.warn = realWarn
vueWarnings.forEach((w) => problems.push('vue: ' + w))

console.log(`tekshirildi: ${n} ta sahifa (3 til x 4 rol x ${PATHS.length} yo'l)`)
console.log(`bosh sahifa: ${rowCount} qator, ${pagerPages} sahifa raqami`)
console.log(problems.length ? 'XATO:\n' + problems.join('\n') : 'muammo topilmadi')

await vite.close()
process.exit(problems.length ? 1 : 0)
