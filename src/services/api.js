/*
  Complaints API klienti.
  Hujjat: http://192.168.14.186:30801/api/docs/

  Token localStorage'dagi `turon-token` dan olinadi. U bo'lmasa — quyidagi
  sinov tokeni ishlatiladi (backend jamoasi bergan, vaqtinchalik).

  Konsolda almashtirish:
    localStorage.setItem('turon-token', '<yangi token>')
    localStorage.removeItem('turon-token')   // sinov tokeniga qaytadi
*/
import axios from 'axios'
import { i18nLang } from '@/i18n'

const BASE = (import.meta.env?.VITE_API_URL || 'http://192.168.14.186:30801/api/v1').replace(/\/+$/, '')

export const TOKEN_KEY = 'turon-token'

// Vaqtinchalik sinov tokeni — localStorage bo'sh bo'lsa shu ishlatiladi.
// Haqiqiy token ERI kirishidan (user_ser) keladi.
const FALLBACK_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzg3NzI3NDI0LCJpYXQiOjE3ODc3MjU2MjQsImp0aSI6IjE4OTc4Mjc5YzJmYjQ1YTE5YTMwMjA0NmY2YTMyMGI3IiwidXNlcl9pZCI6NCwidXNlcm5hbWUiOiJ1bWlkam9uIiwiZnVsbF9uYW1lIjoiVW1pZGpvbiBUb3NoZXYiLCJwaG9uZV9udW1iZXIiOiIrOTk4OTAxMjM0NTY3Iiwicm9sZSI6InN0YWZmIn0.MctDYRg6Tc8Ag1H-hiycyj3UlIV42kcMNcR6IsVDMzM'

/* ---------- token ---------- */

export function getToken() {
  try {
    return localStorage.getItem(TOKEN_KEY) || FALLBACK_TOKEN
  } catch {
    return FALLBACK_TOKEN // shaxsiy rejimda saqlash yopiq bo'lishi mumkin
  }
}

export function setToken(token) {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token)
    else localStorage.removeItem(TOKEN_KEY)
  } catch { /* saqlab bo'lmadi — sessiya davomida baribir ishlaydi */ }
}

export const clearToken = () => setToken(null)

/** JWT ichidagi ma'lumot (imzo tekshirilmaydi — faqat ko'rsatish uchun). */
export function tokenClaims(token = getToken()) {
  try {
    const body = String(token).split('.')[1]
    if (!body) return null
    const json = atob(body.replace(/-/g, '+').replace(/_/g, '/'))
    return JSON.parse(decodeURIComponent(escape(json)))
  } catch {
    return null
  }
}

/** Token muddati tugaganmi (60 soniya zaxira bilan). */
export function tokenExpired(token = getToken()) {
  const claims = tokenClaims(token)
  if (!claims?.exp) return false
  return claims.exp * 1000 - 60000 < Date.now()
}

/* ---------- til ---------- */

// loyihadagi til kodi -> API kutadigan kod
const LANG_MAP = { uz: 'uz', uzk: 'uz-cyrl', ru: 'ru' }

export const apiLang = () => LANG_MAP[i18nLang()] || 'uz'

/* ---------- xatolar ---------- */

export class ApiError extends Error {
  /**
   * @param {string} key i18n kaliti (api.errors.*)
   * @param {string} [detail] serverdan kelgan matn — bo'lsa shu ko'rsatiladi
   * @param {number} [status] HTTP kodi
   */
  constructor(key, detail = '', status = 0) {
    super(detail || key)
    this.key = key
    this.detail = detail
    this.status = status
  }
}

// serverning javobidan odam o'qiy oladigan matnni ajratadi
function readDetail(data) {
  if (!data) return ''
  if (typeof data === 'string') return data.slice(0, 300)
  if (typeof data.detail === 'string') return data.detail

  // DRF maydon xatolari: { card_number: ["..."] }
  const first = Object.values(data)[0]
  if (Array.isArray(first) && typeof first[0] === 'string') return first[0]
  return ''
}

function toApiError(error) {
  if (axios.isCancel?.(error)) return new ApiError('cancelled')

  if (error.code === 'ECONNABORTED') return new ApiError('timeout')
  if (!error.response) return new ApiError('network')

  const { status, data } = error.response
  const detail = readDetail(data)

  const key = {
    400: 'validation',
    401: 'unauthorized',
    403: 'forbidden',
    404: 'notFound',
    409: 'conflict',
    422: 'validation',
    429: 'tooMany'
  }[status] || (status >= 500 ? 'server' : 'unknown')

  return new ApiError(key, detail, status)
}

/* ---------- klient ---------- */

export const api = axios.create({
  baseURL: BASE,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' }
})

// so'rovga token va til qo'shiladi
api.interceptors.request.use((config) => {
  const token = getToken()
  if (token) config.headers.Authorization = `Bearer ${token}`

  // ?lang= har bir so'rovga o'zi qo'shiladi (chaqiruvchi bermagan bo'lsa)
  config.params = { lang: apiLang(), ...(config.params || {}) }
  return config
})

// javobdan to'g'ridan-to'g'ri ma'lumot qaytadi, xatolar bir turga keltiriladi
api.interceptors.response.use(
  (res) => res.data,
  (error) => Promise.reject(toApiError(error))
)

/* ---------- qulaylik uchun ---------- */

export const get = (url, params, config) => api.get(url, { params, ...config })
export const post = (url, body, config) => api.post(url, body, config)
export const put = (url, body, config) => api.put(url, body, config)
export const patch = (url, body, config) => api.patch(url, body, config)
export const del = (url, config) => api.delete(url, config)

export const API_BASE = BASE
