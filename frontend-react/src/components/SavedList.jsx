import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { parseDetailedTranslation } from '../utils/detailed'

function SavedList({ saved, onRemove }) {
  const [expanded, setExpanded] = useState(null)
  const { t } = useTranslation()

  if (saved.length === 0) {
    return (
      <div style={{ background: 'var(--bg2)', borderRadius: '18px', padding: '40px 24px', border: '1px solid var(--border)', textAlign: 'center' }}>
        <div style={{ fontSize: '32px', marginBottom: '12px', opacity: 0.3 }}>📖</div>
        <div style={{ fontSize: '14px', color: 'var(--text3)' }}>{t('saved.empty')}</div>
      </div>
    )
  }

  const card = {
    background: 'var(--bg2)',
    borderRadius: '16px',
    padding: '18px',
    border: '1px solid var(--border)',
  }

  const sectionLabel = {
    fontSize: '10px',
    color: 'var(--accent)',
    textTransform: 'uppercase',
    letterSpacing: '1.5px',
    marginBottom: '8px',
    fontWeight: '700',
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <div style={{ fontSize: '11px', color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>
        {t('saved.count', { count: saved.length })}
      </div>

      {saved.map((item, index) => {
        const isDetailed = item.mode === 'detailed'
        const isOpen = expanded === index
        const parsed = isDetailed ? parseDetailedTranslation(item.translation) : null
        const displayTranslation = isDetailed ? (parsed?.translation || item.translation) : item.translation

        return (
          <div key={item.id ?? index}>
            <div
              onClick={() => isDetailed && setExpanded(isOpen ? null : index)}
              style={{
                background: 'var(--bg2)',
                borderRadius: '14px',
                padding: '14px 16px',
                border: `1px solid ${isOpen ? 'var(--accent)' : 'var(--border)'}`,
                cursor: isDetailed ? 'pointer' : 'default',
                transition: 'border-color .15s',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
              }}
            >
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                flexShrink: 0,
                background: isDetailed ? 'var(--accent-dim)' : 'var(--bg4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '16px',
              }}
              >
                {isDetailed ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round">
                    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                  </svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text3)" strokeWidth="2" strokeLinecap="round">
                    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                  </svg>
                )}
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '3px' }}>
                  <span style={{ fontSize: '11px', color: 'var(--text3)', background: 'var(--bg4)', padding: '2px 7px', borderRadius: '100px' }}>
                    {(parsed?.lang || t('languages.auto'))} → {item.targetLang || 'English'}
                  </span>
                  {isDetailed && (
                    <span style={{ fontSize: '10px', color: 'var(--accent)', background: 'var(--accent-dim)', padding: '2px 7px', borderRadius: '100px', fontWeight: '600' }}>
                      AI
                    </span>
                  )}
                </div>
                <div style={{ fontSize: '14px', color: 'var(--text)', fontWeight: '500', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: '2px' }}>
                  {item.original}
                </div>
                <div style={{ fontSize: '13px', color: 'var(--text3)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {displayTranslation}
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                {isDetailed && (
                  <span style={{ fontSize: '14px', color: 'var(--text3)', transform: isOpen ? 'rotate(180deg)' : 'none', display: 'inline-block', transition: 'transform .2s' }}>↓</span>
                )}
                <button
                  onClick={(event) => {
                    event.stopPropagation()
                    onRemove(item.id)
                  }}
                  style={{ width: '26px', height: '26px', borderRadius: '50%', border: '1px solid var(--border)', background: 'transparent', color: 'var(--text3)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', transition: 'all .15s' }}
                  onMouseEnter={(event) => {
                    event.currentTarget.style.borderColor = 'var(--danger)'
                    event.currentTarget.style.color = 'var(--danger)'
                  }}
                  onMouseLeave={(event) => {
                    event.currentTarget.style.borderColor = 'var(--border)'
                    event.currentTarget.style.color = 'var(--text3)'
                  }}
                >
                  ×
                </button>
              </div>
            </div>

            {isOpen && isDetailed && parsed && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '8px', paddingLeft: '8px' }}>
                {parsed.translation && (
                  <div style={card}>
                    <p style={sectionLabel}>{t('result.translation')}</p>
                    <p style={{ fontSize: '18px', color: 'var(--text)', lineHeight: '1.5', fontWeight: '500' }}>{parsed.translation}</p>
                  </div>
                )}

                {parsed.variants.length > 0 && (
                  <div style={card}>
                    <p style={sectionLabel}>{t('result.variants')}</p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      {parsed.variants.map((variant, variantIndex) => (
                        <div
                          key={variantIndex}
                          onClick={() => navigator.clipboard.writeText(variant)}
                          style={{ padding: '8px 12px', background: 'var(--bg3)', borderRadius: '8px', fontSize: '14px', color: 'var(--text)', cursor: 'pointer', border: '1px solid transparent', transition: 'border-color .15s' }}
                          onMouseEnter={(event) => { event.currentTarget.style.borderColor = 'var(--accent)' }}
                          onMouseLeave={(event) => { event.currentTarget.style.borderColor = 'transparent' }}
                        >
                          {variant}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {parsed.grammar && (
                  <div style={card}>
                    <p style={sectionLabel}>{t('result.grammar')}</p>
                    <p style={{ fontSize: '14px', color: 'var(--text)', lineHeight: '1.7' }}>{parsed.grammar}</p>
                  </div>
                )}

                {parsed.tip && (
                  <div style={card}>
                    <p style={sectionLabel}>{t('result.tip')}</p>
                    <p style={{ fontSize: '14px', color: 'var(--text)', lineHeight: '1.7' }}>{parsed.tip}</p>
                  </div>
                )}

                {parsed.formality && (
                  <div style={card}>
                    <p style={sectionLabel}>{t('result.formality')}</p>
                    <p style={{ fontSize: '14px', color: 'var(--text)', lineHeight: '1.7' }}>{parsed.formality}</p>
                  </div>
                )}

                {parsed.transcription && (
                  <div style={card}>
                    <p style={sectionLabel}>{t('result.transcription')}</p>
                    <p style={{ fontSize: '14px', color: 'var(--text)', lineHeight: '1.7', fontStyle: 'italic' }}>{parsed.transcription}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

export default SavedList
