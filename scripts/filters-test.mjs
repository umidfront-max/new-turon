/*
  Filtrlar paneli tekshiruvi:
    - summa oralig'i mantiqan to'g'ri ishlaydimi (mln -> so'm),
    - tanlovlar server parametrlariga qanday o'giriladi,
    - panel uchala tilda chizilib, barcha guruhlar chiqadimi.
*/
const mem = () => { const m = new Map(); return { getItem: k => m.has(k)?m.get(k):null, setItem:(k,v)=>m.set(k,String(v)), removeItem:k=>m.delete(k) } }
globalThis.localStorage = mem(); globalThis.sessionStorage = mem()
globalThis.document = { body:{dataset:{}}, documentElement:{ style:{} }, title:'', addEventListener(){}, removeEventListener(){}, createElement:()=>({style:{},setAttribute(){}}), querySelector:()=>null }
globalThis.location = { href:'http://localhost/', origin:'http://localhost', pathname:'/', search:'', hash:'' }
globalThis.window = globalThis
globalThis.addEventListener = () => {}
globalThis.removeEventListener = () => {}

const { createServer } = await import('vite')
const { renderToString } = await import('vue/server-renderer')
const { createSSRApp } = await import('vue')

const vite = await createServer({ server: { middlewareMode: true }, appType: 'custom', logLevel: 'silent' })

const { APPLICATIONS, FILTER_GROUPS } = await vite.ssrLoadModule('/src/data/applications.js')
const { filterApplications } = await vite.ssrLoadModule('/src/utils/table.js')
const { useRegistry } = await vite.ssrLoadModule('/src/stores/useRegistry.js')
const { registryPage } = await vite.ssrLoadModule('/src/utils/adapt.js')
// ma'lumotda summa "12 500 000" ko'rinishidagi matn — solishtirish uchun songa o'giramiz
const { toNumber } = await vite.ssrLoadModule('/src/stores/useApplications.js')
const { default: i18n, setLang } = await vite.ssrLoadModule('/src/i18n/index.js')
const { default: FilterPanel } = await vite.ssrLoadModule('/src/components/applications/FilterPanel.vue')

const fail = []
const ok = (cond, msg) => { if (!cond) fail.push(msg) }

const MLN = 1000000
const items = APPLICATIONS

/* ---------- guruhlar ---------- */

const keys = FILTER_GROUPS.map((g) => g.key)
ok(!keys.includes('amount'), "zarar summasi ro'yxat bo'lib qolgan — u oraliq filtri")
ok(keys.length === 7, `guruhlar soni ${keys.length} (7 kutilgan): ${keys.join(', ')}`)

/* ---------- summa oralig'i ---------- */

const sums = items.map((a) => toNumber(a.amount))
const lo = 5, hi = 20   // mln

const from = filterApplications(items, { amount: { from: String(lo), to: '' } })
ok(from.length === sums.filter((s) => s >= lo * MLN).length, '"dan" chegarasi xato')
ok(from.every((a) => toNumber(a.amount) >= lo * MLN), '"dan" chegarasidan past ariza o\'tib ketdi')

const to = filterApplications(items, { amount: { from: '', to: String(hi) } })
ok(to.every((a) => toNumber(a.amount) <= hi * MLN), '"gacha" chegarasidan baland ariza o\'tib ketdi')

const both = filterApplications(items, { amount: { from: String(lo), to: String(hi) } })
ok(both.length === sums.filter((s) => s >= lo * MLN && s <= hi * MLN).length, 'oraliq xato')
ok(both.length > 0 && both.length < items.length, `oraliq hech narsani kesmadi: ${both.length}/${items.length}`)

const empty = filterApplications(items, { amount: { from: '', to: '' } })
ok(empty.length === items.length, "bo'sh oraliq ham arizalarni kesib tashladi")

// oraliq boshqa filtrlar bilan birga
const mixed = filterApplications(items, {
  picked: { status: ['blocked'] },
  amount: { from: String(lo), to: '' }
})
ok(mixed.every((a) => a.status === 'blocked' && toNumber(a.amount) >= lo * MLN), 'oraliq + status birga ishlamadi')

/* ---------- server parametrlari ---------- */

const { toParams } = useRegistry()

/*
  Parametr nomlari Swagger'dan tekshirilgan (/api/schema/):
    ishlaydi   — status__in, method__in, source__in, region__in, basis__in,
                 crime_type__in, bank, intake_type, amount_min, amount_max,
                 is_overdue, tab, process_tab, search
    e'tiborsiz — bank__in, intake_type__in, damage_amount__gte/__lte,
                 has_duplicate (server ularni jimgina tashlab yuboradi)
*/

