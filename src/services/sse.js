/*
  Server-Sent Events (SSE) klienti.

  Nega brauzerning `EventSource`i emas:
    1. u `Authorization` sarlavhasini yubora olmaydi, bizning API esa Bearer
       token so'raydi;
    2. u doim `Accept: text/event-stream` yuboradi — server hozir shunga 406
       qaytaradi (tekshirildi), har qanday turni qabul qiladigan sarlavha
       bilan esa oqim ochiladi.
  Shu sababli oqim `fetch` + `ReadableStream` orqali o'qiladi: sarlavhalarni
  o'zimiz beramiz.

  Server har ~30 soniyada `: keep-alive` izoh satrini yuboradi va ulanishni
  bir soatdan keyin o'zi uzadi — mijoz qayta ulanishi kutiladi.

  Ulanish uzilsa o'zi qayta ulanadi — kutish vaqti har safar ikkilanadi
  (1s dan 30s gacha), server bo'g'ilib qolmasin. Oxirgi hodisa raqami
  `?last_event_id=` bilan qaytariladi, shunda uzilish paytidagi hodisalar
  tushib qolmaydi (server buni qo'llasa).
*/
import { API_BASE, getToken, apiLang } from './api'

const FIRST_WAIT = 1000
const MAX_WAIT = 30000

/**
 * Bitta ramkani ajratadi: "event: created\ndata: {...}\nid: 7".
 * Izoh satrlari (`: ping`) — server tirikligini bildiradi, ular hodisa emas.
 * @returns {{event:string,data:string,id:string,json:any}|null}
 */
function parseFrame(raw) {
  const out = { event: 'message', data: '', id: '', json: null }
  let filled = false

  for (const line of raw.split(/\r?\n/)) {
    if (!line || line[0] === ':') continue

    const cut = line.indexOf(':')
    const field = cut === -1 ? line : line.slice(0, cut)
    const value = cut === -1 ? '' : line.slice(cut + 1).replace(/^ /, '')

    if (field === 'event') { out.event = value; filled = true }
    else if (field === 'id') { out.id = value; filled = true }
    else if (field === 'data') {
      // ko'p satrli data satrma-satr keladi
      out.data = out.data ? `${out.data}\n${value}` : value
      filled = true
    }
  }

  if (!filled) return null
  try { out.json = out.data ? JSON.parse(out.data) : null } catch { /* matn bo'lsa shundayligicha qoladi */ }
  return out
}

/**
 * Oqimni ochadi va uzilganda qayta ulanadi.
 *
 * @param {string} path API'ga nisbatan yo'l, masalan '/notifications/stream/'
 * @param {{onEvent?:Function,onOpen?:Function,onError?:Function}} handlers
 * @returns {{close:Function}}
 */
export function openStream(path, { onEvent, onOpen, onError } = {}) {
  let stopped = false
  let controller = null
  let timer = 0
  let wait = FIRST_WAIT

  // uzilgandan keyin qayerdan davom etishni server shu orqali biladi
  let lastId = ''

  async function run() {
    controller = new AbortController()

    /*
      Sarlavhalar faqat serverning preflight javobida ruxsat etilganlaridan
      olinadi: accept, authorization, content-type, user-agent, x-csrftoken,
      x-requested-with. `Cache-Control` va `Last-Event-ID` ro'yxatda yo'q —
      ularni yuborsak brauzer so'rovni CORS bo'yicha bloklaydi. Shuning uchun
      oxirgi hodisa raqami manzil qatorida ketadi.
    */
    const query = new URLSearchParams({ lang: apiLang() })
    if (lastId) query.set('last_event_id', lastId)

    const url = `${API_BASE}${path}${path.includes('?') ? '&' : '?'}${query}`
    const headers = { Accept: 'text/event-stream, */*' }
    const token = getToken()
    if (token) headers.Authorization = `Bearer ${token}`

    const res = await fetch(url, { headers, signal: controller.signal, credentials: 'omit' })
    if (!res.ok) throw new Error(`stream ${res.status}`)
    if (!res.body) throw new Error('stream: javobda oqim yo\'q')

    wait = FIRST_WAIT // ulandi — keyingi uzilishda yana 1 soniyadan boshlanadi
    onOpen?.()

    const reader = res.body.getReader()
    const decoder = new TextDecoder()
    let buffer = ''

    while (!stopped) {
      const { value, done } = await reader.read()
      if (done) break

      buffer += decoder.decode(value, { stream: true })

      // ramkalar bo'sh satr bilan ajratiladi
      let cut = buffer.search(/\r?\n\r?\n/)
      while (cut !== -1) {
        const raw = buffer.slice(0, cut)
        buffer = buffer.slice(cut).replace(/^\r?\n\r?\n/, '')

        const frame = parseFrame(raw)
        if (frame) {
          if (frame.id) lastId = frame.id
          onEvent?.(frame)
        }
        cut = buffer.search(/\r?\n\r?\n/)
      }
    }
  }

  async function loop() {
    while (!stopped) {
      try {
        await run()
      } catch (e) {
        // close() ham abort qiladi — o'zimiz to'xtatgan bo'lsak xato emas
        if (!stopped) onError?.(e)
      }

      if (stopped) return
      await new Promise((done) => { timer = setTimeout(done, wait) })
      wait = Math.min(MAX_WAIT, wait * 2)
    }
  }

  loop()

  return {
    close() {
      stopped = true
      clearTimeout(timer)
      try { controller?.abort() } catch { /* allaqachon yopilgan */ }
    }
  }
}
