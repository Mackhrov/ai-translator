import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'

function LimitBar() {
  const [limit, setLimit] = useState(null)
  const { t } = useTranslation()

  useEffect(() => {
    fetch('https://ai-translator-production-d1ee.up.railway.app/limit')
      .then(r => r.json())
      .then(setLimit)
      .catch(() => {})
  }, [])

  if (!limit) return null

  const percent = Math.round((limit.used / limit.total) * 100)
  const color = percent >= 90 ? 'var(--danger)' : percent >= 60 ? 'var(--warn)' : 'var(--teal)'

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
      <div style={{ flex: 1, height: '3px', background: 'var(--border)', borderRadius: '100px', overflow: 'hidden' }}>
        <div style={{ width: `${percent}%`, height: '100%', background: color, borderRadius: '100px', transition: 'width .4s' }}/>
      </div>
      <span style={{ fontSize: '11px', color: 'var(--text3)', whiteSpace: 'nowrap' }}>
        {t('limit.remaining', { remaining: limit.remaining, total: limit.total })}
      </span>
    </div>
  )
}

export default LimitBar