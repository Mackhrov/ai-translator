import { useTranslation } from 'react-i18next'

function ModeToggle({ mode, onModeChange }) {
  const { t } = useTranslation()

  const btn = (value) => ({
    onClick: () => onModeChange(value),
    style: {
      flex: 1, padding: '10px 12px', borderRadius: '12px', border: '1px solid',
      borderColor: mode === value ? 'var(--accent)' : 'var(--border)',
      background: mode === value ? 'var(--accent-dim)' : 'transparent',
      color: mode === value ? 'var(--accent)' : 'var(--text-muted)',
      cursor: 'pointer', fontSize: '13px',
      fontWeight: mode === value ? '600' : '400', textAlign: 'center',
    }
  })

  return (
    <div style={{ marginBottom: '20px' }}>
      <div style={{ fontSize: '11px', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>
        {t('translator.mode.label')}
      </div>
      <div style={{ display: 'flex', gap: '8px' }}>
        <button {...btn('simple')}>{t('translator.mode.simple')}</button>
        <button {...btn('detailed')}>{t('translator.mode.detailed')}</button>
      </div>
    </div>
  )
}

export default ModeToggle