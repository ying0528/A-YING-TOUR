import { useEffect, useMemo, useState } from 'react'
import ActivityCard from './components/ActivityCard'
import DetailSheet from './components/DetailSheet'
import AddActivitySheet from './components/AddActivitySheet'
import TravelerPicker from './components/TravelerPicker'
import {
  createActivity,
  deleteActivity,
  fetchTourData,
  loadCachedTourData,
  saveCachedTourData,
  updateActivity,
  type EditableActivityFields,
  type TourData,
} from './api'
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

  const [showAddActivity, setShowAddActivity] =
    useState(false)

  const [activeTab, setActiveTab] =
    useState<'itinerary' | 'places'>('itinerary')

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

  async function handleSaveActivity(
    fields: EditableActivityFields,
  ) {
    if (!selectedActivity) return

    await updateActivity(
      selectedActivity.id,
      fields,
    )

    const updatedActivity: Activity = {
      ...selectedActivity,
      date: fields.date,
      time: fields.time || undefined,
      duration:
        fields.duration === ''
          ? undefined
          : fields.duration,
      type: fields.type,
      title: fields.title,
      cost: fields.cost || undefined,
      note: fields.note || undefined,
    }

    setSelectedActivity(updatedActivity)
    setSelectedDate(updatedActivity.date)

    setData((current) => {
      if (!current) return current

      const next: TourData = {
        ...current,
        activities: current.activities
          .map((activity) =>
            activity.id === updatedActivity.id
              ? updatedActivity
              : activity,
          )
          .sort((a, b) => {
            if (a.date !== b.date) {
              return a.date.localeCompare(b.date)
            }

            return (a.time ?? '99:99').localeCompare(
              b.time ?? '99:99',
            )
          }),
      }

      saveCachedTourData(next)
      return next
    })
  }

  async function handleDeleteActivity() {
    if (!selectedActivity) return

    const activityId = selectedActivity.id

    await deleteActivity(activityId)

    setSelectedActivity(null)

    setData((current) => {
      if (!current) return current

      const next: TourData = {
        ...current,
        activities: current.activities.filter(
          (activity) =>
            activity.id !== activityId,
        ),
      }

      saveCachedTourData(next)
      return next
    })
  }

  async function handleCreateActivity(
    fields: EditableActivityFields,
  ) {
    const result = await createActivity(fields)

    const newActivity: Activity = {
      id: result.activityId,
      date: fields.date,
      time: fields.time || undefined,
      duration:
        fields.duration === ''
          ? undefined
          : fields.duration,
      type: fields.type,
      title: fields.title,
      cost: fields.cost || undefined,
      note: fields.note || undefined,
    }

    setSelectedDate(newActivity.date)

    setData((current) => {
      if (!current) return current

      const next: TourData = {
        ...current,
        activities: [
          ...current.activities,
          newActivity,
        ].sort((a, b) => {
          if (a.date !== b.date) {
            return a.date.localeCompare(b.date)
          }

          return (a.time ?? '99:99').localeCompare(
            b.time ?? '99:99',
          )
        }),
      }

      saveCachedTourData(next)
      return next
    })
  }

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

      <nav className="main-tabs" aria-label="主要功能">
        <button
          className={
            activeTab === 'itinerary'
              ? 'main-tab active'
              : 'main-tab'
          }
          onClick={() => setActiveTab('itinerary')}
        >
          行程
        </button>

        <button
          className={
            activeTab === 'places'
              ? 'main-tab active'
              : 'main-tab'
          }
          onClick={() => setActiveTab('places')}
        >
          景點
        </button>
      </nav>

      {activeTab === 'itinerary' ? (
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
      ) : null}

      <main className="content">
        {activeTab === 'itinerary' ? (
          <>
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

          <div className="day-actions">
            <span className="count-badge">
              {dayActivities.length} 項
            </span>

            <button
              className="add-activity-button"
              onClick={() =>
                setShowAddActivity(true)
              }
            >
              ＋ 新增行程
            </button>
          </div>
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
          </>
        ) : (
          <section className="places-page">
            <div className="places-heading">
              <div>
                <p className="eyebrow">PLACE LIBRARY</p>
                <h2>景點資料</h2>
              </div>

              <span className="count-badge">
                {data.places.length} 個
              </span>
            </div>

            <div className="places-list">
              {data.places.map((place) => (
                <article
                  className="place-card"
                  key={place.id}
                >
                  <div className="place-card-head">
                    <div>
                      <span className="place-type">
                        {place.type || '其他'}
                      </span>
                      <h3>{place.name}</h3>
                    </div>

                    <span className="place-id">
                      {place.id}
                    </span>
                  </div>

                  {place.address ? (
                    <p className="place-address">
                      {place.address}
                    </p>
                  ) : null}

                  {place.intro ? (
                    <p className="place-intro">
                      {place.intro}
                    </p>
                  ) : null}

                  <div className="place-links">
                    {place.naverMap ? (
                      <a
                        href={place.naverMap}
                        target="_blank"
                        rel="noreferrer"
                      >
                        Naver Map
                      </a>
                    ) : null}

                    {place.googleMaps ? (
                      <a
                        href={place.googleMaps}
                        target="_blank"
                        rel="noreferrer"
                      >
                        Google Maps
                      </a>
                    ) : null}

                    {place.website ? (
                      <a
                        href={place.website}
                        target="_blank"
                        rel="noreferrer"
                      >
                        官方網站
                      </a>
                    ) : null}
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}
      </main>

      <DetailSheet
        activity={selectedActivity}
        place={selectedPlace}
        routeSteps={selectedRouteSteps}
        tickets={selectedTickets}
        onSaveActivity={handleSaveActivity}
        onDeleteActivity={handleDeleteActivity}
        onClose={() => setSelectedActivity(null)}
      />

      <AddActivitySheet
        open={showAddActivity}
        defaultDate={selectedDate}
        onSave={handleCreateActivity}
        onClose={() =>
          setShowAddActivity(false)
        }
      />
    </div>
  )
}
