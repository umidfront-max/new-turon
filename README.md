# TURON CYBER · CardBlock — Vue 3

Kiberjinoyatlarga qarshi kurashish departamenti uchun karta bloklash tizimi
interfeysi. Asl HTML dizayn Vue 3 + Composition API (`<script setup>`) ga
ko'chirilgan: ranglar, o'lchamlar va tipografika bir xil saqlangan, ustiga
responsive tartib va animatsiyalar qo'shilgan.

## Ishga tushirish

```bash
npm install
npm run dev      # http://localhost:5173
```

Boshqa buyruqlar:

```bash
npm run build    # dist/ ga yig'ish
npm run preview  # yig'ilgan versiyani ko'rish
```

Node.js 18+ talab qilinadi.

## Tuzilma

```
src/
├─ assets/
│  ├─ tokens.css          190+ rang o'zgaruvchisi — kunduzgi va tungi rejim
│  └─ base.css            reset, shriftlar, animatsiyalar, reduced-motion
├─ i18n/
│  ├─ index.js            vue-i18n sozlamasi, til almashtirish, ko'plik qoidalari
│  ├─ uz.js               O'zbekcha (lotin) — asosiy til
│  ├─ uzk.js              Ўзбекча (кирилл)
│  └─ ru.js               Русский
├─ data/
│  ├─ applications.js     statuslar, arizalar, KPI, filtrlar, qoralamalar (i18n kalitlari)
│  ├─ detail.js           ariza tafsiloti: rekvizit/tranzaksiya hisobi
│  └─ notifications.js    bildirishnomalar lentasi
├─ stores/
│  └─ useUi.js            mavzu, til, rol, sidebar, bildirishnoma, toast, tasdiqlash
├─ router/
│  └─ index.js            5 ta yo'nalish
├─ components/
│  ├─ ui/                 AppIcon · AppToast · ConfirmDialog · StatusPill
│  ├─ layout/             AppLayout · AppTopbar · AppSidebar · SidebarLink
│  │                      RoleMenu · NotifyMenu
│  └─ applications/       KpiCards · QueueTabs · FilterPanel
│                         ApplicationsTable · TablePagination
└─ views/
   ├─ ApplicationsView.vue       Arizalar ro'yxati (to'liq)
   ├─ ApplicationDetailView.vue  Ariza tafsiloti (to'liq)
   ├─ DraftsView.vue             Qoralamalar (to'liq)
   └─ StubView.vue               hali yig'ilmagan ekranlar uchun
```

## Yo'nalishlar

| Yo'l | Ekran | Holati |
| --- | --- | --- |
| `/` | Barcha arizalar | to'liq |
| `/qoralamalar` | Qoralamalar | to'liq |
| `/ariza?id=...` | Ariza tafsiloti | to'liq (Murojaat tabi) |
| `/yangi` | Yangi murojaat | keyingi bosqich |
| `/rahbar` | Rahbar paneli | keyingi bosqich |

`/rahbar` faqat "Rahbar" roli tanlanganda menyuda ko'rinadi — rolni yuqori
o'ng burchakdagi profil menyusidan almashtiring.

## Tillar (i18n)

Interfeys `vue-i18n` orqali uch tilda: **O'zb** (lotin), **Ўзб** (kirill),
**Рус**. Almashtirish: profil menyusi → **Til**. Tanlov `localStorage` da
(`turon-lang`) saqlanadi va `<html lang>` atributi ham yangilanadi.

Barcha matnlar `src/i18n/*.js` da — komponentlarda qattiq yozilgan satr yo'q.
Namuna ma'lumotlar (`src/data/*.js`) ham matn emas, kalit saqlaydi:
`method: 'vishing'` → `t('methods.vishing')`. Shu sababli status, navbat,
filtr va KPI nomlari til bilan birga almashadi; bank nomlari, F.I.Sh. va
karta raqamlari esa asl holida qoladi.

Yangi matn qo'shganda uchala faylga ham kalit yozing — tuzilma bir xil
bo'lishi shart. Ruscha ko'plik shakllari (`1 транзакция / 3 транзакции /
7 транзакций`) `pluralRules` orqali ishlaydi, o'zbek tilida esa bitta shakl
qaytariladi.