const p1 = toParams({
  picked: {
    status: ['blocked', 'new'],
    method: [3, 4],
    region: [1],
    bank: [2],
    intake_type: ['manual']
  },
  amount: { from: '5', to: '20' }
})
ok(p1.method__in === '3,4', `method__in xato: ${p1.method__in}`)
ok(p1.region__in === '1', `region__in xato: ${p1.region__in}`)
ok(String(p1.status__in).includes(','), `status__in bitta qiymatga aylanib qoldi: ${p1.status__in}`)
ok(p1.amount_min === 5 * MLN, `amount_min xato: ${p1.amount_min}`)
ok(p1.amount_max === 20 * MLN, `amount_max xato: ${p1.amount_max}`)
ok(!('damage_amount__gte' in p1), "serverda yoq damage_amount__gte yuborilyapti")

// bank va qabul turida `__in` yo'q — bittadan yuboriladi
ok(p1.bank === 2, `bank xato: ${p1.bank}`)
ok(!('bank__in' in p1), "server etiborsiz qoldiradigan bank__in yuborilyapti")
ok(p1.intake_type === 'manual', `intake_type xato: ${p1.intake_type}`)
ok(!('intake_type__in' in p1), 'intake_type__in yuborilyapti')

const p2 = toParams({ amount: { from: '', to: '' } })
ok(!('amount_min' in p2) && !('amount_max' in p2), "bo'sh oraliq ham serverga ketdi")

// navbat chiplari: `status=`/`is_overdue=` emas, `tab=`/`process_tab=`.
// Aks holda server qolgan chiplarning sanog'ini nolga tushirib yuboradi.
const p3 = toParams({ queue: 'autopayment' })
ok(p3.tab === 'auto_payment', `tab xato: ${p3.tab}`)
ok(!('status' in p3), 'navbat status= bilan yuborilyapti')

const p4 = toParams({ queue: 'overdue' })
ok(p4.process_tab === 'overdue', `process_tab xato: ${p4.process_tab}`)
ok(!('is_overdue' in p4), 'navbat is_overdue= bilan yuborilyapti')

const p5 = toParams({ queue: 'all' })
ok(!('tab' in p5) && !('process_tab' in p5), "'barchasi' uchun tab yuborilyapti")

// muddat filtri: facets'dagi 'yes'/'no' ham, mahalliy 'breached' ham
ok(toParams({ picked: { sla: ['yes'] } }).is_overdue === true, "sla 'yes' -> is_overdue")
ok(toParams({ picked: { sla: ['no'] } }).is_overdue === false, "sla 'no' -> is_overdue")
ok(toParams({ picked: { sla: ['breached'] } }).is_overdue === true, "mahalliy 'breached' -> is_overdue")
ok(!('is_overdue' in toParams({ picked: { sla: ['yes', 'no'] } })),
  'ikkala muddat tanlanganda cheklov qolib ketdi')

// takroriylik alohida parametr emas — status ro'yxatidagi 'duplicate'
ok(!('has_duplicate' in toParams({ picked: { repeat: ['duplicate'] } })),
  "serverda yoq has_duplicate yuborilyapti")

// hudud manzildan: server raqamli id kutadi
ok(toParams({ region: '3' }).region === 3, 'raqamli hudud uzatilmadi')
ok(!('region' in toParams({ region: 'tashkentCity' })),
  'mahalliy hudud kaliti serverga ketdi')

/* ---------- panel uchala tilda ---------- */

