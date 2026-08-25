// play/pause markazda ekanini tekshiramiz: chizmaning o'rta nuqtasi 12 bo'lishi kerak
import { readFileSync, readdirSync } from 'node:fs'

const dir = 'src/assets/icons'
const bad = []

function centroidX(path) {
  const nums = path.match(/-?\d+(\.\d+)?/g).map(Number)
  const xs = nums.filter((_, i) => i % 2 === 0)
  return xs.reduce((a, b) => a + b, 0) / xs.length
}

// play: uchburchak markazi
const play = readFileSync(`${dir}/play.svg`, 'utf8')
const d = /d="([^"]+)"/.exec(play)[1]
const c = centroidX(d)
if (Math.abs(c - 12) > 0.3) bad.push(`play markazi ${c} (12 kutilgan)`)
if (!/fill="currentColor"/.test(play)) bad.push("play to'ldirilgan emas")

// pause: ikki to'rtburchak o'rtasi
const pause = readFileSync(`${dir}/pause.svg`, 'utf8')
const rects = [...pause.matchAll(/x="([\d.]+)"[^>]*width="([\d.]+)"/g)].map((m) => [+m[1], +m[2]])
const left = Math.min(...rects.map((r) => r[0]))
const right = Math.max(...rects.map((r) => r[0] + r[1]))
const mid = (left + right) / 2
if (Math.abs(mid - 12) > 0.3) bad.push(`pause markazi ${mid} (12 kutilgan)`)
if (!/fill="currentColor"/.test(pause)) bad.push("pause to'ldirilgan emas")

// barcha ikonkalarda viewBox bormi
for (const f of readdirSync(dir)) {
  const raw = readFileSync(`${dir}/${f}`, 'utf8')
  if (!/viewBox="/.test(raw)) bad.push(`${f}: viewBox yo'q`)
}

console.log(`ikonka fayllari: ${readdirSync(dir).length}`)
console.log('play markazi:', c.toFixed(2), '| pause markazi:', mid.toFixed(2))
console.log(bad.length ? 'XATO:\n' + bad.join('\n') : 'markazlash: muammo topilmadi')
process.exit(bad.length ? 1 : 0)
