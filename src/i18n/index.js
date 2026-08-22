import { createI18n } from 'vue-i18n'
import uz from './uz'
import uzk from './uzk'
import ru from './ru'

export const LANG_KEY = 'turon-lang'
export const DEFAULT_LANG = 'uz'

// RoleMenu'dagi til almashtirgichi shu ro'yxatdan yig'iladi
export const LANGS = [
  { value: 'uz', html: 'uz-Latn' },
  { value: 'uzk', html: 'uz-Cyrl' },
  { value: 'ru', html: 'ru' }
]

export function storedLang() {
  try {
    const saved = localStorage.getItem(LANG_KEY)
    return LANGS.some((l) => l.value === saved) ? saved : DEFAULT_LANG
  } catch {
    return DEFAULT_LANG
  }
}

// Bir shaklli tillar uchun — har doim birinchi variant
const singleForm = () => 0

// Ruscha: 1 / 2–4 / 5+ shakllari
function ruPlural(choice, choicesLength) {
  if (choicesLength < 2) return 0
  const n = Math.abs(Number(choice) || 0)
  const mod10 = n % 10
  const mod100 = n % 100
  if (mod10 === 1 && mod100 !== 11) return 0
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return 1
  return 2
}

const i18n = createI18n({
  legacy: false,
  globalInjection: true,
  locale: storedLang(),
  fallbackLocale: DEFAULT_LANG,
  messages: { uz, uzk, ru },
  pluralRules: { uz: singleForm, uzk: singleForm, ru: ruPlural },
  missingWarn: false,
  fallbackWarn: false
})

/** Komponentlardan tashqarida (store, router) tarjima olish uchun */
export const t = (key, ...args) => i18n.global.t(key, ...args)

export function setLang(lang) {
  const next = LANGS.some((l) => l.value === lang) ? lang : DEFAULT_LANG
  i18n.global.locale.value = next
  try {
    localStorage.setItem(LANG_KEY, next)
  } catch { /* localStorage yopiq bo'lishi mumkin */ }
  const meta = LANGS.find((l) => l.value === next)
  document.documentElement.lang = meta ? meta.html : next
  return next
}

setLang(storedLang())

export default i18n
