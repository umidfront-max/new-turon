// Serverdan keladigan yozuvni ekran kutgan ko'rinishga o'girishni tekshiradi.
// Haqiqiy so'rov yubormaydi — Swagger'dagi RegistryRow tuzilmasidan namuna oladi.
const { createServer } = await import('vite')
const vite = await createServer({ server: { middlewareMode: true }, appType: 'custom', logLevel: 'silent' })

const { registryRow, registryPage, statusToUi, statusToApi, money, dateTime } =
  await vite.ssrLoadModule('/src/utils/adapt.js')

const problems = []
const ok = (cond, msg) => { if (!cond) problems.push(msg) }

/* ---------- statuslar ---------- */
const pairs = {
  new: 'new', pending: 'pending', auto_payment: 'autopayment', error: 'error',
  blocked: 'blocked', done: 'done', canceled: 'cancelled', duplicate: 'duplicate'
}
for (const [api, ui] of Object.entries(pairs)) {
  ok(statusToUi(api) === ui, `${api} -> ${statusToUi(api)} (${ui} kutilgan)`)
  ok(statusToApi(ui) === api, `${ui} -> ${statusToApi(ui)} (${api} kutilgan)`)
}

/* ---------- summa va sana ---------- */
ok(money('12500000.00') === '12 500 000', 'summa: ' + money('12500000.00'))
ok(money(null) === '0', 'bo\'sh summa 0 bo\'lishi kerak')
ok(dateTime('2026-08-04T09:12:00+05:00').startsWith('04.08.2026'), 'sana: ' + dateTime('2026-08-04T09:12:00+05:00'))
ok(dateTime(null) === '', 'bo\'sh sana bo\'sh satr bo\'lishi kerak')

/* ---------- qator ---------- */
const sample = {
  id: 17,
  number: 'M0126290/2026-10011',
  material_number: 'KJ-2026-004217',
  intake_type: 'hotline_102',
  citizen_name: "ABDULLAYEV ULUG'BEK SAYDAMATOVICH",
  method: 3,
  method_name: "Soxta qo'ng'iroq (vishing)",
  region: 1,
  region_name: 'Toshkent shahri',
  requisite: { number: '9860 2703 6925 4910', bank_name: 'Kapitalbank' },
  total_amount: '12500000.00',
  status: 'auto_payment',
  occurred_at: '2026-08-04T09:12:00+05:00',
  is_overdue: true,
  remaining_seconds: -3600,
  deadline: '2026-08-10'
}

const row = registryRow(sample, 4)
const want = {
  n: 5, id: 'M0126290/2026-10011', material: 'KJ-2026-004217', flow: '102',
  name: "ABDULLAYEV ULUG'BEK SAYDAMATOVICH", methodLabel: "Soxta qo'ng'iroq (vishing)",
  card: '9860 2703 6925 4910', bank: 'Kapitalbank', amount: '12 500 000',
  status: 'autopayment', overdue: true, apiId: 17
}
for (const [k, v] of Object.entries(want)) {
  ok(row[k] === v, `${k}: ${JSON.stringify(row[k])} (${JSON.stringify(v)} kutilgan)`)
}
ok(row.time.startsWith('04.08.2026'), 'vaqt: ' + row.time)

/* qo'lda kiritilgan ariza navbatchi oqimida bo'lishi kerak */
ok(registryRow({ ...sample, intake_type: 'manual' }).flow === 'duty', 'manual -> duty emas')

/* ---------- sahifa ---------- */
const page = registryPage({ count: 64, results: [sample, sample], by_status: { new: 8, blocked: 20 } }, 2, 10)
ok(page.total === 64, 'jami: ' + page.total)
ok(page.rows.length === 2, 'qatorlar: ' + page.rows.length)
ok(page.rows[0].n === 11, '2-sahifaning birinchi tartib raqami: ' + page.rows[0].n)
ok(page.byStatus.blocked === 20, 'by_status o\'tmadi')

/* requisite ichidagi nom noaniq — bir nechta variant qo'llab-quvvatlanadi */
const variants = [
  { number: '9860 2703 6925 4910', bank_name: 'Kapitalbank' },
  { masked: '9860 2703 6925 4910', bank_title: 'Kapitalbank' },
  { card_number: '9860 2703 6925 4910', bank_label: 'Kapitalbank' }
]
for (const req of variants) {
  const r = registryRow({ ...sample, requisite: req })
  ok(r.card === '9860 2703 6925 4910', 'karta topilmadi: ' + JSON.stringify(req))
  ok(r.bank === 'Kapitalbank', 'bank topilmadi: ' + JSON.stringify(req))
}

/* bank ID bo'lib kelsa ekranda raqam ko'rinmasligi kerak */
const idOnly = registryRow({ ...sample, requisite: { number: '9860', bank: 7 } })
ok(idOnly.bank === '', 'bank ID sifatida chiqib ketdi: ' + idOnly.bank)

/* bo'sh javob ham yiqilmasligi kerak */
const empty = registryPage({}, 1, 10)
ok(empty.rows.length === 0 && empty.total === 0, 'bo\'sh javob xato')

