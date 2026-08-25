// Uch yangi oyna (bloklangan rekvizitlar, tranzaksiya paneli, karta tarixi) uch tilda chiziladi.
const mem = () => { const m = new Map(); return { getItem: k => m.has(k) ? m.get(k) : null, setItem: (k, v) => m.set(k, String(v)), removeItem: k => m.delete(k) } }
globalThis.localStorage = mem(); globalThis.sessionStorage = mem()
globalThis.document = {
  body: { dataset: {} }, documentElement: {}, title: '',
  addEventListener() {}, removeEventListener() {},
  createElement: () => ({ innerHTML: '', content: {}, setAttribute() {}, style: {} }),
  createElementNS: () => ({ setAttribute() {}, style: {} }),
  createTextNode: () => ({}), createComment: () => ({}), querySelector: () => null
}
globalThis.location = { pathname: '/', search: '', hash: '', href: 'http://localhost/', origin: 'http://localhost' }
globalThis.history = { state: {}, pushState() {}, replaceState() {}, scrollRestoration: 'auto', go() {} }
globalThis.addEventListener = () => {}; globalThis.removeEventListener = () => {}; globalThis.scrollTo = () => {}
globalThis.window = globalThis

const { createServer } = await import('vite')
const { renderToString } = await import('vue/server-renderer')
const { createSSRApp, h } = await import('vue')

const vite = await createServer({ server: { middlewareMode: true }, appType: 'custom', logLevel: 'silent' })
const { default: i18n, setLang } = await vite.ssrLoadModule('/src/i18n/index.js')
const { default: Blocked } = await vite.ssrLoadModule('/src/components/detail/BlockedRequisites.vue')
const { default: TxPanel } = await vite.ssrLoadModule('/src/components/detail/TransactionPanel.vue')
const { default: History } = await vite.ssrLoadModule('/src/components/form/CardHistory.vue')
const { detailFor } = await vite.ssrLoadModule('/src/data/detail.js')
const { buildChain } = await vite.ssrLoadModule('/src/data/chain.js')
const { useApplications } = await vite.ssrLoadModule('/src/stores/useApplications.js')

const { items } = useApplications()
const problems = []
let n = 0

async function draw(label, comp, props) {
  const app = createSSRApp({ render: () => h(comp, props) })
  app.use(i18n)
  const html = await renderToString(app)
  n += 1
  if (/\{\{|undefined|NaN|\[object/.test(html)) problems.push(`${label}: shubhali matn`)
  if (/<span class="material-symbols-rounded app-icon"[^>]*><\/span>/.test(html)) problems.push(`${label}: bo'sh ikonka`)
  if (html.length < 400) problems.push(`${label}: juda qisqa (${html.length})`)
  return html
}

// har xil holatdagi arizalar
const ids = ['M0126279/2026-10004', 'M0126284/2026-10008', 'M0126291/2026-10012']

for (const lang of ['uz', 'uzk', 'ru']) {
  setLang(lang)
  for (const id of ids) {
    const row = items.value.find((a) => a.id === id)
    if (!row) { problems.push(`ariza topilmadi: ${id}`); continue }
    const data = detailFor(row)
    const chain = buildChain(data)

    await draw(`${lang} blocked ${id}`, Blocked, { rows: data.blocked })

    const n1 = chain.level1[0]
    await draw(`${lang} tx-l1 ${id}`, TxPanel, { node: n1 })
    await draw(`${lang} tx-l3 ${id}`, TxPanel, { node: n1.children[0].children[0] })

    const dups = items.value.slice(0, 3)
    await draw(`${lang} history ${id}`, History, { card: row.card, rows: dups })
  }
}

// jami summa haqiqatan hisoblanadimi
setLang('uz')
const one = detailFor(items.value[0])
const html = await draw('summa tekshiruvi', Blocked, { rows: one.blocked })
if (!one.blocked.length) problems.push("bloklangan rekvizitlar bo'sh")
if (!html.includes(one.blocked[0].card)) problems.push("birinchi rekvizit jadvalda yo'q")

await vite.close()
console.log(`tekshirildi: ${n} ta oyna (3 til x ${ids.length} ariza)`)
if (problems.length) { console.error(problems.join('\n')); process.exit(1) }
console.log('muammo topilmadi')
