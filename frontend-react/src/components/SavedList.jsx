import { useState } from 'react'
import { useTranslation } from 'react-i18next'

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

  function parseDetailed(raw) {
    const s = { translation: '', variants: [], grammar: '', tip: '', lang: '', formality: '', transcription: '' }
    const langM = raw.match(/LANGUAGE:\s*(.+)/i) || raw.match(/ЯЗЫК:\s*(.+)/i)
    if (langM) s.lang = langM[1].trim()
    const transM = raw.match(/TRANSLATION:\s*([\s\S]*?)(?=VARIANTS:|GRAMMAR:|TIP:|FORMALITY:|TRANSCRIPTION:|$)/i)
      || raw.match(/ПЕРЕВОД:\s*([\s\S]*?)(?=ВАРИАНТЫ:|ГРАММАТИКА:|СОВЕТ:|$)/i)
    if (transM) s.translation = transM[1].trim()
    const varM = raw.match(/VARIANTS:\s*([\s\S]*?)(?=GRAMMAR:|TIP:|FORMALITY:|TRANSCRIPTION:|$)/i)
      || raw.match(/ВАРИАНТЫ:\s*([\s\S]*?)(?=ГРАММАТИКА:|СОВЕТ:|$)/i)
    if (varM) s.variants = varM[1].split('\n').map(l => l.replace(/^-\s*/, '').trim()).filter(Boolean)
    const gramM = raw.match(/GRAMMAR:\s*([\s\S]*?)(?=TIP:|FORMALITY:|TRANSCRIPTION:|$)/i)
      || raw.match(/ГРАММАТИКА:\s*([\s\S]*?)(?=СОВЕТ:|$)/i)
    if (gramM) s.grammar = gramM[1].trim()
    const tipM = raw.match(/TIP:\s*([\s\S]*?)(?=FORMALITY:|TRANSCRIPTION:|$)/i)
      || raw.match(/СОВЕТ:\s*([\s\S]*?)(?=ФОРМАЛЬНОСТЬ:|$)/i)
    if (tipM) s.tip = tipM[1].trim()
    const formM = raw.match(/FORMALITY:\s*([\s\S]*?)(?=TRANSCRIPTION:|$)/i)
    if (formM) s.formality = formM[1].trim()
    const transcrM = raw.match(/TRANSCRIPTION:\s*([\s\S]*?)$/i)
    if (transcrM) s.transcription = transcrM[1].trim()
    return s
  }

  const card = { background: 'var(--bg2)', borderRadius: '16px', padding: '18px', border: '1px solid var(--border)' }
  const sectionLabel = { fontSize: '10px', color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '8px', fontWeight: '700' }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <div style={{ fontSize: '11px', color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>
        {t('saved.count', { count: saved.length })}
      </div>

      {saved.map((item, i) => {
        const isAI = item.mode === 'detailed'
        const isOpen = expanded === i
        const parsed = isAI ? parseDetailed(item.translation) : null
        const displayTranslation = isAI ? (parsed?.translation || item.translation) : item.translation

        return (
          <div key={i}>
            <div
              onClick={() => isAI && setExpanded(isOpen ? null : i)}
              style={{
                background: 'var(--bg2)', borderRadius: '14px', padding: '14px 16px',
                border: `1px solid ${isOpen ? 'var(--accent)' : 'var(--border)'}`,
                cursor: isAI ? 'pointer' : 'default',
                transition: 'border-color .15s',
                display: 'flex', alignItems: 'center', gap: '12px',
              }}
            >
              <div style={{
                width: '36px', height: '36px', borderRadius: '10px', flexShrink: 0,
                background: isAI ? 'var(--accent-dim)' : 'var(--bg4)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '16px',
              }}>
                {isAI ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round">
                    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                  </svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text3)" strokeWidth="2" strokeLinecap="round">
                    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
                  </svg>
                )}
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '3px' }}>
                  <span style={{ fontSize: '11px', color: 'var(--text3)', background: 'var(--bg4)', padding: '2px 7px', borderRadius: '100px' }}>
                    {parsed?.lang || 'auto'} → {item.targetLang?.slice(0, 2).toUpperCase() || 'EN'}
                  </span>
                  {isAI && (
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
                {isAI && (
                  <span style={{ fontSize: '14px', color: 'var(--text3)', transform: isOpen ? 'rotate(180deg)' : 'none', display: 'inline-block', transition: 'transform .2s' }}>↓</span>
                )}
                <button
                  onClick={e => { e.stopPropagation(); onRemove(item.id) }}
                  style={{ width: '26px', height: '26px', borderRadius: '50%', border: '1px solid var(--border)', background: 'transparent', color: 'var(--text3)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', transition: 'all .15s' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--danger)'; e.currentTarget.style.color = 'var(--danger)' }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text3)' }}
                >
                  ×
                </button>
              </div>
            </div>

            {isOpen && isAI && parsed && (
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
                      {parsed.variants.map((v, vi) => (
                        <div key={vi} onClick={() => navigator.clipboard.writeText(v)}
                          style={{ padding: '8px 12px', background: 'var(--bg3)', borderRadius: '8px', fontSize: '14px', color: 'var(--text)', cursor: 'pointer', border: '1px solid transparent', transition: 'border-color .15s' }}
                          onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent)'}
                          onMouseLeave={e => e.currentTarget.style.borderColor = 'transparent'}
                        >{v}</div>
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
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

export default SavedList