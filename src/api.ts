import type {
  Activity,
  ActivityType,
  Place,
  RouteStep,
  Ticket,
  Traveler,
} from './types'

export const API_URL =
  'https://script.google.com/macros/s/AKfycbyrA0WvAYZhuCDp8rrdndt3mGRCxL-tg8nUWI-lsQj8zYCt1mzRkWDdUQ3AOC78qhfs8w/exec'

export type RemoteStatus = {
  travelerId: string
  activityId: string
  completed: boolean
  updatedAt?: string
}

export type TourData = {
  travelers: Traveler[]
  activities: Activity[]
  places: Place[]
  routeSteps: RouteStep[]
  tickets: Ticket[]
  statuses: RemoteStatus[]
  tripName: string
  updatedAt?: string
}

const CACHE_KEY = 'a-ying-tour-data-v1'

function text(value: unknown) {
  return String(value ?? '').trim()
}

function optional(value: unknown) {
  const valueText = text(value)
  return valueText || undefined
}

function numberOrUndefined(value: unknown) {
  const valueText = text(value)
  if (!valueText) return undefined

  const parsed = Number(valueText)
  return Number.isFinite(parsed) ? parsed : undefined
}

function normalizeTime(value: unknown) {
  const valueText = text(value)
  if (!valueText) return undefined

  const parts = valueText.split(':')
  if (parts.length < 2) return valueText

  return `${parts[0].padStart(2, '0')}:${parts[1].padStart(2, '0')}`
}

function convertData(raw: any): TourData {
  const travelers: Traveler[] = (raw.travelers ?? [])
    .filter((row: any) => text(row.traveler_id))
    .filter((row: any) => text(row['啟用']).toUpperCase() !== 'FALSE')
    .map((row: any) => ({
      id: text(row.traveler_id) as Traveler['id'],
      name: text(row['顯示名稱']) as Traveler['name'],
    }))

  const activities: Activity[] = (raw.activities ?? [])
    .filter((row: any) => text(row.activity_id))
    .filter((row: any) => text(row['啟用']).toUpperCase() !== 'FALSE')
    .map((row: any) => ({
      id: text(row.activity_id),
      date: text(row['日期']),
      time: normalizeTime(row['開始時間']),
      duration: numberOrUndefined(row['停留分鐘']),
      type: text(row['類型']) as ActivityType,
      title: text(row['標題']),
      placeId: optional(row.place_id),
      routeId: optional(row.route_id),
      cost: optional(row['費用']),
      note: optional(row['補充']),
    }))
    .sort((a: Activity, b: Activity) => {
      if (a.date !== b.date) return a.date.localeCompare(b.date)
      return (a.time ?? '99:99').localeCompare(b.time ?? '99:99')
    })

  const places: Place[] = (raw.places ?? [])
    .filter((row: any) => text(row.place_id))
    .map((row: any) => ({
      id: text(row.place_id),
      name: text(row['名稱'] || row['景點名稱']),
      type: text(row['類型']),
      intro: optional(row['簡介']),
      address: optional(row['地址']),
      naverMap: optional(row['Naver Map'] || row['NAVER地圖']),
      googleMaps: optional(row['Google Maps'] || row['Google地圖']),
      website: optional(row['官網'] || row['網站']),
      note: optional(row['說明']),
    }))

  const routeSteps: RouteStep[] = (raw.routes ?? [])
    .filter((row: any) => text(row.route_id))
    .map((row: any) => ({
      routeId: text(row.route_id),
      step: numberOrUndefined(row.step_id || row['步驟']) ?? 1,
      mode: text(row['交通方式'] || row['方式']),
      line: optional(row['路線'] || row['線路']),
      from: optional(row['起點']),
      to: optional(row['終點']),
      direction: optional(row['方向']),
      note: optional(row['說明'] || row['備註']),
    }))

  const tickets: Ticket[] = (raw.tickets ?? [])
    .filter((row: any) => text(row.ticket_id))
    .map((row: any) => ({
      id: text(row.ticket_id),
      travelerId: text(row.traveler_id),
      activityId: text(row.activity_id),
      name: text(row['票券名稱'] || row['名稱']),
      type: text(row['票券類型'] || row['類型']),
      fileUrl: optional(row['檔案網址'] || row['票券網址']),
      originalUrl: optional(row['原始網址']),
      note: optional(row['備註']),
    }))

  const statuses: RemoteStatus[] = (raw.status ?? [])
    .filter((row: any) => text(row.traveler_id))
    .filter((row: any) => text(row.activity_id))
    .map((row: any) => ({
      travelerId: text(row.traveler_id),
      activityId: text(row.activity_id),
      completed:
        text(row['已完成']).toUpperCase() === 'TRUE',
      updatedAt: optional(row['更新時間']),
    }))

  return {
    travelers,
    activities,
    places,
    routeSteps,
    tickets,
    statuses,
    tripName: text(raw.trip?.[0]?.['旅程名稱']) || 'A Ying Tour',
    updatedAt: raw.updatedAt,
  }
}