## Bildirishnomalar

Topbar'dagi qo'ng'iroq tugmasi ochiladigan panel: o'qilmaganlar soni
badge'da, har bir satr bosilganda tegishli arizaga o'tadi va o'qilgan
deb belgilanadi, «Hammasini o'qildi» tugmasi hammasini tozalaydi.
Ma'lumot manbai — `src/data/notifications.js`, vaqt ("8 daqiqa avval")
i18n orqali hisoblanadi.

## Mavzu (kunduzgi / tungi)

Rang o'zgaruvchilari `body[data-theme="dark"]` selektori orqali almashadi.
Tanlov `localStorage` da (`turon-theme` kaliti) saqlanadi. Almashtirish:
profil menyusi → **Mavzu**.

Yangi rang qo'shganda `tokens.css` dagi ikkala blokka ham yozing, aks holda
tungi rejimda rang qotib qoladi.

## Responsive

| Kenglik | O'zgarish |
| --- | --- |
| ≥ 1024px | to'liq tartib; sidebar yig'iladi (248px ↔ 72px) |
| < 1024px | sidebar chekka drawer'ga aylanadi, topbar'da hamburger paydo bo'ladi |
| < 900px | arizalar jadvali karta ro'yxatiga o'tadi |
| < 720px | navbat tablari gorizontal skroll, tugmalarda faqat ikonka |
| < 520px | KPI ikki ustunda |

## Animatsiyalar

Ekran almashinuvi (fade + slide), KPI va jadval qatorlarining ketma-ket
chiqishi, filtr panelining ochilishi, sidebar kengligi, dropdown pop,
toast va modal. Barchasi `prefers-reduced-motion: reduce` da o'chadi.

## Ariza tafsiloti ekrani

`/ariza?id=<ariza raqami>` — ro'yxatdagi qatorni bosganda ochiladi va
umumiy layout ichida ishlaydi (topbar + sidebar joyida qoladi):

* amal satri — muddat (rangi qolgan kunga qarab), XLSX eksport va statusga
  bog'liq asosiy tugma: `Yuborilmagan` da «Bloklashga yuborish», `Xatolik` da
  «Tahrirlash va qayta yuborish», qolgan holatlarda tugma ko'rsatilmaydi;
* sarlavha kartasi — arizachi, status, zarar summasi va qadamlar treki
  (2–3 qadam: qabul qilindi → bankka yuborildi → javob kutilmoqda / qaytardi /
  bloklandi / qaytarildi);
* 5 ta tab: **Murojaat**, **Bank amaliyotlari**, **Ish jarayoni** — to'liq;
  Sanksiyalar va Tranzaksiyalar — keyingi bosqich.

Tanlangan tab manzilda turadi (`/ariza?id=...&tab=bank`), shuning uchun havolani
ulashish va brauzer «orqaga» tugmasi ishlaydi.

| Tab | Nima ko'rsatiladi |
| --- | --- |
| Murojaat | asosiy maydonlar, arizachi, fabula + ovozli fabula pleyeri, rekvizitlar (tranzaksiyalari ochiladi) |
| Bank amaliyotlari | Markaziy bank bilan almashinuv lentasi: yuborilgan so'rov (REQ raqami, E2202 kodi, urinish, rekvizitlar), bank javoblari, qaytarilganda — bank xodimi va «Avto to'lov izohi» |
| Ish jarayoni | daraxt ko'rinishidagi tarix: vaqt, xodim/bank, bosqich yorlig'i |

Lenta, qadamlar va daraxt bitta manbadan — `src/data/detail.js` dagi status
bo'yicha yig'iladi, sanalar ariza vaqtidan siljitib hisoblanadi. Ovozli fabula
pleyeri namuna — haqiqiy audio fayl ulanmagan.

## Ma'lumotlar

`src/data/applications.js` dagi qiymatlar — asl dizayndagi namuna ma'lumotlar.
Real loyihada bu faylni API chaqiruvlari bilan almashtiring; komponentlar
propslar orqali ishlaydi, shuning uchun ular o'zgarmaydi.
