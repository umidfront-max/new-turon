/*
  Til almashganda serverdan kelgan matnlarni yangilaydi.

  Nega sahifani butunlay yangilamaymiz: `location.reload()` formadagi
  to'ldirilgan ma'lumotni, ochiq oynani va skroll o'rnini yo'qotadi hamda
  butun ilovani qaytadan yuklaydi. Aslida faqat serverdagi yorliqlar tilga
  bog'liq — chip va facet nomlari, ma'lumotnomalar, status matnlari,
  bildirishnomalar. Shularning o'zini qaytadan so'raymiz.

  Mahalliy tarjimalar (i18n) esa darhol almashadi, ular uchun hech narsa
  kerak emas.
*/
import { watch } from 'vue'
import { i18nLang } from '@/i18n'
import { useRegistry } from '@/stores/useRegistry'
import { useReferences } from '@/stores/useReferences'
import { useComplaint } from '@/stores/useComplaint'
import { useDrafts } from '@/stores/useDrafts'
import { useNotifications } from '@/stores/useNotifications'
import { useDuty } from '@/stores/useDuty'

/** Ilova ochilganda bir marta chaqiriladi (App.vue). */
export function useLangRefresh() {
  const registry = useRegistry()
  const refs = useReferences()
  const complaint = useComplaint()
  const drafts = useDrafts()
  const notifications = useNotifications()
  const duty = useDuty()

  watch(i18nLang, () => {
    /*
      Har biri mustaqil: biri yiqilsa qolgani baribir yangilanadi.
      Yuklanmagan bo'limlar o'zi o'tkazib yuboradi (reload ichida tekshiruv bor).
    */
    const jobs = [
      () => refs.reload(),
      () => registry.reload(),
      () => complaint.reload(),
      () => (drafts.live.value ? drafts.load() : null),
      () => (notifications.live.value ? notifications.load() : null),
      () => (duty.live?.value ? duty.load() : null)
    ]

    jobs.forEach((run) => {
      try {
        Promise.resolve(run()).catch(() => { /* eski matn qoladi */ })
      } catch { /* do'kon hali tayyor emas */ }
    })
  })
}
