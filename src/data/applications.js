// Namuna ma'lumotlar — asl dizayndagi qiymatlar bilan bir xil.
// Matnlar bu yerda saqlanmaydi: faqat i18n kalitlari turadi (src/i18n/*).
// Real loyihada bu joyni API javobi bilan almashtirasiz.

// status kaliti -> rang uslubi. Matn: t(`status.<key>.label`)
export const STATUS = {
  new: { fg: 'var(--c23568f)', bg: 'var(--ce8eef7)', bd: 'var(--kc9d9ec)' },
  pending: { fg: 'var(--c96620a)', bg: 'var(--cfdf3e3)', bd: 'var(--cf0dcb4)' },
  autopayment: { fg: 'var(--c5b3fa8)', bg: 'var(--cefeafa)', bd: 'var(--cd8cff2)' },
  blocked: { fg: 'var(--c1a6e4b)', bg: 'var(--ce3f2e9)', bd: 'var(--cbfe0ce)' },
  error: { fg: 'var(--ca52220)', bg: 'var(--cfceceb)', bd: 'var(--cf2cfcd)' },
  cancelled: { fg: 'var(--c4b5a73)', bg: 'var(--ceef1f6)', bd: 'var(--cdbe1e9)' },
  done: { fg: 'var(--c0e6a6e)', bg: 'var(--ce5f2f2)', bd: 'var(--cc3e0e0)' },
  // serverda takroriy arizalar alohida status bilan keladi
  duplicate: { fg: 'var(--c5b3fa8)', bg: 'var(--cefeafa)', bd: 'var(--cd8cff2)' }
}

const BASE_APPLICATIONS = [
  { n: 1, id: 'M0126290/2026-10011', material: 'KJ-2026-004217', flow: '102', name: "ABDULLAYEV ULUG'BEK SAYDAMATOVICH", method: 'vishing', card: '9860 2703 6925 4910', bank: 'Kapitalbank', amount: '12 500 000', cur: 'UZS', region: 'tashkentCity', status: 'pending', time: '04.08.2026 09:12' },
  { n: 2, id: 'M0126291/2026-10012', material: null, flow: 'duty', name: 'MALABOEV DILSHOD SOKINOVICH', method: 'phishing', card: '8600 3329 8653 5924', bank: 'Ipoteka bank', amount: '4 780 000', cur: 'UZS', region: 'tashkentRegion', status: 'new', time: '04.08.2026 08:41' },
  { n: 3, id: 'M0126284/2026-10008', material: 'KJ-2026-004201', flow: '102', name: 'TUROBIDINOVA MALOHAT LEODINOVNA', method: 'apk', card: '5614 6818 8572 6806', bank: 'Hamkorbank', amount: '51 300 000', cur: 'UZS', region: 'andijan', status: 'error', time: '03.08.2026 19:26', overdue: true },
  { n: 4, id: 'M0126279/2026-10004', material: 'KJ-2026-004188', flow: '102', name: 'MAMATOV AVZXON BAXODIROVICH', method: 'fakeShop', card: '9860 0120 1189 7377', bank: 'SQB', amount: '2 150 000', cur: 'UZS', region: 'samarkand', status: 'blocked', time: '03.08.2026 15:03' },
  { n: 5, id: 'M0126275/2026-10001', material: 'KJ-2026-004180', flow: 'duty', name: 'IBRAGIMOVA ROHATOY SOBIROVNA', method: 'simSwap', card: '5614 6814 2703 6342', bank: 'Trastbank', amount: '19 400 000', cur: 'UZS', region: 'fergana', status: 'pending', time: '03.08.2026 12:47' },
  { n: 6, id: 'M0126270/2026-09996', material: 'KJ-2026-004171', flow: '102', name: 'NISHANOV TIMUR RUSTAMOVICH', method: 'fakeInvest', card: '9860 0103 0720 2941', bank: 'Anorbank', amount: '87 900 000', cur: 'UZS', region: 'tashkentCity', status: 'blocked', time: '02.08.2026 18:20', overdue: true },
  { n: 7, id: 'M0126266/2026-09991', material: 'KJ-2026-004166', flow: '102', name: 'XUSNIYOXON XOJIYEVA ANVAROVNA', method: 'fakeSupport', card: '9860 1201 1897 3771', bank: 'Aloqabank', amount: '6 340 000', cur: 'UZS', region: 'bukhara', status: 'autopayment', time: '02.08.2026 14:55' },
  { n: 8, id: 'M0126261/2026-09985', material: 'KJ-2026-004159', flow: 'duty', name: 'MIRZASHARIPOV SARVARBEK BAXODIR', method: 'phishing', card: '5614 6814 2703 6342', bank: 'Uzum Bank', amount: '14 720 000', cur: 'RUB', region: 'namangan', status: 'done', time: '01.08.2026 11:38' },
  { n: 9, id: 'M0126257/2026-09980', material: 'KJ-2026-004150', flow: '102', name: 'BEKNAZAROVA ZUHRA ALISHEROVNA', method: 'other', card: '9860 6067 5458 0490', bank: 'TBC Bank', amount: '1 090 000', cur: 'CRYPTO', region: 'tashkentCity', status: 'cancelled', time: '01.08.2026 09:04' }
]

