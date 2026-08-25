/*
  Ikonkalar — Google Material Symbols Rounded (fonts.google.com/icons).
  Loyihadagi nomlar shrift glifiga shu yerda bog'lanadi: komponentlarda
  o'zimizning qisqa nomlar qoladi, dizayndagi glif esa shu jadvaldan olinadi.
  Yangi ikonka kerak bo'lsa — bu yerga bitta qator qo'shiladi.
*/
export const ICONS = {
  /* ---------- yon menyu ---------- */
  chart: 'bar_chart',
  list: 'credit_card',
  docPlus: 'add',
  docLines: 'description',
  inbox: 'credit_card',
  back: 'arrow_back',
  bank: 'credit_card',
  lock: 'lock',
  refresh: 'history',
  book: 'menu_book',
  badge: 'badge',
  settings: 'settings',
  accountBank: 'account_balance',

  /* ---------- topbar ---------- */
  bell: 'notifications',
  logout: 'logout',
  login: 'login',
  menu: 'menu',
  chevronDown: 'keyboard_arrow_down',
  chevronUp: 'keyboard_arrow_up',
  chevronLeft: 'chevron_left',
  chevronRight: 'chevron_right',
  collapseLeft: 'chevron_left',
  collapseRight: 'chevron_right',
  arrowRight: 'arrow_forward',

  /* ---------- ro'yxat va jadval ---------- */
  filter: 'tune',
  filterList: 'filter_list',
  download: 'download',
  calendar: 'calendar_month',
  search: 'search',
  searchOff: 'search_off',
  clock: 'schedule',
  alarm: 'warning',
  swapVert: 'swap_vert',

  /* ---------- tafsilot ---------- */
  doc: 'description',
  docText: 'description',
  chat: 'description',
  send: 'send',
  shield: 'verified_user',
  swap: 'swap_horiz',
  card: 'credit_card',
  cardFilled: 'credit_card',
  bookmark: 'bookmark',
  phone: 'call',
  pin: 'location_on',
  user: 'person',
  users: 'group',
  play: 'play_arrow',
  pause: 'pause',
  volume: 'volume_up',
  copy: 'content_copy',
  print: 'print',
  reply: 'reply',
  history: 'history',
  checkCircle: 'check_circle',
  infoCircle: 'info',
  warnTriangle: 'warning',

  /* ---------- amallar ---------- */
  plus: 'add',
  trash: 'delete',
  edit: 'edit',
  check: 'check',
  scan: 'crop_free',
  close: 'close',
  warn: 'warning',
  error: 'error',
  eye: 'visibility',
  eyeOff: 'visibility_off',
  mic: 'mic',
  bolt: 'bolt',
  upload: 'upload_file',
  lockReset: 'lock_reset',
  crop: 'crop_free',
  excel: 'download',

  /* ---------- mavzu ---------- */
  sun: 'light_mode',
  moon: 'dark_mode',

  /* ---------- login ---------- */
  key: 'key',
  face: 'face',
  gear: 'settings',
  radar: 'radar',
  broadcast: 'cell_tower',

  /* ---------- rahbar/admin paneli ---------- */
  pie: 'pie_chart'
}

/** Loyiha nomi -> Material Symbols glifi (nom topilmasa nomning o'zi) */
export function glyphOf(name) {
  return ICONS[name] || name
}
