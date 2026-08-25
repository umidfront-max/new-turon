// Banklar ma'lumotnomasi — yangi dizayndan (cardBlock_new.html).
// [nomi, MFO, BIN kodlari, faol emasmi]
const RAW = [
  ["O'zbekiston Milliy banki", '00450', '860002,986001'],
  ['Sanoatqurilishbank', '00440', '860008,986004'],
  ['Asakabank', '00417', '860006,986015'],
  ['Ipoteka bank', '00437', '860030,986003'],
  ['Agrobank', '00975', '860020,986005'],
  ['Xalq banki', '00443', '860014,986011'],
  ['Mikrokreditbank', '00447', '860026,986016'],
  ['Aloqabank', '00401', '860011,986009'],
  ['Turonbank', '00404', '860055', true],
  ['Qishloq qurilish bank', '00435', '860058,986019'],
  ['Hamkorbank', '00083', '860038,986002'],
  ['Kapitalbank', '01088', '860049,986008'],
  ["Ipak Yo'li banki", '01041', '860044,986010'],
  ['Trastbank', '00491', '860042'],
  ['Davr bank', '01072', '860051'],
  ['Universal bank', '00459', '860062'],
  ['Orient Finans bank', '01071', '860071,986013'],
  ['InFinBank', '01049', '860035,986014'],
  ['Ravnaq bank', '01083', '860067', true],
  ['Hi-Tech bank', '01097', '860074'],
  ['Ziraat Bank Uzbekistan', '01043', '860077'],
  ['KDB Bank Uzbekistan', '01044', '860079,986021'],
  ['Saderat bank', '01050', '860081'],
  ['TBC Bank', '01111', '860063,986018'],
  ['Anorbank', '01183', '860082,986022'],
  ['Uzum Bank', '01142', '860018,986012'],
  ['Poytaxt bank', '01062', '860085'],
  ['Madad Invest bank', '01065', '860086'],
  ['Tenge Bank', '01098', '860088,986023'],
  ['Garant bank', '01053', '860089'],
  ['Asia Alliance bank', '01067', '860091,986024'],
  ['Oktobank', '01079', '860093'],
  ['Avo bank', '01186', '860095,986025'],
  ['Smartbank', '01190', '860097,986026']
]

/** BIN prefiksidan to'lov tizimi: 8600/5614 — UzCard, 9860 — Humo */
export function binSystem(bin) {
  const head = String(bin).slice(0, 4)
  if (head === '9860' || head === '9860'.slice(0, 4)) return 'Humo'
  if (head.startsWith('98')) return 'Humo'
  if (head === '8600' || head === '5614') return 'UzCard'
  return 'UzCard'
}

export const BANKS = RAW.map(([name, mfo, bins, off], i) => ({
  id: `b${i + 1}`,
  name,
  mfo,
  bins: bins.split(','),
  active: !off
}))
