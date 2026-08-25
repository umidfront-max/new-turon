/*
  DSKEYS papkasidagi kalitlar ro'yxati.

  Brauzer diskni o'zi o'qiy olmaydi, shuning uchun foydalanuvchi papkani bir marta
  tanlaydi (<input webkitdirectory>) — shundan keyin ro'yxat E-imzo'dagidek ko'rinadi.
  Parol faqat tanlangan kalit uchun so'raladi va serverga yuboriladi.
*/

const KEY_RE = /\.(pfx|p12)$/i

/**
 * Fayl nomidan identifikatorni ajratadi.
 * DS + 18 raqam -> JSHSHIR(14) + tartib(4)
 * DS + 13 raqam -> STIR(9) + tartib(4)
 */
export function idFromName(name) {
  const m = /^DS(\d+)\.(?:pfx|p12)$/i.exec(name)
  if (!m) return null

  const digits = m[1]
  if (digits.length === 18) return { kind: 'pinfl', value: digits.slice(0, 14), seq: digits.slice(14) }
  if (digits.length === 13) return { kind: 'tin', value: digits.slice(0, 9), seq: digits.slice(9) }
  return { kind: 'id', value: digits, seq: '' }
}

/** "gadoyev_o'tkir_ilxom_o'g'li.pfx" -> "Gadoyev O'tkir Ilxom O'g'li" */
function titleFromName(name) {
  const base = name.replace(KEY_RE, '').replace(/[_-]+/g, ' ').trim()
  if (!base) return name
  return base.replace(/(^|\s)(\S)/g, (_, sp, ch) => sp + ch.toUpperCase())
}

/** Baytni "2.4 KB" ko'rinishiga o'giradi. */
export function humanSize(bytes) {
  return `${(bytes / 1024).toFixed(1)} KB`
}

/**
 * FileList / File[] dan kalitlar ro'yxatini yig'adi.
 * Faqat .pfx va .p12 olinadi, nom bo'yicha tartiblanadi.
 */
export function collectKeys(files) {
  const list = []

  for (const file of Array.from(files || [])) {
    if (!KEY_RE.test(file.name)) continue

    const id = idFromName(file.name)
    list.push({
      // ro'yxatda takrorlanmaydigan kalit
      key: `${file.name}:${file.size}:${file.lastModified}`,
      file,
      name: file.name,
      title: id ? file.name.replace(KEY_RE, '') : titleFromName(file.name),
      size: humanSize(file.size),
      // DS-siz fayllarda identifikator faqat parol kiritilgach ma'lum bo'ladi
      idKind: id ? id.kind : null,
      idValue: id ? id.value : '',
      idSeq: id ? id.seq : '',
      // papka tanlanganda brauzer nisbiy yo'lni ham beradi
      path: file.webkitRelativePath || file.name
    })
  }

  return list.sort((a, b) => a.name.localeCompare(b.name))
}

/** Papka tanlash qo'llab-quvvatlanadimi (Safari'da yo'q). */
export function canPickFolder() {
  try {
    return 'webkitdirectory' in document.createElement('input')
  } catch {
    return false
  }
}
