/*
  services/faceAuth.js tekshiruvi — brauzersiz.
  Kamera, canvas va WebSocket o'rniga soxta obyektlar qo'yiladi, shuning uchun
  faqat aloqa tartibi sinaladi: chipta -> ready -> freymlar -> match/error.
*/

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

/* ---------- brauzer o'rnini bosuvchilar ---------- */

globalThis.location = { protocol: 'http:', host: 'app.local' }

globalThis.document = {
  createElement: () => ({
    width: 0,
    height: 0,
    getContext: () => ({ drawImage() {} }),
    toDataURL: () => 'data:image/jpeg;base64,RlJBTUU='
  })
}

let tracksStopped = 0

// Node 22 da navigator faqat o'qish uchun — ustidan yozamiz
Object.defineProperty(globalThis, 'navigator', {
  configurable: true,
  value: {
    mediaDevices: {
      getUserMedia: async () => ({
        getTracks: () => [{ stop() { tracksStopped += 1 } }]
      })
    }
  }
})

class FakeWs {
  static OPEN = 1
  static last = null

  constructor(url) {
    this.url = url
    this.readyState = 0
    this.sent = []
    FakeWs.last = this
    setTimeout(() => {
      if (this.readyState !== 0) return
      this.readyState = FakeWs.OPEN
      this.onopen?.()
    }, 0)
  }

  send(raw) { this.sent.push(JSON.parse(raw)) }
  close() { this.readyState = 3 }

  emit(msg) { this.onmessage?.({ data: JSON.stringify(msg) }) }
  drop() { this.readyState = 3; this.onclose?.() }
}

globalThis.WebSocket = FakeWs

const newVideo = () => ({
  videoWidth: 640,
  videoHeight: 480,
  srcObject: null,
  muted: false,
  play: async () => {},
  addEventListener() {},
  removeEventListener() {}
})

/* ---------- tekshiruvlar ---------- */

const { startFaceCheck, resolveWsUrl, FaceError } = await import('../src/services/faceAuth.js')

const bad = []
const eq = (got, want, what) => { if (got !== want) bad.push(`${what}: ${got} (kutilgan ${want})`) }

// 1. manzil ws ga keltiriladi
eq(resolveWsUrl('http://h/face/ws'), 'ws://h/face/ws', 'http -> ws')
eq(resolveWsUrl('https://h/face/ws'), 'wss://h/face/ws', 'https -> wss')
eq(resolveWsUrl('/face/ws'), 'ws://app.local/face/ws', 'nisbiy yo\'l')
try { resolveWsUrl(''); bad.push("bo'sh manzil xato bermadi") } catch (e) { eq(e.key, 'noUrl', "bo'sh manzil") }

// https sahifada oddiy ws bloklanadi — wss ga ko'tariladi
globalThis.location = { protocol: 'https:', host: 'app.local' }
eq(resolveWsUrl('ws://h/face/ws'), 'wss://h/face/ws', 'https sahifada ws -> wss')
globalThis.location = { protocol: 'http:', host: 'app.local' }

// 2. to'liq oqim: chipta -> ready -> freymlar -> match
{
  tracksStopped = 0
  const states = []
  const prompts = []
  const session = startFaceCheck({
    url: 'http://h/face/ws',
    ticket: 'TICKET-1',
    video: newVideo(),
    frameMs: 5,
    onState: (s) => states.push(s),
    onPrompt: (p) => prompts.push(p)
  })

  await sleep(20)
  const ws = FakeWs.last

  eq(JSON.stringify(ws.sent[0]), '{"face_ticket":"TICKET-1"}', 'birinchi xabar chipta')
  eq(ws.sent.length, 1, 'ready dan oldin freym yuborilmaydi')

  ws.emit({ status: 'ready', prompt: 'Kameraga qarang' })
  await sleep(40)

  const frames = ws.sent.filter((m) => m.frame)
  if (frames.length < 2) bad.push(`freymlar oqmadi: ${frames.length}`)
  eq(frames[0].frame, 'RlJBTUU=', 'freym base64')
  eq(prompts[0], 'Kameraga qarang', "server ko'rsatmasi")

  ws.emit({ status: 'no_face' })
  ws.emit({ status: 'match', face_proof: 'PROOF-1', score: 0.94 })

  const proof = await session.result
  eq(proof, 'PROOF-1', 'proof qaytdi')
  eq(tracksStopped, 1, 'kamera yopildi')
  eq(ws.readyState, 3, 'ws yopildi')
  if (!states.includes('ready') || !states.includes('no_face') || !states.includes('match')) {
    bad.push(`holatlar yetib kelmadi: ${states.join(',')}`)
  }

  const after = ws.sent.length
  await sleep(20)
  eq(ws.sent.length, after, 'match dan keyin freym yuborilmaydi')
}

