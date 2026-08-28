/*
  Yuz tanish bosqichi — kamera freymlari WebSocket orqali face_recog xizmatiga
  yuboriladi. Manzil (`face_ws_url`) va chipta (`face_ticket`) auth-gateway ning
  /auth/pfx javobidan keladi — services/eriLogin.js dagi authPfxB64() ga qarang.

  Aloqa tartibi:
    1. ws ochiladi          -> { face_ticket }
    2. server tayyor bo'lsa -> { status: 'ready', prompt }
    3. freymlar oqimi       -> { frame: '<jpeg base64>' }  har ~350 ms
    4. server holatlari     -> liveness | no_face | spoof | no_match | match | error
    5. match                -> { face_proof } — /auth/complete uchun dalil

  Bosqich faqat bitta natija beradi: proof yoki xato. Kamera va ws har qanday
  yakunda (jumladan bekor qilinganda) albatta yopiladi.

  Ishlab chiqish rejimida har bir xabar va yuborilgan freymlar soni konsolga
  chiqadi — services/keyLog.js dagi logFace().
*/
import { logFace } from './keyLog.js'

const FRAME_MS = 350        // freymlar orasidagi tanaffus
const JPEG_QUALITY = 0.8
const OPEN_TIMEOUT = 15000  // ws ochilishini kutish
const TOTAL_TIMEOUT = 90000 // butun bosqich uchun chegara

export class FaceError extends Error {
  /**
   * @param {string} key i18n kaliti (login.faceCheck.errors.*)
   * @param {string} [detail] serverdan kelgan matn — bo'lsa shu ko'rsatiladi
   */
  constructor(key, detail) {
    super(detail || key)
    this.key = key
    this.detail = detail || ''
  }
}

/*
  Yuz xizmatining xosti.

  Darvoza `face_ws_url` ni o'zi qaytaradi, lekin u ichki tarmoq manzili
  bo'lishi mumkin (masalan ws://192.168...). Ilova tashqaridan — tunnel yoki
  boshqa xost orqali ochilganda bunday manzilga ulanib bo'lmaydi. Shu sababli
  `VITE_FACE_WS` berilgan bo'lsa, manzilning faqat protokoli va xosti
  almashtiriladi; yo'l va parametrlar serverdagicha qoladi.
*/
const FACE_WS = String(import.meta.env?.VITE_FACE_WS || '').trim()

/**
 * Serverdan kelgan manzilni brauzer tushunadigan ws manziliga keltiradi.
 * http(s) -> ws(s), nisbiy yo'l -> joriy host. Sahifa https bo'lsa oddiy ws
 * bloklanadi, shuning uchun wss ga ko'tariladi.
 *
 * @param {string} raw serverdan kelgan manzil
 * @param {string} [override] xostni almashtirish uchun (sinovlarda beriladi)
 */
export function resolveWsUrl(raw, override = FACE_WS) {
  const value = String(raw || '').trim()
  if (!value) throw new FaceError('noUrl')

  const secure = typeof location !== 'undefined' && location.protocol === 'https:'
  let url = value

  if (url.startsWith('//')) url = (secure ? 'wss:' : 'ws:') + url
  else if (url.startsWith('/')) url = `${secure ? 'wss:' : 'ws:'}//${location.host}${url}`
  else if (/^https:/i.test(url)) url = url.replace(/^https:/i, 'wss:')
  else if (/^http:/i.test(url)) url = url.replace(/^http:/i, 'ws:')

  /*
    Sozlamadagi qiymat uch xil bo'lishi mumkin:
      wss://host/ws/face  — to'liq manzil, butunlay o'shanga almashadi
                            (serverdagi so'rov parametrlari saqlanadi);
      wss://host          — faqat protokol va xost almashadi, yo'l qoladi;
      boshqa har qanday   — sahifaning o'z manzili ishlatiladi, ya'ni ulanish
                            Vite proxy orqali o'tadi.
  */
  if (override) {
    const base = String(override).trim().replace(/^http:/i, 'ws:').replace(/^https:/i, 'wss:')
    const parts = base.match(/^(wss?:\/\/[^/]+)(\/.*)?$/i)

    if (parts) {
      const path = (parts[2] || '').replace(/\/+$/, '')
      if (path) {
        // yo'l ham berilgan — so'rov parametrlarigina serverdagicha qoladi
        const query = url.slice(url.indexOf('?') + 1)
        url = parts[1] + path + (url.includes('?') ? `?${query}` : '')
      } else {
        url = url.replace(/^wss?:\/\/[^/]+/i, parts[1])
      }
    } else if (typeof location !== 'undefined' && location.host) {
      url = url.replace(/^wss?:\/\/[^/]+/i, `${secure ? 'wss:' : 'ws:'}//${location.host}`)
    }
  }

  if (secure && /^ws:/i.test(url)) url = 'wss:' + url.slice(3)
  if (!/^wss?:/i.test(url)) throw new FaceError('noUrl')
  return url
}

