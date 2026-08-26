// Navbatchilik hisoboti — yangi dizayndagi (cardBlock_new.html) namuna ma'lumot.
// Matnlar i18n'da: dutyReport.*

export const CODE = 'NH-2026-0814-01 · 14.08.2026 · 1-smena'

/* ---------- smena natijalari ---------- */
export const STATS = [
  { key: 'accepted', v: '24' },
  { key: 'blocked', v: '46' },
  { key: 'sent', v: '23' },
  { key: 'closed', v: '18', fg: 'var(--c1a6e4b)' },
  { key: 'autopayment', v: '7' },
  { key: 'answer', v: '6 daq' }
]

/* ---------- bajarilgan ishlar ---------- */
export const DONE = [
  { id: 'CB-2026-4831', key: 'blocked', tag: 'closed', time: '11:20' },
  { id: 'CB-2026-4829', key: 'bankRequest', tag: 'done', time: '13:05' },
  { id: 'CB-2026-4822', key: 'autopayment', tag: 'closed', time: '15:40' },
  { id: 'CB-2026-4818', key: 'manyBlocked', tag: 'done', time: '18:12' }
]

export const TAG_TONE = {
  closed: { bg: 'var(--ce3f2e9)', fg: 'var(--c1a6e4b)' },
  done: { bg: 'var(--ceef2fb, var(--ce8eef7))', fg: 'var(--c23568f)' }
}

/* ---------- topshirilayotgan ishlar ---------- */
export const LEFT = [
  { id: 'CB-2026-4835', key: 'waitBank', next: 'tomorrow' },
  { id: 'CB-2026-4833', key: 'noContact', next: 'recall' },
  { id: 'CB-2026-4830', key: 'notEnough', next: 'request' }
]

/* ---------- kimga topshiriladi ---------- */
export const TARGETS = [
  { ini: 'IJ', name: 'Ismoilov Jasur', note: '2-smena · 09:00–21:00' },
  { ini: 'QB', name: 'Qodirov Bekzod', note: '2-smena · zaxira' },
  { ini: 'YN', name: 'Yusupova Nilufar', note: '3-smena · 21:00–09:00' }
]

/* ---------- rahbar qaytarish sabablari ---------- */
/*
  Qaytarish sabablari — serverdagi DutyReturnReasonEnum qiymatlari.
  Yorliqlar: t(`dutyReport.reasons.<qiymat>`)
*/
export const REASONS = ['incomplete_report', 'unfinished_work', 'wrong_successor', 'other']