export function loadCachedTourData(): TourData | null {
  try {
    const saved = localStorage.getItem(CACHE_KEY)
    return saved ? JSON.parse(saved) : null
  } catch {
    return null
  }
}

export async function fetchTourData(): Promise<TourData> {
  const response = await fetch(API_URL, {
    method: 'GET',
    cache: 'no-store',
  })

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`)
  }

  const raw = await response.json()
  const data = convertData(raw)

  localStorage.setItem(CACHE_KEY, JSON.stringify(data))
  return data
}

export type StatusItem = {
  travelerId: string
  activityId: string
  completed: boolean
  note?: string
}

export async function saveStatus(item: StatusItem) {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'text/plain;charset=utf-8',
    },
    body: JSON.stringify({
      action: 'saveStatus',
      travelerId: item.travelerId,
      activityId: item.activityId,
      completed: item.completed,
      note: item.note ?? '',
      device: 'mobile-web',
    }),
  })

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`)
  }

  const result = await response.json()

  if (result.ok === false) {
    throw new Error(result.error || '儲存失敗')
  }

  return result
}

export type EditableActivityFields = {
  date: string
  time: string
  duration: number | ''
  type: ActivityType
  title: string
  cost: string
  note: string
}

export async function updateActivity(
  activityId: string,
  fields: EditableActivityFields,
) {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'text/plain;charset=utf-8',
    },
    body: JSON.stringify({
      action: 'updateActivity',
      activityId,
      ...fields,
    }),
  })

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`)
  }

  const result = await response.json()

  if (result.ok === false) {
    throw new Error(result.error || '更新行程失敗')
  }

  return result
}

export function saveCachedTourData(data: TourData) {
  localStorage.setItem(CACHE_KEY, JSON.stringify(data))
}

export async function createActivity(
  fields: EditableActivityFields,
) {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'text/plain;charset=utf-8',
    },
    body: JSON.stringify({
      action: 'createActivity',
      ...fields,
    }),
  })

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`)
  }

  const result = await response.json()

  if (result.ok === false) {
    throw new Error(result.error || '新增行程失敗')
  }

  return result
}

export async function deleteActivity(
  activityId: string,
) {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'text/plain;charset=utf-8',
    },
    body: JSON.stringify({
      action: 'deleteActivity',
      activityId,
    }),
  })

  const raw = await response.text()

  if (!response.ok) {
    throw new Error(
      `HTTP ${response.status}: ${raw.slice(0, 300)}`,
    )
  }

  let result: any

  try {
    result = JSON.parse(raw)
  } catch {
    throw new Error(
      `後端沒有回傳 JSON：${raw.slice(0, 300)}`,
    )
  }

  if (result.ok === false) {
    throw new Error(
      result.error || '刪除行程失敗',
    )
  }

  return result
}
