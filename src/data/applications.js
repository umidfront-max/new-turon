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
  done: { fg: 'var(--c0e6a6e)', bg: 'var(--ce5f2f2)', bd: 'var(--cc3e0e0)' }
}

export const APPLICATIONS = [
  { n: 1, id: 'M0126290/2026-10011', material: 'KJ-2026-004217', flow: '102', name: "ABDULLAYEV ULUG'BEK SAYDAMATOVICH", method: 'vishing', card: '9860 2703 6925 4910', bank: 'Kapitalbank', amount: '12 500 000', cur: 'UZS', status: 'pending', time: '04.08.2026 09:12' },
  { n: 2, id: 'M0126291/2026-10012', material: null, flow: 'duty', name: 'MALABOEV DILSHOD SOKINOVICH', method: 'phishing', card: '8600 3329 8653 5924', bank: 'Ipoteka bank', amount: '4 780 000', cur: 'UZS', status: 'new', time: '04.08.2026 08:41' },
  { n: 3, id: 'M0126284/2026-10008', material: 'KJ-2026-004201', flow: '102', name: 'TUROBIDINOVA MALOHAT LEODINOVNA', method: 'apk', card: '5614 6818 8572 6806', bank: 'Hamkorbank', amount: '51 300 000', cur: 'UZS', status: 'error', time: '03.08.2026 19:26', overdue: true },
  { n: 4, id: 'M0126279/2026-10004', material: 'KJ-2026-004188', flow: '102', name: 'MAMATOV AVZXON BAXODIROVICH', method: 'fakeShop', card: '9860 0120 1189 7377', bank: 'SQB', amount: '2 150 000', cur: 'UZS', status: 'blocked', time: '03.08.2026 15:03' },
  { n: 5, id: 'M0126275/2026-10001', material: 'KJ-2026-004180', flow: 'duty', name: 'IBRAGIMOVA ROHATOY SOBIROVNA', method: 'simSwap', card: '5614 6814 2703 6342', bank: 'Trastbank', amount: '19 400 000', cur: 'UZS', status: 'pending', time: '03.08.2026 12:47' },
  { n: 6, id: 'M0126270/2026-09996', material: 'KJ-2026-004171', flow: '102', name: 'NISHANOV TIMUR RUSTAMOVICH', method: 'fakeInvest', card: '9860 0103 0720 2941', bank: 'Anorbank', amount: '87 900 000', cur: 'UZS', status: 'blocked', time: '02.08.2026 18:20', overdue: true },
  { n: 7, id: 'M0126266/2026-09991', material: 'KJ-2026-004166', flow: '102', name: 'XUSNIYOXON XOJIYEVA ANVAROVNA', method: 'fakeSupport', card: '9860 1201 1897 3771', bank: 'Aloqabank', amount: '6 340 000', cur: 'UZS', status: 'autopayment', time: '02.08.2026 14:55' },
  { n: 8, id: 'M0126261/2026-09985', material: 'KJ-2026-004159', flow: 'duty', name: 'MIRZASHARIPOV SARVARBEK BAXODIR', method: 'phishing', card: '5614 6814 2703 6342', bank: 'Uzum Bank', amount: '14 720 000', cur: 'RUB', status: 'done', time: '01.08.2026 11:38' },
  { n: 9, id: 'M0126257/2026-09980', material: 'KJ-2026-004150', flow: '102', name: 'BEKNAZAROVA ZUHRA ALISHEROVNA', method: 'other', card: '9860 6067 5458 0490', bank: 'TBC Bank', amount: '1 090 000', cur: 'CRYPTO', status: 'cancelled', time: '01.08.2026 09:04' }
]

// label/note: t(`kpi.<key>.label`) / t(`kpi.<key>.note`)
export const KPI = [
  { key: 'new', value: '14', tone: 'var(--c23568f)', iconBg: 'var(--ce8eef7)', icon: 'inbox' },
  { key: 'pending', value: '23', tone: 'var(--c96620a)', iconBg: 'var(--cfdf3e3)', icon: 'clock' },
  { key: 'blocked', value: '46', tone: 'var(--c1a6e4b)', iconBg: 'var(--ce3f2e9)', icon: 'lock' },
  { key: 'autopayment', value: '7', tone: 'var(--c5b3fa8)', iconBg: 'var(--cefeafa)', icon: 'refresh' },
  { key: 'overdue', value: '5', tone: 'var(--ca52220)', iconBg: 'var(--cfceceb)', icon: 'alarm' }
]

// label: t(`queues.<key>`)
export const QUEUES = [
  ['all', 128], ['new', 14], ['pending', 23], ['error', 9],
  ['blocked', 46], ['autopayment', 7], ['cancelled', 12], ['done', 17]
].map(([key, count]) => ({ key, count }))

// guruh sarlavhasi: t(`filters.groups.<key>`)
// qiymat matni: FilterPanel'dagi resolver orqali (i18n prefiksi yoki xom qiymat)
export const FILTER_GROUPS = [
  {
    key: 'status', i18n: 'status', suffix: 'label', checked: ['pending'], values: [
      ['new', 14], ['pending', 23], ['autopayment', 7], ['blocked', 46],
      ['error', 9], ['cancelled', 12], ['done', 17]]
  },
  {
    key: 'bank', raw: true, checked: ['Kapitalbank'], values: [
      ['Kapitalbank', 21], ['Xalq banki', 13], ['Ipoteka bank', 18], ['Trastbank', 7], ['SQB', 11],
      ['Aloqabank', 9], ['Anorbank', 14], ['TBC Bank', 8], ['Uzum Bank', 16], ['Hamkorbank', 11]]
  },
  {
    key: 'method', i18n: 'methods', checked: [], values: [
      ['vishing', 38], ['phishing', 29], ['fakeShop', 17],
      ['fakeInvest', 12], ['simSwap', 8], ['apk', 14],
      ['fakeSupport', 6], ['other', 4]]
  },
  {
    key: 'source', i18n: 'sources', checked: ['102'], values: [
      ['102', 71], ['duty', 24], ['telegram', 12], ['instagram', 6], ['facebook', 3],
      ['whatsapp', 4], ['call', 2], ['sms', 2], ['web', 2], ['bankApp', 1], ['other', 1]]
  },
  {
    key: 'region', i18n: 'regions', checked: [], values: [
      ['tashkentCity', 34], ['tashkentRegion', 14], ['andijan', 12], ['bukhara', 7],
      ['fergana', 11], ['jizzakh', 5], ['namangan', 9], ['navoi', 4], ['kashkadarya', 6],
      ['samarkand', 10], ['syrdarya', 3], ['surkhandarya', 4], ['khorezm', 5], ['karakalpakstan', 4]]
  },
  {
    key: 'amount', i18n: 'amounts', checked: [], values: [
      ['lt5', 41], ['m5_20', 52], ['m20_50', 24], ['gt50', 11]]
  },
  {
    key: 'repeat', i18n: 'repeat', checked: [], values: [
      ['duplicate', 19], ['clean', 109]]
  },
  {
    key: 'sla', i18n: 'sla', checked: [], values: [
      ['inTime', 123], ['breached', 5]]
  }
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
