/*
  face_recog xizmati ko'rsatmalarni inglizcha yuboradi
  ("Slowly turn your head to the right"). To'liq ro'yxat hujjatlashtirilmagan,
  shuning uchun matn aynan solishtirilmaydi — kalit so'z qidiriladi.

  promptKey() topilgan turni qaytaradi (login.faceCheck.prompts.* kaliti),
  tanilmasa bo'sh satr — o'shanda serverning o'z matni ko'rsatiladi.

  Tartib muhim: aniqroq ko'rsatma umumiyroqidan oldin turadi, chunki
  "Hold still and look at the camera" ikkalasiga ham tushadi.
*/

const RULES = [
  [/\bblink\b/, 'blink'],
  [/\bmouth\b/, 'mouth'],
  [/\bsmile\b/, 'smile'],
  [/\bnod\b/, 'nod'],
  [/\bright\b/, 'right'],
  [/\bleft\b/, 'left'],
  [/\b(up|upward|upwards|raise)\b/, 'up'],
  [/\b(down|downward|downwards|lower)\b/, 'down'],
  [/\b(closer|nearer)\b|\b(come|move|step) close/, 'closer'],
  [/\b(farther|further|away)\b|\b(move|step) back\b/, 'farther'],
  [/\bglasses\b/, 'glasses'],
  [/\b(light|lighting|dark|darker|bright|brighter)\b/, 'light'],
  [/\b(still|steady|hold)\b|\bdon'?t move\b/, 'still'],
  [/\b(look|camera|face|center|centre|straight|forward)\b/, 'look']
]

/**
 * Ko'rsatma turini aniqlaydi.
 * @param {string} text serverdan kelgan matn
 * @returns {string} login.faceCheck.prompts.* kaliti yoki bo'sh satr
 */
export function promptKey(text) {
  const low = String(text || '').trim().toLowerCase()
  if (!low) return ''

  const hit = RULES.find(([re]) => re.test(low))
  return hit ? hit[1] : ''
}
