/*
  Karta/hisob raqamini serverda tekshirish.

  Formada raqam kiritilayotganda ishlaydi: to'liq raqam yig'ilgach so'rov
  yuboriladi, natijada bank nomi va shu raqam bo'yicha oldingi arizalar keladi.

  Server javob bermasa `live` false bo'lib qoladi va chaqiruvchi namuna
  ma'lumotdagi takroriylikni ko'rsatadi — ekran bir xil ishlaydi.
*/
import { ref, computed } from 'vue'
import { checkNumber, identifyCard } from '@/services/complaints'
import { numberCheck, cardIdentity } from '@/utils/adapt'

const DEBOUNCE = 400
const MIN_DIGITS = 16

export function useNumberCheck() {
  const result = ref(null)
  const identity = ref(null)
  const loading = ref(false)
  const failed = ref(false)

  let timer = null
  // eng oxirgi so'rovgina natijani yozadi
  let seq = 0

  function reset() {
    clearTimeout(timer)
    result.value = null
    identity.value = null
    loading.value = false
    failed.value = false
  }

  async function run(digits) {
    const mine = ++seq
    loading.value = true

    // ikkalasi mustaqil: biri yiqilsa ikkinchisi baribir ishlatiladi
    const [check, card] = await Promise.allSettled([
      checkNumber(digits),
      identifyCard(digits)
    ])

    if (mine !== seq) return // orada yangi raqam kiritilgan

    result.value = check.status === 'fulfilled' ? numberCheck(check.value) : null
    identity.value = card.status === 'fulfilled' ? cardIdentity(card.value) : null
    failed.value = check.status === 'rejected'
    loading.value = false
  }

  /**
   * Raqam o'zgarganda chaqiriladi. To'liq bo'lmasa hech narsa yubormaydi.
   * @param {string} value maskalangan yoki xom raqam
   */
  function check(value) {
    clearTimeout(timer)
    const digits = String(value || '').replace(/\D/g, '')

    if (digits.length < MIN_DIGITS) {
      seq += 1 // ketayotgan so'rov natijasi endi kerak emas
      result.value = null
      identity.value = null
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
