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

  modules: { complaint: 'Murojaat', cardblock: 'CardBlock', short: 'CB' },

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
    phDate: 'Tanlang',
    noMaterial: "material raqami yo'q"
  },

  pager: {
    perPage: '{n} ta/sahifa',
    jump: "Sahifaga o'tish",
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
    done: 'Yakunlangan'
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
    steps: {
      accepted: 'Murojaat qabul qilindi',
      sentToBank: 'Bankka yuborildi',
      notSent: 'Bankka yuborilmagan',
      queued: 'navbatda'
    },
    tabs: {
      complaint: 'Murojaat',
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
      transactions: 'Tranzaksiyalar bo‘limi keyingi bosqichda yig‘iladi.',
      workflow: 'Ish jarayoni (daraxt) keyingi bosqichda yig‘iladi.'
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
