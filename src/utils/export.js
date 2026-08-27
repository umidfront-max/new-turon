// XLSX eksport — kutubxona faqat kerak bo'lganda yuklanadi (lazy import).
import { toNumber } from '@/stores/useApplications'

function stamp() {
  const d = new Date()
  const p = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}-${p(d.getHours())}${p(d.getMinutes())}`
}

/**
 * Arizalar ro'yxatini .xlsx fayl qilib yuklab beradi.
 * @param {Array} rows filtrlangan arizalar
 * @param {Function} t i18n tarjimon
 * @returns {Promise<string>} fayl nomi
 */
export async function exportApplications(rows, t) {
  const XLSX = await import('xlsx')

  const data = rows.map((r, i) => ({
    [t('table.n')]: i + 1,
    [t('table.id')]: r.id,
    [t('detail.fields.material')]: r.material || t('table.noMaterial'),
    [t('table.flow')]: r.flow === '102' ? '102' : t('flow.duty'),
    [t('detail.applicant.fio')]: r.name,
    // serverdan kelgan qatorda usul raqamli id, nomi alohida maydonda
    [t('detail.fields.method')]: r.methodLabel || (r.method ? t(`methods.${r.method}`) : ''),
    [t('form.requisite.cardNumber')]: r.card,
    [t('filters.groups.bank')]: r.bank,
    [t('filters.groups.region')]: r.regionLabel || (r.region ? t(`regions.${r.region}`) : ''),
    [t('table.amount')]: toNumber(r.amount),
    [t('table.status')]: t(`status.${r.status}.label`),
    [t('table.time')]: r.time
  }))

  const sheet = XLSX.utils.json_to_sheet(data)
  sheet['!cols'] = [
    { wch: 5 }, { wch: 22 }, { wch: 18 }, { wch: 10 }, { wch: 34 }, { wch: 24 },
    { wch: 21 }, { wch: 14 }, { wch: 18 }, { wch: 14 }, { wch: 20 }, { wch: 18 }
  ]

  const book = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(book, sheet, t('applications.title').slice(0, 28))

  const file = `cardblock-${stamp()}.xlsx`
  XLSX.writeFile(book, file)
  return file
}