for (const lang of ['uz', 'uzk', 'ru']) {
  setLang(lang)
  const app = createSSRApp(FilterPanel)
  app.use(i18n)
  const html = await renderToString(app)

  const controls = (html.match(/class="ms-control[^"]*"/g) || []).length
  ok(controls === keys.length, `${lang}: ${controls} ta ro'yxat (${keys.length} kutilgan)`)

  const labels = (html.match(/class="ms-label"/g) || []).length
  ok(labels === keys.length, `${lang}: ${labels} ta sarlavha`)

  ok((html.match(/class="famount-input"/g) || []).length === 2, `${lang}: summa maydonlari yo'q`)
  ok(html.includes('famount-label'), `${lang}: summa sarlavhasi yo'q`)
  ok(html.includes('btn-dark') && html.includes('btn-light'), `${lang}: tugmalar yo'q`)

  // tarjima kaliti matn o'rniga chiqib qolmasin
  ok(!html.includes('filters.'), `${lang}: tarjima qilinmagan kalit ko'rinib turibdi`)
  // yopiq holatda ro'yxat ochilmagan bo'lishi kerak
  ok(!html.includes('ms-pop'), `${lang}: ro'yxat yopiq holatda ochiq chiqdi`)
}

/* ---------- server facets'i ustidan ---------- */

// haqiqiy javobdan olingan qisqartma
const FACETS = {
  method: [{ value: 1, label: 'Test', count: 3 }],
  source: [{ value: 1, label: 'Test', count: 3 }],
  region: [{ value: 1, label: 'Tashkent', count: 3 }],
  bank: [{ value: 1, label: 'Milliy Bank', count: 0 }],
  status: [
    { value: 'new', label: 'Yangi', count: 3 },
    { value: 'auto_payment', label: "Avtomatik to'lov", count: 1 },
    { value: 'canceled', label: 'Bekor qilingan', count: 0 }
  ],
  basis: [{ value: 'application', label: 'Ariza', count: 3 }],
  crime_type: [{ value: 'cyber_theft', label: "Kiber o'g'irlik", count: 3 }],
  intake_type: [{ value: 'manual', label: "Xodim tomonidan qo'lda kiritilgan", count: 3 }],
  // sla/duplicate/amount qatorlarida `value` emas, `key` keladi
  sla: [
    { key: 'yes', label: "Muddati o'tgan", count: 0 },
    { key: 'no', label: 'Muddatida', count: 4 }
  ]
}

/*
  Holat qo'lda emas, haqiqiy adapter orqali to'ldiriladi: `queueTab` chip
  kalitlarini o'zgartiradi (`overdue` -> `new`, server kaliti `apiKey` da
  qoladi), qo'lda yozilgan stub buni yashirib qo'yardi.
*/
const registry = useRegistry()
const page = registryPage({
  count: 4,
  results: [],
  facets: FACETS,
  tabs: [{ key: 'all', label: 'Barchasi', count: 4 }],
  process_tabs: [
    { key: 'all', label: 'Barchasi', count: 4 },
    { key: 'overdue', label: "Muddati o'tgan", count: 1 },
    { key: 'queued', label: 'Navbatda', count: 3 }
  ]
}, 1, 10)

registry.state.facets = page.facets
registry.state.processTabs = page.processTabs
registry.state.tabs = page.tabs

const served = registry.facetGroups.value.map((g) => g.key)
ok(served.join(',') === 'status,bank,method,source,region,basis,crime_type,intake_type,sla',
  `facets tartibi xato: ${served.join(',')}`)

// `key` bilan kelgan qatorlar ham qiymatga aylanishi kerak
const slaGroup = registry.facetGroups.value.find((g) => g.key === 'sla')
ok(slaGroup.options[0].value === 'yes' && slaGroup.options[1].count === 4,
  'sla facet qatori qiymatga aylanmadi')

// bank va qabul turi — bittadan tanlanadigan guruhlar
const single = registry.facetGroups.value.filter((g) => g.single).map((g) => g.key)
ok(single.join(',') === 'bank,intake_type', `bittadan tanlanadigan guruhlar: ${single.join(',')}`)

const statusGroup = registry.facetGroups.value.find((g) => g.key === 'status')
ok(statusGroup.options[1].value === 'auto_payment' && statusGroup.options[1].count === 1,
  'facets qiymat va sanoqni yetkazmadi')

// KPI va yon paneldagi sonlar: server kalitlari ekran kalitlariga o'girilishi kerak
registry.state.byStatus = { new: 3, pending: 0, auto_payment: 1, canceled: 0, blocked: 0 }
registry.state.total = 4

const c = registry.counts.value
ok(c.all === 4, `sanoq all ${c.all}`)
ok(c.new === 3, `sanoq new ${c.new}`)
ok(c.autopayment === 1, `auto_payment -> autopayment o'girilmadi: ${c.autopayment}`)
ok(c.cancelled === 0, `canceled -> cancelled o'girilmadi: ${c.cancelled}`)
ok(c.overdue === 1, `muddati o'tganlar jarayon chipidan olinmadi: ${c.overdue}`)

// serverdagi qiymatlar o'zgartirilmasdan ketishi kerak
const pf = toParams({
  picked: {
    status: ['auto_payment', 'canceled'],
    method: [1],
    region: [1],
    basis: ['application'],
    crime_type: ['cyber_theft'],
    intake_type: ['manual']
  }
})
ok(pf.status__in === 'auto_payment,canceled', `server statusi buzildi: ${pf.status__in}`)
ok(pf.method__in === '1' && pf.region__in === '1', 'raqamli id uzatilmadi')
ok(pf.basis__in === 'application', 'basis uzatilmadi')
ok(pf.crime_type__in === 'cyber_theft', 'crime_type uzatilmadi')
ok(pf.intake_type === 'manual', 'intake_type uzatilmadi')

// mahalliy statuslar esa server kodiga o'giriladi
const pl = toParams({ picked: { status: ['autopayment', 'cancelled'] } })
ok(pl.status__in === 'auto_payment,canceled', `mahalliy status o'girilmadi: ${pl.status__in}`)

// facets kelganda panel o'sha guruhlarni chizadi
setLang('uz')
{
  const app = createSSRApp(FilterPanel)
  app.use(i18n)
  const html = await renderToString(app)
  const controls = (html.match(/class="ms-control[^"]*"/g) || []).length
  ok(controls === served.length, `serverdagi guruhlar ${controls} ta (${served.length} kutilgan)`)
  ok(html.includes('Jinoyat turi') && html.includes('Qabul turi'), 'yangi guruh sarlavhalari chiqmadi')
  ok(!html.includes('filters.'), 'tarjima qilinmagan kalit chiqdi')
}

console.log(fail.length
  ? 'XATO:\n' + fail.join('\n')
  : `filtrlar: mahalliy ${keys.length} ta guruh, serverdan ${served.length} ta, summa oralig'i, parametrlar va uchala til tekshirildi`)

await vite.close()
process.exit(fail.length ? 1 : 0)
