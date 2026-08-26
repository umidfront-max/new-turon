const mem = () => { const m = new Map(); return { getItem: k => m.has(k)?m.get(k):null, setItem:(k,v)=>m.set(k,String(v)), removeItem:k=>m.delete(k) } }
globalThis.localStorage = mem(); globalThis.sessionStorage = mem()
globalThis.document = { body:{dataset:{}}, documentElement:{ style:{} }, title:'', addEventListener(){}, removeEventListener(){}, createElement:()=>({webkitdirectory:false,innerHTML:'',content:{},setAttribute(){},style:{}}), createElementNS:()=>({setAttribute(){},style:{}}), createTextNode:()=>({}), createComment:()=>({}), querySelector:()=>null }
globalThis.location = { pathname:'/', search:'', hash:'', href:'http://localhost/', origin:'http://localhost' }
// vue-router history.state ni o'qiydi va almashtiradi — u hech qachon undefined bo'lmasligi kerak
let _historyState = {}
globalThis.history = {
  get state() { return _historyState },
  pushState(s) { _historyState = s || {} },
  replaceState(s) { _historyState = s || {} },
  scrollRestoration: 'auto',
  go() {}
}
globalThis.addEventListener=()=>{}; globalThis.removeEventListener=()=>{}; globalThis.scrollTo=()=>{}
globalThis.window = globalThis
const { createServer } = await import('vite')
const { renderToString } = await import('vue/server-renderer')
const { createSSRApp } = await import('vue')
const vite = await createServer({ server:{middlewareMode:true}, appType:'custom', logLevel:'silent' })
const { default: App } = await vite.ssrLoadModule('/src/App.vue')
const { default: i18n, setLang } = await vite.ssrLoadModule('/src/i18n/index.js')
const router = (await vite.ssrLoadModule('/src/router/index.js')).default
const bad = []
for (const lang of ['uz','uzk','ru']) {
  setLang(lang)
  for (const tab of ['password','eimzo','faceId']) {
    const app = createSSRApp(App); app.use(i18n).use(router)
    await router.push(`/login?tab=${tab}`).catch(()=>{}); await router.isReady()
    const html = await renderToString(app)
    const classes = [...html.matchAll(/class="([^"]*)"/g)].map(m => m[1].split(/\s+/))
    const forms = classes.filter(c => c.includes('form'))
    const hidden = forms.filter(c => c.includes('hidden'))
    if (forms.length !== 3) bad.push(`${lang}/${tab}: ${forms.length} ta forma (3 kutilgan)`)
    if (hidden.length !== 2) bad.push(`${lang}/${tab}: ${hidden.length} ta yashirin (2 kutilgan)`)
    if (!html.includes('class="forms"')) bad.push(`${lang}/${tab}: grid o'ram yo'q`)
    if ((html.match(/inert/g) || []).length < 2) bad.push(`${lang}/${tab}: inert yetarli emas`)
    // e-imzo tabi alohida komponentda — ichi ham chizilishi kerak
    if (!html.includes('signer-wait') && !html.includes('signer-off')) {
      bad.push(`${lang}/${tab}: e-imzo tabi ichi chizilmadi`)
    }
    if (!html.includes('class="submit"')) bad.push(`${lang}/${tab}: yuborish tugmasi yo'q`)
  }
}
console.log(bad.length ? 'XATO:\n' + bad.join('\n') : "login tablari: uchalasi bir katakda, faqat bittasi ko'rinadi — balandlik doimiy")
await vite.close(); process.exit(bad.length ? 1 : 0)
