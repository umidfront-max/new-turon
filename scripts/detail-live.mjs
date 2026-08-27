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

  // serverdagi tayyor yorliqlar ekranga chiqadimi
  ok(typeof d.basisLabel === 'string', "asos yorligi yoq")
  ok(typeof d.crimeTypeLabel === 'string', "jinoyat turi yorligi yoq")
  ok(typeof d.intakeLabel === 'string', "qabul turi yorligi yoq")
  ok(typeof d.description === 'string', "fabula matni yoq")
  ok(typeof d.address === 'string', "manzil yoq")

  // qadam nomi: tarjima kaliti yoki serverning yorlig'i bo'lishi shart
  const STEP_KEYS = ['accepted', 'sentToBank', 'notSent', 'awaiting', 'returned', 'blocked',
    'autopayment', 'refunded', 'cancelled', 'received', 'sent_to_bank', 'bank_answer']
  d.steps.forEach((st) => {
    ok(STEP_KEYS.includes(st.key) || !!st.label,
      `qadam "${st.key}" uchun na tarjima, na yorliq bor`)
  })

  // status tarixi ulangan
  ok(store.state.history === null || Array.isArray(store.state.history), 'tarix tuzilmasi xato')
  ;(store.state.history || []).forEach((h) => {
    ok(!!h.to, "tarix qatorida yangi status yoq")
    ok(h.time && !h.time.includes('NaN'), 'tarix vaqti xato: ' + h.time)
  })

  // tablar yiqilmasligi kerak — bo'sh bo'lsa ham tuzilma to'g'ri
  ok(store.state.bank === null || Array.isArray(store.state.bank.exchange), 'bank tabi tuzilmasi xato')
  ok(store.state.chain === null || Array.isArray(store.state.chain.level1), 'zanjir tuzilmasi xato')
  ok(store.state.workflow === null || Array.isArray(store.state.workflow), 'ish jarayoni tuzilmasi xato')
  ok(store.state.sanctions === null || Array.isArray(store.state.sanctions), 'sanksiya tuzilmasi xato')

  console.log(`ariza ${d.row.id}: ${d.requisites.length} rekvizit, ${d.txTotal} tranzaksiya, ${d.steps.length} qadam`)
  console.log(`tablar: bank ${store.state.bank?.exchange.length ?? '—'}, zanjir ${store.state.chain?.level1.length ?? '—'}, `
    + `sanksiya ${store.state.sanctions?.length ?? '—'}, jarayon ${store.state.workflow?.length ?? '—'}, `
    + `tarix ${store.state.history?.length ?? '—'}`)
  console.log(`maydonlar: asos "${d.basisLabel}", jinoyat turi "${d.crimeTypeLabel}", `
    + `qabul "${d.intakeLabel}", fabula ${d.description.length} belgi`)
  console.log('qadamlar: ' + d.steps.map((st) => `${st.key}${st.label ? ` (${st.label})` : ''}`).join(', '))
}

await vite.close()
console.log(problems.length ? 'XATO:\n' + problems.join('\n') : 'tafsilot: serverdagi ariza to\'liq o\'girildi')
process.exit(problems.length ? 1 : 0)