// 3. server xatosi — xabari ko'rsatiladi
{
  const session = startFaceCheck({ url: 'http://h/ws', ticket: 'T', video: newVideo(), frameMs: 5 })
  await sleep(20)
  FakeWs.last.emit({ status: 'error', message: 'ticket muddati tugagan' })
  const err = await session.result.then(() => null, (e) => e)
  eq(err instanceof FaceError, true, 'xato turi')
  eq(err?.key, 'server', 'server xatosi')
  eq(err?.detail, 'ticket muddati tugagan', 'server matni')
}

// 4. match bo'lsa-yu proof bo'lmasa — xato
{
  const session = startFaceCheck({ url: 'http://h/ws', ticket: 'T', video: newVideo(), frameMs: 5 })
  await sleep(20)
  FakeWs.last.emit({ status: 'match' })
  const err = await session.result.then(() => null, (e) => e)
  eq(err?.key, 'noProof', 'proof yo\'q')
}

// 5. foydalanuvchi bekor qildi — kamera darhol yopiladi
{
  tracksStopped = 0
  const session = startFaceCheck({ url: 'http://h/ws', ticket: 'T', video: newVideo(), frameMs: 5 })
  await sleep(20)
  session.stop()
  const err = await session.result.then(() => null, (e) => e)
  eq(err?.key, 'cancelled', 'bekor qilish')
  eq(tracksStopped, 1, 'bekor qilinganda kamera yopildi')
}

// 6. aloqa uzildi
{
  const session = startFaceCheck({ url: 'http://h/ws', ticket: 'T', video: newVideo(), frameMs: 5 })
  await sleep(20)
  FakeWs.last.emit({ status: 'ready' })
  await sleep(10)
  FakeWs.last.drop()
  const err = await session.result.then(() => null, (e) => e)
  eq(err?.key, 'closed', 'oqim ustida uzilish')
}

// 7. chipta yo'q
{
  const session = startFaceCheck({ url: 'http://h/ws', ticket: '', video: newVideo() })
  const err = await session.result.then(() => null, (e) => e)
  eq(err?.key, 'noTicket', 'chiptasiz')
}

// 8. server ko'rsatmalari kalit so'z bo'yicha tanilishi
{
  const { promptKey } = await import('../src/services/facePrompts.js')
  const cases = [
    ['Slowly turn your head to the right', 'right'],
    ['Turn your head to the left', 'left'],
    ['Look at the camera', 'look'],
    ['Please blink your eyes', 'blink'],
    ['Open your mouth', 'mouth'],
    ['Nod your head', 'nod'],
    ['Raise your head up', 'up'],
    ['Look down', 'down'],
    ['Move closer to the camera', 'closer'],
    ['Please step back', 'farther'],
    ['Remove your glasses', 'glasses'],
    ['Find a brighter place', 'light'],
    ['Hold still and look at the camera', 'still'],
    ['Yangi kutilmagan matn', ''],   // tanilmasa — serverning matni qoladi
    ['', '']
  ]
  for (const [text, want] of cases) eq(promptKey(text), want, `prompt "${text}"`)
}

console.log(bad.length
  ? 'XATO:\n' + bad.join('\n')
  : "yuz bosqichi: chipta, freym oqimi, match/error, bekor qilish, uzilish va ko'rsatma tarjimasi tekshirildi")
process.exit(bad.length ? 1 : 0)
