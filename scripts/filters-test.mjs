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

const p1 = toParams({
  picked: { status: ['blocked', 'new'], bank: ['SQB', 'Anorbank'], region: ['andijan'] },
  amount: { from: '5', to: '20' }
})
ok(p1.bank__in === 'SQB,Anorbank', `bank__in xato: ${p1.bank__in}`)
ok(p1.region__in === 'andijan', `region__in xato: ${p1.region__in}`)
ok(String(p1.status__in).includes(','), `status__in bitta qiymatga aylanib qoldi: ${p1.status__in}`)
ok(p1.damage_amount__gte === 5 * MLN, `damage_amount__gte xato: ${p1.damage_amount__gte}`)
ok(p1.damage_amount__lte === 20 * MLN, `damage_amount__lte xato: ${p1.damage_amount__lte}`)

const p2 = toParams({ amount: { from: '', to: '' } })
ok(!('damage_amount__gte' in p2) && !('damage_amount__lte' in p2), "bo'sh oraliq ham serverga ketdi")

const p3 = toParams({ picked: { sla: ['breached'], repeat: ['duplicate'] } })
ok(p3.is_overdue === true, 'muddat: buzilgan uzatilmadi')
ok(p3.has_duplicate === true, 'takroriylik uzatilmadi')

const p4 = toParams({ picked: { sla: ['breached', 'inTime'], repeat: ['duplicate', 'clean'] } })
ok(!('is_overdue' in p4), 'ikkala muddat tanlanganda cheklov qolib ketdi')
ok(!('has_duplicate' in p4), 'ikkala takroriylik tanlanganda cheklov qolib ketdi')

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

console.log(fail.length
  ? 'XATO:\n' + fail.join('\n')
  : `filtrlar: ${keys.length} ta guruh, summa oralig'i, server parametrlari va uchala til tekshirildi`)

await vite.close()
process.exit(fail.length ? 1 : 0)