/* ---------------------------------------------------------------
   Namunani kengaytirish: jadval, filtr va sahifalash haqiqiy
   ko'rinishda ishlashi uchun ro'yxat qo'shimcha yozuvlar bilan
   to'ldiriladi. Barcha qiymatlar indeksdan hisoblanadi — har safar
   bir xil (tasodifiy son ishlatilmaydi).
---------------------------------------------------------------- */
const BANKS = ['Kapitalbank', 'Xalq banki', 'Ipoteka bank', 'Trastbank', 'SQB',
  'Aloqabank', 'Anorbank', 'TBC Bank', 'Uzum Bank', 'Hamkorbank']

const METHODS = ['vishing', 'phishing', 'fakeShop', 'fakeInvest', 'simSwap', 'apk', 'fakeSupport', 'other']

const REGIONS = ['tashkentCity', 'tashkentRegion', 'andijan', 'bukhara', 'fergana', 'jizzakh',
  'namangan', 'navoi', 'kashkadarya', 'samarkand', 'syrdarya', 'surkhandarya', 'khorezm', 'karakalpakstan']

// statuslar taqsimoti — hayotiy nisbatda
const STATUS_MIX = ['pending', 'blocked', 'blocked', 'new', 'pending', 'done', 'blocked',
  'error', 'autopayment', 'cancelled', 'pending', 'blocked', 'new', 'done', 'blocked']

const SURNAMES = ['ABDULLAYEV', 'KARIMOVA', 'TOSHPULATOV', 'YUSUPOVA', 'RAHMONOV', 'ISMOILOVA',
  'NAZAROV', 'SOBIROVA', 'ERGASHEV', 'MUXAMEDOVA', 'QODIROV', 'SAIDOVA']
const NAMES = ['AZIZ', 'DILNOZA', 'SARVAR', 'NARGIZA', 'TOHIR', 'MALIKA',
  'BEHRUZ', 'ZUHRA', 'JAMSHID', 'GULNORA', 'RUSTAM', 'SEVARA']
const PATRONYMS = ['ANVAROVICH', 'SHUHRAT QIZI', 'BAXODIROVICH', 'OLIMJON QIZI',
  'RUSTAMOVICH', 'ALISHEROVNA', 'TIMUROVICH', 'SOBIROVNA']

const CARD_PREFIX = ['8600', '9860', '5614', '9860', '8600']

function pad(n, len) {
  return String(n).padStart(len, '0')
}

function makeApplication(i) {
  const seq = 9979 - i * 3               // ariza raqami kamayib boradi
  const status = STATUS_MIX[i % STATUS_MIX.length]
  const day = 30 - (i % 28)              // 30.07.2026 dan orqaga
  const month = day > 0 ? '07' : '06'
  const date = `${pad(day > 0 ? day : 30 + day, 2)}.${month}.2026`
  const hour = pad(8 + (i % 11), 2)
  const minute = pad((i * 7) % 60, 2)
  const amount = (1 + (i * 37) % 95) * 1000000 + ((i * 13) % 9) * 100000

  return {
    id: `M0126${pad(240 - i, 3)}/2026-${pad(seq, 5)}`,
    material: i % 9 === 4 ? null : `KJ-2026-00${pad(4140 - i * 2, 4)}`,
    flow: i % 3 === 1 ? 'duty' : '102',
    name: `${SURNAMES[i % SURNAMES.length]} ${NAMES[(i * 3) % NAMES.length]} ${PATRONYMS[i % PATRONYMS.length]}`,
    method: METHODS[i % METHODS.length],
    card: `${CARD_PREFIX[i % CARD_PREFIX.length]} ${pad((1200 + i * 7) % 10000, 4)} ${pad((4400 + i * 13) % 10000, 4)} ${pad((3100 + i * 29) % 10000, 4)}`,
    bank: BANKS[i % BANKS.length],
    amount: String(amount).replace(/\B(?=(\d{3})+(?!\d))/g, ' '),
    cur: 'UZS',
    region: REGIONS[i % REGIONS.length],
    status,
    time: `${date} ${hour}:${minute}`,
    ...(status === 'error' || i % 17 === 3 ? { overdue: true } : {})
  }
}

const GENERATED = Array.from({ length: 55 }, (_, i) => makeApplication(i))

export const APPLICATIONS = [...BASE_APPLICATIONS, ...GENERATED]

