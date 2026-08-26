/*
  Complaints API endpointlari — bitta joyda.
  Har bir funksiya tayyor ma'lumot qaytaradi, xatolar ApiError bo'lib chiqadi.
*/
import { get, post, put, patch, del } from '@/services/api'

/* ---------- ma'lumotnomalar ---------- */

export const fetchRegions = () => get('/regions/')
export const fetchMethods = () => get('/methods/')
export const fetchSources = () => get('/sources/')

/* ---------- bosh sahifa ---------- */

export const fetchDashboard = () => get('/complaints/dashboard/')
export const fetchChiefDashboard = () => get('/chief/dashboard/')
export const fetchOversight = () => get('/oversight/dashboard/')

/* ---------- arizalar ro'yxati ---------- */

/**
 * Reyestr jadvali.
 * @param {object} p
 * @param {number} [p.page] 1 dan boshlanadi — limit/offset ga o'giriladi
 * @param {number} [p.perPage]
 * @param {string} [p.tab] all | overdue | queued | in_execution | under_control | completed
 * @param {string} [p.search] umumiy qidiruv
 * @param {string} [p.ordering] created_at | date | number | status | damage_amount | deadline
 * @param {string[]} [p.facets] filtr paneli uchun guruhlar
 */
export function fetchRegistry({ page = 1, perPage = 10, facets, ...filters } = {}) {
  return get('/complaints/registry/', {
    limit: perPage,
    offset: (page - 1) * perPage,
    ...(facets?.length ? { facets: facets.join(',') } : null),
    ...filters
  })
}

export const fetchComplaints = (params) => get('/complaints/', params)
export const fetchComplaint = (id) => get(`/complaints/${id}/`)

/** Karta/hisob raqami bo'yicha oldingi arizalar — formadagi ogohlantirish. */
export const checkNumber = (number) => post('/complaints/check-number/', { number })

/** Karta raqamining birinchi raqamlaridan bankni aniqlash. */
export const identifyCard = (number) => post('/cards/identify/', { number })

export const createManual = (body) => post('/complaints/manual/', body)
export const changeStatus = (id, body) => post(`/complaints/${id}/status/`, body)

/* ---------- ariza tafsiloti ---------- */

export const fetchBankOperations = (id) => get(`/complaints/${id}/bank-operations/`)
export const fetchSanctions = (id) => get(`/complaints/${id}/sanctions/`)
export const fetchTransactionChain = (id) => get(`/complaints/${id}/transaction-chain/`)
export const fetchWorkflow = (id) => get(`/complaints/${id}/workflow/`)
export const fetchHistory = (id) => get(`/complaints/${id}/history/`)

/* ---------- qoralamalar ---------- */

export const fetchDrafts = (params) => get('/complaints/drafts/', params)
export const fetchDraft = (id) => get(`/complaints/drafts/${id}/`)
export const startDraft = (body) => post('/complaints/drafts/', body)
export const saveDraft = (id, body) => put(`/complaints/drafts/${id}/`, body)
export const autosaveDraft = (id, body) => patch(`/complaints/drafts/${id}/`, body)
export const removeDraft = (id) => del(`/complaints/drafts/${id}/`)
export const submitDraft = (id) => post(`/complaints/drafts/${id}/submit/`)

/* ---------- navbatchilik ---------- */

export const fetchDutyShifts = (params) => get('/duty/', params)
export const fetchCurrentDuty = () => get('/duty/current/')
export const startDuty = (body) => post('/duty/current/', body)
export const fetchDutyReport = (id) => get(`/duty/${id}/`)
export const fetchDutyCandidates = () => get('/duty/candidates/')
export const handOverDuty = (id, body) => post(`/duty/${id}/hand-over/`, body)
export const acceptDuty = (id) => post(`/duty/${id}/accept/`)
export const returnDuty = (id, body) => post(`/duty/${id}/return/`, body)

/* ---------- bildirishnomalar ---------- */

export const fetchNotifications = (params) => get('/notifications/', params)
export const readNotification = (id) => post(`/notifications/${id}/read/`)
export const readAllNotifications = () => post('/notifications/read-all/')
