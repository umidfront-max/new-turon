/*
  Tarjimalar tekshiruvi:
    - shablonlarda ishlatilgan har bir $t('...') kaliti uz tarjimasida bormi
      (bo'lmasa ekranda `form.applicant.phone2` kabi xom kalit ko'rinadi),
    - uz / uzk / ru kalitlari bir xilmi.

  Dinamik kalitlar ($t(`status.${x}.label`)) tekshirilmaydi — ular shablonda
  qo'shtirnoq bilan yozilmaydi, shuning uchun qidiruvga tushmaydi.
*/
import fs from 'fs'
import path from 'path'

const load = async (lang) => (await import(`../src/i18n/${lang}.js`)).default

const uz = await load('uz')
const uzk = await load('uzk')
const ru = await load('ru')

const fail = []

/* ---------- shablondagi kalitlar tarjimada bormi ---------- */

const has = (dict, key) => key
  .split('.')
  .reduce((node, part) => (node && typeof node === 'object' ? node[part] : undefined), dict) !== undefined

const files = []
const walk = (dir) => fs.readdirSync(dir, { withFileTypes: true }).forEach((entry) => {
  const full = path.join(dir, entry.name)
  if (entry.isDirectory()) walk(full)
  else if (/\.(vue|js)$/.test(entry.name) && !full.includes('i18n')) files.push(full)
})
walk('src')

let used = 0
for (const file of files) {
  const src = fs.readFileSync(file, 'utf8')
  for (const match of src.matchAll(/[$ ({]t\(\s*'([a-zA-Z][\w.]*)'/g)) {
    used += 1
    if (!has(uz, match[1])) fail.push(`${match[1]} — tarjimasi yo'q (${file.split(path.sep).join('/')})`)
  }
}

/* ---------- uchala til bir xilmi ---------- */

const flat = (obj, prefix = '') => Object.entries(obj).flatMap(([key, value]) => (
  value && typeof value === 'object' && !Array.isArray(value)
    ? flat(value, `${prefix}${key}.`)
    : [`${prefix}${key}`]
))

const keys = { uz: new Set(flat(uz)), uzk: new Set(flat(uzk)), ru: new Set(flat(ru)) }

for (const lang of ['uzk', 'ru']) {
  for (const key of keys.uz) if (!keys[lang].has(key)) fail.push(`${lang}: "${key}" yo'q`)
  for (const key of keys[lang]) if (!keys.uz.has(key)) fail.push(`uz: "${key}" yo'q (${lang} da bor)`)
}

console.log(fail.length
  ? 'XATO:\n' + fail.join('\n')
  : `tarjimalar: shablonlardagi ${used} ta kalit topildi, uchala tilda ${keys.uz.size} ta kalit bir xil`)

process.exit(fail.length ? 1 : 0)