// label/note: t(`kpi.<key>.label`) / t(`kpi.<key>.note`)
// qiymat useApplications do'konida hisoblanadi
export const KPI = [
  { key: 'new', tone: 'var(--c23568f)', iconBg: 'var(--ce8eef7)', icon: 'inbox' },
  { key: 'pending', tone: 'var(--c96620a)', iconBg: 'var(--cfdf3e3)', icon: 'clock' },
  { key: 'blocked', tone: 'var(--c1a6e4b)', iconBg: 'var(--ce3f2e9)', icon: 'lock' },
  { key: 'autopayment', tone: 'var(--c5b3fa8)', iconBg: 'var(--cefeafa)', icon: 'refresh' },
  { key: 'overdue', tone: 'var(--ca52220)', iconBg: 'var(--cfceceb)', icon: 'alarm' }
]

// label: t(`queues.<key>`)
export const QUEUES = ['all', 'new', 'pending', 'error', 'blocked', 'autopayment', 'cancelled', 'done']

// guruh sarlavhasi: t(`filters.groups.<key>`), qiymat matni FilterPanel'dagi resolver orqali.
// Sanoqlar ro'yxatdan hisoblanadi (useApplications.filterCounts).
export const FILTER_GROUPS = [
  {
    key: 'status', i18n: 'status', suffix: 'label', checked: [],
    values: ['new', 'pending', 'autopayment', 'blocked', 'error', 'cancelled', 'done']
  },
  {
    key: 'bank', raw: true, checked: [],
    values: ['Kapitalbank', 'Xalq banki', 'Ipoteka bank', 'Trastbank', 'SQB',
      'Aloqabank', 'Anorbank', 'TBC Bank', 'Uzum Bank', 'Hamkorbank']
  },
  {
    key: 'method', i18n: 'methods', checked: [],
    values: ['vishing', 'phishing', 'fakeShop', 'fakeInvest', 'simSwap', 'apk', 'fakeSupport', 'other']
  },
  {
    key: 'source', i18n: 'sources', checked: [],
    values: ['102', 'duty', 'telegram', 'instagram', 'facebook', 'whatsapp',
      'call', 'sms', 'web', 'bankApp', 'other']
  },
  {
    key: 'region', i18n: 'regions', checked: [],
    values: ['tashkentCity', 'tashkentRegion', 'andijan', 'bukhara', 'fergana', 'jizzakh',
      'namangan', 'navoi', 'kashkadarya', 'samarkand', 'syrdarya', 'surkhandarya',
      'khorezm', 'karakalpakstan']
  },
  { key: 'amount', i18n: 'amounts', checked: [], values: ['lt5', 'm5_20', 'm20_50', 'gt50'] },
  { key: 'repeat', i18n: 'repeat', checked: [], values: ['duplicate', 'clean'] },
  { key: 'sla', i18n: 'sla', checked: [], values: ['inTime', 'breached'] }
]

export const DRAFTS = [
  { id: 'KJ-2026-004301', material: 'M0438715/2026-0000', name: 'YUSUPOVA NARGIZA OLIMJON QIZI', method: 'fakeCall', card: '9860 12** **** 4922', bank: 'Uzum bank', tx: 1, done: 85, missing: 'address', time: '14.08.2026 09:12', ago: { unit: 'min', n: 12 } },
  { id: 'KJ-2026-004298', material: 'M0438715/2026-0000', name: "ABDULLAYEV ULUG'BEK SAYDAMATOVICH", method: 'fakeMarket', card: '8600 06** **** 1111', bank: 'Kapitalbank', tx: 2, done: 70, missing: 'fabula', time: '13.08.2026 18:40', ago: { unit: 'day', n: 1 } },
  { id: 'KJ-2026-004295', material: '—', name: 'RAHMONOV TOHIR ANVAROVICH', method: 'telegramBot', card: '9860 35** **** 8584', bank: 'Anorbank', tx: 1, done: 55, missing: 'materialRegion', time: '13.08.2026 11:05', ago: { unit: 'day', n: 1 } },
  { id: '—', material: null, name: 'KARIMOVA DILNOZA SHUHRAT QIZI', method: 'fakeCall', card: '—', bank: null, tx: null, done: 35, missing: 'requisiteAmount', time: '12.08.2026 16:22', ago: { unit: 'day', n: 2 } },
  { id: 'KJ-2026-004288', material: 'M0438715/2026-0000', name: '—', method: 'unknown', card: '8600 49** **** 5031', bank: 'Ipoteka bank', tx: 1, done: 45, missing: 'applicant', time: '11.08.2026 10:03', ago: { unit: 'day', n: 3 } },
  { id: 'KJ-2026-004274', material: 'M0438715/2026-0000', name: "TOSHPO'LATOV AZIZ RUSTAMOVICH", method: 'fakeApp', card: '9860 53** **** 4129', bank: 'Uzum bank', tx: 4, done: 90, missing: 'voice', time: '09.08.2026 15:48', ago: { unit: 'day', n: 5 } }
]

// oqim (102 / navbatchi) uchun rang uslubi
export function flowStyle(flow) {
  return flow === '102'
    ? { bg: 'var(--ce8eef7)', fg: 'var(--c23568f)', bd: 'var(--kc9d9ec)' }
    : { bg: 'var(--cf0f3f8)', fg: 'var(--c4b5a73)', bd: 'var(--ce2e8f1)' }
}
