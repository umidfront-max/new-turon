/*
  Karta/hisob raqamini serverda tekshirish.

  Ikki xil so'rov, ikki xil paytda:
    - bank BIN prefiksidan aniqlanadi, buning uchun birinchi 8 ta raqam
      yetarli — shu to'lishi bilan bir marta so'raladi (POST /cards/identify/);
    - shu raqam bo'yicha oldingi arizalar esa «Tekshirish» tugmasi bosilganda
      (POST /complaints/check-number/). Ilgari u raqam yozilishi bilan o'zi
      ketardi — tugma esa hech narsa so'ramasdi.

  Server javob bermasa `live` false bo'lib qoladi va chaqiruvchi namuna
  ma'lumotdagi takroriylikni ko'rsatadi — ekran bir xil ishlaydi.
*/
import { ref, computed } from 'vue'
import { checkNumber, identifyCard } from '@/services/complaints'
import { numberCheck, cardIdentity } from '@/utils/adapt'

// bank BIN prefiksi shuncha raqamdan iborat
const BIN_DIGITS = 8

// shundan qisqa raqam bo'yicha oldingi arizalarni so'rashning ma'nosi yo'q
const MIN_DIGITS = 16

export function useNumberCheck() {
  const result = ref(null)
  const identity = ref(null)
  const loading = ref(false)
  const failed = ref(false)

  // eng oxirgi so'rovgina natijani yozadi
  let seq = 0
  let binSeq = 0

  // oxirgi aniqlangan BIN — bir xil prefiks uchun qayta so'ralmaydi
  let lastBin = ''

  function reset() {
    lastBin = ''
    seq += 1
    binSeq += 1
    result.value = null
    identity.value = null
    loading.value = false
    failed.value = false
  }

  /** Bankni BIN bo'yicha aniqlaydi — har bir prefiks uchun bir marta. */
  async function identify(bin) {
    const mine = ++binSeq
    try {
      const res = await identifyCard(bin)
      if (mine === binSeq) identity.value = cardIdentity(res)
    } catch {
      if (mine === binSeq) identity.value = null
    }
  }

  /** Shu raqam bo'yicha oldingi arizalar. */
  async function run(digits) {
    const mine = ++seq
    try {
      const res = await checkNumber(digits)
      if (mine !== seq) return // orada yangi raqam kiritilgan
      result.value = numberCheck(res)
      failed.value = false
    } catch {
      if (mine !== seq) return
      result.value = null
      failed.value = true
    }
  }

  /**
   * Raqam yozilayotganda chaqiriladi: bank aniqlanadi, eski tekshiruv
   * natijasi esa endi bu raqamga tegishli emas — tozalanadi.
   * @param {string} value maskalangan yoki xom raqam
   */
  function check(value) {
    const digits = String(value || '').replace(/\D/g, '')
    const bin = digits.slice(0, BIN_DIGITS)

    if (bin.length < BIN_DIGITS) {
      binSeq += 1
      lastBin = ''
      identity.value = null
    } else if (bin !== lastBin) {
      lastBin = bin
      identify(bin)
    }

    seq += 1 // ketayotgan so'rov natijasi endi kerak emas
    result.value = null
    failed.value = false
  }

  /**
   * «Tekshirish» tugmasi: so'rovni darhol yuboradi va tugagunicha kutadi.
   *
   * @param {string} value maskalangan raqam
   * @param {'card'|'account'} kind hisob raqamida BIN yo'q — bank so'ralmaydi
   * @returns {Promise<object|null>} tekshiruv natijasi, server javob bermasa null
   */
  async function checkNow(value, kind = 'card') {
    const digits = String(value || '').replace(/\D/g, '')
    const bin = digits.slice(0, BIN_DIGITS)

    loading.value = true
    try {
      const jobs = []

      if (kind === 'card' && bin.length === BIN_DIGITS && (bin !== lastBin || !identity.value)) {
        lastBin = bin
        jobs.push(identify(bin))
      }
      if (digits.length >= MIN_DIGITS) jobs.push(run(digits))

      await Promise.all(jobs)
    } finally {
      loading.value = false
    }

    return result.value
  }

  /** Serverdan javob kelganmi — chaqiruvchi shunga qarab manba tanlaydi. */
  const live = computed(() => !!result.value)

  /** Shu raqam bo'yicha oldingi arizalar. */
  const earlier = computed(() => result.value?.earlier || [])

  /** Rekvizit maydonida ko'rsatiladigan bank nomi. */
  const bankLabel = computed(() =>
    identity.value?.bankName || result.value?.bankName || ''
  )

  return { check, checkNow, reset, result, identity, earlier, bankLabel, live, loading, failed }
}