/** Kamerani yoqadi va <video> ga ulaydi. Birinchi kadr kelguncha kutadi. */
export async function openCamera(video) {
  if (!navigator?.mediaDevices?.getUserMedia) throw new FaceError('noCamera')

  let stream
  try {
    stream = await navigator.mediaDevices.getUserMedia({
      video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'user' },
      audio: false
    })
  } catch (e) {
    const name = e?.name || ''
    if (name === 'NotAllowedError' || name === 'SecurityError') throw new FaceError('denied')
    if (name === 'NotFoundError' || name === 'OverconstrainedError') throw new FaceError('noCamera')
    throw new FaceError('camera', e?.message)
  }

  video.srcObject = stream
  video.muted = true
  try { await video.play() } catch { /* autoplay to'sildi — kadr baribir keladi */ }
  await firstFrame(video, stream)
  return stream
}

/** videoWidth noldan katta bo'lguncha kutadi (aks holda bo'sh rasm yuboriladi). */
function firstFrame(video, stream) {
  return new Promise((resolve, reject) => {
    if (video.videoWidth) return resolve()

    const cleanup = () => {
      clearTimeout(timer)
      clearInterval(poll)
      video.removeEventListener('loadeddata', tick)
    }

    const tick = () => {
      if (!video.videoWidth) return
      cleanup()
      resolve()
    }

    const timer = setTimeout(() => {
      cleanup()
      stream.getTracks().forEach((t) => t.stop())
      reject(new FaceError('camera'))
    }, 10000)

    const poll = setInterval(tick, 120)
    video.addEventListener('loadeddata', tick)
  })
}

/**
 * Yuz tanish bosqichini boshlaydi.
 *
 * @param {object} p
 * @param {string} p.url     face_ws_url
 * @param {string} p.ticket  face_ticket
 * @param {HTMLVideoElement} p.video kadr olinadigan element
 * @param {(status:string, msg:object)=>void} [p.onState] har bir holat uchun
 * @param {(text:string)=>void} [p.onPrompt] serverning ko'rsatmasi
 * @param {number} [p.frameMs]
 * @returns {{ result: Promise<string>, stop: () => void }} result — face_proof
 */