/* ---------- bildirishnoma ---------- */
const { notification, draftRow, agoOf } = await vite.ssrLoadModule('/src/utils/adapt.js')

const n = notification({
  id: 9, title: 'Bank arizani qaytardi', message: 'Karta raqamida xatolik',
  type: 'crime_error', is_read: false,
  payload: { complaint_number: 'M0126284/2026-10008' },
  created_at: new Date(Date.now() - 8 * 60000).toISOString()
})
ok(n.title === 'Bank arizani qaytardi', 'sarlavha: ' + n.title)
ok(n.tone === 'bad' && n.icon === 'warn', `crime_error rangi: ${n.tone}/${n.icon}`)
ok(n.read === false, "o'qilgan holati xato")
ok(n.appId === 'M0126284/2026-10008', 'ariza raqami: ' + n.appId)
ok(n.ago.unit === 'min' && n.ago.n === 8, `vaqt: ${n.ago.n} ${n.ago.unit}`)

/* noma'lum tur ham yiqilmasligi kerak */
const unknown = notification({ id: 1, type: 'boshqa_tur', created_at: null })
ok(unknown.tone === 'info' && unknown.icon === 'bell', "noma'lum tur zaxira rangsiz")

/* ---------- qoralama ---------- */
const draft = draftRow({
  id: 3, number: 'KJ-2026-004301', material_number: 'M0438715/2026-0000',
  applicant_name: 'YUSUPOVA NARGIZA', method: 3, method_name: "Soxta qo'ng'iroq",
  requisite: { number: '9860 12** **** 4922', bank_name: 'Uzum Bank', count: 2 },
  completed_steps: 4, total_steps: 5,
  steps: [{ key: 'app', done: true }, { key: 'fabula', done: false }],
  updated_at: '2026-08-14T09:12:00+05:00'
})
ok(draft.done === 80, "to'ldirilgan foiz: " + draft.done)
ok(draft.missing === 'fabula', 'qolgan qadam: ' + draft.missing)
ok(draft.tx === 2, 'rekvizit soni: ' + draft.tx)
ok(draft.time.startsWith('14.08.2026'), 'qoralama vaqti: ' + draft.time)

/* qadamlar bo'lmasa ham ishlashi kerak */
const bare = draftRow({ id: 4 })
ok(bare.done === 0 && bare.missing === null, "bo'sh qoralama xato")

/* ---------- raqam tekshiruvi ---------- */
const { numberCheck, cardIdentity, earlierComplaint } = await vite.ssrLoadModule('/src/utils/adapt.js')

const check = numberCheck({
  number: '986035******8584', number_type: 'card', number_type_display: 'Karta',
  is_known: true, bank: 7, bank_name: 'Anorbank', is_blocked: true,
  frozen_amount: '3000000.00', complaint_count: 2, total_amount: '19400000.00',
  checked_at: '2026-08-26T13:05:00+05:00',
  complaints: [{
    id: 12, number: 'M0126275/2026-10001', material_number: 'KJ-2026-004180',
    status: 'blocked', citizen_name: 'IBRAGIMOVA R.', date: '2026-08-03T12:47:00+05:00',
    transactions: [{}, {}], matched_amount: '19400000.00'
  }]
})
ok(check.bankName === 'Anorbank', 'bank: ' + check.bankName)
ok(check.blocked === true, 'bloklangan holati xato')
ok(check.frozen === '3 000 000', 'muzlatilgan: ' + check.frozen)
ok(check.total === '19 400 000', 'jami: ' + check.total)
ok(check.earlier.length === 1, 'oldingi arizalar soni: ' + check.earlier.length)
ok(check.earlier[0].status === 'blocked', 'oldingi ariza statusi xato')
ok(check.earlier[0].tx === 2, 'o‘tkazmalar soni: ' + check.earlier[0].tx)
ok(check.earlier[0].time.startsWith('03.08.2026'), 'vaqt: ' + check.earlier[0].time)

/* oldingi arizalar bo'lmasa ham yiqilmasin */
ok(numberCheck({}).earlier.length === 0, 'bo‘sh tekshiruv xato')
ok(numberCheck(null).count === 0, 'null tekshiruv xato')

/* ---------- karta aniqlash ---------- */
const idn = cardIdentity({
  matched: true, prefix: '860006', processing: 'uzcard',
  processing_display: 'UzCard', bank: 4, bank_name: 'Kapital bank',
  bank_short_name: 'Kapitalbank', is_bank: true, number_type: 'card'
})
ok(idn.bankName === 'Kapitalbank', 'qisqa nom afzal: ' + idn.bankName)
ok(idn.system === 'UzCard', 'tizim: ' + idn.system)
ok(cardIdentity({ matched: false }) === null, "mos kelmasa null bo'lishi kerak")

await vite.close()
console.log(`adapter: ${Object.keys(pairs).length} status, qator va sahifa tekshirildi`)
console.log(problems.length ? 'XATO:\n' + problems.join('\n') : 'adapter: barcha tekshiruvlar o\'tdi')
process.exit(problems.length ? 1 : 0)
