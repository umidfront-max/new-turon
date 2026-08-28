/*
  Navbatchilik hisoboti uchun sozlamalar.

  Hisobotning o'zi — smena sarlavhasi, natijalar, bajarilgan va topshirilayotgan
  ishlar hamda topshiriladigan xodimlar ro'yxati — serverdan keladi
  (`GET /duty/{id}/` va `GET /duty/candidates/`). Ilgari shu yerda namuna
  ma'lumot turardi va oynada o'sha ko'rinardi.

  Bu yerda faqat serverdagi ro'yxat bilan bir xil bo'lishi shart bo'lgan
  qiymatlar qoladi.
*/

/*
  Rahbar hisobotni qaytarganda ko'rsatadigan sabablar — serverdagi
  DutyReturnReasonEnum qiymatlari. Yorliqlar: t(`dutyReport.reasons.<qiymat>`)
*/
export const REASONS = ['incomplete_report', 'unfinished_work', 'wrong_successor', 'other']
