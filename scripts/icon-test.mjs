// Ikonkalar: har bir ishlatilgan nom Material Symbols glifiga bog'langanmi?
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'

const files = []
;(function walk(dir) {
  for (const f of readdirSync(dir)) {
    const p = join(dir, f)
    if (statSync(p).isDirectory()) walk(p)
    else if (/\.(vue|js)$/.test(f)) files.push(p)
  }
})('src')

const map = readFileSync('src/components/ui/icons.js', 'utf8')
const known = new Set([...map.matchAll(/^\s{2}([A-Za-z]+):\s*'/gm)].map((m) => m[1]))

const used = new Set()
for (const f of files) {
  const src = readFileSync(f, 'utf8')
  // <AppIcon name="..." /> — :name="..." (dinamik) hisobga olinmaydi
  for (const m of src.matchAll(/<AppIcon[^>]*(?<!:)name="([A-Za-z]+)"/g)) used.add(m[1])
  // ma'lumot fayllaridagi { icon: '...' } maydonlari
  for (const m of src.matchAll(/\bicon:\s*'([A-Za-z]+)'/g)) used.add(m[1])
  // dinamik tanlov: :name="a ? 'x' : 'y'"
  for (const m of src.matchAll(/:name="[^"]*'([A-Za-z]+)'[^"]*'([A-Za-z]+)'/g)) {
    used.add(m[1])
    used.add(m[2])
  }
}

const missing = [...used].filter((n) => !known.has(n)).sort()

console.log(`ikonka nomlari: jadvalda ${known.size}, kodda uchraydi ${used.size}`)
console.log(missing.length
  ? "XATO — jadvalda yo'q: " + missing.join(', ')
  : 'barcha ikonka nomlari jadvalda bor')
process.exit(missing.length ? 1 : 0)
