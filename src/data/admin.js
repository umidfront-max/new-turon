// Admin (Respublika admini) ekranlari uchun namuna ma'lumot —
// yangi dizayndan (cardBlock_new.html) olingan.
// Matnlar i18n'da: admin.*

/* ---------- hududlar ---------- */
export const REGIONS = [
  { name: 'Toshkent shahri', key: 'tashkentCity', apps: 214, blocked: 158, loss: 4.9, staff: 12, trend: 8 },
  { name: 'Toshkent viloyati', key: 'tashkentRegion', apps: 132, blocked: 96, loss: 2.6, staff: 8, trend: 4 },
  { name: 'Samarqand', key: 'samarkand', apps: 118, blocked: 84, loss: 2.1, staff: 7, trend: -3 },
  { name: "Farg'ona", key: 'fergana', apps: 112, blocked: 79, loss: 1.9, staff: 7, trend: 6 },
  { name: 'Andijon', key: 'andijan', apps: 98, blocked: 71, loss: 1.6, staff: 6, trend: 2 },
  { name: 'Namangan', key: 'namangan', apps: 92, blocked: 64, loss: 1.4, staff: 6, trend: -1 },
  { name: 'Xorazm', key: 'khorezm', apps: 81, blocked: 57, loss: 1.3, staff: 5, trend: 7 },
  { name: 'Buxoro', key: 'bukhara', apps: 76, blocked: 52, loss: 1.2, staff: 5, trend: 3 },
  { name: 'Qashqadaryo', key: 'kashkadarya', apps: 71, blocked: 48, loss: 1.1, staff: 5, trend: 5 },
  { name: "Qoraqalpog'iston R.", key: 'karakalpakstan', apps: 67, blocked: 45, loss: 1.0, staff: 4, trend: 2 },
  { name: 'Surxondaryo', key: 'surkhandarya', apps: 64, blocked: 44, loss: 0.9, staff: 4, trend: -2 },
  { name: 'Navoiy', key: 'navoi', apps: 58, blocked: 39, loss: 0.8, staff: 4, trend: 1 },
  { name: 'Jizzax', key: 'jizzakh', apps: 54, blocked: 36, loss: 0.7, staff: 4, trend: 3 },
  { name: 'Sirdaryo', key: 'syrdarya', apps: 46, blocked: 31, loss: 0.6, staff: 3, trend: -1 }
]

export const DISTRICTS = {
  'Toshkent shahri': ['Chilonzor tumani', 'Yunusobod tumani', "Mirzo Ulug'bek tumani", 'Sergeli tumani', 'Yashnobod tumani'],
  'Toshkent viloyati': ['Nurafshon shahri', 'Chirchiq shahri', 'Olmaliq shahri', 'Bekobod tumani'],
  Samarqand: ['Samarqand shahri', 'Urgut tumani', "Kattaqo'rg'on tumani"],
  "Farg'ona": ["Farg'ona shahri", "Qo'qon shahri", "Marg'ilon shahri"],
  Andijon: ['Andijon shahri', 'Asaka tumani', 'Xonobod shahri'],
  Namangan: ['Namangan shahri', 'Chust tumani', 'Pop tumani'],
  Xorazm: ['Urganch shahri', 'Xiva shahri', 'Yangibozor tumani'],
  Buxoro: ['Buxoro shahri', 'Kogon shahri', "G'ijduvon tumani"],
  Qashqadaryo: ['Qarshi shahri', 'Shahrisabz shahri', 'Muborak tumani'],
  "Qoraqalpog'iston R.": ['Nukus shahri', "Xo'jayli tumani", 'Taxiatosh tumani'],
  Surxondaryo: ['Termiz shahri', 'Denov tumani', 'Sherobod tumani'],
  Navoiy: ['Navoiy shahri', 'Zarafshon shahri', 'Konimex tumani'],
  Jizzax: ['Jizzax shahri', 'Zomin tumani', "G'allaorol tumani"],
  Sirdaryo: ['Guliston shahri', 'Yangiyer shahri', 'Sirdaryo tumani']
}

/* ---------- matritsa ustunlari ---------- */
// grp — ustunlar guruhi (sarlavhada birlashadi), warn — muammoli ustun
export const MTX_COLS = [
  { k: 'apps', w: 106, bold: true },
  { k: 'd24', w: 104 },
  { k: 'work', w: 92, grp: 'from' },
  { k: 'bank', w: 112, grp: 'from' },
  { k: 'blocked', w: 112, fg: 'var(--c1a6e4b)' },
  { k: 'today', w: 104, grp: 'deadline' },
  { k: 'over', w: 112, grp: 'deadline', warn: true },
  { k: 'ret', w: 104, warn: true },
  { k: 'closed', w: 96 },
  { k: 'loss', w: 120 }
]

