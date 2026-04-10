import { useState } from 'react'

function SavedList({ saved, onRemove }) {
  const [expanded, setExpanded] = useState(null)

  if (saved.length === 0) {
    return (
      <div style={{ background: 'var(--bg2)', borderRadius: '20px', padding: '40px 24px', border: '1px solid var(--border)', textAlign: 'center' }}>
        <div style={{ fontSize: '13px', color: 'var(--text-dim)' }}>Словарь пуст — нажми "+ В словарь" после перевода</div>
      </div>
    )
  }

  function parseDetailed(raw) {
    const s = { translation: '', variants: [], grammar: '', tip: '', lang: '' }
    const langM = raw.match(/ЯЗЫК:\s*(.+)/i)
    if (langM) s.lang = langM[1].trim()
    const transM = raw.match(/ПЕРЕВОД:\s*([\s\S]*?)(?=ВАРИАНТЫ:|$)/i)
    if (transM) s.translation = transM[1].trim()
    const varM = raw.match(/ВАРИАНТЫ:\s*([\s\S]*?)(?=ГРАММАТИКА:|$)/i)
    if (varM) s.variants = varM[1].split('\n').map(l => l.replace(/^-\s*/, '').trim()).filter(Boolean)
    const gramM = raw.match(/ГРАММАТИКА:\s*([\s\S]*?)(?=СОВЕТ:|$)/i)
    if (gramM) s.grammar = gramM[1].trim()
    const tipM = raw.match(/СОВЕТ:\s*([\s\S]*?)$/i)
    if (tipM) s.tip = tipM[1].trim()
    return s
  }

  const card = {
    background: 'var(--bg2)',
    borderRadius: '20px',
    padding: '24px',
    border: '1px solid var(--border)',
  }

  const sectionLabel = {
    fontSize: '11px',
    color: 'var(--accent)',
    textTransform: 'uppercase',
    letterSpacing: '1.5px',
    marginBottom: '10px',
    fontWeight: '600',
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <div style={{ fontSize: '11px', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>
        Словарь — {saved.length}
      </div>

      {saved.map((item, i) => {
        const isOpen = expanded === i
        const isAI = item.mode === 'detailed'
        const parsed = isAI ? parseDetailed(item.translation) : null

        return (
          <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div
              style={{
                background: 'var(--bg3)',
                borderRadius: '14px',
                padding: '14px 16px',
                border: `1px solid ${isOpen ? 'var(--accent)' : 'var(--border)'}`,
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                cursor: isAI ? 'pointer' : 'default',
                transition: 'border-color .15s',
              }}
              onClick={() => isAI && setExpanded(isOpen ? null : i)}
            >
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '15px', color: 'var(--text)', fontWeight: '500', marginBottom: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {item.original}
                </div>
                <div style={{ fontSize: '13px', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {isAI ? (parsed.translation || item.translation) : item.translation}
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                {isAI && (
                  <span style={{ fontSize: '11px', color: 'var(--teal)', background: '#0d2a22', padding: '3px 10px', borderRadius: '100px' }}>
                    AI
                  </span>
                )}
                <span style={{ fontSize: '11px', color: 'var(--accent)', background: 'var(--accent-dim)', padding: '3px 10px', borderRadius: '100px' }}>
                  {item.targetLang}
                </span>
                {isAI && (
                  <span style={{ fontSize: '14px', color: 'var(--text-dim)', transition: 'transform .2s', transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)', display: 'inline-block' }}>
                    ↓
                  </span>
                )}
                <button
                  onClick={e => { e.stopPropagation(); onRemove(i) }}
                  style={{ width: '24px', height: '24px', borderRadius: '50%', border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-dim)', cursor: 'pointer', fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = '#ff6060'; e.currentTarget.style.color = '#ff6060' }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-dim)' }}
                >
                  ×
                </button>
              </div>
            </div>

            {isOpen && isAI && parsed && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', paddingLeft: '8px' }}>
                {parsed.lang && (
                  <div style={{ fontSize: '12px', color: 'var(--teal)', padding: '5px 14px', background: '#0d2a22', borderRadius: '100px', display: 'inline-block', alignSelf: 'flex-start' }}>
                    Язык: {parsed.lang}
                  </div>
                )}

                {parsed.translation && (
                  <div style={card}>
                    <p style={sectionLabel}>Перевод</p>
                    <p style={{ fontSize: '18px', color: 'var(--text)', lineHeight: '1.5', fontWeight: '500' }}>{parsed.translation}</p>
                  </div>
                )}

                {parsed.variants.length > 0 && (
                  <div style={card}>
                    <p style={sectionLabel}>Варианты</p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      {parsed.variants.map((v, vi) => (
                        <div key={vi} style={{ padding: '10px 14px', background: 'var(--bg3)', borderRadius: '10px', fontSize: '14px', color: 'var(--text)' }}>
                          {v}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {parsed.grammar && (
                  <div style={card}>
                    <p style={sectionLabel}>Грамматика</p>
                    <p style={{ fontSize: '14px', color: 'var(--text)', lineHeight: '1.7' }}>{parsed.grammar}</p>
                  </div>
                )}

                {parsed.tip && (
                  <div style={card}>
                    <p style={sectionLabel}>Совет</p>
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