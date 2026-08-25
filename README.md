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
npm test         # jadval mantiqi + barcha sahifalarni chizib tekshirish
```

`npm test` ikki bosqichdan iborat: `scripts/table-test.mjs` filtr, sahifalash va
sanoqlarni tekshiradi, `scripts/render-check.mjs` esa barcha sahifani uch tilda,
ikki rolda SSR orqali chizib, yo'qolgan tarjima kaliti va render xatolarini
qidiradi.

Node.js 18+ talab qilinadi.

## Tuzilma

```
src/
├─ assets/
│  ├─ tokens.css          190+ rang o'zgaruvchisi — kunduzgi va tungi rejim
│  ├─ base.css            reset, shriftlar, animatsiyalar, reduced-motion
│  └─ icons/              67 ta .svg — asl dizayndan olingan ikonkalar
├─ i18n/
│  ├─ index.js            vue-i18n sozlamasi, til almashtirish, ko'plik qoidalari
│  ├─ uz.js               O'zbekcha (lotin) — asosiy til
│  ├─ uzk.js              Ўзбекча (кирилл)
│  └─ ru.js               Русский
├─ data/
│  ├─ applications.js     statuslar, arizalar, KPI, filtrlar, qoralamalar (i18n kalitlari)
│  ├─ queues.js           navbat: manzil bo'lagi <-> kalit <-> status
│  ├─ detail.js           ariza tafsiloti: rekvizit, almashinuv, qadamlar, daraxt
│  ├─ form.js             forma tanlovlari, maskalar va tekshiruvlar
│  ├─ reasons.js          bloklash sabablari ma'lumotnomasi
│  ├─ keys.js             E-imzo kalitlari (namuna)
│  └─ notifications.js    bildirishnomalar lentasi
├─ stores/
│  ├─ useUi.js            mavzu, til, rol, sidebar, bildirishnoma, toast, tasdiqlash
│  ├─ useAuth.js          sessiya: kirish, chiqish, saqlash
│  └─ useApplications.js  arizalar va qoralamalar ro'yxati, sanoqlar, qo'shish
├─ utils/
│  ├─ table.js            filtrlash, sahifalash (alohida tekshiriladi)
│  └─ export.js           XLSX eksport (kutubxona lazy yuklanadi)
├─ router/
│  └─ index.js            5 ta yo'nalish
├─ components/
│  ├─ ui/                 AppIcon · AppToast · ConfirmDialog · StatusPill
│  ├─ layout/             AppLayout · AppTopbar · AppSidebar · SidebarLink
│  │                      RoleMenu · NotifyMenu
│  └─ applications/       KpiCards · QueueTabs · FilterPanel
│                         ApplicationsTable · TablePagination
└─ views/
   ├─ LoginView.vue              Tizimga kirish (to'liq)
   ├─ DashboardView.vue          Rahbar paneli (to'liq)
   ├─ NotificationsView.vue      Bildirishnomalar (to'liq)
   ├─ NotFoundView.vue           404
   ├─ ApplicationsView.vue       Arizalar ro'yxati va navbatlar (to'liq)
   ├─ ApplicationDetailView.vue  Ariza tafsiloti (to'liq)
   ├─ NewApplicationView.vue     Yangi murojaat formasi (to'liq)
   ├─ DraftsView.vue             Qoralamalar (to'liq)
   ├─ ReasonsView.vue            Bloklash sabablari (to'liq)
   └─ StubView.vue               hali yig'ilmagan ekranlar uchun
```

## Yo'nalishlar

Manzillar inglizcha, interfeys matni esa i18n orqali tarjima qilinadi.

| Yo'l | Ekran | Holati |
| --- | --- | --- |
| `/login` | Tizimga kirish | to'liq |
| `/` | Barcha arizalar | to'liq |
| `/queue/:queue` | Navbat bo'yicha ro'yxat | to'liq |
| `/application?id=...&tab=...` | Ariza tafsiloti | to'liq (Murojaat, Bank amaliyotlari, Ish jarayoni) |
| `/application/new` | Yangi murojaat formasi | to'liq |
| `/drafts` | Qoralamalar | to'liq |
| `/reasons` | Bloklash sabablari | to'liq |
| `/notifications` | Bildirishnomalar | to'liq |
| `/dashboard` | Rahbar paneli | to'liq |

Navbat bo'lagi (`:queue`): `new`, `in-bank`, `returned`, `blocked`,
`autopayment`, `cancelled`, `completed` — yon menyudagi har bir band va
jadval ustidagi tablar shu manzillarga o'tadi, KPI kartalari ham shunday.

`/dashboard` faqat "Rahbar" roli tanlanganda menyuda ko'rinadi — rolni yuqori
o'ng burchakdagi profil menyusidan almashtiring.

## Kirish va sessiya

`/login` — asl dizayndagi ikki qismli ekran: chapda gerb, TURON nomi va uchta
tezis, o'ngda til almashtirgichi (Uz / Ўз / Ru) va uchta kirish usuli:

| Usul | Nima qiladi |
| --- | --- |
| **Login** | login + parol (parolni ko'rsatish, «Parolni eslab qolish», «Parolni unutdingizmi?») |
| **E-imzo** | ulangan kalitlar ro'yxati (shaxsiy va tashkilot), PIN-kod maydoni |
| **Face ID** | skaner animatsiyasi va kirish |

Marshrut himoyasi `router.beforeEach` da: kirmagan foydalanuvchi istalgan
sahifadan `/login?next=<yo'l>` ga yo'naltiriladi va kirgandan keyin o'sha
sahifaga qaytariladi; kirgan foydalanuvchi `/login` ni ochsa `/` ga tushadi.
Sessiya `turon-auth` kaliti bilan saqlanadi — «Parolni eslab qolish»
belgilangan bo'lsa `localStorage` da, aks holda `sessionStorage` da (brauzer
yopilganda o'chadi). Profil menyusidagi «Tizimdan chiqish» endi haqiqatan
sessiyani tozalab, `/login` ga qaytaradi.

Rol kirish usulidan olinadi: E-imzo'dagi shaxsiy kalit (Boybayev Umrbek) —
**Rahbar**, tashkilot kaliti va login/parol — **Navbatchi**. Keyin rolni
profil menyusidan ham almashtirish mumkin.

**Diqqat:** backend yo'q — parol tekshirilmaydi, har qanday to'ldirilgan forma
qabul qilinadi, Face ID esa kamerani so'ramaydi (animatsiya). Real tizimda bu
qism API va token bilan almashtiriladi.

## Yangi murojaat formasi

`/application/new` — ikki ustunli forma, asl dizayndagidek:

* **Ariza ma'lumotlari** — ariza/material raqami, sodir etish usuli va manbasi
  (i18n ro'yxatlaridan), fabula maydoni + to'rtta savol yorlig'i (bosilganda
  matnga qo'shiladi) va «Ovozli yozib olish» tugmasi;
* **Arizachi** — F.I.Sh. (avtomatik lotin katta harflar), telefon
  (`+998 90 123 45 67` maskasi), hudud, manzil;
* **Karta / hisob raqam** — 16 yoki 20 raqamli maska, raqam bo'yicha to'lov
  tizimi aniqlanadi (Humo / UzCard / Visa / Mastercard), summa va tranzaksiya
  vaqti maskalari, qo'shilgan rekvizitlar ro'yxati va jami summa.

Har bir blokning «Tekshirish» tugmasi majburiy maydonlarni tekshiradi va
sarlavhaga yashil belgi qo'yadi. «Bloklashga yuborish» barcha majburiy maydon
to'lgunicha va kamida bitta rekvizit qo'shilgunicha o'chiq turadi; bosilganda
tasdiqlash oynasi chiqadi. Qoralama taymeri sarlavhada ko'rinadi.
Forma ma'lumoti hozircha backendga yuborilmaydi — tasdiqdan keyin ro'yxatga
qaytariladi.

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

## Bloklash sabablari

`/reasons` — 12 ta sabab: kod (`CB-01`…), nomi va izohi, bank javobi uchun
reglament muddati va shu sabab bo'yicha arizalar soni. Sarlavhadagi qidiruv
kod, nom va izoh bo'yicha filtrlaydi. Ma'lumot manbai —
`src/data/reasons.js`, matnlar `reasons.items.*` da.

## Jadval: filtr, qidiruv va sahifalash

Ro'yxat endi haqiqiy ishlaydi — hammasi `src/utils/table.js` dagi sof
funksiyalarda, komponentlar faqat ularni chaqiradi:

* **navbat** — manzildan (`/queue/blocked`), `overdue` ham navbat sifatida;
* **filtr paneli** — 8 guruh (status, bank, usul, manba, hudud, summa oralig'i,
  takroriylik, SLA); har bir qiymat yonidagi son ro'yxatdan hisoblanadi,
  0 ta bo'lgan qiymat xiralashadi;
* **ustun qidiruvi** — jadval sarlavhasidagi qator: ariza/material raqami,
  oqim, F.I.Sh. yoki usul, karta yoki bank, summa `dan–gacha`, status tanlovi
  va sana (native date input); o'ngdagi ✕ hammasini tozalaydi;
* **sahifalash** — haqiqiy kesish, 10/20/50 tanlovi, `1 … 4 5 6 … 7` ko'rinishi,
  `1–10` oralig'i va jami; filtr natijasi kamayganda sahifa avtomatik
  to'g'rilanadi.

Takroriylik va SLA maydonlari ma'lumotda saqlanmaydi — bir xil karta bir necha
arizada uchrashi va `overdue` bayrog'idan hisoblanadi.

Namuna ro'yxat 64 ta arizadan iborat: 9 tasi asl dizayndan, qolgani
`src/data/applications.js` dagi generator orqali indeksdan hosil qilinadi
(tasodifiy son yo'q — har safar bir xil). Shu sababli yon menyu, KPI va
navbat tablaridagi sonlar jadvaldagi haqiqiy holat bilan mos.

## Eksport

«Eksport · XLSX» filtrlangan ro'yxatni haqiqiy `.xlsx` fayl qilib yuklab beradi
(`cardblock-YYYYMMDD-HHMM.xlsx`). SheetJS faqat shu tugma bosilganda yuklanadi,
shuning uchun asosiy paketga qo'shilmaydi.

## Rahbar paneli

`/dashboard` — asl dizayndan (`cardBlock.html`) bir-bir ko'chirilgan. Uslublar
o'sha yerdagidek inline turadi, ranglar `tokens.css` dagi o'zgaruvchilardan
olinadi — shu sababli o'lcham, bo'shliq va rang piksel darajasida mos.

* sarlavha — hudud chipi, davr belgisi va Bugun / Hafta / Oy / Chorak tanlovi
  (davr almashsa hujum kanallari sonlari qayta hisoblanadi);
* 5 ta KPI karta — sonlar ro'yxatdan (jadval bilan mos);
* **Taqsimlanmagan murojaatlar** — 9 ta ish, muddat 40 soatdan kam bo'lsa qizil;
  «Tayinlash» ijrochi tanlash oynasini ochadi (tizim tavsiyasi — eng kam
  yuklangan xodim), «Avto taqsimlash» esa hammasini bir vaqtda taqsimlaydi;
* **Muddat** — 5 kunlik ustunli diagramma (balandlik `n / max * 88%`);
* **Jamoa yuklamasi** — 5 xodim, yuklama 9 tadan oshsa rang o'zgaradi;
* **Hujum kanallari** — 10 qator, ulush bo'yicha kenglik va ko'kning
  pasayib boruvchi shaffofligi.

Ish tayinlangach jamoa yuklamasi va ro'yxat darhol yangilanadi.

## Ikonkalar

Barcha ikonkalar `src/assets/icons/*.svg` da — asl dizayndan ajratib olingan.
`AppIcon` ularni qurilish vaqtida o'qiydi (`import.meta.glob(... '?raw')`),
`viewBox` ni fayldan oladi va o'lcham/qalinlikni props orqali beradi. Yangi
ikonka qo'shish uchun shu papkaga `.svg` tashlash kifoya. Rangli ikonka
(masalan Excel) `fill` bilan yozilgan bo'lsa, `stroke` qo'llanmaydi.

## Ma'lumotlar

`src/data/applications.js` dagi qiymatlar — asl dizayndagi namuna ma'lumotlar.
Real loyihada bu faylni API chaqiruvlari bilan almashtiring; komponentlar
propslar orqali ishlaydi, shuning uchun ular o'zgarmaydi.
