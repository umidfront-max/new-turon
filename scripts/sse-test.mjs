/*
  SSE klientini tekshiradi.

  1) Soxta oqim: ramkalar to'g'ri ajratiladimi, bo'linib kelgan paket
     yig'iladimi, izoh (heartbeat) hodisa sifatida sanalmaydimi.
  2) Haqiqiy server: /notifications/stream/ ochiladimi.
*/
const mem = () => { const m = new Map(); return { getItem: k => m.has(k) ? m.get(k) : null, setItem: (k, v) => m.set(k, String(v)), removeItem: k => m.delete(k) } }
globalThis.localStorage = mem()
globalThis.sessionStorage = mem()
globalThis.document = {
  body: { dataset: {} },
  documentElement: { style: {}, setAttribute() {} },
  title: '',
  addEventListener() {}, removeEventListener() {},
  createElement: () => ({ style: {}, setAttribute() {}, content: {} }),
  querySelector: () => null
}
globalThis.location = { href: 'http://localhost/', origin: 'http://localhost', pathname: '/', search: '', hash: '' }
globalThis.window = globalThis
globalThis.addEventListener = () => {}
globalThis.removeEventListener = () => {}

const { createServer } = await import('vite')
const vite = await createServer({ server: { middlewareMode: true }, appType: 'custom', logLevel: 'silent' })
const { openStream } = await vite.ssrLoadModule('/src/services/sse.js')

let fail = 0
const ok = (name, cond, extra = '') => { console.log((cond ? '  OK   ' : '  XATO ') + name + (extra ? '  ' + extra : '')); if (!cond) fail++ }

/* ---------- 1) soxta oqim ---------- */
const CHUNKS = [
  ': ping\n\n',                                  // izoh — hodisa emas
  'event: created\ndata: {"id":7,',              // ataylab yarmida uzilgan
  '"title":"Yangi"}\nid: 7\n\n',
  'data: birinchi\ndata: ikkinchi\n\n'           // ko\u0027p satrli data
]
const realFetch = globalThis.fetch
globalThis.fetch = async () => ({
  ok: true,
  status: 200,
  body: {
    getReader() {
      let i = 0
      return { read: async () => (i < CHUNKS.length ? { value: new TextEncoder().encode(CHUNKS[i++]), done: false } : { value: undefined, done: true }) }
    }
  }
})

const seen = []
await new Promise((done) => {
  const s = openStream('/x/', { onEvent: (f) => { seen.push(f); if (seen.length === 2) { s.close(); done() } } })
  setTimeout(() => { s.close(); done() }, 2000)
})

ok('izoh hodisa sifatida sanalmadi', seen.length === 2, `(${seen.length} ta hodisa)`)
ok('bo\u0027linib kelgan ramka yig\u0027ildi', seen[0]?.json?.id === 7 && seen[0].json.title === 'Yangi')
ok('event nomi o\u0027qildi', seen[0]?.event === 'created', seen[0]?.event)
ok('id o\u0027qildi (Last-Event-ID uchun)', seen[0]?.id === '7', seen[0]?.id)
ok('ko\u0027p satrli data birlashdi', seen[1]?.data === 'birinchi' + String.fromCharCode(10) + 'ikkinchi', JSON.stringify(seen[1]?.data))

/* ---------- CORS: brauzer ruxsat bergan sarlavhalar ---------- */
// serverning preflight javobi shu ro'yxatni beradi; boshqasini yuborsak bloklanadi
const ALLOWED = ['accept', 'authorization', 'content-type', 'user-agent', 'x-csrftoken', 'x-requested-with']
let sentHeaders = null
let sentUrl = ''
globalThis.fetch = async (url, init) => {
  sentUrl = String(url)
  sentHeaders = init.headers
  return { ok: true, status: 200, body: { getReader: () => ({ read: () => new Promise(() => {}) }) } }
}
const s3 = openStream('/notifications/stream/', {})
await new Promise((r) => setTimeout(r, 200))
s3.close()
const names = Object.keys(sentHeaders || {}).map((k) => k.toLowerCase())
ok('faqat ruxsat etilgan sarlavhalar', names.every((n) => ALLOWED.includes(n)), names.join(', '))
ok('token sarlavhada ketdi', names.includes('authorization'))
ok('lang manzilda', /[?&]lang=/.test(sentUrl), sentUrl)

/* ---------- 2) haqiqiy server ---------- */
globalThis.fetch = realFetch
console.log('\nhaqiqiy server: /notifications/stream/ (12 soniya)')
let opened = false; let err = null; const live = []
const s2 = openStream('/notifications/stream/', {
  onOpen: () => { opened = true },
  onEvent: (f) => live.push(f),
  onError: (e) => { err = e }
})
await new Promise((r) => setTimeout(r, 12000))
s2.close()
console.log('  ochildi:', opened, '| hodisa:', live.length, '| xato:', err ? err.message : 'yo\u0027q')

/* ---------- 3) do'kon: hodisa kelganda GET qayta ishlaydimi ---------- */
console.log('')
console.log('do\u0027kon bog\u0027lanishi')
const { useNotifications } = await vite.ssrLoadModule('/src/stores/useNotifications.js')
const notifications = useNotifications()

let pushEvent = null
globalThis.fetch = async () => ({
  ok: true,
  status: 200,
  body: {
    getReader() {
      return {
        read: () => new Promise((resolve) => { pushEvent = (text) => resolve({ value: new TextEncoder().encode(text), done: false }) })
      }
    }
  }
})

notifications.connect()
await new Promise((r) => setTimeout(r, 300))
ok('oqim ochilgani belgilandi', notifications.state.streaming === true)

notifications.state.items = []
notifications.state.source = null
pushEvent?.(['event: created', 'data: {\"id\":1}', '', ''].join(String.fromCharCode(10)))
await new Promise((r) => setTimeout(r, 2500))

ok('hodisadan keyin GET ishladi', notifications.state.source === 'api', `source=${notifications.state.source}, ${notifications.state.items.length} ta yozuv`)
notifications.disconnect()
ok('disconnect oqimni yopdi', notifications.state.streaming === false)

globalThis.fetch = realFetch
await vite.close()
console.log(fail ? `\n${fail} ta muammo` : '\nsoxta oqim sinovlari to\u0027liq o\u0027tdi')
process.exit(fail ? 1 : 0)
