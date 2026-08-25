// O'zbekcha (lotin) — asosiy til. Boshqa fayllar shu tuzilmani takrorlaydi.
export default {
  app: {
    brand: 'TURON CYBER',
    logoAlt: 'Kiberjinoyatlarga qarshi kurashish departamenti',
    defaultTitle: 'TURON CYBER · CardBlock'
  },

  common: {
    search: 'Qidiruv',
    apply: "Qo'llash",
    clear: 'Tozalash',
    cancel: 'Bekor qilish',
    confirm: 'Tasdiqlash',
    close: 'Yopish',
    remove: "O'chirish",
    details: 'Batafsil',
    backToList: "Ro'yxatga qaytish",
    continue: 'Davom etish'
  },

  modules: {
    complaint: 'Murojaat',
    cardblock: 'CardBlock',
    short: 'CB',
    soon: "Murojaat moduli keyingi bosqichda ulanadi"
  },

  nav: {
    dashboard: 'Rahbar paneli',
    all: 'Barcha arizalar',
    add: "Ariza qo'shish",
    drafts: 'Qoralamalar',
    newApps: 'Yangi arizalar',
    returned: 'Qaytarilgan',
    inBank: 'Bankda',
    blocked: 'Bloklangan',
    autopayment: "Avto to'lov",
    reasons: 'Bloklash sabablari',
    groupTasks: 'Mening vazifalarim',
    groupAttention: "E'tibor talab qiladi",
    groupStatus: 'Murojaat holati',
    groupReference: "Ma'lumotnoma",
    collapse: "Menyuni yig'ish",
    expand: 'Menyuni ochish',
    openMenu: 'Menyuni ochish',
    closeMenu: 'Menyuni yopish'
  },

  topbar: {
    clockTip: '{date}, {weekday} · hisobot yili {year}',
    weekday: 'Juma',
    notifications: 'Bildirishnomalar',
    profile: 'Profil va rol'
  },

  profile: {
    staff: { name: 'Suvonov Farrux', label: 'Navbatchi ijrochi', ini: 'SF' },
    exec: { name: 'Umrbek Boybayev', label: 'Rahbar', ini: 'RJ' }
  },

  duty: {
    staff: {
      on: { state: 'Navbatchi', meta: '1-smena · 09:00–21:00' },
      review: { state: 'Tekshiruvda', meta: '1-smena · 09:41 da' },
      returned: { state: 'Hisobot qaytarildi', meta: '1-smena · 10:04 da' },
      closed: { state: 'Navbat yopildi', meta: '2-smena · 21:00–09:00' }
    },
    exec: {
      on: { state: 'Navbatchi: Suvonov F.', meta: 'Navbatda' },
      review: { state: 'Hisobot keldi', meta: '1-smena · 09:41 da' },
      returned: { state: 'Hisobot qaytarildi', meta: '1-smena · tuzatish kutilmoqda' },
      closed: { state: 'Navbat yopildi', meta: '1-smena · tasdiqlandi' }
    },
    btn: {
      hand: 'Topshirish',
      report: 'Hisobot',
      fix: 'Tuzatish',
      accept: 'Qabul qilish',
      review: "Ko'rib chiqish"
    },
    tip: {
      hand: 'Smena hisobotini rahbarga yuborish',
      report: "Yuborilgan hisobotni ko'rish",
      fix: "Rahbar izohini ko'rib qayta yuborish",
      accept: 'Navbatchilikni qabul qilish',
      review: "Navbatchilik hisobotini ko'rib chiqish"
    },
    ask: {
      title: 'Navbatchilikni qabul qilasizmi?',
      text: "Yangi smena boshlanadi va oldingi navbatchidan qolgan 3 ta ish sizga o'tadi.",
      ok: 'Qabul qilish'
    },
    toast: {
      accepted: 'Navbatchilik qabul qilindi · 1-smena',
      approved: 'Navbatchilik tasdiqlandi va yopildi',
      sent: 'Hisobot rahbarga yuborildi · Ismoilov J.'
    }
  },

  role: {
    title: 'Rolni tanlash',
    staff: { label: 'Navbatchi / ijrochi', note: 'Arizalar bilan ishlash' },
    exec: { label: 'Rahbar', note: 'Umumiy nazorat va taqsimlash' },
    lang: 'Til',
    theme: 'Mavzu',
    light: 'Kunduzgi',
    dark: 'Tungi',
    year: 'Hisobot yili',
    logout: 'Tizimdan chiqish',
    loggedOut: 'Tizimdan chiqildi',
    langChanged: "Til o'zgartirildi · O'zbekcha (lotin)"
  },

  lang: {
    uz: { short: "O'zb", full: "O'zbekcha (lotin)" },
    uzk: { short: 'Ўзб', full: 'Ўзбекча (кирилл)' },
    ru: { short: 'Рус', full: 'Ruscha' }
  },

  notify: {
    title: 'Bildirishnomalar',
    unread: '{n} ta yangi',
    markAll: "Hammasini o'qildi",
    allRead: "Barcha bildirishnomalar o'qildi",
    emptyTitle: "Yangi bildirishnoma yo'q",
    emptyText: "Ariza holati o'zgarganda shu yerda ko'rinadi.",
    viewAll: "Barchasini ko'rish",
    pageTitle: 'Bildirishnomalar',
    pageNote: "Oxirgi hodisalar — eng yangisi tepada",
    unreadOnly: "Faqat o'qilmagan",
    open: 'Arizani ochish',
    items: {
      bankRejected: {
        title: 'Bank arizani qaytardi',
        text: '{id} — karta raqamida xatolik topildi.'
      },
      blocked: {
        title: 'Karta bloklandi',
        text: '{id} — {amount} UZS muzlatildi.'
      },
      newApplication: {
        title: 'Yangi ariza keldi',
        text: '{id} — 102 oqimi orqali qabul qilindi.'
      },
      slaSoon: {
        title: 'Muddat tugayapti',
        text: "{id} bo'yicha javob muddati 2 soatdan kam qoldi."
      },
      reportReturned: {
        title: 'Hisobot qaytarildi',
        text: 'Rahbar smena hisobotiga izoh qoldirdi.'
      }
    }
  },

  time: {
    now: 'Hozirgina',
    minAgo: '{n} daqiqa avval',
    hourAgo: '{n} soat avval',
    dayAgo: '{n} kun avval'
  },

  applications: {
    title: 'Bloklash arizalari',
    filters: 'Filtrlar',
    export: 'Eksport · XLSX',
    exportToast: 'Eksport tayyorlanmoqda · XLSX',
    exportDone: 'Yuklab olindi: {file}',
    exportEmpty: "Eksport uchun ariza yo'q",
    filtersCleared: 'Filtrlar tozalandi',
    filtersApplied: '{n} ta filtr qo‘llandi',
    emptyTitle: "Bu navbatda ariza yo'q",
    emptyText: "Boshqa navbatni tanlang yoki filtrlarni tozalab ko'ring."
  },

  table: {
    n: '№',
    id: 'Ariza raqami',
    flow: 'Oqim',
    applicant: 'Arizachi va usuli',
    card: 'Karta / bank',
    amount: 'Zarar',
    status: 'Status',
    time: 'Vaqti',
    phId: 'Qidiruv',
    phFlow: 'Qidiruv',
    phApplicant: 'F.I.Sh. yoki usul',
    phCard: 'Karta yoki bank',
    phAmount: 'dan – gacha',
    phStatus: 'Holati:',
    from: 'dan',
    to: 'gacha',
    phDate: 'Tanlang',
    noMaterial: "material raqami yo'q"
  },

  pager: {
    perPage: '{n} ta/sahifa',
    jump: "Sahifaga o'tish",
    range: '{from}–{to}',
    total: 'Jami: {n} ta'
  },

  flow: { duty: 'Navbatchi' },

  queues: {
    all: 'Barchasi',
    new: 'Yangi',
    pending: 'Bankda',
    error: 'Qaytarilgan',
    blocked: 'Bloklangan',
    autopayment: "Avto to'lov",
    cancelled: 'Bekor qilingan',
    done: 'Yakunlangan',
    overdue: "Muddati o'tgan"
  },

  kpi: {
    new: { label: 'Yangi arizalar', note: "ko'rib chiqilmagan" },
    pending: { label: 'Bankda jarayonda', note: 'javob kutilmoqda' },
    blocked: { label: 'Bloklangan', note: 'muzlatilgan' },
    autopayment: { label: "Avto to'lov", note: 'muzlatilgan' },
    overdue: { label: "Muddati o'tgan", note: "ko'rish kerak" }
  },

  status: {
    new: {
      label: 'Yuborilmagan',
      short: 'Yuborilmagan',
      plain: 'Ariza tayyorlangan, ammo bankka hali yuborilmagan.',
      next: "Ma'lumotlarni tekshirib «Bloklashga yuborish» tugmasini bosing."
    },
    pending: {
      label: "Bankda ko'rilmoqda",
      short: 'Bankda',
      plain: 'Ariza Markaziy bankka yuborilgan, javob kutilmoqda.',
      next: 'Bank javobini kutish. Odatda 2 soat ichida keladi.'
    },
    autopayment: {
      label: "Avto to'lov",
      short: "Avto to'lov",
      plain: "Pul avto-to'lov bosqichida ushlandi, kartani bloklash talab etilmadi.",
      next: 'Qaror hujjatini «Sanksiyalar» tabidan yuklab oling.'
    },
    blocked: {
      label: 'Bloklangan',
      short: 'Bloklangan',
      plain: "Karta muzlatildi, mablag' harakati to'xtatildi.",
      next: 'Muzlatilgan summani tekshirib, ishni yakunlashga tayyorlang.'
    },
    error: {
      label: 'Xatolik / rad etilgan',
      short: 'Xatolik',
      plain: "Bank arizani qaytardi — ko'rsatilgan maydonda xatolik bor.",
      next: "Xatolik izohini o'qing, maydonni tuzatib qayta yuboring."
    },
    cancelled: {
      label: 'Bekor qilingan',
      short: 'Bekor',
      plain: "Ariza bekor qilindi, bank bilan almashinuv to'xtatildi.",
      next: "Bekor qilish sababini ish jarayonidan ko'ring."
    },
    done: {
      label: "Mablag' qaytarilgan",
      short: 'Qaytarilgan',
      plain: "Jarayon yakunlandi, mablag' egasiga qaytarildi.",
      next: 'Ish yopilgan. Hisobot uchun eksport qilish mumkin.'
    }
  },

  filters: {
    groups: {
      status: 'Status',
      bank: 'Bank',
      method: 'Firibgarlik usuli',
      source: 'Manba',
      region: 'Hudud',
      amount: 'Zarar summasi',
      repeat: 'Takroriylik',
      sla: 'SLA'
    }
  },

  methods: {
    vishing: "Soxta qo'ng'iroq (vishing)",
    phishing: 'Fishing havolasi',
    fakeShop: "Soxta internet-do'kon",
    fakeInvest: 'Soxta investitsiya',
    simSwap: 'SIM-swap',
    apk: 'Zararli ilova (APK)',
    fakeSupport: 'Soxta texnik yordam',
    other: 'Boshqa',
    fakeCall: "Soxta qo'ng'iroq (fishing)",
    fakeMarket: 'Soxta savdo maydonchasi',
    telegramBot: 'Telegram bot',
    fakeApp: 'Soxta ilova (APK)',
    unknown: 'aniqlanmagan'
  },

  sources: {
    '102': '102',
    duty: 'Navbatchi',
    telegram: 'Telegram',
    instagram: 'Instagram',
    facebook: 'Facebook',
    whatsapp: 'WhatsApp',
    call: "Qo'ng'iroq",
    sms: 'SMS',
    web: 'Veb-sayt',
    bankApp: 'Bank ilovasi',
    other: 'Boshqa'
  },

  regions: {
    tashkentCity: 'Toshkent shahar',
    tashkentRegion: 'Toshkent viloyati',
    andijan: 'Andijon',
    bukhara: 'Buxoro',
    fergana: "Farg'ona",
    jizzakh: 'Jizzax',
    namangan: 'Namangan',
    navoi: 'Navoiy',
    kashkadarya: 'Qashqadaryo',
    samarkand: 'Samarqand',
    syrdarya: 'Sirdaryo',
    surkhandarya: 'Surxondaryo',
    khorezm: 'Xorazm',
    karakalpakstan: "Qoraqalpog'iston Resp."
  },

  amounts: {
    lt5: '<5 mln',
    m5_20: '5–20 mln',
    m20_50: '20–50 mln',
    gt50: '50 mln+'
  },

  repeat: {
    duplicate: 'Takroriy rekvizit aniqlangan',
    clean: 'Toza'
  },

  sla: {
    inTime: 'Muddat ichida',
    breached: 'Muddati buzilgan'
  },

  drafts: {
    title: 'Qoralamalar',
    chip: '{n} ta tugallanmagan ariza',
    newApplication: 'Yangi ariza',
    listTitle: 'Saqlangan qoralamalar',
    listNote: 'Qoralama 30 kun saqlanadi',
    colId: 'Ariza raqami',
    colApplicant: 'Arizachi',
    colCard: 'Rekvizit',
    colDone: "To'ldirilgan",
    colEdited: 'Oxirgi tahrir',
    tx: '{n} tranzaksiya',
    noRequisite: "rekvizit qo'shilmagan",
    noNumber: 'raqam berilmagan',
    askTitle: "Qoralamani o'chirasizmi?",
    askText: "Qoralamadagi barcha kiritilgan ma'lumotlar o'chiriladi va tiklab bo'lmaydi.",
    removed: "Qoralama o'chirildi",
    emptyTitle: "Qoralama yo'q",
    emptyText: 'Tugallanmagan arizalar shu yerda saqlanadi va istalgan vaqtda davom ettirish mumkin.',
    missing: {
      address: 'Yashash manzili kiritilmagan',
      fabula: "Fabula to'ldirilmagan",
      materialRegion: "Material raqami, hudud yo'q",
      requisiteAmount: "Rekvizit va summa yo'q",
      applicant: "Arizachi ma'lumotlari yo'q",
      voice: 'Ovozli fabula yozilmagan'
    }
  },

  detail: {
    label: 'Ariza:',
    manual: "Qo'lda",
    deadline: 'Muddat: {n} kun qoldi',
    overdue: 'Muddat: {n} kun kechikdi',
    export: 'Eksport · XLSX',
    send: 'Bloklashga yuborish',
    sent: 'Ariza bloklashga yuborildi · javob kutilmoqda',
    exportToast: 'Ariza eksport qilinmoqda · XLSX',
    close: 'Yopish',
    damage: 'Zarar miqdori',
    sum: "so'm",
    notFound: 'Ariza topilmadi',
    notFoundText: "Bunday raqamli ariza ro'yxatda yo'q. Ro'yxatga qaytib qayta tanlang.",
    fix: 'Tahrirlash va qayta yuborish',
    fixToast: 'Tahrirlash ekrani keyingi bosqichda ulanadi',
    steps: {
      accepted: 'Murojaat qabul qilindi',
      sentToBank: 'Bankka yuborildi',
      notSent: 'Bankka yuborilmagan',
      queued: 'navbatda',
      awaiting: 'Bank javobi kutilmoqda',
      returned: 'Bank qaytardi',
      blocked: 'Karta bloklandi',
      autopayment: "Avto to'lov",
      refunded: "Mablag' qaytarildi",
      cancelled: 'Bekor qilindi',
      daysLeft: '{n} kun qoldi'
    },
    bank: {
      title: 'Markaziy bank bilan almashinuv',
      emptyTitle: 'Hali bankka yuborilmagan',
      emptyText: "«Bloklashga yuborish» tugmasidan keyin almashinuv tarixi shu yerda ko'rinadi.",
      route: 'TURON → Markaziy bank',
      attempt: '{n}-urinish',
      sentAt: "So'rov yuborilgan vaqt",
      requestId: "So'rov ID",
      requisites: 'Rekvizitlar',
      staff: 'Bank xodimi',
      phone: 'Telefon raqami',
      noteTitle: "Avto to'lov izohi",
      note: "Arizada ko'rsatilgan {card} raqamli karta bo'yicha {date} sanasida (transaction_date) qidiruv berilganda, tizimimizda aynan siz ko'rsatgan {amount} so'm (amount) miqdoridagi yechilish qayd etilmagan.",
      events: {
        sent: 'Bloklash uchun bankka yuborildi',
        returned: 'Bank arizani qaytardi',
        blocked: 'Bank kartani blokladi',
        autopayment: "Avto to'lov bosqichida ushlandi",
        refunded: "Mablag' egasiga qaytarildi",
        cancelled: "Almashinuv to'xtatildi"
      }
    },
    workflow: {
      title: 'Ish jarayoni',
      officer: 'F.B.Suvonov',
      staffRole: 'Xodim — Kiberxavfsizlik boshqarmasi',
      bank: 'Markaziy bank',
      badges: {
        accepted: 'Murojaat qabul qilindi',
        sent: 'Markaziy bankka yuborildi',
        waiting: 'Javob kutilmoqda',
        returned: 'Ariza qaytarildi',
        blocked: 'Karta bloklandi',
        autopayment: "Avto to'lov",
        refunded: "Mablag' qaytarildi",
        cancelled: 'Bekor qilindi'
      }
    },
    tabs: {
      complaint: 'Murojaat',
      bank: 'Bank amaliyotlari',
      sanctions: 'Sanksiyalar',
      transactions: 'Tranzaksiyalar',
      workflow: 'Ish jarayoni'
    },
    fields: {
      id: 'Ariza raqami',
      material: 'Material raqami',
      date: 'Kelib tushgan sana',
      source: 'Manba',
      method: 'Firibgarlik usuli'
    },
    applicant: {
      title: 'Murojaat qiluvchi',
      fio: 'F.I.Sh.',
      phone: 'Telefon raqami',
      region: 'Hudud',
      address: 'Yashash manzili',
      addressValue: 'Chilonzor tumani, 19-kvartal, 24-uy'
    },
    fabula: {
      title: 'Fabulasi — murojaat mazmuni',
      voice: 'Ovozli fabula',
      text: "Jabrlanuvchining bank kartasidan 12.07.2026 kuni soat 21:30 atrofida roziligisiz uch marta pul yechib olingan. Avval «bank xodimi» nomidan qo'ng'iroq qilinib, SMS-kod so'ralgan. «Kurs 60» yopiq Telegram guruhi orqali «APK» virusli ilova tarqatilgani aniqlandi. Umumiy zarar — {amount} so'm. Karta darhol bloklangan, bank ko'chirmasi ilova qilindi."
    },
    requisites: {
      title: 'Rekvizitlar',
      cards: '{n} ta rekvizit',
      tx: '{n} tranzaksiya',
      transactions: 'Tranzaksiyalar'
    },
    soon: {
      sanctions: 'Sanksiyalar bo‘limi keyingi bosqichda yig‘iladi.',
      transactions: 'Tranzaksiyalar bo‘limi keyingi bosqichda yig‘iladi.'
    }
  },

  dashboard: {
    export: 'Hisobotni yuklab olish',
    exportToast: 'Hisobot tayyorlanmoqda',
    exportReady: '{file} tayyorlandi',
    periods: { today: 'Bugun', week: 'Hafta', month: 'Oy', quarter: 'Chorak' },
    types: { app: 'Ariza', notice: 'Bildirgi' },
    roles: { senior: 'Katta inspektor', inspector: 'Inspektor', junior: 'Yosh inspektor' },
    unassigned: {
      title: 'Taqsimlanmagan murojaatlar',
      auto: 'Avto taqsimlash',
      empty: 'Barcha murojaatlar taqsimlangan',
      colId: 'Raqami',
      colMethod: 'Sodir etish usuli',
      colDeadline: 'Muddat',
      assign: 'Tayinlash',
      hours: '{n} soat',
      viewAll: "Barchasini ko'rish"
    },
    deadline: {
      title: 'Muddat',
      chip: '5 kunlik',
      total: 'Jami {n} ta',
      labels: {
        today: 'Bugun', tomorrow: 'Ertaga', afterTomorrow: 'Indinga',
        d3: '3 kun', d4: '4 kun', d5: '5 kun'
      }
    },
    team: { title: 'Jamoa yuklamasi', link: 'Jamoa', load: '{n} ish' },
    channels: {
      title: 'Hujum kanallari',
      note: "Firibgar mijozga qaysi yo'l bilan yetgan",
      items: {
        fakeLink: 'Soxta havola / zararli dastur',
        fakeCalls: "Soxta qo'ng'iroqlar",
        fakeTrading: 'Soxta treyding va birja',
        onlineTrade: 'Onlayn savdoda aldov',
        investment: 'Investitsiya aldovi',
        onlineLoan: 'Onlayn qarz va kredit',
        bankStaff: 'Bank xodimi ishtirokida',
        techWeak: 'Texnik zaiflik',
        inheritance: 'Meros va xayriya nomidan',
        other: 'Boshqa'
      }
    },
    methodsShort: {
      prepay: "To'lovni oldindan undurish",
      virusApp: 'Virusli ilova',
      onlineShop: "Onlayn do'konda aldov",
      socialHack: 'Ijtimoiy tarmoq buzib kirilgan',
      phoneFraud: 'Telefon orqali firibgarlik',
      fakeBankStaff: "Soxta bank xodimi qo'ng'irog'i",
      phishingInfo: "Fishing havola orqali ma'lumot olish",
      fakeInvestPlatform: 'Soxta investitsiya platformasi',
      smsCode: "SMS kod so'rab olish"
    },
    auto: {
      title: 'Avto-taqsimlash taklifi',
      lead: "Tizim {n} ta ishni joriy yuklama bo'yicha taqsimladi. Tasdiqlashdan oldin ijrochilarni ko'rib chiqing.",
      note: 'Tasdiqlangach ishlar ijrochilarga biriktiriladi va muddat hisobi boshlanadi',
      confirm: 'Tasdiqlash va taqsimlash',
      askTitle: 'Taqsimlashni tasdiqlaysizmi?',
      askText: '{n} ta ish ijrochilarga biriktiriladi va muddat hisobi boshlanadi.',
      done: '{n} ta ish ijrochilarga taqsimlandi'
    },
    assign: {
      title: 'Ijrochini tayinlash',
      recommend: 'Tizim tavsiyasi',
      recNote: 'Eng kam yuklama — {n} ish',
      others: 'Boshqa xodimlar',
      confirm: 'Biriktirish',
      done: 'Ish {name} ga biriktirildi'
    }
  },

  notFound: {
    title: 'Sahifa topilmadi',
    text: "So'ralgan manzil mavjud emas yoki ko'chirilgan.",
    back: 'Bosh sahifaga qaytish'
  },

  login: {
    brand: 'TURON',
    org: 'IIV · Kiberjinoyatlarga qarshi kurashish departamenti',
    title: 'Tizimga kirish',
    subtitle: 'Xizmat hisobingiz bilan davom eting',
    lang: { uz: 'Uz', uzk: "O'z", ru: 'Ru' },
    features: {
      one: 'Murojaatdan tergovgacha — barchasi bitta tizimda',
      two: 'Hududiy va tematik statistika doimiy nazoratda',
      three: "Hududiy bo'linmalar barchasi yagona platformada"
    },
    tabs: { password: 'Login', eimzo: 'E-imzo', faceId: 'Face ID' },
    loginLabel: 'Login',
    loginPh: "umrbek{'@'}cyber102.com",
    password: 'Parol',
    passwordPh: 'Parolingiz',
    show: "Parolni ko'rsatish",
    hide: 'Parolni yashirish',
    remember: 'Parolni eslab qolish',
    forgot: 'Parolni unutdingizmi?',
    forgotToast: 'Parolni tiklash uchun tizim administratoriga murojaat qiling',
    signingIn: 'Kirilmoqda...',
    submit: 'Kirish',
    welcome: 'Xush kelibsiz, {name}',
    note: 'Faqat vakolatli xodimlar uchun. Barcha kirishlar qayd etiladi.',
    eimzo: {
      connected: 'E-imzo dasturi ulandi',
      expires: 'amal qiladi {date}',
      pin: 'Kalit PIN-kodi',
      pinPh: 'PIN-kodni kiriting'
    },
    face: {
      title: 'Face ID orqali kirish',
      text: 'Kamera orqali yuzingizni skanerlab, tizimga soniyalar ichida kiring.',
      start: 'Skanerlashni boshlash',
      scanning: 'Skanerlanmoqda...'
    },
    errors: {
      credentials: "Login va parolni to'g'ri kiriting",
      pin: "PIN-kod kamida 4 ta raqamdan iborat bo'lishi kerak"
    }
  },

  form: {
    title: 'Yangi murojaat',
    draftSaved: 'Qoralama saqlandi · {time}',
    submit: 'Bloklashga yuborish',
    check: 'Tekshirish',
    checked: "Ma'lumotlar tekshirildi",
    invalid: "Majburiy maydonlarni to'g'ri to'ldiring",
    optional: 'ixtiyoriy',
    sent: 'Ariza bloklashga yuborildi',
    askTitle: 'Arizani bloklashga yuborasizmi?',
    askText: "{n} ta rekvizit va {amount} so'm zarar bilan Markaziy bankka yuboriladi.",
    cancelTitle: 'Arizani bekor qilasizmi?',
    cancelText: "Kiritilgan barcha ma'lumotlar o'chiriladi va tiklab bo'lmaydi.",
    cancelled: 'Ariza bekor qilindi',
    draftLoaded: "Qoralama yuklandi — davom eting",
    addedToList: "Ariza ro'yxatga qo'shildi",
    app: {
      title: "Ariza ma'lumotlari",
      id: 'Ariza raqami',
      idPh: 'KJ-2026-000000',
      material: 'Material raqami',
      materialPh: 'M0438715/2026-0000',
      method: 'Sodir etish usuli',
      source: 'Sodir etish manbasi',
      select: 'Tanlang',
      fabula: 'Fabula — voqeaning batafsil mazmuni',
      fabulaPh: "Murojaatdagi barcha holat shu yerga kiritiladi. Voqea qanday sodir bo'lganini erkin matnda yozing...",
      voice: 'Ovozli yozib olish',
      voiceToast: 'Ovozli yozib olish keyingi bosqichda ulanadi',
      hints: {
        asked: "Nima so'rashdi?",
        transfer: "Pul qanday o'tkazildi?",
        noticed: 'Qachon sezdingiz?',
        contact: 'Qanday aloqa qilishdi?'
      }
    },
    applicant: {
      title: 'Arizachi',
      fio: 'F.I.Sh. (lotin harflarida)',
      fioPh: "ABDULLAYEV ULUG'BEK SAYDAMATOVICH",
      phone: 'Telefon raqami',
      region: 'Hudud',
      address: 'Yashash manzili',
      addressPh: "Tuman, mahalla, ko'cha, uy"
    },
    requisite: {
      title: "Karta, hisob raqam qo'shish",
      card: 'Karta raqam',
      account: 'Hisob raqam',
      cardNumber: 'Karta raqami',
      accountNumber: 'Hisob raqami',
      digits: '{n} raqam',
      bank: 'Bank',
      amount: 'Yechilgan summa miqdori',
      sum: "So'm",
      time: 'Tranzaksiya vaqti',
      timePh: 'KK.OO.YYYY SS:DD',
      add: "Qo'shish",
      addedToast: "Rekvizit qo'shildi",
      added: "Qo'shilgan rekvizitlar",
      empty: "Hali rekvizit qo'shilmagan",
      needOne: "Kamida bitta rekvizit qo'shing",
      total: 'Jami'
    }
  },

  reasons: {
    title: 'Bloklash sabablari',
    chip: '{n} ta sabab',
    listTitle: "Ma'lumotnoma",
    note: 'Muddat — bank javobi uchun belgilangan reglament',
    colCode: 'Kod',
    colName: 'Sabab',
    colTerm: 'Muddat',
    colCount: 'Arizalar',
    term: '{n} kun',
    emptyTitle: 'Hech narsa topilmadi',
    emptyText: "Qidiruv so'zini o'zgartirib ko'ring.",
    items: {
      vishing: {
        name: "Soxta qo'ng'iroq (vishing)",
        text: "«Bank xodimi» nomidan qo'ng'iroq qilib SMS-kod yoki karta ma'lumotlari so'ralgan."
      },
      phishing: {
        name: 'Fishing havolasi',
        text: "Soxta havola orqali karta ma'lumotlari kiritiladigan sahifaga o'tkazilgan."
      },
      fakeShop: {
        name: "Soxta internet-do'kon",
        text: "Mavjud bo'lmagan tovar uchun oldindan to'lov olingan soxta savdo sayti."
      },
      fakeInvest: {
        name: 'Soxta investitsiya',
        text: "Yuqori foyda va'da qilib investitsiya nomi bilan mablag' olingan."
      },
      simSwap: {
        name: 'SIM-swap',
        text: "SIM-karta qayta tiklanib, tasdiqlash SMS-kodlari firibgar qo'liga o'tgan."
      },
      apk: {
        name: 'Zararli ilova (APK)',
        text: "Telefonga zararli ilova o'rnatilib, bank ilovasi nazoratga olingan."
      },
      fakeSupport: {
        name: 'Soxta texnik yordam',
        text: "Texnik yordam nomidan masofaviy kirish dasturi o'rnattirilgan."
      },
      socialEng: {
        name: 'Ijtimoiy injeneriya',
        text: "Tanish yoki qarindosh nomidan yozib, ishonchga kirib pul so'ralgan."
      },
      cardTheft: {
        name: "Karta o'g'irlanishi",
        text: "Karta jismonan o'g'irlangan yoki yo'qolgan va egasisiz ishlatilgan."
      },
      mule: {
        name: 'Drop-karta (vositachi)',
        text: "Karta boshqa jinoyat mablag'ini o'tkazish uchun vositachi sifatida ishlatilgan."
      },
      courtOrder: {
        name: 'Sud/tergov qarori',
        text: 'Sud yoki tergov organi qarori asosida hisob bo\'yicha cheklov qo\'yilgan.'
      },
      other: {
        name: 'Boshqa',
        text: 'Yuqoridagilarga kirmagan holat — tafsiloti fabulada batafsil yoziladi.'
      }
    }
  },

  stub: {
    heading: "Bu ekran keyingi bosqichda yig'iladi",
    detail: {
      title: 'Ariza tafsiloti',
      text: 'Asl dizayndagi eng katta ekran: sarlavha satri, qadamlar treki va 5 ta tab — Murojaat, Bank amaliyotlari, Sanksiyalar, Tranzaksiyalar, Ish jarayoni (daraxt).',
      blocks: {
        steps: 'Qadamlar treki',
        complaint: 'Murojaat',
        bankOps: 'Bank amaliyotlari',
        sanctions: 'Sanksiyalar',
        transactions: 'Tranzaksiyalar',
        workflow: 'Ish jarayoni'
      }
    },
    new: {
      title: 'Yangi murojaat',
      text: "Ikki ustunli forma: chapda ariza ma'lumotlari va arizachi, o'ngda rekvizit qo'shish bloki.",
      blocks: {
        info: "Ariza ma'lumotlari",
        applicant: 'Arizachi',
        requisite: "Rekvizit qo'shish"
      }
    },
    dashboard: {
      title: 'Rahbar paneli',
      text: "Umumiy ko'rsatkichlar, xodimlar kesimi, status taqsimoti va oxirgi hodisalar lentasi.",
      blocks: {
        kpi: 'KPI bloklari',
        rating: 'Xodimlar reytingi',
        split: 'Status taqsimoti',
        feed: 'Hodisalar lentasi'
      }
    }
  }
}
