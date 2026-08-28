// O'zbekcha (lotin) — asosiy til. Boshqa fayllar shu tuzilmani takrorlaydi.
export default {
  app: {
    brand: 'TURON CYBER',
    logoAlt: 'Kiberjinoyatlarga qarshi kurashish departamenti',
    defaultTitle: 'TURON CYBER · CardBlock'
  },

  api: {
    errors: {
      network: "Serverga ulanib bo'lmadi. Tarmoqni tekshiring.",
      timeout: "Server javob bermadi — qaytadan urinib ko'ring",
      unauthorized: 'Sessiya tugagan — qaytadan kiring',
      forbidden: "Bu amalga ruxsat yo'q",
      notFound: 'Topilmadi',
      conflict: "Ma'lumot boshqa joyda o'zgargan — sahifani yangilang",
      validation: "Yuborilgan ma'lumotlar to'g'ri emas",
      tooMany: "So'rovlar juda ko'p — biroz kuting",
      server: 'Serverda xatolik',
      cancelled: "So'rov bekor qilindi",
      unknown: 'Kutilmagan xatolik'
    }
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
    adminPanel: 'Boshqaruv paneli',
    users: 'Foydalanuvchilar',
    logs: 'Tizim jurnali',
    banks: 'Banklar',
    settings: 'Tizim sozlamalari',
    groupManage: 'Boshqarish',
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
    exec: { name: 'Umrbek Boybayev', label: 'Rahbar', ini: 'RJ' },
    admin: { name: 'Alisher Rahimov', label: 'Respublika admini', ini: 'AR' },
    sadmin: { name: 'Ravshan Sattorov', label: 'Super admin', ini: 'RS' }
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

  dutyReport: {
    title: 'Navbatchilik hisoboti',
    phase: { on: 'Qoralama', review: 'Tekshiruvda', returned: 'Qaytarilgan', closed: 'Yopilgan' },
    hoursValue: '{n} soat',
    meta: { officer: 'Navbatchi', shift: 'Smena', hours: 'Davomiylik', receiver: 'Qabul qiluvchi' },
    results: 'Smena natijalari',
    items: '{n} ta',
    stats: {
      accepted: 'ariza qabul qilindi',
      blocked: 'rekvizit bloklandi',
      sent: 'bankka yuborildi',
      closed: 'ariza yopildi',
      autopayment: "avto to'lov to'xtatildi",
      answer: "o'rtacha javob vaqti"
    },
    done: 'Bajarilgan ishlar',
    doneItems: {
      blocked: "Karta bloklandi, mablag' ushlab qolindi",
      bankRequest: "Bankka so'rov yuborildi (Kapitalbank)",
      autopayment: "Avto to'lov to'xtatildi",
      manyBlocked: '12 rekvizit bloklandi'
    },
    tags: { closed: 'Yopildi', done: 'Bajarildi' },
    left: 'Topshirilayotgan (qolgan) ishlar',
    leftItems: {
      waitBank: 'Bank javobi kutilmoqda',
      noContact: "Fuqaro bilan bog'lanilmadi",
      notEnough: "Ma'lumot yetarli emas"
    },
    next: { tomorrow: 'Ertaga 12:00 gacha', recall: "Qayta qo'ng'iroq", request: "Tergovchidan so'rov" },
    note: 'Navbatchi izohi',
    notePh: "Smena davomidagi muhim holatlar, e'tibor talab qiladigan arizalar…",
    noteEmpty: 'Izoh qoldirilmagan',
    handTo: 'Kimga topshiriladi',
    handedTo: 'Navbatchilik kimga topshirilmoqda',
    passing: "Qolgan {n} ta ish o'tadi",
    reason: 'Qaytarish sababi',
    reasons: {
      incomplete_report: "Hisobot to'liq emas",
      unfinished_work: 'Qolgan ishlar yakunlanmagan',
      wrong_successor: "Noto'g'ri xodimga topshirilgan",
      other: 'Boshqa sabab'
    },
    pickSuccessor: 'Avval kimga topshirishni tanlang',
    reasonPh: "Qaytarish sababini qo'shimcha izohlang (ixtiyoriy)…",
    pickReason: 'Qaytarish sababini tanlang',
    return: 'Qaytarish',
    returnConfirm: 'Qaytarishni tasdiqlash',
    returned: 'Hisobot navbatchiga qaytarildi',
    actions: { send: 'Rahbarga yuborish', resend: 'Qayta yuborish', approve: 'Tasdiqlash va yopish' },
    banner: {
      returned: {
        title: 'Rahbar hisobotni qaytardi',
        text: "CB-2026-4833 bo'yicha qayta qo'ng'iroq natijasi ko'rsatilmagan, CB-2026-4830 esa tergovchiga so'rovsiz qoldirilgan. Izohni to'ldirib qayta yuboring."
      },
      check: {
        title: 'Tasdiqlashdan oldin tekshirilishi kerak',
        text: "Qolgan 3 ta ish keyingi navbatchiga o'tadi. Tasdiqlangandan so'ng smena yopiladi va hisobot o'zgartirilmaydi."
      }
    },
    foot: {
      editHint: "Yuborilgandan so'ng hisobotni faqat rahbar qaytarsa o'zgartirish mumkin.",
      waiting: 'Rahbar tasdiqlashini kutmoqda. Tasdiqlangach smena yopiladi.',
      archived: 'Smena yopilgan. Hisobot arxivda saqlanadi.',
      sentAt: 'Hisobot 09:41 da Suvonov Farrux tomonidan yuborilgan.',
      returnHint: "Sabab tanlangandan so'ng hisobot navbatchiga qaytariladi."
    }
  },

  blocked: {
    title: 'Bloklangan rekvizitlar',
    searchPh: "Rekvizit yoki bank bo'yicha qidiruv",
    cards: 'Karta',
    accounts: 'Hisob',
    sumShort: 'Jami',
    sum: 'Ushlab qolingan summa',
    colCard: 'Rekvizit',
    colKind: 'Turi',
    colCur: 'Valyuta',
    kinds: { card: 'Karta', account: 'Hisob' },
    allCount: "Barchasini ko'rish — {n} rekvizit",
    shown: "Ko'rsatilgan {n} rekvizit bo'yicha",
    noMatch: 'Qidiruvga mos rekvizit topilmadi',
    footCount: 'Jami {n} rekvizit',
    footSum: 'Umumiy muzlatilgan summa',
    exported: 'Bloklangan rekvizitlar eksport qilinmoqda · XLSX'
  },

  cardHistory: {
    open: 'Karta tarixi',
    title: "Karta bo'yicha oldingi arizalar bor",
    card: 'Karta',
    lead: "Karta bo'yicha avvalgi arizalar topildi. Summasi va tranzaksiya vaqtini solishtiring.",
    previous: 'Oldingi arizalar',
    checked: 'tekshirildi',
    ago: {
      now: 'hozirgina',
      min: '{n} daqiqa oldin',
      hour: '{n} soat oldin',
      day: '{n} kun oldin',
      month: '{n} oy oldin'
    },
    copy: 'Nusxalash',
    copied: '{text} nusxalandi',
    foot: 'Yuborishdan avval oldingi arizalar holatini tekshiring',
    ok: 'Tushunarli'
  },

  role: {
    title: 'Rolni tanlash',
    staff: { label: 'Navbatchi / ijrochi', note: 'Arizalar bilan ishlash' },
    exec: { label: 'Rahbar', note: 'Umumiy nazorat va taqsimlash' },
    admin: { label: 'Respublika admini', note: 'Hududlar statistikasi va foydalanuvchilar' },
    sadmin: { label: 'Super admin', note: 'Tizim sozlamalari, integratsiyalar, huquqlar' },
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

  admin: {
    title: "Respublika bo'yicha holat",
    exportReady: '{file} tayyorlandi',
    exportDone: '{file} yuklab olindi',
    kpi: {
      apps: { label: 'Jami arizalar', unit: 'ta' },
      blocked: { label: 'Bloklangan rekvizit', unit: 'karta va hisob' },
      loss: { label: "Ushlab qolingan mablag'", unit: "mlrd so'm" },
      staff: { label: 'Faol xodimlar', unit: '14 hududda' }
    },
    matrix: {
      title: "Hududlar bo'yicha statistika",
      colName: 'Struktura nomi',
      sync: 'Oxirgi yangilanish: {time}',
      refresh: 'Yangilash',
      export: 'Excel',
      exportTip: 'Tanlangan hududlarni eksport qilish',
      exported: '{n} ta hudud eksport qilinmoqda · XLSX',
      pickAll: 'Barchasini tanlash',
      pickRow: 'Hisobot uchun tanlash',
      syncing: 'Yangilanmoqda...',
      synced: "Ma'lumotlar yangilandi · {time}",
      districts: '{n} ta hudud',
      openList: 'arizalar bazasini ochish',
      opened: "{name} bo'yicha arizalar ochildi",
      total: 'Jami',
      groups: { from: 'Shundan', deadline: 'Muddati' },
      cols: {
        apps: 'Jami arizalar',
        d24: 'Oxirgi 24 soat',
        work: 'Ijroda',
        bank: 'Bankda javob kutilmoqda',
        blocked: 'Bloklangan rekvizit',
        today: 'Bugun tugaydi',
        over: 'Muddati buzilgan',
        ret: 'Qaytarilgan',
        closed: 'Yopilgan',
        loss: "Zarar, mln so'm"
      }
    },
    roles: {
      staff: 'Navbatchi / ijrochi',
      exec: 'Rahbar',
      admin: 'Respublika admini',
      sadmin: 'Super admin',
      analyst: 'Tahlilchi'
    },
    deps: {
      cardblock: 'CardBlock guruhi',
      night: 'Tungi smena',
      analysis: "Tahlil bo'limi",
      it: 'IT boshqarmasi'
    },
    users: {
      title: 'Foydalanuvchilar',
      count: '{n} ta hisob',
      kpi: {
        all: 'Jami foydalanuvchi',
        active: 'Faol hisoblar',
        blocked: 'Bloklangan',
        today: 'Bugun tizimga kirgan'
      },
      colName: 'Xodim',
      colRole: 'Rol',
      colDep: "Bo'lim",
      colSeen: 'Oxirgi kirish',
      colState: 'Holat',
      on: 'Faol',
      off: 'Bloklangan',
      reset: 'Parolni tiklash',
      resetTitle: 'Parolni tiklaysizmi?',
      resetText: "{name} uchun vaqtinchalik parol yaratiladi va SMS orqali yuboriladi.",
      resetDone: '{login} uchun vaqtinchalik parol yuborildi',
      block: 'Hisobni bloklash',
      unblock: 'Hisobni faollashtirish',
      blockedDone: '{login} bloklandi',
      activeDone: '{login} faollashtirildi'
    },
    logs: {
      title: 'Tizim jurnali',
      count: '{n} ta yozuv · bugun',
      colTime: 'Vaqt',
      colWho: 'Foydalanuvchi',
      colAct: 'Amal',
      colObj: 'Obyekt',
      colIp: 'IP',
      acts: {
        reportSent: 'Navbatchilik hisobotini yubordi',
        signIn: 'Tizimga kirdi',
        blocked: 'Rekvizit bloklandi',
        assigned: 'Ishlarni ijrochilarga taqsimladi',
        created: 'Yangi ariza yaratdi',
        userAdded: "Foydalanuvchi qo'shdi",
        returned: 'Ariza qaytarildi',
        sync: 'Bank bilan almashinuv'
      }
    },
    banks: {
      title: 'Bank rekvizitlari',
      count: '{n} ta bank · {bins} ta BIN',
      search: 'Bank, BIN yoki MFO',
      add: "Bank qo'shish",
      addTitle: "Bank qo'shish",
      editTitle: 'Bankni tahrirlash',
      edit: 'Tahrirlash',
      import: 'Excel orqali import',
      importTitle: 'Excel orqali import',
      importCount: '{n} ta yozuv',
      importDo: "Qo'shish",
      imported: "{n} ta bank qo'shildi",
      colName: 'Bank nomi',
      colMfo: 'MFO',
      colBins: 'BIN kodi',
      namePh: 'Bank nomini kiriting',
      addBin: "BIN qo'shish",
      binHint: "Bir bankka bir nechta BIN biriktirish mumkin.",
      save: 'Saqlash',
      invalid: "Bank nomi, MFO va kamida bitta BIN kerak",
      added: "{name} qo'shildi",
      updated: '{name} yangilandi',
      removeTitle: "Bankni o'chirasizmi?",
      removeText: "{name} ma'lumotnomadan olib tashlanadi.",
      removed: "{name} o'chirildi",
      noneTitle: "Banklar ma'lumotnomasi bo'sh",
      noneText: "Hozircha birorta bank qo'shilmagan. Yangi bank qo'shing yoki Excel fayl orqali ro'yxatni import qiling.",
      emptyTitle: 'Hech narsa topilmadi',
      emptyText: '«{q}» bo\'yicha bank, BIN yoki MFO topilmadi. Qidiruv so\'zini tekshirib qaytadan urinib ko\'ring.'
    },
    settings: {
      title: 'Tizim sozlamalari',
      text: 'Bu bo\'lim keyingi bosqichda yig\'iladi: integratsiyalar, huquqlar va reglament sozlamalari shu yerda bo\'ladi.',
      blocks: {
        integrations: 'Integratsiyalar',
        rights: 'Rollar va huquqlar',
        deadlines: 'Muddat reglamenti',
        notifications: 'Bildirishnomalar'
      }
    }
  },

  applications: {
    title: 'Bloklash arizalari',
    search: "Ariza raqami, F.I.Sh., karta, bank",
    filters: 'Filtrlar',
    export: 'Eksport · XLSX',
    exportToast: 'Eksport tayyorlanmoqda · XLSX',
    exportDone: 'Yuklab olindi: {file}',
    exportEmpty: "Eksport uchun ariza yo'q",
    exportTitle: '{n} ta ariza eksport qilinadi',
    exportPartial: "Ro'yxat uzun — birinchi {n} ta ariza eksport qilindi",
    exportFailed: "Eksport qilib bo'lmadi — qaytadan urinib ko'ring",
    filtersCleared: 'Filtrlar tozalandi',
    regionFilter: 'Hudud filtri',
    regionClear: 'Filtrni olib tashlash',
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
    phAmount: 'dan – gacha',
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
    duplicate: 'Takroriy',
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
    duplicate: {
      label: 'Takroriy',
      short: 'Takroriy',
      plain: "Bu ariza shu karta bo'yicha avval kelgan murojaat bilan bir xil.",
      next: "Asl arizani ochib, natijasini shu yerda ko'ring."
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
      sla: 'Muddat',
      basis: 'Asos',
      crime_type: 'Jinoyat turi',
      intake_type: 'Qabul turi'
    },
    all: 'Barchasi',
    selected: '{n} ta tanlandi',
    search: 'Qidirish',
    notFound: 'Topilmadi',
    amountUnit: 'mln',
    from: 'dan',
    to: 'gacha'
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
    sending: 'Yuborilmoqda...',
    askSendTitle: 'Arizani bankka yuborasizmi?',
    askResendTitle: 'Tuzatilgan arizani qayta yuborasizmi?',
    sentToBank: 'Ariza bankka yuborildi',
    notReadyTitle: "Ariza yuborishga tayyor emas",
    notReadyText: "Ba'zi majburiy ma'lumotlar to'ldirilmagan",
    askSendText: "{id} raqamli ariza Markaziy bankka yuboriladi va holati «Bankda» ga o'tadi.",
    comment: 'Izoh',
    commentPh: "Tarixda ko'rinadi — sabab yoki qo'shimcha ma'lumot",
    statusChanged: 'Ariza holati yangilandi',
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
      daysLeft: '{n} kun qoldi',
      // serverdagi timeline kalitlari (snake_case)
      received: 'Murojaat qabul qilindi',
      sent_to_bank: 'Bankka yuborildi',
      bank_answer: 'Bank javobi kutilmoqda'
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
      fixField: 'Maydonni tuzatish',
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
      history: "Status o'zgarishlari tarixi",
      historyEmpty: "Status hali o'zgarmagan",
      created: 'yaratildi',
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
      method: 'Firibgarlik usuli',
      basis: 'Asos',
      crimeType: 'Jinoyat turi',
      intake: 'Qabul turi'
    },
    applicant: {
      title: 'Murojaat qiluvchi',
      fio: 'F.I.Sh.',
      phone: 'Telefon raqami',
      phone2: "Qo'shimcha telefon",
      region: 'Hudud',
      address: 'Yashash manzili',
      pinfl: 'JSHSHIR'
    },
    fabula: {
      title: 'Fabulasi — murojaat mazmuni',
      voice: 'Ovozli fabula',
      empty: "Fabula matni kiritilmagan",
      voicePending: "Ovozli fabula hali serverga ulanmagan — alohida vazifada",
      text: "Jabrlanuvchining bank kartasidan 12.07.2026 kuni soat 21:30 atrofida roziligisiz uch marta pul yechib olingan. Avval «bank xodimi» nomidan qo'ng'iroq qilinib, SMS-kod so'ralgan. «Kurs 60» yopiq Telegram guruhi orqali «APK» virusli ilova tarqatilgani aniqlandi. Umumiy zarar — {amount} so'm. Karta darhol bloklangan, bank ko'chirmasi ilova qilindi."
    },
    doc: {
      title: 'Qaror hujjati',
      emptyTitle: "Qaror hujjati hali yo'q",
      emptyText: "Bank rekvizitni bloklagach, qaror hujjati shu bo'limda paydo bo'ladi.",
      sheet: 'QAROR HUJJATI · PDF',
      sheetText: "Bloklash to'g'risidagi qaror hujjatining sahifalari shu joyda ko'rsatiladi",
      download: 'Yuklab olish',
      downloaded: '{file} yuklab olindi',
      print: 'Chop etish',
      printing: 'Chop etishga yuborildi'
    },
    txPanel: {
      title: 'Tranzaksiya tafsilotlari',
      photo: '3×4 rasm',
      male: 'Erkak',
      female: 'Ayol',
      age: '{n} yosh',
      citizen: "O'zbekiston fuqarosi",
      address: "Ro'yxatdagi manzil",
      phone: 'Aloqa telefoni',
      uzs: "UZS (so'm)",
      wallet: 'Kripto hamyon',
      ownerOk: "PINFL bo'yicha tasdiqlangan",
      noteOk: "Operatsiya muvaffaqiyatli o'tgan, bank tomonidan tasdiqlangan.",
      extraNote: "Zanjirdagi keyingi o'tkazma keyingi bosqichda ko'rsatiladi.",
      hint: "Karta egasi ma'lumotlari bank va soliq bazasidan olinadi.",
      sections: {
        base: { title: 'Tranzaksiya asosi', hint: 'summa va vaqt' },
        requisite: { title: "Rekvizit ma'lumoti", hint: 'karta / hisob' },
        merchant: { title: "Savdo / avto-to'lov nuqtasi", hint: 'merchant rekvizitlari' },
        digital: { title: 'Raqamli izlar', hint: 'qurilma va tarmoq' },
        system: { title: "Tizim ma'lumotlari", hint: 'texnik kalitlar' }
      },
      fields: {
        pinfl: 'PINFL',
        passport: 'Pasport / ID',
        birth: "Tug'ilgan sana",
        birthPlace: "Tug'ilgan joy",
        issued: 'Hujjat berilgan',
        expires: 'Amal qilish muddati',
        amount: 'Summa',
        currency: 'Valyuta',
        date: 'Sana',
        type: 'Tranzaksiya turi',
        cardType: 'Karta turi',
        card: 'Karta / hamyon',
        bank: 'Bank',
        kind: 'Rekvizit turi',
        owner: "Egasi bo'yicha holat",
        category: 'Kategoriya',
        merchantId: 'Merchant ID',
        terminal: 'Terminal ID',
        note: 'Izoh / status',
        ip: 'IP manzil',
        device: 'Qurilma (device)',
        os: 'Operatsion tizim',
        mobile: 'Mobil ilova',
        reqId: 'Request ID',
        key: 'Key',
        keyCard: 'Key card',
        extra: "Qo'shimcha izohlar"
      }
    },
    tx: {
      title: 'Tranzaksiyalar zanjiri',
      emptyTitle: 'Tranzaksiyalar hali yuklanmagan',
      emptyText: "Bank so'rovga javob berganidan keyin pul harakati zanjiri shu bo'limda ko'rsatiladi.",
      count: 'Umumiy tranzaksiyalar',
      sum: 'Jami aylanma summa',
      cards: 'Jalb qilingan kartalar',
      file: "Bank ko'chirmasi — {file}",
      fileMeta: 'Bank tomonidan yuborilgan · {time}',
      view: "Ko'rish",
      viewed: '{file} ochildi',
      download: 'Yuklab olish',
      downloaded: '{file} yuklab olindi',
      search: "Karta, F.I.Sh. yoki bank bo'yicha qidiruv",
      sortAmount: 'Summa',
      allCategories: 'Barcha kategoriyalar',
      more: "Yana {n} tranzaksiya · ko'rsatish",
      victim: 'Jabrlanuvchi kartasi',
      taken: 'Yechib olingan:',
      level: '{n}-daraja',
      open: "Ko'rish",
      opened: '{card} bo\'yicha tranzaksiyalar keyingi bosqichda ochiladi',
      noMatch: 'Qidiruvga mos tranzaksiya topilmadi'
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
    eri: {
      lead: "Kalit faylini tanlang va parolini kiriting. JSHSHIR kiritish shart emas — u kalit ichidagi sertifikatdan olinadi.",
      connecting: 'E-imzo dasturiga ulanmoqda...',
      connected: '{n} ta amaldagi kalit topildi',
      selectKey: 'ERI kalitini tanlang',
      selectPh: '-- ERI tanlang --',
      signerOff: 'E-imzo (ISigner) dasturi ishlamayapti.',
      retry: 'Qayta urinish',
      pick: 'Kalit faylini tanlang',
      pickNote: '.pfx yoki .p12 — bosing yoki bu yerga tashlang',
      openFolder: 'Kalitlar papkasi',
      openFile: 'Fayl tanlash',
      found: '{n} ta kalit topildi',
      change: 'Boshqa papka',
      ids: { pinfl: 'JSHSHIR', tin: 'STIR', id: 'ID' },
      ready: 'Kalit fayli tayyor',
      grant: "Kalit papkasiga ruxsat berish",
      password: 'Kalit paroli',
      passwordPh: 'Kalit parolini kiriting',
      checking: 'Kalit tekshirilmoqda...',
      unknownOwner: 'Kalit egasi',
      errors: {
        keyNotFound: "Kalit topilmadi — E-imzo ro'yxatini yangilang",
        wrongPassword: "Kalit paroli noto'g'ri",
        unknownFormat: "Kalit formati tanilmadi",
        signFailed: "Imzo yaratib bo'lmadi",
        badCertificate: "Sertifikat yaroqsiz",
        cancelled: 'Amal bekor qilindi',
        badPrivateKey: "Yopiq kalit yaroqsiz",
        failed: "E-imzo dasturida xatolik",
        notRunning: "E-imzo (ISigner) dasturi ishlamayapti",
        disconnected: "E-imzo dasturi bilan aloqa uzildi",
        mismatch: "Tanlangan kalit bilan fayl mos kelmadi — papkani qayta tanlang",
        noKeys: "Bu papkada .pfx yoki .p12 kalit topilmadi",
        noKey: 'Avval ERI kalitini tanlang',
        allExpired: "Amal muddati tugamagan kalit yo'q",
        noFile: 'Avval kalit faylini tanlang',
        noPassword: 'Kalit parolini kiriting',
        badType: "Faqat .pfx yoki .p12 fayl qabul qilinadi",
        tooBig: "Fayl juda katta — kalit fayli 512 KB dan oshmasligi kerak",
        read: "Faylni o'qib bo'lmadi",
        rejected: "Kalit yoki parol noto'g'ri",
        expired: 'Sertifikat muddati tugagan',
        validation: "So'rov ma'lumotlari to'liq emas",
        network: "Kirish xizmatiga ulanib bo'lmadi. Tarmoqni tekshiring.",
        timeout: "Xizmat javob bermadi — qaytadan urinib ko'ring",
        faceOff: "Yuz tanish xizmati ulanmagan — administratorga murojaat qiling",
        server: 'Kirish xizmatida xatolik'
      }
    },
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
    // kamera orqali yuz tekshiruvi — components/login/FaceCheck.vue
    faceCheck: {
      camera: 'Kamera yoqilmoqda...',
      connecting: 'Yuz tanish xizmatiga ulanmoqda...',
      scanning: 'Kameraga qarang',
      retry: 'Qayta urinish',
      score: "O'xshashlik: {n}",
      // server ko'rsatmalari inglizcha keladi — kalit so'z bo'yicha tarjima
      prompts: {
        look: 'Kameraga qarang',
        right: "Boshingizni sekin o'ngga buring",
        left: 'Boshingizni sekin chapga buring',
        up: "Boshingizni yuqoriga ko'taring",
        down: 'Boshingizni pastga tushiring',
        blink: "Ko'zingizni pirpirating",
        mouth: "Og'zingizni oching",
        smile: 'Tabassum qiling',
        nod: "Bosh irg'ating",
        closer: 'Kameraga yaqinroq keling',
        farther: 'Kameradan biroz uzoqlashing',
        still: 'Qimirlamay turing',
        glasses: 'Ko\'zoynagingizni yeching',
        light: 'Yorug\'roq joyga o\'ting'
      },
      states: {
        liveness: "Ko'rsatmani bajaring",
        no_face: "Yuz ko'rinmayapti — kameraga qarang",
        spoof: 'Jonli yuz kerak — rasm yoki ekran qabul qilinmaydi',
        no_match: 'Yuz mos kelmadi — biroz kuting',
        match: 'Yuz tasdiqlandi'
      },
      errors: {
        noUrl: 'Yuz tanish manzili kelmadi',
        noTicket: 'Yuz tanish chiptasi kelmadi',
        noCamera: 'Kamera topilmadi',
        denied: "Kameraga ruxsat berilmadi — brauzer sozlamalaridan yoqing",
        camera: "Kamerani ochib bo'lmadi",
        network: "Yuz tanish xizmatiga ulanib bo'lmadi",
        closed: 'Yuz tanish xizmati aloqani uzdi',
        timeout: "Vaqt tugadi — qaytadan urinib ko'ring",
        cancelled: 'Yuz tekshiruvi bekor qilindi',
        noProof: 'Server tasdiq (proof) bermadi',
        server: 'Yuz tanish xizmatida xatolik'
      }
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
    sending: 'Yuborilmoqda...',
    check: 'Tekshirish',
    checked: "Ma'lumotlar tekshirildi",
    invalid: "Majburiy maydonlarni to'g'ri to'ldiring",
    needField: "«{field}» to'ldirilmagan",
    optional: 'ixtiyoriy',
    sent: 'Ariza bloklashga yuborildi',
    askTitle: 'Arizani bloklashga yuborasizmi?',
    askText: "{n} ta rekvizit va {amount} so'm zarar bilan Markaziy bankka yuboriladi.",
    cancelTitle: 'Arizani bekor qilasizmi?',
    cancelText: "Kiritilgan barcha ma'lumotlar o'chiriladi va tiklab bo'lmaydi.",
    cancelled: 'Ariza bekor qilindi',
    draftLoaded: "Qoralama yuklandi — davom eting",
    draftStore: 'Qoralama saqlash',
    leaveTitle: 'Formadan chiqmoqchimisiz?',
    leaveText: "Kiritilgan ma'lumotlarni qoralamada saqlab qo'yish mumkin — keyin shu joydan davom ettirasiz.",
    leaveDrop: "Saqlamasdan chiqish",
    draftSaving: 'Saqlanmoqda...',
    draftStored: 'Qoralama saqlandi',
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
      fabulaMin: 'kamida {n} belgi',
      fabulaShort: "Fabula juda qisqa: {has} ta belgi, kamida {n} ta kerak",
      fabulaPh: "Murojaatdagi barcha holat shu yerga kiritiladi. Voqea qanday sodir bo'lganini erkin matnda yozing...",
      voice: 'Ovozli yozib olish',
      voiceToast: 'Ovozli yozib olish keyingi bosqichda ulanadi',
      recorded: 'Ovozli fabula',
      reRecord: 'Qayta yozish',
      recSaved: 'Ovozli fabula saqlandi · {time}',
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
      phone2: "Qo'shimcha telefon",
      phoneShort: "Telefon raqamini to'liq kiriting",
      region: 'Hudud',
      address: 'Yashash manzili',
      addressPh: "Tuman, mahalla, ko'cha, uy"
    },
    dup: {
      title: "Karta bo'yicha takroriylik topildi",
      text: "Shu karta bo'yicha ilgari {n} ta ariza qabul qilingan. Summani va tranzaksiya vaqtini solishtirib ko'ring."
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
      needNumber: "Raqam to'liq emas: {has} ta kiritildi, {n} ta kerak",
      needAmount: 'Yechilgan summani kiriting',
      needTime: "Tranzaksiya vaqtini to'liq kiriting — {format}",
      check: 'Tekshirish',
      checked: 'Rekvizit tekshirildi · {bank}',
      attach: 'Briktirish',
      add: "Qo'shish",
      txCount: '{n} tranzaksiya',
      txAdded: "Tranzaksiya qo'shildi",
      txUpdated: 'Tranzaksiya yangilandi',
      txRemoved: "Tranzaksiya o'chirildi",
      removed: "Rekvizit o'chirildi",
      addTx: "Tranzaksiya qo'shish",
      summary: '{n} ta rekvizit · {tx} tranzaksiya',
      save: 'Saqlash',
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
