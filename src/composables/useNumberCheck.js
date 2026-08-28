/*
  Karta/hisob raqamini serverda tekshirish.

  Ikki xil so'rov, ikki xil paytda:
    - bank va to'lov tizimi BIN prefiksidan aniqlanadi, buning uchun birinchi
      8 ta raqam yetarli — shu to'lishi bilan bir marta so'raladi;
    - shu raqam bo'yicha oldingi arizalar esa to'liq raqam yig'ilgach.

  Server javob bermasa `live` false bo'lib qoladi va chaqiruvchi namuna
  ma'lumotdagi takroriylikni ko'rsatadi — ekran bir xil ishlaydi.
*/
import { ref, computed } from 'vue'
import { checkNumber, identifyCard } from '@/services/complaints'
import { numberCheck, cardIdentity } from '@/utils/adapt'

const DEBOUNCE = 400
const MIN_DIGITS = 16

// bank BIN prefiksi shuncha raqamdan iborat
const BIN_DIGITS = 8

export function useNumberCheck() {
  const result = ref(null)
  const identity = ref(null)
  const loading = ref(false)
  const failed = ref(false)

  let timer = null
  // eng oxirgi so'rovgina natijani yozadi
  let seq = 0
  let binSeq = 0

  // oxirgi aniqlangan BIN — bir xil prefiks uchun qayta so'ralmaydi
  let lastBin = ''

  function reset() {
    clearTimeout(timer)
    lastBin = ''
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
    loading.value = true

    try {
      const res = await checkNumber(digits)
      if (mine !== seq) return // orada yangi raqam kiritilgan
      result.value = numberCheck(res)
      failed.value = false
    } catch {
      if (mine !== seq) return
      result.value = null
      failed.value = true
    } finally {
      if (mine === seq) loading.value = false
    }
  }

  /**
   * Raqam o'zgarganda chaqiriladi.
   * @param {string} value maskalangan yoki xom raqam
   */
  function check(value) {
    clearTimeout(timer)
    const digits = String(value || '').replace(/\D/g, '')
    const bin = digits.slice(0, BIN_DIGITS)

    // bank: 8 raqam to'lishi bilan bir marta; prefiks o'zgarsa qaytadan
    if (bin.length < BIN_DIGITS) {
      binSeq += 1
      lastBin = ''
      identity.value = null
    } else if (bin !== lastBin) {
      lastBin = bin
      identify(bin)
    }

    // oldingi arizalar: to'liq raqam kerak
    if (digits.length < MIN_DIGITS) {
      seq += 1 // ketayotgan so'rov natijasi endi kerak emas
      result.value = null
      failed.value = false
      return
    }

    timer = setTimeout(() => run(digits), DEBOUNCE)
  }

  /** Serverdan javob kelganmi — chaqiruvchi shunga qarab manba tanlaydi. */
  const live = computed(() => !!result.value)

  /** Shu raqam bo'yicha oldingi arizalar. */
  const earlier = computed(() => result.value?.earlier || [])

  /** Rekvizit maydonida ko'rsatiladigan bank/tizim nomi. */
  const bankLabel = computed(() =>
    identity.value?.bankName || result.value?.bankName || ''
  )

  return { check, reset, result, identity, earlier, bankLabel, live, loading, failed }
}
