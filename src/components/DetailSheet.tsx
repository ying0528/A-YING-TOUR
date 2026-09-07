import type { Activity, Place, RouteStep, Ticket } from '../types'

type Props = {
  activity: Activity | null
  place?: Place
  routeSteps: RouteStep[]
  tickets: Ticket[]
  onClose: () => void
}

export default function DetailSheet({ activity, place, routeSteps, tickets, onClose }: Props) {
  if (!activity) return null

  return (
    <div className="sheet-backdrop" onClick={onClose}>
      <section className="detail-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="sheet-handle" />
        <div className="sheet-head">
          <div>
            <p className="eyebrow">{activity.type}</p>
            <h2>{activity.title}</h2>
          </div>
          <button className="close-button" onClick={onClose}>×</button>
        </div>

        <div className="detail-section">
          <p><strong>日期：</strong>{activity.date}</p>
          {activity.time ? <p><strong>時間：</strong>{activity.time}</p> : null}
          {activity.duration ? <p><strong>預計：</strong>{activity.duration} 分鐘</p> : null}
          {activity.note ? <p><strong>補充：</strong>{activity.note}</p> : null}
        </div>

        {place ? (
          <div className="detail-section">
            <h3>景點資訊</h3>
            <p><strong>名稱：</strong>{place.name}</p>
            <p><strong>類型：</strong>{place.type}</p>
            {place.intro ? <p>{place.intro}</p> : null}
            {place.address ? <p><strong>地址：</strong>{place.address}</p> : null}
            {place.note ? <p><strong>備註：</strong>{place.note}</p> : null}
          </div>
        ) : null}

        {routeSteps.length > 0 ? (
          <div className="detail-section">
            <h3>交通步驟</h3>
            <div className="route-list">
              {routeSteps.map((step) => (
                <div className="route-step" key={`${step.routeId}-${step.step}`}>
                  <span className="step-index">{step.step}</span>
                  <div>
                    <strong>{step.mode}{step.line ? ` · ${step.line}` : ''}</strong>
                    <p>{step.from ?? '—'} → {step.to ?? '—'}</p>
                    {step.direction ? <p className="muted small">{step.direction}</p> : null}
                    {step.note ? <p className="muted small">{step.note}</p> : null}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {tickets.length > 0 ? (
          <div className="detail-section">
            <h3>我的電子票券</h3>
            {tickets.map((ticket) => (
              <a
                className="ticket-card"
                key={ticket.id}
                href={ticket.fileUrl || ticket.originalUrl || '#'}
                target="_blank"
                rel="noreferrer"
              >
                <strong>{ticket.name}</strong>
                <span>{ticket.type}</span>
              </a>
            ))}
          </div>
        ) : null}
      </section>
    </div>
  )
}
