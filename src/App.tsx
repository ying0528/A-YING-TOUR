import { useMemo, useState } from 'react'
import ActivityCard from './components/ActivityCard'
import DetailSheet from './components/DetailSheet'
import TravelerPicker from './components/TravelerPicker'
import { activities, places, routeSteps, tickets, travelers } from './data/mockData'
import type { Activity, Traveler } from './types'

const dates = [
  { date: '2026-09-09', label: '9/9', weekday: '三' },
  { date: '2026-09-10', label: '9/10', weekday: '四' },
  { date: '2026-09-11', label: '9/11', weekday: '五' },
  { date: '2026-09-12', label: '9/12', weekday: '六' },
]

const storageKey = 'a-ying-tour-traveler'

function loadTraveler(): Traveler | null {
  const id = localStorage.getItem(storageKey)
  return travelers.find((item) => item.id === id) ?? null
}

export default function App() {
  const [traveler, setTraveler] = useState<Traveler | null>(loadTraveler)
  const [selectedDate, setSelectedDate] = useState(dates[0].date)
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null)

  const dayActivities = useMemo(
    () => activities.filter((activity) => activity.date === selectedDate),
    [selectedDate],
  )

  if (!traveler) {
    return (
      <TravelerPicker
        travelers={travelers}
        onSelect={(value) => {
          localStorage.setItem(storageKey, value.id)
          setTraveler(value)
        }}
      />
    )
  }

  const selectedPlace = selectedActivity?.placeId
    ? places.find((place) => place.id === selectedActivity.placeId)
    : undefined

  const selectedRouteSteps = selectedActivity?.routeId
    ? routeSteps.filter((step) => step.routeId === selectedActivity.routeId)
    : []

  const selectedTickets = selectedActivity
    ? tickets.filter(
        (ticket) =>
          ticket.activityId === selectedActivity.id &&
          ticket.travelerId === traveler.id,
      )
    : []

  return (
    <div className="app-shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">A YING TOUR</p>
          <h1>釜山窮遊之旅</h1>
        </div>
        <button
          className="traveler-chip"
          onClick={() => {
            localStorage.removeItem(storageKey)
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
            className={selectedDate === item.date ? 'date-tab active' : 'date-tab'}
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
            <h2>{dates.find((item) => item.date === selectedDate)?.label} 行程</h2>
          </div>
          <span className="count-badge">{dayActivities.length} 項</span>
        </div>

        <div className="timeline">
          {dayActivities.map((activity) => {
            const hasTicket = tickets.some(
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
        onClose={() => setSelectedActivity(null)}
      />
    </div>
  )
}
