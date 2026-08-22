// Jadval mantiqi tekshiruvi: filtr, sahifalash va sanoqlar.
import { createServer } from 'vite'

const vite = await createServer({ server: { middlewareMode: true }, appType: 'custom', logLevel: 'silent' })
const { APPLICATIONS } = await vite.ssrLoadModule('/src/data/applications.js')
const { filterApplications, pageSlice, pageList, lastPageOf, isoDay, EMPTY_COLS } = await vite.ssrLoadModule('/src/utils/table.js')
const { useApplications } = await vite.ssrLoadModule('/src/stores/useApplications.js')

const store = useApplications()
const items = APPLICATIONS
const dups = store.duplicateCards.value
const fail = []
const ok = (cond, msg) => { if (!cond) fail.push(msg) }

/* ---------- sanoqlar ---------- */
const counts = store.counts.value
const manual = {}
items.forEach((a) => { manual[a.status] = (manual[a.status] || 0) + 1 })
ok(counts.all === items.length, `counts.all ${counts.all} != ${items.length}`)
Object.entries(manual).forEach(([k, v]) => ok(counts[k] === v, `counts.${k} ${counts[k]} != ${v}`))
ok(counts.overdue === items.filter((a) => a.overdue).length, 'counts.overdue mos emas')

/* ---------- navbat filtri ---------- */
const blocked = filterApplications(items, { queue: 'blocked', dups })
ok(blocked.length === counts.blocked, `navbat blocked ${blocked.length} != ${counts.blocked}`)
ok(blocked.every((a) => a.status === 'blocked'), 'blocked navbatida boshqa status bor')

const overdue = filterApplications(items, { queue: 'overdue', dups })
ok(overdue.length === counts.overdue && overdue.every((a) => a.overdue), 'overdue navbati xato')

/* ---------- ustun qidiruvlari ---------- */
const byName = filterApplications(items, { cols: { ...EMPTY_COLS, name: 'karimova' }, dups })
ok(byName.length > 0 && byName.every((a) => a.name.toLowerCase().includes('karimova')), 'F.I.Sh. qidiruvi xato')

const byCard = filterApplications(items, { cols: { ...EMPTY_COLS, card: '9860' }, dups })
ok(byCard.every((a) => `${a.card} ${a.bank}`.includes('9860')), 'karta qidiruvi xato')

const byStatus = filterApplications(items, { cols: { ...EMPTY_COLS, status: 'error' }, dups })
ok(byStatus.length === counts.error, 'status tanlovi xato')

const someDay = isoDay(items[0].time)
const byDate = filterApplications(items, { cols: { ...EMPTY_COLS, date: someDay }, dups })
ok(byDate.length > 0 && byDate.every((a) => isoDay(a.time) === someDay), 'sana filtri xato')

const byRange = filterApplications(items, { cols: { ...EMPTY_COLS, min: '20 000 000', max: '50 000 000' }, dups })
const inRange = (a) => {
  const n = Number(a.amount.replace(/\D/g, ''))
  return n >= 20000000 && n <= 50000000
}
ok(byRange.length === items.filter(inRange).length && byRange.every(inRange), 'summa oralig\'i xato')

/* ---------- filtr paneli ---------- */
const panel = filterApplications(items, { picked: { status: ['pending'], region: ['tashkentCity'] }, dups })
ok(panel.every((a) => a.status === 'pending' && a.region === 'tashkentCity'), 'panel filtri xato')

const repeatOnly = filterApplications(items, { picked: { repeat: ['duplicate'] }, dups })
ok(repeatOnly.every((a) => dups.has(a.card)), 'takroriy rekvizit filtri xato')

const slaBreached = filterApplications(items, { picked: { sla: ['breached'] }, dups })
ok(slaBreached.length === counts.overdue, 'SLA filtri muddati o\'tganlarga mos emas')

/* ---------- navbat + filtr birga ---------- */
const combo = filterApplications(items, {
  queue: 'blocked',
  picked: { amount: ['gt50'] },
  cols: { ...EMPTY_COLS, flow: '102' },
  dups,
  labels: { flow: (a) => (a.flow === '102' ? '102' : 'Navbatchi') }
})
ok(combo.every((a) => a.status === 'blocked' && a.flow === '102'), 'birlashgan filtr xato')

/* ---------- sahifalash ---------- */
const total = items.length
const perPage = 10
const last = lastPageOf(total, perPage)
ok(last === Math.ceil(total / perPage), 'oxirgi sahifa xato')

const p1 = pageSlice(items, 1, perPage)
const p2 = pageSlice(items, 2, perPage)
const pLast = pageSlice(items, last, perPage)
ok(p1.length === perPage && p1[0].n === 1 && p1[9].n === 10, 'birinchi sahifa xato')
ok(p2[0].n === 11 && p2[0].id === items[10].id, 'ikkinchi sahifa xato')
ok(pLast.length === total - (last - 1) * perPage, 'oxirgi sahifadagi qatorlar soni xato')
ok(new Set([...p1, ...p2].map((r) => r.id)).size === p1.length + p2.length, 'sahifalar takrorlanmoqda')

const all = []
for (let i = 1; i <= last; i += 1) all.push(...pageSlice(items, i, perPage))
ok(all.length === total, 'sahifalar yig\'indisi jamiga teng emas')

// har xil perPage
ok(pageSlice(items, 1, 20).length === 20 && lastPageOf(total, 20) === Math.ceil(total / 20), 'perPage 20 xato')
ok(pageSlice(items, 2, 50).length === total - 50, 'perPage 50 xato')

// bo'sh natija
ok(lastPageOf(0, 10) === 1 && pageSlice([], 1, 10).length === 0, 'bo\'sh ro\'yxat xato')

/* ---------- sahifa raqamlari ---------- */
ok(JSON.stringify(pageList(1, 5)) === JSON.stringify([1, 2, 3, 4, 5]), 'kichik ro\'yxat xato')
const big = pageList(6, 13)
ok(big[0] === 1 && big[big.length - 1] === 13 && big.includes('…') && big.includes(6), 'katta ro\'yxat xato')
ok(!pageList(2, 13).slice(0, 4).includes('…'), 'boshida ortiqcha uch nuqta')

console.log(`arizalar: ${total} · sahifa: ${last} (${perPage}/sahifa) · statuslar: ${JSON.stringify(manual)}`)
console.log(fail.length ? 'XATO:\n' + fail.join('\n') : 'jadval mantiqi: barcha tekshiruvlar o\'tdi')

await vite.close()
process.exit(fail.length ? 1 : 0)
