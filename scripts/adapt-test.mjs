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

/* bo'sh javob ham yiqilmasligi kerak */
const empty = registryPage({}, 1, 10)
ok(empty.rows.length === 0 && empty.total === 0, 'bo\'sh javob xato')

await vite.close()
console.log(`adapter: ${Object.keys(pairs).length} status, qator va sahifa tekshirildi`)
console.log(problems.length ? 'XATO:\n' + problems.join('\n') : 'adapter: barcha tekshiruvlar o\'tdi')
process.exit(problems.length ? 1 : 0)
