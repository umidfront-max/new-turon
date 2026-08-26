// Haqiqiy serverdagi ariza tafsiloti ekranda to'liq chiziladimi.
// Server yoki token yaroqsiz bo'lsa test yiqilmaydi — o'tkazib yuboradi.
globalThis.localStorage = { getItem: () => null, setItem() {}, removeItem() {} }
globalThis.document = {
  documentElement: { style: {} }, body: { dataset: {} }, title: '',
  addEventListener() {}, removeEventListener() {},
  createElement: () => ({ style: {}, setAttribute() {} }),
  createElementNS: () => ({ style: {}, setAttribute() {} }),
  createTextNode: () => ({}), createComment: () => ({}), querySelector: () => null
}
globalThis.location = { href: 'http://localhost/', protocol: 'http:', origin: 'http://localhost' }
globalThis.window = globalThis

const { createServer } = await import('vite')
const vite = await createServer({ server: { middlewareMode: true }, appType: 'custom', logLevel: 'silent' })

const { useComplaint } = await vite.ssrLoadModule('/src/stores/useComplaint.js')
const { fetchRegistry } = await vite.ssrLoadModule('/src/services/complaints.js')

const problems = []
const ok = (cond, msg) => { if (!cond) problems.push(msg) }

let first = null
try {
  const res = await fetchRegistry({ page: 1, perPage: 1 })
  first = (res.results || [])[0]
} catch (e) {
  console.log('server javob bermadi (' + (e.detail || e.key) + ') — o\'tkazib yuborildi')
  await vite.close()
  process.exit(0)
}

if (!first) {
  console.log('serverda ariza yo\'q — o\'tkazib yuborildi')
  await vite.close()
  process.exit(0)
}

const store = useComplaint()
await store.load(first.id)

ok(store.live.value, 'tafsilot serverdan kelmadi: ' + (store.state.error?.detail || ''))

if (store.live.value) {
  const d = store.state.detail
  ok(!!d.row.id, 'ariza raqami bo\'sh')
  ok(!!d.row.status, 'status bo\'sh')
  ok(d.row.time && !d.row.time.includes('NaN'), 'vaqt xato: ' + d.row.time)
  ok(!d.total.includes('NaN'), 'summa xato: ' + d.total)
  ok(Array.isArray(d.requisites), 'rekvizitlar massiv emas')
  ok(Array.isArray(d.steps), 'qadamlar massiv emas')

  d.requisites.forEach((r, i) => {
    ok(!!r.card, `${i + 1}-rekvizitda raqam yo'q`)
    ok(!r.sum.includes('NaN'), `${i + 1}-rekvizit summasi xato: ${r.sum}`)
    r.tx.forEach((t) => ok(!t.time.includes('NaN'), 'tranzaksiya vaqti xato: ' + t.time))
  })

  // tablar yiqilmasligi kerak — bo'sh bo'lsa ham tuzilma to'g'ri
  ok(store.state.bank === null || Array.isArray(store.state.bank.exchange), 'bank tabi tuzilmasi xato')
  ok(store.state.chain === null || Array.isArray(store.state.chain.level1), 'zanjir tuzilmasi xato')
  ok(store.state.workflow === null || Array.isArray(store.state.workflow), 'ish jarayoni tuzilmasi xato')
  ok(store.state.sanctions === null || Array.isArray(store.state.sanctions), 'sanksiya tuzilmasi xato')

  console.log(`ariza ${d.row.id}: ${d.requisites.length} rekvizit, ${d.txTotal} tranzaksiya, ${d.steps.length} qadam`)
  console.log(`tablar: bank ${store.state.bank?.exchange.length ?? '—'}, zanjir ${store.state.chain?.level1.length ?? '—'}, `
    + `sanksiya ${store.state.sanctions?.length ?? '—'}, jarayon ${store.state.workflow?.length ?? '—'}`)
}

await vite.close()
console.log(problems.length ? 'XATO:\n' + problems.join('\n') : 'tafsilot: serverdagi ariza to\'liq o\'girildi')
process.exit(problems.length ? 1 : 0)
