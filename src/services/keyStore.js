/*
  Kalitlar papkasiga ruxsat.

  Brauzer diskdagi faylni foydalanuvchi ruxsatisiz o'qiy olmaydi — bu xavfsizlik
  chegarasi. Ikki yo'l bor:

  1. File System Access API (showDirectoryPicker) — xavfsiz kontekstda (https yoki
     localhost) ishlaydi. Papka «tutqichi» IndexedDB'da saqlanadi, shuning uchun
     keyingi kirishlarda oyna ochilmaydi — ko'pi bilan bitta «Ruxsat berish».

  2. <input webkitdirectory> — hamma joyda ishlaydi, lekin har sessiyada bir marta
     papka tanlash oynasi chiqadi.
*/

const DB_NAME = 'turon-keys'
const STORE = 'handles'
const HANDLE_ID = 'dskeys'

/** Zamonaviy usul mavjudmi (https yoki localhost kerak). */
export function canRemember() {
  return typeof window !== 'undefined'
    && typeof window.showDirectoryPicker === 'function'
    && window.isSecureContext === true
}

/* ---------- IndexedDB: papka tutqichini saqlash ---------- */

function openDb() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1)
    req.onupgradeneeded = () => req.result.createObjectStore(STORE)
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

async function idb(mode, run) {
  try {
    const db = await openDb()
    return await new Promise((resolve, reject) => {
      const tx = db.transaction(STORE, mode)
      const req = run(tx.objectStore(STORE))
      req.onsuccess = () => resolve(req.result)
      req.onerror = () => reject(req.error)
    })
  } catch {
    return null // shaxsiy rejimda IndexedDB yopiq bo'lishi mumkin
  }
}

const saveHandle = (handle) => idb('readwrite', (s) => s.put(handle, HANDLE_ID))
const loadHandle = () => idb('readonly', (s) => s.get(HANDLE_ID))
export const forgetFolder = () => idb('readwrite', (s) => s.delete(HANDLE_ID))

/* ---------- papkadan kalitlarni o'qish ---------- */

const KEY_RE = /\.(pfx|p12)$/i

async function readFolder(handle) {
  const out = []
  for await (const entry of handle.values()) {
    if (entry.kind === 'file' && KEY_RE.test(entry.name)) out.push(await entry.getFile())
  }
  return out.sort((a, b) => a.name.localeCompare(b.name))
}

/**
 * Saqlangan papkani so'ramasdan o'qishga urinadi.
 * @returns {Promise<File[]|null>} ruxsat bo'lmasa null
 */
export async function restoreFolder() {
  if (!canRemember()) return null

  const handle = await loadHandle()
  if (!handle) return null

  try {
    const state = await handle.queryPermission({ mode: 'read' })
    if (state !== 'granted') return null
    return await readFolder(handle)
  } catch {
    return null
  }
}

/**
 * Saqlangan papkaga qayta ruxsat so'raydi (foydalanuvchi bosishi bilan chaqiriladi).
 * @returns {Promise<File[]|null>}
 */
export async function regrantFolder() {
  if (!canRemember()) return null

  const handle = await loadHandle()
  if (!handle) return null

  try {
    const state = await handle.requestPermission({ mode: 'read' })
    if (state !== 'granted') return null
    return await readFolder(handle)
  } catch {
    return null
  }
}

/**
 * Papka tanlash oynasini ochadi va tutqichni eslab qoladi.
 * @returns {Promise<File[]|null>} bekor qilinsa null
 */
export async function chooseFolder() {
  if (!canRemember()) return null

  let handle
  try {
    handle = await window.showDirectoryPicker({ id: 'dskeys', mode: 'read' })
  } catch {
    return null // foydalanuvchi bekor qildi
  }

  await saveHandle(handle)
  return readFolder(handle)
}