export function startFaceCheck({ url, ticket, video, onState, onPrompt, frameMs = FRAME_MS }) {
  const canvas = document.createElement('canvas')

  let ws = null
  let stream = null
  let frameTimer = null
  let openTimer = null
  let totalTimer = null
  let sending = false
  let finished = false
  let settle = null
  let frames = 0   // yuborilgan kadrlar — jurnalda oqim ketayotganini ko'rsatadi

  // chipta yuborildimi va server uni qabul qilib `ready` dedimi —
  // uzilish sababini shu ikkisi aniqlaydi
  let ticketSent = false
  let accepted = false

  function cleanup() {
    clearTimeout(frameTimer)
    clearTimeout(openTimer)
    clearTimeout(totalTimer)
    sending = false

    if (ws) {
      ws.onopen = ws.onmessage = ws.onerror = ws.onclose = null
      try { ws.close() } catch { /* allaqachon yopiq */ }
      ws = null
    }
    if (stream) {
      stream.getTracks().forEach((t) => { try { t.stop() } catch { /* to'xtagan */ } })
      stream = null
    }
    if (video) { try { video.srcObject = null } catch { /* element yo'q */ } }
  }

  function finish(err, proof) {
    if (finished) return
    finished = true
    cleanup()
    if (err) settle.reject(err)
    else settle.resolve(proof)
  }

  function say(status, msg = {}) {
    logFace(status, msg, frames)
    try { onState?.(status, msg) } catch { /* chaqiruvchi xatosi bosqichni buzmasin */ }
    if (msg.prompt !== undefined) {
      try { onPrompt?.(msg.prompt || '') } catch { /* e'tiborsiz */ }
    }
  }

  /** Joriy kadrni jpeg base64 ga o'giradi. */
  function grab() {
    const w = video?.videoWidth || 0
    const h = video?.videoHeight || 0
    if (!w || !h) return ''
    canvas.width = w
    canvas.height = h
    canvas.getContext('2d').drawImage(video, 0, 0, w, h)
    return canvas.toDataURL('image/jpeg', JPEG_QUALITY).split(',')[1]
  }

  function pump() {
    if (!sending || !ws || ws.readyState !== WebSocket.OPEN) return
    const frame = grab()
    if (frame) {
      try {
        ws.send(JSON.stringify({ frame }))
        frames += 1
      } catch { /* yopilib qoldi */ }
    }
    frameTimer = setTimeout(pump, frameMs)
  }

  function startSending() {
    if (sending) return
    accepted = true
    sending = true
    pump()
  }

  /** Kadr yuborishni to'xtatadi, ulanishni ochiq qoldiradi. */
  function stopSending() {
    sending = false
    clearTimeout(frameTimer)
  }

  function onMessage(raw) {
    let msg = null
    try { msg = JSON.parse(raw) } catch { return }
    if (!msg || typeof msg !== 'object') return

    switch (msg.status) {
      case 'ready':
        say('ready', msg)
        startSending()
        break

      case 'match':
        say('match', msg)
        if (msg.face_proof) finish(null, msg.face_proof)
        else finish(new FaceError('noProof'))
        break

      case 'error':
        say('error', msg)
        finish(new FaceError('server', msg.message))
        break

      // liveness | no_face | spoof | no_match va boshqalar — oqim davom etadi
      default:
        say(msg.status || 'info', msg)

        /*
          `done: true` — server tekshiruvni yakunladi. `match` kelmagani uchun
          natija muvaffaqiyatsiz: kadr yuborishni to'xtatamiz va sababni
          serverning o'z matni bilan qaytaramiz. Ilgari bu belgi e'tiborsiz
          qolar, kadrlar yuborilaverar va oxirida aloqa uzilgani "xizmatga
          ulanib bo'lmadi" bo'lib ko'rinardi.
        */
        if (msg.done) {
          stopSending()
          finish(new FaceError('failed', msg.prompt || msg.message))
        }
    }
  }

  const result = new Promise((resolve, reject) => {
    settle = { resolve, reject }

    let wsUrl
    try { wsUrl = resolveWsUrl(url) } catch (e) { finish(e); return }
    if (!ticket) { finish(new FaceError('noTicket')); return }

    totalTimer = setTimeout(() => finish(new FaceError('timeout')), TOTAL_TIMEOUT)
    say('camera')

    openCamera(video).then(
      (media) => {
        if (finished) {
          media.getTracks().forEach((t) => t.stop())
          return
        }
        stream = media
        say('connecting')

        try { ws = new WebSocket(wsUrl) } catch { finish(new FaceError('network')); return }

        openTimer = setTimeout(() => finish(new FaceError('network')), OPEN_TIMEOUT)

        ws.onopen = () => {
          clearTimeout(openTimer)
          try {
            ws.send(JSON.stringify({ face_ticket: ticket }))
            ticketSent = true
          } catch { /* yopiq */ }
          say('connected')
        }
        ws.onmessage = (ev) => onMessage(ev.data)
        /*
          Uzilish sababi uch xil: chipta yuborilgandan keyin server hech nima
          demasdan yopsa — chipta qabul qilinmagan (u bir martalik, qayta
          urinishda yangisi kerak); `ready` dan keyin uzilsa — aloqa uzilgan;
          umuman ochilmasa — tarmoq.
        */
        const closeKey = () => {
          if (accepted) return 'closed'
          return ticketSent ? 'ticket' : 'network'
        }

        ws.onerror = () => finish(new FaceError(closeKey()))
        ws.onclose = () => finish(new FaceError(closeKey()))
      },
      (err) => finish(err instanceof FaceError ? err : new FaceError('camera', err?.message))
    )
  })

  // hech kim kutmasa ham "unhandled rejection" chiqmasin
  result.catch(() => {})

  return {
    result,
    stop: () => finish(new FaceError('cancelled'))
  }
}
