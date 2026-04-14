import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

function UserMenu({ username, onLogout, onSettings, theme, onToggleTheme }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const { t, i18n } = useTranslation()
  const isRussian = i18n.language?.startsWith('ru')

  const initials = username ? username.slice(0, 2).toUpperCase() : '??'

  useEffect(() => {
    function handleClick(event) {
      if (ref.current && !ref.current.contains(event.target)) setOpen(false)
    }

    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <div
        onClick={() => setOpen((value) => !value)}
        style={{
          width: '34px',
          height: '34px',
          borderRadius: '50%',
          background: 'var(--accent)',
          color: 'var(--accent-text)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '12px',
          fontWeight: '800',
          cursor: 'pointer',
          border: open ? '2px solid var(--accent-dark)' : '2px solid transparent',
          transition: 'border .15s',
        }}
      >
        {initials}
      </div>

      {open && (
        <div style={{
          position: 'absolute',
          top: '42px',
          right: 0,
          background: 'var(--bg2)',
          border: '1px solid var(--border2)',
          borderRadius: '14px',
          padding: '6px',
          width: '180px',
          zIndex: 100,
          boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
        }}
        >
          <div style={{ padding: '10px 12px 8px', borderBottom: '1px solid var(--border)', marginBottom: '4px' }}>
            <div style={{ fontSize: '13px', color: 'var(--text)', fontWeight: '600' }}>{username}</div>
          </div>

          <div
            onClick={() => {
              onToggleTheme()
              setOpen(false)
            }}
            style={{ padding: '8px 12px', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', color: 'var(--text3)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', transition: 'background .1s' }}
            onMouseEnter={(event) => { event.currentTarget.style.background = 'var(--bg4)' }}
            onMouseLeave={(event) => { event.currentTarget.style.background = 'transparent' }}
          >
            {theme === 'dark'
              ? t('user.themeLight', { defaultValue: isRussian ? '☀ Светлая тема' : '☀ Light theme' })
              : t('user.themeDark', { defaultValue: isRussian ? '☾ Тёмная тема' : '☾ Dark theme' })}
          </div>

          <div
            onClick={() => {
              onSettings()
              setOpen(false)
            }}
            style={{ padding: '8px 12px', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', color: 'var(--text3)', transition: 'background .1s' }}
            onMouseEnter={(event) => { event.currentTarget.style.background = 'var(--bg4)' }}
            onMouseLeave={(event) => { event.currentTarget.style.background = 'transparent' }}
          >
            {t('settings.aiSettings')}
          </div>

          <div style={{ borderTop: '1px solid var(--border)', marginTop: '4px', paddingTop: '4px' }}>
            <div
              onClick={() => {
                onLogout()
                setOpen(false)
              }}
              style={{ padding: '8px 12px', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', color: 'var(--danger)', transition: 'background .1s' }}
              onMouseEnter={(event) => { event.currentTarget.style.background = 'var(--bg4)' }}
              onMouseLeave={(event) => { event.currentTarget.style.background = 'transparent' }}
            >
              {t('user.logout')}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default UserMenu
