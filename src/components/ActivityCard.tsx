import type { Activity } from '../types'

type Props = {
  activity: Activity
  hasTicket: boolean
  onClick: () => void
}

export default function ActivityCard({ activity, hasTicket, onClick }: Props) {
  return (
    <button className="activity-card" onClick={onClick}>
      <div className="time-col">
        <strong>{activity.time ?? '—'}</strong>
        {activity.duration ? <span>{activity.duration} 分</span> : null}
      </div>
      <div className="activity-main">
        <div className="activity-meta">
          <span className={`type-badge type-${activity.type}`}>{activity.type}</span>
          {hasTicket ? <span className="ticket-badge">有票券</span> : null}
        </div>
        <h3>{activity.title}</h3>
        {activity.cost ? <p className="muted small">費用：{activity.cost}</p> : null}
      </div>
      <span className="chevron">›</span>
    </button>
  )
}
