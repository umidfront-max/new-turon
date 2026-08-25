// Rahbar paneli — asl dizayndagi (cardBlock.html) namuna ma'lumot va hisob-kitob.
// Matnlar i18n'da: dashboard.*

/* ---------- taqsimlanmagan murojaatlar ---------- */
export const UNASSIGNED = [
  { id: 'M0438715/2026-20034', material: 'KJ-2026-004217', type: 'app', method: 'prepay', hours: 46 },
  { id: 'M0438715/2026-20035', material: 'KJ-2026-004218', type: 'notice', method: 'virusApp', hours: 44 },
  { id: 'M0438715/2026-20036', material: 'KJ-2026-004219', type: 'app', method: 'onlineShop', hours: 40 },
  { id: 'M0438715/2026-20037', material: 'KJ-2026-004220', type: 'app', method: 'socialHack', hours: 18 },
  { id: 'M0438715/2026-20038', material: 'KJ-2026-004221', type: 'notice', method: 'phoneFraud', hours: 12 },
  { id: 'M0438715/2026-20039', material: 'KJ-2026-004222', type: 'app', method: 'fakeBankStaff', hours: 36 },
  { id: 'M0438715/2026-20040', material: 'KJ-2026-004223', type: 'app', method: 'phishingInfo', hours: 31 },
  { id: 'M0438715/2026-20041', material: 'KJ-2026-004224', type: 'notice', method: 'fakeInvestPlatform', hours: 27 },
  { id: 'M0438715/2026-20042', material: 'KJ-2026-004225', type: 'app', method: 'smsCode', hours: 22 }
]

/* ---------- jamoa ---------- */
export const TEAM = [
  { name: 'Murodjon Adashev', ini: 'MA', load: 8, role: 'senior' },
  { name: "Ulug'bek Tursunov", ini: 'UT', load: 11, role: 'inspector' },
  { name: 'Jasur Ismoilov', ini: 'JI', load: 9, role: 'inspector' },
  { name: 'Nabijonov Samandar', ini: 'NS', load: 6, role: 'inspector' },
  { name: 'Umidjon Tojiboyev', ini: 'UT', load: 4, role: 'junior' }
]

/* ---------- muddat diagrammasi ---------- */
export const DEADLINE = [
  { key: 'today', n: 14, tone: 'red' },
  { key: 'tomorrow', n: 11, tone: 'amber' },
  { key: 'afterTomorrow', n: 8, tone: 'gray' },
  { key: 'd3', n: 9, tone: 'gray' },
  { key: 'd4', n: 0, tone: 'mute' },
  { key: 'd5', n: 8, tone: 'gray' }
]

export const DL_TONE = {
  red: { bar: 'var(--cf5a19c)', fg: 'var(--ce0452f)', w: '600' },
  amber: { bar: 'var(--cf8cd85)', fg: 'var(--cd98413)', w: '600' },
  gray: { bar: 'var(--cc3c9d4)', fg: 'var(--c1c2b45)', w: '500' },
  mute: { bar: 'var(--ce6eaf0)', fg: 'var(--ca3adbd)', w: '500' }
}

export const DL_AXIS = [15, 10, 5, 0]

/* ---------- hujum kanallari ---------- */
export const METHODS = [
  { key: 'fakeLink', share: 0.22 },
  { key: 'fakeCalls', share: 0.18 },
  { key: 'fakeTrading', share: 0.13 },
  { key: 'onlineTrade', share: 0.11 },
  { key: 'investment', share: 0.09 },
  { key: 'onlineLoan', share: 0.07 },
  { key: 'bankStaff', share: 0.06 },
  { key: 'techWeak', share: 0.05 },
  { key: 'inheritance', share: 0.05 },
  { key: 'other', share: 0.04 }
]

const TINT = ['.20', '.18', '.16', '.14', '.12', '.10', '.09', '.08', '.07', '.06']

/* ---------- davrlar ---------- */
export const PERIODS = ['today', 'week', 'month', 'quarter']

export const PERIOD_DATA = {
  today: { apps: 34, stamp: 'Bugun 09:41' },
  week: { apps: 212, stamp: '08–14.08.2026' },
  month: { apps: 876, stamp: 'Avgust 2026' },
  quarter: { apps: 2410, stamp: 'III chorak 2026' }
}

/* ---------- yordamchilar (dizayndagi mantiq bilan bir xil) ---------- */
export function formatNumber(v) {
  return String(v).replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
}

/** Butun sonni ulushlar bo'yicha yo'qotmasdan taqsimlaydi */
export function alloc(total, shares) {
  const raw = shares.map((s) => total * s)
  const base = raw.map((v) => Math.floor(v))
  let left = total - base.reduce((a, b) => a + b, 0)
  const order = raw
    .map((v, i) => ({ i, frac: v - Math.floor(v) }))
    .sort((a, b) => b.frac - a.frac)
  for (let k = 0; k < order.length && left > 0; k += 1) {
    base[order[k].i] += 1
    left -= 1
  }
  return base
}

/** Hujum kanallari qatorlari: ulush -> son, foiz, kenglik va rang */
export function methodRows(apps) {
  const counts = alloc(apps, METHODS.map((m) => m.share))
  const max = Math.max(...METHODS.map((m) => m.share))
  return METHODS.map((m, i) => ({
    key: m.key,
    n: formatNumber(counts[i]),
    pct: `${Math.round(m.share * 100)}%`,
    rank: String(i + 1).padStart(2, '0'),
    fill: `rgba(35,86,143,${TINT[i] || '.05'})`,
    w: `${Math.round(m.share / max * 100)}%`
  }))
}

/** Muddat diagrammasi ustunlari */
export function deadlineBars() {
  const max = Math.max(...DEADLINE.map((d) => d.n))
  return DEADLINE.map((d) => ({
    ...d,
    ...DL_TONE[d.tone],
    h: `${Math.round(d.n / max * 88)}%`
  }))
}

export const DEADLINE_TOTAL = DEADLINE.reduce((s, d) => s + d.n, 0)

/** Jamoa qatorlari: yuklama foizi va rangi */
export function teamRows(loads) {
  const cap = Math.max(...loads, 12) + 3
  return TEAM.map((t, i) => ({
    name: t.name,
    ini: t.ini,
    role: t.role,
    load: loads[i],
    pct: `${Math.round(loads[i] / cap * 100)}%`,
    fg: loads[i] >= 9 ? 'var(--ce58a1f)' : 'var(--c2f6fd0)'
  }))
}

/** Avto-taqsimlash taklifi: har bir ish eng kam yuklangan xodimga */
export function autoAssign(rows, loads) {
  const sim = loads.slice()
  return rows.map((u) => {
    const j = sim.indexOf(Math.min(...sim))
    sim[j] += 1
    return { ...u, staff: TEAM[j], staffLoad: sim[j] }
  })
}

export function typeStyle(type) {
  return type === 'app'
    ? { bg: 'var(--ceef2ff)', fg: 'var(--c2d5be3)' }
    : { bg: 'var(--cfef3e2)', fg: 'var(--cb45309)' }
}
