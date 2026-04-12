import { useTranslation } from 'react-i18next'

const LANGS = [
  { code: 'ru', label: 'RU' },
  { code: 'en', label: 'EN' },
  { code: 'de', label: 'DE' },
  { code: 'uk', label: 'UK' },
  { code: 'es', label: 'ES' },
  { code: 'zh', label: 'ZH' },
]

function LanguageSwitcher() {
  const { i18n } = useTranslation()
  const current = i18n.language?.slice(0, 2)

  return (
    <div style={{ display: 'flex', gap: '4px' }}>
      {LANGS.map(lang => (
        <button
          key={lang.code}
          onClick={() => i18n.changeLanguage(lang.code)}
          style={{
            padding: '4px 8px',
            borderRadius: '8px',
            border: '1px solid',
            borderColor: current === lang.code ? 'var(--accent)' : 'var(--border)',
            background: current === lang.code ? 'var(--accent-dim)' : 'transparent',
            color: current === lang.code ? 'var(--accent)' : 'var(--text-dim)',
            fontSize: '11px',
            fontWeight: current === lang.code ? '700' : '400',
            cursor: 'pointer',
            transition: 'all .15s',
          }}
        >
          {lang.label}
        </button>
      ))}
    </div>
  )
}

export default LanguageSwitcher