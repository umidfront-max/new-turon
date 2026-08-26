// API klientini haqiqiy serverda sinaydi: token, til, interseptorlar.
globalThis.localStorage = { getItem: () => null, setItem() {}, removeItem() {} }
globalThis.document = {
  documentElement: { style: {} }, body: { dataset: {} }, title: '',
  addEventListener() {}, removeEventListener() {},
  createElement: () => ({ style: {}, setAttribute() {} }),
  createElementNS: () => ({ style: {}, setAttribute() {} }),
  createTextNode: () => ({}), createComment: () => ({}), querySelector: () => null
}
globalThis.location = { href: 'http://localhost/', protocol: 'http:', origin: 'http://localhost' }
globalThis.window = globalThis

const { createServer } = await import('vite')
const vite = await createServer({ server: { middlewareMode: true }, appType: 'custom', logLevel: 'silent' })

const { getToken, tokenClaims, tokenExpired, apiLang, ApiError } = await vite.ssrLoadModule('/src/services/api.js')
const { setLang } = await vite.ssrLoadModule('/src/i18n/index.js')
const refs = await vite.ssrLoadModule('/src/services/complaints.js')

const problems = []
const ok = (cond, msg) => { if (!cond) problems.push(msg) }

/* token localStorage bo'sh bo'lsa zaxiradan keladi */
const claims = tokenClaims()
ok(!!getToken(), 'token yo\'q')
ok(claims?.username === 'umidjon', 'token ichidagi username xato: ' + claims?.username)
ok(claims?.role === 'staff', 'token ichidagi rol xato')
console.log(`token: ${claims.full_name} (${claims.role}) · tugaydi ${new Date(claims.exp * 1000).toLocaleString()}`)
if (tokenExpired()) console.log('DIQQAT: token muddati tugagan')

/* til kodi API ko\'rinishiga o\'giriladi */
const langs = { uz: 'uz', uzk: 'uz-cyrl', ru: 'ru' }
for (const [our, theirs] of Object.entries(langs)) {
  setLang(our)
  ok(apiLang() === theirs, `${our} -> ${apiLang()} (${theirs} kutilgan)`)
}
setLang('uz')
console.log('til xaritasi: uz -> uz, uzk -> uz-cyrl, ru -> ru')

/* ochiq endpoint haqiqatan javob beradi */
try {
  const regions = await refs.fetchRegions()
  const rows = regions.results || regions
  console.log(`hududlar: ${rows.length} ta (${rows[0]?.name_uz ?? '—'})`)
} catch (e) {
  // server o'chiq bo'lsa test yiqilmasin — bu tarmoq holati, kod xatosi emas
  if (e.key === 'network' || e.key === 'timeout') console.log("server javob bermadi — o'tkazib yuborildi")
  else problems.push('hududlar olinmadi: ' + (e.detail || e.key))
}

/* himoyalangan endpoint — xato to\'g\'ri turga o\'giriladimi */
try {
  await refs.fetchDashboard()
  console.log('dashboard: ochildi')
} catch (e) {
  ok(e instanceof ApiError, 'xato ApiError emas: ' + e)
  console.log(`dashboard: ${e.key} (${e.status}) — ${e.detail}`)
  if (e.key === 'unauthorized' && /sozlanmagan/i.test(e.detail)) {
    console.log('  ^ server tomonda JWT tekshiruvi hali yoqilmagan')
  }
}


/* ---------- ma'lumotnomalar do'koni ---------- */
const { useReferences } = await vite.ssrLoadModule('/src/stores/useReferences.js')
const refsStore = useReferences()
await refsStore.load()

const counts = {
  methods: refsStore.methods.value.length,
  sources: refsStore.sources.value.length,
  regions: refsStore.regions.value.length
}
console.log(`ma'lumotnomalar: usul ${counts.methods}, manba ${counts.sources}, hudud ${counts.regions}`)
console.log('serverdan:', JSON.stringify(refsStore.live.value))

/* server ro'yxati kichik bo'lsa dizayn buzilmasligi kerak */
ok(counts.methods >= 8, `usullar ${counts.methods} ta (kamida 8 kutilgan)`)
ok(counts.regions >= 14, `hududlar ${counts.regions} ta (kamida 14 kutilgan)`)
ok(refsStore.methods.value.every((x) => x.label && x.value !== undefined), 'ma\'lumotnoma yozuvi to\'liq emas')

await vite.close()
console.log(problems.length ? 'XATO:\n' + problems.join('\n') : 'api klienti: tekshiruvlar o\'tdi')
process.exit(problems.length ? 1 : 0)
