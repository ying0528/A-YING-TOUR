import { useEffect, useState } from 'react'
import type {
  EditableActivityFields,
} from '../api'
import type { ActivityType } from '../types'

type Props = {
  open: boolean
  defaultDate: string
  onSave: (
    fields: EditableActivityFields,
  ) => Promise<void>
  onClose: () => void
}

const activityTypes: ActivityType[] = [
  '景點',
  '餐廳',
  '住宿',
  '移動',
  '飛機',
  '其他',
]

export default function AddActivitySheet({
  open,
  defaultDate,
  onSave,
  onClose,
}: Props) {
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] =
    useState<EditableActivityFields>({
      date: defaultDate,
      time: '',
      duration: '',
      type: '景點',
      title: '',
      cost: '',
      note: '',
    })

  useEffect(() => {
    if (!open) return

    setForm({
      date: defaultDate,
      time: '',
      duration: '',
      type: '景點',
      title: '',
      cost: '',
      note: '',
    })

    setError('')
  }, [open, defaultDate])

  if (!open) return null

  async function handleSave() {
    if (!form.title.trim()) {
      setError('請輸入行程名稱')
      return
    }

    if (!form.date) {
      setError('請選擇日期')
      return
    }

    setSaving(true)
    setError('')

    try {
      await onSave({
        ...form,
        title: form.title.trim(),
        cost: form.cost.trim(),
        note: form.note.trim(),
      })

      onClose()
    } catch (err) {
      console.error(err)
      setError('新增失敗，請確認網路後再試一次。')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div
      className="sheet-backdrop"
      onClick={() => {
        if (!saving) onClose()
      }}
    >
      <section
        className="detail-sheet"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sheet-handle" />

        <div className="sheet-head">
          <div>
            <p className="eyebrow">新增行程</p>
            <h2>建立新行程</h2>
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

        <div className="edit-form">
          <label className="edit-field">
            <span>名稱</span>
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
                    type:
                      e.target.value as ActivityType,
                  })
                }
              >
                {activityTypes.map((type) => (
                  <option
                    key={type}
                    value={type}
                  >
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
                        : Number(
                            e.target.value,
                          ),
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

          {error ? (
            <p className="edit-error">
              {error}
            </p>
          ) : null}

          <div className="edit-actions">
            <button
              className="cancel-edit-button"
              onClick={onClose}
              disabled={saving}
            >
              取消
            </button>

            <button
              className="save-edit-button"
              onClick={handleSave}
              disabled={saving}
            >
              {saving
                ? '新增中...'
                : '新增行程'}
            </button>
          </div>

          <p className="save-hint">
            按「新增行程」才會寫入 Google Sheet。
          </p>
        </div>
      </section>
    </div>
  )
}
