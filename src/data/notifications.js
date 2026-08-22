// Bildirishnomalar — matn i18n'dan: t(`notify.items.<key>.title` / `.text`, params)
export const NOTIFICATIONS = [
  {
    id: 'n1',
    key: 'bankRejected',
    tone: 'bad',
    icon: 'warn',
    params: { id: 'M0126284/2026-10008' },
    appId: 'M0126284/2026-10008',
    ago: { unit: 'min', n: 8 },
    read: false
  },
  {
    id: 'n2',
    key: 'blocked',
    tone: 'ok',
    icon: 'lock',
    params: { id: 'M0126279/2026-10004', amount: '2 150 000' },
    appId: 'M0126279/2026-10004',
    ago: { unit: 'min', n: 42 },
    read: false
  },
  {
    id: 'n3',
    key: 'newApplication',
    tone: 'info',
    icon: 'inbox',
    params: { id: 'M0126291/2026-10012' },
    appId: 'M0126291/2026-10012',
    ago: { unit: 'hour', n: 2 },
    read: false
  },
  {
    id: 'n4',
    key: 'slaSoon',
    tone: 'warn',
    icon: 'alarm',
    params: { id: 'M0126270/2026-09996' },
    appId: 'M0126270/2026-09996',
    ago: { unit: 'hour', n: 5 },
    read: false
  },
  {
    id: 'n5',
    key: 'reportReturned',
    tone: 'info',
    icon: 'doc',
    params: {},
    appId: null,
    ago: { unit: 'day', n: 1 },
    read: true
  }
]

export const TONE = {
  ok: { fg: 'var(--c1a6e4b)', bg: 'var(--ce3f2e9)' },
  bad: { fg: 'var(--ca52220)', bg: 'var(--cfceceb)' },
  warn: { fg: 'var(--c96620a)', bg: 'var(--cfdf3e3)' },
  info: { fg: 'var(--c23568f)', bg: 'var(--ce8eef7)' }
}
