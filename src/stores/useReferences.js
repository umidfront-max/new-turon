/*
  Ma'lumotnomalar: sodir etish usullari, murojaat manbalari, hududlar.

  Serverdan olinadi (/methods/, /sources/, /regions/). Server javob bermasa yoki
  ro'yxati bo'sh bo'lsa — loyihadagi i18n kalitlari ishlatiladi, ya'ni ekran
  hech qachon bo'sh qolmaydi va dizayn o'zgarmaydi.

  Har bir yozuv bir xil ko'rinishda qaytadi:
    { id, value, label }
  `value` — filtrga yuboriladigan qiymat (serverdan kelsa ID, aks holda i18n kaliti),
  `label` — ekranda ko'rinadigan matn.
*/
import { reactive, computed } from 'vue'
import { i18nLang, t } from '@/i18n'
import { METHOD_OPTIONS, SOURCE_OPTIONS, REGION_OPTIONS } from '@/data/form'
import { fetchMethods, fetchSources, fetchRegions } from '@/services/complaints'

// serverdagi til maydonlari
const NAME_FIELD = { uz: 'name_uz', uzk: 'name_uz_cyrl', ru: 'name_ru' }

const state = reactive({
  methods: [],
  sources: [],
  regions: [],
  loaded: false,
  loading: false,
  // serverdan olinmagan bo'lsa — sabab (ko'rsatish shart emas, jurnal uchun)
  error: null
})

/** Serverdan kelgan yozuvni bitta ko'rinishga keltiradi. */
function fromApi(row) {
  const field = NAME_FIELD[i18nLang()] || 'name_uz'
  return {
    id: row.id,
    value: row.id,
    label: row[field] || row.name || String(row.id)
  }
}

/** Loyihadagi kalitlardan ro'yxat — server bo'lmaganda. */
function fromKeys(keys, group) {
  return keys.map((key) => ({ id: key, value: key, label: t(`${group}.${key}`) }))
}

// javob { results: [...] } yoki to'g'ridan-to'g'ri massiv bo'lishi mumkin
const rows = (res) => (Array.isArray(res) ? res : res?.results || [])

/**
 * Uchala ma'lumotnomani bir marta yuklaydi.
 * Xato bo'lsa jimgina zaxiraga tushadi — chaqiruvchi kutishi shart emas.
 */
async function load() {
  if (state.loaded || state.loading) return
  state.loading = true

  const [m, s, r] = await Promise.allSettled([fetchMethods(), fetchSources(), fetchRegions()])

  const take = (result) => (result.status === 'fulfilled' ? rows(result.value) : [])
  state.methods = take(m).map(fromApi)
  state.sources = take(s).map(fromApi)
  state.regions = take(r).map(fromApi)

  const failed = [m, s, r].find((x) => x.status === 'rejected')
  state.error = failed ? failed.reason : null

  state.loading = false
  state.loaded = true
}

/** Til almashganda nomlarni qaytadan so'raydi. */
async function reload() {
  if (!state.loaded) return
  state.loaded = false
  await load()
}

/**
 * Serverdagi ro'yxat ishonchli bo'lsagina ishlatiladi.
 * Hozircha bazada sinov yozuvlari bor (1 ta hudud, 1 ta usul), shuning uchun
 * u loyihadagi ro'yxatdan kichik bo'lsa — zaxira qoladi.
 */
function pick(apiList, keys, group) {
  return apiList.length >= keys.length ? apiList : fromKeys(keys, group)
}

const methods = computed(() => pick(state.methods, METHOD_OPTIONS, 'methods'))
const sources = computed(() => pick(state.sources, SOURCE_OPTIONS, 'sources'))
const regions = computed(() => pick(state.regions, REGION_OPTIONS, 'regions'))

/*
  Yangi ariza formasi uchun: yozuv serverga saqlanadi, shuning uchun ro'yxat
  qanchalik qisqa bo'lsa ham aynan serverdagi id'lar kerak. Yuqoridagi `pick`
  bu yerda yaramaydi — u qisqa ro'yxatni zaxira bilan almashtirib yuboradi va
  formadan `vishing` kabi matn kaliti ketib qolardi.

  Zaxira faqat server umuman javob bermaganda qoladi.
*/
const exact = computed(() => ({
  methods: state.methods.length ? state.methods : fromKeys(METHOD_OPTIONS, 'methods'),
  sources: state.sources.length ? state.sources : fromKeys(SOURCE_OPTIONS, 'sources'),
  regions: state.regions.length ? state.regions : fromKeys(REGION_OPTIONS, 'regions')
}))

/** Serverdagi ro'yxat ishlatilyaptimi — sozlash uchun. */
const live = computed(() => ({
  methods: state.methods.length >= METHOD_OPTIONS.length,
  sources: state.sources.length >= SOURCE_OPTIONS.length,
  regions: state.regions.length >= REGION_OPTIONS.length
}))

export function useReferences() {
  return { state, load, reload, methods, sources, regions, exact, live }
}
