import { saveStatus, type StatusItem } from './api'

const STATUS_KEY = 'a-ying-tour-status-v1'
const QUEUE_KEY = 'a-ying-tour-status-queue-v1'

type StatusMap = Record<string, boolean>

function key(travelerId: string, activityId: string) {
  return `${travelerId}:${activityId}`
}

function readMap(): StatusMap {
  try {
    return JSON.parse(localStorage.getItem(STATUS_KEY) || '{}')
  } catch {
    return {}
  }
}

function writeMap(map: StatusMap) {
  localStorage.setItem(STATUS_KEY, JSON.stringify(map))
}

function readQueue(): StatusItem[] {
  try {
    return JSON.parse(localStorage.getItem(QUEUE_KEY) || '[]')
  } catch {
    return []
  }
}

function writeQueue(queue: StatusItem[]) {
  localStorage.setItem(QUEUE_KEY, JSON.stringify(queue))
}

export function isCompleted(
  travelerId: string,
  activityId: string,
) {
  return Boolean(readMap()[key(travelerId, activityId)])
}

export function setLocalCompleted(
  travelerId: string,
  activityId: string,
  completed: boolean,
) {
  const map = readMap()
  map[key(travelerId, activityId)] = completed
  writeMap(map)
}

function queueStatus(item: StatusItem) {
  const queue = readQueue()

  const filtered = queue.filter(
    (queued) =>
      !(
        queued.travelerId === item.travelerId &&
        queued.activityId === item.activityId
      ),
  )

  filtered.push(item)
  writeQueue(filtered)
}

export async function saveCompleted(
  travelerId: string,
  activityId: string,
  completed: boolean,
) {
  const item: StatusItem = {
    travelerId,
    activityId,
    completed,
  }

  setLocalCompleted(travelerId, activityId, completed)

  try {
    await saveStatus(item)
  } catch {
    queueStatus(item)
    throw new Error('offline')
  }
}

export async function syncPendingStatuses() {
  const queue = readQueue()

  if (!queue.length) return

  const remaining: StatusItem[] = []

  for (const item of queue) {
    try {
      await saveStatus(item)
    } catch {
      remaining.push(item)
    }
  }

  writeQueue(remaining)
}
