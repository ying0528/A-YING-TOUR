export type Traveler = {
  id: 'U001' | 'U002'
  name: '大寶' | '小寶'
}

export type ActivityType = '景點' | '移動' | '餐廳' | '飛機' | '住宿' | '其他'

export type Activity = {
  id: string
  date: string
  time?: string
  duration?: number
  type: ActivityType
  title: string
  placeId?: string
  routeId?: string
  cost?: string
  note?: string
}

export type Place = {
  id: string
  name: string
  type: string
  intro?: string
  address?: string
  naverMap?: string
  googleMaps?: string
  website?: string
  note?: string
}

export type RouteStep = {
  routeId: string
  step: number
  mode: string
  line?: string
  from?: string
  to?: string
  direction?: string
  note?: string
}

export type Ticket = {
  id: string
  travelerId: string
  activityId: string
  name: string
  type: string
  fileUrl?: string
  originalUrl?: string
  note?: string
}