/* ---------- foydalanuvchilar ---------- */
export const USERS = [
  { name: "Suvonov Farrux Bahodir o'g'li", login: 'f.suvonov', role: 'staff', dep: 'cardblock', seen: '09:41', active: true },
  { name: "Ismoilov Jasur Alisher o'g'li", login: 'j.ismoilov', role: 'staff', dep: 'cardblock', seen: 'Kecha 21:04', active: true },
  { name: "Qodirov Bekzod Rustam o'g'li", login: 'b.qodirov', role: 'staff', dep: 'cardblock', seen: '12.08 18:20', active: true },
  { name: 'Yusupova Nilufar Anvar qizi', login: 'n.yusupova', role: 'staff', dep: 'night', seen: 'Kecha 08:55', active: true },
  { name: "Boybayev Umrbek Jasur o'g'li", login: 'u.boybayev', role: 'exec', dep: 'cardblock', seen: '09:05', active: true },
  { name: "Rahimov Alisher Baxtiyor o'g'li", login: 'a.rahimov', role: 'admin', dep: 'analysis', seen: '09:38', active: true },
  { name: 'Ergasheva Nargiza Toir qizi', login: 'n.ergasheva', role: 'analyst', dep: 'analysis', seen: '11.08 17:44', active: false },
  { name: "Qosimov Davron Elyor o'g'li", login: 'd.qosimov', role: 'staff', dep: 'cardblock', seen: '09:40', active: true },
  { name: "Sattorov Ravshan Ikrom o'g'li", login: 'r.sattorov', role: 'sadmin', dep: 'it', seen: 'Kecha 19:02', active: true },
  { name: 'Nazarova Dilnoza Shuhrat qizi', login: 'd.nazarova', role: 'staff', dep: 'night', seen: '13.08 22:10', active: true },
  { name: "Tursunov Ulug'bek Anvar o'g'li", login: 'u.tursunov', role: 'staff', dep: 'cardblock', seen: '09:12', active: true },
  { name: "Adashev Murodjon Sobir o'g'li", login: 'm.adashev', role: 'staff', dep: 'cardblock', seen: '08:58', active: true },
  { name: 'Sobirova Zuhra Alisher qizi', login: 'z.sobirova', role: 'analyst', dep: 'analysis', seen: '12.08 15:30', active: true },
  { name: "Nabijonov Samandar Islom o'g'li", login: 's.nabijonov', role: 'staff', dep: 'night', seen: 'Kecha 23:40', active: true },
  { name: "Tojiboyev Umidjon Faxriddin o'g'li", login: 'u.tojiboyev', role: 'staff', dep: 'cardblock', seen: '09:33', active: true }
]

/* ---------- tizim jurnali ---------- */
export const LOGS = [
  { time: '09:41', who: 'Suvonov F.', act: 'reportSent', obj: 'NH-2026-0814-01', ip: '10.20.4.11', tone: 'blue' },
  { time: '09:38', who: 'Rahimov A.', act: 'signIn', obj: '—', ip: '10.20.1.3', tone: 'gray' },
  { time: '09:20', who: 'Suvonov F.', act: 'blocked', obj: 'CB-2026-4831', ip: '10.20.4.11', tone: 'green' },
  { time: '09:05', who: 'Boybayev U.', act: 'assigned', obj: '7 ta ariza', ip: '10.20.2.8', tone: 'blue' },
  { time: '08:58', who: 'Adashev M.', act: 'created', obj: 'KJ-2026-004301', ip: '10.20.4.19', tone: 'gray' },
  { time: '08:44', who: 'Sattorov R.', act: 'userAdded', obj: 'd.qosimov', ip: '10.20.9.2', tone: 'blue' },
  { time: '08:30', who: 'Qodirov B.', act: 'returned', obj: 'M0126284/2026-10008', ip: '10.20.4.15', tone: 'red' },
  { time: '08:12', who: 'Tizim', act: 'sync', obj: 'Markaziy bank', ip: '—', tone: 'gray' }
]

export const LOG_TONE = {
  blue: { bg: 'var(--ce8eef7)', fg: 'var(--c23568f)' },
  green: { bg: 'var(--ce3f2e9)', fg: 'var(--c1a6e4b)' },
  red: { bg: 'var(--cfceceb)', fg: 'var(--ca52220)' },
  gray: { bg: 'var(--cf0f3f8)', fg: 'var(--c66748c)' }
}

/* ---------- matritsa hisob-kitobi (dizayndagi mantiq) ---------- */
export function deriveRow(apps, seed, blocked, lossMlrd) {
  const j = (n) => ((seed * 7 + n * 13) % 5) - 2
  const work = Math.max(0, Math.round(apps * 0.22) + j(1))
  const bank = Math.max(0, Math.round(apps * 0.15) + j(2))
  return {
    apps,
    d24: Math.max(0, Math.round(apps * 0.08) + j(3)),
    work,
    bank,
    blocked,
    today: Math.max(0, Math.round(apps * 0.05) + j(5)),
    over: Math.max(0, Math.round(apps * 0.035) + j(6)),
    ret: Math.max(0, Math.round(apps * 0.028) + j(7)),
    closed: Math.max(0, apps - work - bank),
    loss: Math.round(lossMlrd * 1000)
  }
}

/** Viloyat ichidagi tumanlar bo'yicha taqsimot */
export function districtRows(region, index) {
  const list = DISTRICTS[region.name] || []
  const weights = list.map((_, k) => 1 / (k + 1.35))
  const sum = weights.reduce((a, b) => a + b, 0)
  return list.map((name, k) => {
    const share = weights[k] / sum
    const apps = Math.max(1, Math.round(region.apps * share))
    return {
      name,
      region: region.key,
      ...deriveRow(apps, index * 3 + k + 2, Math.max(1, Math.round(region.blocked * share)), region.loss * share)
    }
  })
}

export function regionRows() {
  return REGIONS.map((r, i) => ({ ...r, ...deriveRow(r.apps, i + 1, r.blocked, r.loss) }))
}

export function totalsOf(rows) {
  const keys = ['apps', 'd24', 'work', 'bank', 'blocked', 'today', 'over', 'ret', 'closed', 'loss']
  const out = Object.fromEntries(keys.map((k) => [k, 0]))
  rows.forEach((r) => keys.forEach((k) => { out[k] += r[k] || 0 }))
  return out
}
