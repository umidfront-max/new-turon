// DSKEYS papkasidagi kalitlarni ro'yxatlaydi va parol berilsa /login-pfx orqali tekshiradi.
//
//   node scripts/eri-keys.mjs                       — ro'yxat
//   node scripts/eri-keys.mjs iiv_kiber_user.pfx <parol>   — bitta kalitni tekshirish
import { readdir, stat, readFile } from 'node:fs/promises'
import { join } from 'node:path'

const DIR = process.env.DSKEYS || 'C:\\DSKEYS'
const BASE = (process.env.VITE_ERI_URL || 'http://192.168.14.186/eri-login').replace(/\/+$/, '')

// DS + 13 raqam -> STIR, DS + 18 raqam -> JSHSHIR(14) + tartib(4)
function idFromName(name) {
  const m = /^DS(\d+)\.pfx$/i.exec(name)
  if (!m) return null
  const digits = m[1]
  if (digits.length === 18) return { kind: 'JSHSHIR', value: digits.slice(0, 14), seq: digits.slice(14) }
  if (digits.length === 13) return { kind: 'STIR', value: digits.slice(0, 9), seq: digits.slice(9) }
  return { kind: 'ID', value: digits, seq: '' }
}

async function list() {
  const names = (await readdir(DIR)).filter((n) => /\.(pfx|p12)$/i.test(n))
  console.log(`${DIR} — ${names.length} ta kalit\n`)
  console.log('fayl'.padEnd(38), 'hajm'.padStart(8), ' sana'.padEnd(12), 'identifikator')
  console.log('-'.repeat(92))

  for (const name of names.sort()) {
    const info = await stat(join(DIR, name))
    const id = idFromName(name)
    const day = info.mtime.toISOString().slice(0, 10)
    const label = id ? `${id.kind} ${id.value}${id.seq ? ' · ' + id.seq : ''}` : 'fayl nomidan aniqlanmadi'
    console.log(
      name.padEnd(38),
      `${(info.size / 1024).toFixed(1)} KB`.padStart(8),
      ` ${day}`.padEnd(12),
      label
    )
  }

  console.log('\nSertifikat tafsilotlari uchun parol kerak:')
  console.log('  node scripts/eri-keys.mjs <fayl> <parol>')
}

async function check(name, password) {
  const file = name.includes('\\') || name.includes('/') ? name : join(DIR, name)
  const pfx_b64 = (await readFile(file)).toString('base64')

  const res = await fetch(`${BASE}/login-pfx`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Audit-Id': `cli-${Date.now().toString(36)}` },
    body: JSON.stringify({ pfx_b64, password })
  })

  const data = await res.json()
  if (!data.success) {
    console.error(`✗ ${name}: ${data.message || 'rad etildi'}`)
    process.exit(1)
  }

  const c = data.certificate || {}
  console.log(`✓ ${name}`)
  console.log('  user_id  :', data.user_id ?? '—')
  console.log('  has_face :', data.has_face ? 'ha' : "yo'q")
  console.log('  amal     :', c.not_before || '—', '→', c.not_after || '—', c.expired ? '(muddati tugagan)' : '')
  console.log('  seriya   :', c.serial_number || '—')
  console.log('  subject  :', typeof c.subject === 'string' ? c.subject : JSON.stringify(c.subject))
  console.log('  identity :', JSON.stringify(c.identity))
}

const [name, password] = process.argv.slice(2)
if (name && password) await check(name, password)
else await list()
