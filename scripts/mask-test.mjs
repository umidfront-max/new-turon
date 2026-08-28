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
  applyMask, maskCard, maskAccount, maskAmount, maskPhone, maskDateTime,
  toIsoDateTime, fromIsoDateTime
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

/**
 * Brauzerdagidek belgilab-belgilab yozadi: har bir belgi kursor turgan joyga
 * qo'yiladi va shundan keyin niqob qo'llanadi. Kursor xato tiklansa raqamlar
 * aralashib ketadi — aynan shuni ushlaydi.
 */
function type(text, mask, start = '') {
  const el = field(start)
  for (const ch of text) {
    const at = el.selectionStart
    el.value = el.value.slice(0, at) + ch + el.value.slice(at)
    el.selectionStart = at + 1
    applyMask(el, mask)
  }
  return el
}

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

/*
  Hisob raqami — 22 ta. Uzunlik serverning tekshiruvidan olingan:
  "Karta (12-19 raqam) yoki hisob raqamini (22 raqam) kiriting".
*/
{
  const el = field('2020 8012 3456 7890 1234 5699')
  eq(applyMask(el, maskAccount), '2020 8012 3456 7890 1234 56', 'hisob: 22 raqamdan oshdi')
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
  // kursor o'zidan keyingi 4 ta raqam oldida qoladi
  eq(el.selectionStart, 5, "kursor keyingi guruh oldida turishi kerak")
}

/* ---------- ketma-ket yozish (kursor to'g'ri tiklanishi) ---------- */

// telefonda `+998 ` prefiksi niqobning o'zi tomonidan qo'shiladi — yozilgan
// raqamlar tartibi buzilmasligi kerak
{
  const el = type('901234567', maskPhone)
  eq(el.value, '+998 90 123 45 67', 'telefon: yozilgan raqamlar aralashib ketdi')
  eq(el.selectionStart, el.value.length, 'telefon: kursor oxirida qolmadi')
}

/*
  To'liq raqam bir marta joylashtirilsa (paste) mamlakat kodi tashlanadi.
  Belgilab-belgilab yozilganda esa `+998 ` allaqachon turgani uchun har bir
  raqam abonent raqami sifatida qabul qilinadi — bu kutilgan xatti-harakat.
*/
{
  const el = field('998901234567')
  eq(applyMask(el, maskPhone), '+998 90 123 45 67', 'telefon: joylashtirilganda kod tashlanmadi')
}

{
  const el = type('8600123456789012', maskCard)
  eq(el.value, '8600 1234 5678 9012', 'karta: ketma-ket yozishda tartib buzildi')
  eq(el.selectionStart, el.value.length, 'karta: kursor oxirida qolmadi')
}

{
  eq(type('1403202601', maskDateTime).value, '14.03.2026 01', 'sana: ketma-ket yozishda xato')
}

{
  eq(type('123456', maskAmount).value, '123 456', 'summa: ketma-ket yozishda xato')
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

/* ---------- o'chirish ---------- */
// oxiridan belgi o'chirilganda kursor oxirida qoladi
{
  const el = field('+998 90 123 45 6', 16)
  applyMask(el, maskPhone)
  eq(el.value, '+998 90 123 45 6', "telefon: o'chirishda qiymat o'zgardi")
}

/* ---------- serverga o'girish va qaytarish ---------- */

// forma <-> server: qoralamani qayta ochganda vaqt aynan tiklanishi kerak
{
  const shown = '14.03.2026 01:13'
  const iso = toIsoDateTime(shown)
  eq(iso, '2026-03-14T01:13:00+05:00', "ISO ga ogirish xato")
  eq(fromIsoDateTime(iso), shown, "ISO dan qaytarish xato")
}

// noto'g'ri qiymat serverga ketmasligi kerak
eq(toIsoDateTime('14.03.2026'), '', "to'liqmas sana ISO ga o'girildi")
eq(toIsoDateTime('32.13.2026 99:99'), '', "yaroqsiz sana ISO ga o'girildi")
eq(fromIsoDateTime(''), '', "bo'sh ISO dan qiymat chiqdi")

console.log(fail.length
  ? 'XATO:\n' + fail.join('\n')
  : 'niqoblar: karta 16, hisob 22, telefon, summa va sana chegaralari hamda kursor tekshirildi')

await vite.close()
process.exit(fail.length ? 1 : 0)
