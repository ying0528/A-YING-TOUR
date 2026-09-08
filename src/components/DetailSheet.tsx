import { useEffect, useState } from 'react'
import type {
  EditableActivityFields,
} from '../api'
import type {
  Activity,
  ActivityType,
  Place,
  RouteStep,
  Ticket,
} from '../types'

type Props = {
  activity: Activity | null
  place?: Place
  routeSteps: RouteStep[]
  tickets: Ticket[]
  completed: boolean
  syncing?: boolean
  onToggleCompleted: () => void
  onSaveActivity: (
    fields: EditableActivityFields,
  ) => Promise<void>
  onClose: () => void
}

const activityTypes: ActivityType[] = [
  '景點',
  '移動',
  '餐廳',
  '飛機',
  '住宿',
  '其他',
]

export default function DetailSheet({
  activity,
  place,
  routeSteps,
  tickets,
  completed,
  syncing,
  onToggleCompleted,
  onSaveActivity,
  onClose,
}: Props) {
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')

  const [form, setForm] =
    useState<EditableActivityFields>({
      date: '',
      time: '',
      duration: '',
      type: '其他',
      title: '',
      cost: '',
      note: '',
    })

  useEffect(() => {
    if (!activity) return

    setEditing(false)
    setSaveError('')

    setForm({
      date: activity.date,
      time: activity.time ?? '',
      duration: activity.duration ?? '',
      type: activity.type,
      title: activity.title,
      cost: activity.cost ?? '',
      note: activity.note ?? '',
    })
  }, [activity])

  if (!activity) return null

  async function handleSave() {
    if (!form.title.trim()) {
      setSaveError('請輸入行程標題')
      return
    }

    if (!form.date) {
      setSaveError('請選擇日期')
      return
    }

    setSaving(true)
    setSaveError('')

    try {
      await onSaveActivity({
        ...form,
        title: form.title.trim(),
        cost: form.cost.trim(),
        note: form.note.trim(),
      })

      setEditing(false)
    } catch (error) {
      console.error(error)
      setSaveError('儲存失敗，請確認網路後再試一次。')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div
      className="sheet-backdrop"
      onClick={() => {
        if (!editing && !saving) onClose()
      }}
    >
      <section
        className="detail-sheet"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sheet-handle" />

        <div className="sheet-head">
          <div>
            <p className="eyebrow">
              {editing ? '編輯行程' : activity.type}
            </p>
            <h2>
              {editing ? '修改行程資料' : activity.title}
            </h2>
          </div>

          <button
            className="close-button"
            onClick={onClose}
            disabled={saving}
            aria-label="關閉"
          >
            ×
          </button>
        </div>

        {editing ? (
          <div className="edit-form">
            <label className="edit-field">
              <span>標題</span>
              <input
                value={form.title}
                onChange={(e) =>
                  setForm({
                    ...form,
                    title: e.target.value,
                  })
                }
                placeholder="例如：甘川文化村"
              />
            </label>

            <div className="edit-row">
              <label className="edit-field">
                <span>日期</span>
                <input
                  type="date"
                  value={form.date}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      date: e.target.value,
                    })
                  }
                />
              </label>

              <label className="edit-field">
                <span>開始時間</span>
                <input
                  type="time"
                  value={form.time}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      time: e.target.value,
                    })
                  }
                />
              </label>
            </div>

            <div className="edit-row">
              <label className="edit-field">
                <span>類型</span>
                <select
                  value={form.type}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      type: e.target.value as ActivityType,
                    })
                  }
                >
                  {activityTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </label>

              <label className="edit-field">
                <span>停留分鐘</span>
                <input
                  type="number"
                  min="0"
                  inputMode="numeric"
                  value={form.duration}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      duration:
                        e.target.value === ''
                          ? ''
                          : Number(e.target.value),
                    })
                  }
                  placeholder="60"
                />
              </label>
            </div>

            <label className="edit-field">
              <span>費用</span>
              <input
                value={form.cost}
                onChange={(e) =>
                  setForm({
                    ...form,
                    cost: e.target.value,
                  })
                }
                placeholder="例如：10000 KRW"
              />
            </label>

            <label className="edit-field">
              <span>補充</span>
              <textarea
                rows={4}
                value={form.note}
                onChange={(e) =>
                  setForm({
                    ...form,
                    note: e.target.value,
                  })
                }
                placeholder="想記的事情..."
              />
            </label>

            {saveError ? (
              <p className="edit-error">{saveError}</p>
            ) : null}

            <div className="edit-actions">
              <button
                className="cancel-edit-button"
                onClick={() => {
                  setEditing(false)
                  setSaveError('')
                }}
                disabled={saving}
              >
                取消
              </button>

              <button
                className="save-edit-button"
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? '儲存中...' : '儲存變更'}
              </button>
            </div>

            <p className="save-hint">
              只有按「儲存變更」才會更新 Google Sheet。
            </p>
          </div>
        ) : (
          <>
            <button
              className="edit-activity-button"
              onClick={() => {
                setEditing(true)
                setSaveError('')
              }}
            >
              ✎ 編輯行程
            </button>

            <button
              className={`complete-button ${
                completed ? 'completed' : ''
              }`}
              onClick={onToggleCompleted}
            >
              {completed
                ? '✓ 已完成'
                : '○ 標記為已完成'}
            </button>

            {syncing ? (
              <p className="muted small">
                正在同步...
              </p>
            ) : null}

            <div className="detail-section">
              <p>
                <strong>日期：</strong>
                {activity.date}
              </p>

              {activity.time ? (
                <p>
                  <strong>時間：</strong>
                  {activity.time}
                </p>
              ) : null}

              {activity.duration ? (
                <p>
                  <strong>預計：</strong>
                  {activity.duration} 分鐘
                </p>
              ) : null}

              {activity.cost ? (
                <p>
                  <strong>費用：</strong>
                  {activity.cost}
                </p>
              ) : null}

              {activity.note ? (
                <p>
                  <strong>補充：</strong>
                  {activity.note}
                </p>
              ) : null}
            </div>

            {place ? (
              <div className="detail-section">
                <h3>景點資訊</h3>

                <p>
                  <strong>名稱：</strong>
                  {place.name}
                </p>

                <p>
                  <strong>類型：</strong>
                  {place.type}
                </p>

                {place.intro ? <p>{place.intro}</p> : null}

                {place.address ? (
                  <p>
                    <strong>地址：</strong>
                    {place.address}
                  </p>
                ) : null}

                {place.note ? (
                  <p>
                    <strong>備註：</strong>
                    {place.note}
                  </p>
                ) : null}
              </div>
            ) : null}

            {routeSteps.length > 0 ? (
              <div className="detail-section">
                <h3>交通步驟</h3>

                <div className="route-list">
                  {routeSteps.map((step) => (
                    <div
                      className="route-step"
                      key={`${step.routeId}-${step.step}`}
                    >
                      <span className="step-index">
                        {step.step}
                      </span>

                      <div>
                        <strong>
                          {step.mode}
                          {step.line
                            ? ` · ${step.line}`
                            : ''}
                        </strong>

                        <p>
                          {step.from ?? '—'} →{' '}
                          {step.to ?? '—'}
                        </p>

                        {step.direction ? (
                          <p className="muted small">
                            {step.direction}
                          </p>
                        ) : null}

                        {step.note ? (
                          <p className="muted small">
                            {step.note}
                          </p>
                        ) : null}
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
                    href={
                      ticket.fileUrl ||
                      ticket.originalUrl ||
                      '#'
                    }
                    target="_blank"
                    rel="noreferrer"
                  >
                    <strong>{ticket.name}</strong>
                    <span>{ticket.type}</span>
                  </a>
                ))}
              </div>
            ) : null}
          </>
        )}
      </section>
    </div>
  )
}
