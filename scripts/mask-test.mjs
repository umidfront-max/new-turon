/*
  Kiritish niqoblari tekshiruvi.

  Asosiy nuqta: Vue qiymat o'zgarmasa maydonni qayta chizmaydi, shuning uchun
  niqob tashlab yuboradigan belgi (17-raqam, harf, ortiqcha bo'sh joy) ekranda
  qolib ketishi mumkin. `applyMask` DOM ni ham tekislaydi — shu yerda aynan
  maydonning o'zidagi qiymat tekshiriladi.
*/
import { createServer } from 'vite'

const vite = await createServer({ server: { middlewareMode: true }, appType: 'custom', logLevel: 'silent' })
const {
  applyMask, maskCard, maskAccount, maskAmount, maskPhone, maskDateTime
} = await vite.ssrLoadModule('/src/data/form.js')

const fail = []
const ok = (cond, msg) => { if (!cond) fail.push(msg) }

/** Foydalanuvchi yozgan matnli soxta maydon. */
function field(value, caret = null) {
  return {
    value,
    selectionStart: caret ?? value.length,
    setSelectionRange(a) { this.selectionStart = a }
  }
}

const eq = (got, want, what) => { if (got !== want) fail.push(`${what}: "${got}" (kutilgan "${want}")`) }

/* ---------- karta raqami ---------- */

// 16 tadan ortiq raqam qabul qilinmaydi va maydonning o'zi ham tozalanadi
{
  const el = field('2312 3123 2133 1232323')
  const out = applyMask(el, maskCard)
  eq(out, '2312 3123 2133 1232', 'karta: 16 raqamdan oshdi')
  eq(el.value, '2312 3123 2133 1232', 'karta: maydon tozalanmadi')
}

// harf tushib qoladi
{
  const el = field('2312abc')
  eq(applyMask(el, maskCard), '2312', 'karta: harf qoldi')
  eq(el.value, '2312', 'karta: maydonda harf qoldi')
}

// oradagi ortiqcha bo'sh joylar o'zi tartibga tushadi
{
  const el = field('2312   3123')
  eq(applyMask(el, maskCard), '2312 3123', "karta: bo'sh joy tozalanmadi")
}

// to'liq raqamga yana bir raqam qo'shib bo'lmaydi
{
  const full = '8600 1234 5678 9012'
  const el = field(`${full}5`)
  eq(applyMask(el, maskCard), full, 'karta: 17-raqam kirib ketdi')
}

// hisob raqami — 20 ta
{
  const el = field('2020 8012 3456 7890 1234 99')
  eq(applyMask(el, maskAccount), '2020 8012 3456 7890 1234', 'hisob: 20 raqamdan oshdi')
}

/* ---------- kursor ---------- */

// oxiriga yozilganda kursor oxirida qoladi
{
  const el = field('2312 3123 2133 12325', 20)
  applyMask(el, maskCard)
  eq(el.selectionStart, el.value.length, 'kursor oxirida qolmadi')
}

// o'rtaga tashlangan harf kursorni surib yubormasin
{
  const el = field('2312a 3123', 5)
  applyMask(el, maskCard)
  eq(el.value, '2312 3123', 'karta: harf tozalanmadi')
  eq(el.selectionStart, 4, "kursor 4-raqamdan keyin turishi kerak")
}

/* ---------- summa, telefon, sana ---------- */

{
  const el = field('12a3 456')
  eq(applyMask(el, maskAmount), '123 456', 'summa: harf qoldi')
}

{
  const el = field('+998 90 123 45 6789')
  eq(applyMask(el, maskPhone), '+998 90 123 45 67', 'telefon: 9 raqamdan oshdi')
  eq(el.value, '+998 90 123 45 67', 'telefon: maydon tozalanmadi')
}

{
  const el = field('14.03.2026 01:1399')
  eq(applyMask(el, maskDateTime), '14.03.2026 01:13', 'sana: ortiqcha raqam qoldi')
}

/* ---------- qiymat o'zgarmasa maydonga tegilmaydi ---------- */
{
  const el = field('8600 1234', 4)
  applyMask(el, maskCard)
  eq(el.selectionStart, 4, "toza qiymatda kursor qimirladi")
}

console.log(fail.length
  ? 'XATO:\n' + fail.join('\n')
  : 'niqoblar: karta 16, hisob 20, telefon, summa va sana chegaralari hamda kursor tekshirildi')

await vite.close()
process.exit(fail.length ? 1 : 0)
