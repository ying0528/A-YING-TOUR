import type { Traveler } from '../types'

type Props = {
  travelers: Traveler[]
  onSelect: (traveler: Traveler) => void
}

export default function TravelerPicker({ travelers, onSelect }: Props) {
  return (
    <main className="picker-page">
      <div className="picker-card">
        <p className="eyebrow">A YING TOUR</p>
        <h1>你是誰？</h1>
        <p className="muted">選擇後只會顯示屬於你的電子票券。</p>
        <div className="picker-actions">
          {travelers.map((traveler) => (
            <button
              className="traveler-button"
              key={traveler.id}
              onClick={() => onSelect(traveler)}
            >
              <span className="avatar">{traveler.name.slice(0, 1)}</span>
              <span>{traveler.name}</span>
            </button>
          ))}
        </div>
      </div>
    </main>
  )
}
