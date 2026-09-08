import { useEffect, useMemo, useState } from 'react'
import ActivityCard from './components/ActivityCard'
import DetailSheet from './components/DetailSheet'
import TravelerPicker from './components/TravelerPicker'
import {
  fetchTourData,
  loadCachedTourData,
  type TourData,
} from './api'
import {
  isCompleted,
  saveCompleted,
  syncPendingStatuses,
} from './status'
import type { Activity, Traveler } from './types'

const travelerStorageKey = 'a-ying-tour-traveler'

const fallbackDates = [
  { date: '2026-09-09', label: '9/9', weekday: '三' },
  { date: '2026-09-10', label: '9/10', weekday: '四' },
  { date: '2026-09-11', label: '9/11', weekday: '五' },
  { date: '2026-09-12', label: '9/12', weekday: '六' },
]

function weekday(date: string) {
  const day = new Date(`${date}T12:00:00`).getDay()
  return ['日', '一', '二', '三', '四', '五', '六'][day]
}

function makeDates(activities: Activity[]) {
  const unique = [...new Set(activities.map((item) => item.date))].sort()

  if (!unique.length) return fallbackDates

  return unique.map((date) => {
    const [, month, day] = date.split('-')

    return {
      date,
      label: `${Number(month)}/${Number(day)}`,
      weekday: weekday(date),
    }
  })
}

export default function App() {
  const cached = loadCachedTourData()

  const [data, setData] = useState<TourData | null>(cached)
  const [loading, setLoading] = useState(!cached)
  const [error, setError] = useState('')
  const [traveler, setTraveler] = useState<Traveler | null>(null)

  const [selectedDate, setSelectedDate] = useState(
    cached?.activities?.[0]?.date ?? fallbackDates[0].date,
  )

  const [selectedActivity, setSelectedActivity] =
    useState<Activity | null>(null)

  const [statusVersion, setStatusVersion] = useState(0)
  const [syncing, setSyncing] = useState(false)

  useEffect(() => {
    let active = true

    fetchTourData()
      .then((fresh) => {
        if (!active) return

        setData(fresh)

        if (!fresh.activities.some((item) => item.date === selectedDate)) {
          setSelectedDate(
            fresh.activities[0]?.date ?? fallbackDates[0].date,
          )
        }

        setError('')
      })
      .catch((err) => {
        console.error(err)

        if (!cached && active) {
          setError('目前無法取得行程資料，請稍後再試。')
        }
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    if (!data?.travelers?.length) return

    const savedId = localStorage.getItem(travelerStorageKey)

    const savedTraveler =
      data.travelers.find((item) => item.id === savedId) ?? null

    setTraveler(savedTraveler)
  }, [data])

  useEffect(() => {
    const sync = async () => {
      try {
        await syncPendingStatuses()
      } catch {
        // 保留佇列，下次有網路再同步
      }
    }

    sync()

    window.addEventListener('online', sync)

    return () => {
      window.removeEventListener('online', sync)
    }
  }, [])

  const dates = useMemo(
    () => makeDates(data?.activities ?? []),
    [data?.activities],
  )

  const dayActivities = useMemo(
    () =>
      (data?.activities ?? []).filter(
        (activity) => activity.date === selectedDate,
      ),
    [data?.activities, selectedDate],
  )

  if (loading && !data) {
    return (
      <div className="app-shell">
        <main className="content">
          <p>正在讀取行程...</p>
        </main>
      </div>
    )
  }

  if (error && !data) {
    return (
      <div className="app-shell">
        <main className="content">
          <h2>暫時無法載入</h2>
          <p>{error}</p>
          <button onClick={() => location.reload()}>
            重新整理
          </button>
        </main>
      </div>
    )
  }

  if (!data) return null

  if (!traveler) {
    return (
      <TravelerPicker
        travelers={data.travelers}
        onSelect={(value) => {
          localStorage.setItem(travelerStorageKey, value.id)
          setTraveler(value)
        }}
      />
    )
  }

  const selectedPlace = selectedActivity?.placeId
    ? data.places.find(
        (place) => place.id === selectedActivity.placeId,
      )
    : undefined

  const selectedRouteSteps = selectedActivity?.routeId
    ? data.routeSteps.filter(
        (step) => step.routeId === selectedActivity.routeId,
      )
    : []

  const selectedTickets = selectedActivity
    ? data.tickets.filter(
        (ticket) =>
          ticket.activityId === selectedActivity.id &&
          ticket.travelerId === traveler.id,
      )
    : []

  const selectedCompleted = selectedActivity
    ? isCompleted(traveler.id, selectedActivity.id)
    : false

  async function handleToggleCompleted() {
    if (!selectedActivity || !traveler) return

    const nextCompleted = !isCompleted(
      traveler.id,
      selectedActivity.id,
    )

    const promise = saveCompleted(
      traveler.id,
      selectedActivity.id,
      nextCompleted,
    )

    setStatusVersion((value) => value + 1)
    setSyncing(true)

    try {
      await promise
    } catch {
      // 已保存在手機，等待恢復網路後補同步
    } finally {
      setSyncing(false)
    }
  }

  void statusVersion

  return (
    <div className="app-shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">A YING TOUR</p>
          <h1>{data.tripName}</h1>
        </div>

        <button
          className="traveler-chip"
          onClick={() => {
            localStorage.removeItem(travelerStorageKey)
            setTraveler(null)
          }}
        >
          {traveler.name}
        </button>
      </header>

      <nav className="date-tabs" aria-label="日期">
        {dates.map((item) => (
          <button
            key={item.date}
            className={
              selectedDate === item.date
                ? 'date-tab active'
                : 'date-tab'
            }
            onClick={() => setSelectedDate(item.date)}
          >
            <strong>{item.label}</strong>
            <span>週{item.weekday}</span>
          </button>
        ))}
      </nav>

      <main className="content">
        <div className="day-heading">
          <div>
            <p className="eyebrow">BUSAN 2026</p>
            <h2>
              {dates.find(
                (item) => item.date === selectedDate,
              )?.label}{' '}
              行程
            </h2>
          </div>

          <span className="count-badge">
            {dayActivities.length} 項
          </span>
        </div>

        <div className="timeline">
          {dayActivities.map((activity) => {
            const hasTicket = data.tickets.some(
              (ticket) =>
                ticket.activityId === activity.id &&
                ticket.travelerId === traveler.id,
            )

            return (
              <ActivityCard
                key={activity.id}
                activity={activity}
                hasTicket={hasTicket}
                onClick={() => setSelectedActivity(activity)}
              />
            )
          })}
        </div>
      </main>

      <DetailSheet
        activity={selectedActivity}
        place={selectedPlace}
        routeSteps={selectedRouteSteps}
        tickets={selectedTickets}
        completed={selectedCompleted}
        syncing={syncing}
        onToggleCompleted={handleToggleCompleted}
        onClose={() => setSelectedActivity(null)}
      />
    </div>
  )
}
