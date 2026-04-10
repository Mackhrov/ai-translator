import { useState, useEffect } from 'react'

function LimitBar() {
  const [limit, setLimit] = useState(null)

  useEffect(() => {
    fetch('https://ai-translator-production-d1ee.up.railway.app/limit')
      .then(r => r.json())
      .then(setLimit)
      .catch(() => {})
  }, [])

  if (!limit) return null

  const percent = (limit.used / limit.total) * 100
  const color = percent >= 90 ? '#ff6060' : percent >= 60 ? '#f0c060' : 'var(--teal)'

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
      <div style={{ flex: 1, height: '3px', background: 'var(--border)', borderRadius: '100px', overflow: 'hidden' }}>
        <div style={{ width: `${percent}%`, height: '100%', background: color, borderRadius: '100px', transition: 'width .3s' }}/>
      </div>
      <span style={{ fontSize: '11px', color: 'var(--text-dim)', whiteSpace: 'nowrap' }}>
        {limit.remaining} / {limit.total} переводов
      </span>
    </div>
  )
}

export default LimitBar