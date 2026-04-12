import { useState, useRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'

const LANGS = [
  { code: 'ru', label: 'Русский' },
  { code: 'en', label: 'English' },
  { code: 'de', label: 'Deutsch' },
  { code: 'uk', label: 'Українська' },
  { code: 'es', label: 'Español' },
  { code: 'zh', label: '中文' },
]

function GlobePicker() {
  const { i18n } = useTranslation()
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const current = i18n.language?.slice(0, 2)

  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: '34px', height: '34px', borderRadius: '50%',
          border: `1px solid ${open ? 'var(--accent)' : 'var(--border)'}`,
          background: open ? 'var(--accent-dim)' : 'var(--bg2)',
          cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'all .15s',
        }}
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="1.8" strokeLinecap="round">
          <circle cx="12" cy="12" r="10"/>
          <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
        </svg>
      </button>

      {open && (
        <div style={{
          position: 'absolute', top: '42px', right: 0,
          background: 'var(--bg2)', border: '1px solid var(--border2)',
          borderRadius: '14px', padding: '6px', width: '160px',
          zIndex: 100, boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
        }}>
          {LANGS.map(lang => (
            <div
              key={lang.code}
              onClick={() => { i18n.changeLanguage(lang.code); setOpen(false) }}
              style={{
                padding: '8px 12px', borderRadius: '8px', cursor: 'pointer',
                fontSize: '13px', display: 'flex', justifyContent: 'space-between',
                alignItems: 'center',
                color: current === lang.code ? 'var(--accent)' : 'var(--text3)',
                background: current === lang.code ? 'var(--accent-dim)' : 'transparent',
                fontWeight: current === lang.code ? '600' : '400',
                transition: 'all .1s',
              }}
              onMouseEnter={e => { if (current !== lang.code) e.currentTarget.style.background = 'var(--bg4)' }}
              onMouseLeave={e => { if (current !== lang.code) e.currentTarget.style.background = 'transparent' }}
            >
              {lang.label}
              {current === lang.code && (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M20 6L9 17l-5-5"/>
                </svg>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default GlobePicker