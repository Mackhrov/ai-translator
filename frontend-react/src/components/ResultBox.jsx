function ResultBox({ translation, mode, onSave }) {
  if (!translation) return null

  function parseDetailed(raw) {
    const s = { lang: '', translation: '', variants: [], grammar: '', tip: '' }
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

  function copy(text) {
    navigator.clipboard.writeText(text)
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

  const iconBtn = (onClick, label, accent) => (
    <button
      onClick={onClick}
      style={{
        fontSize: '12px',
        padding: '5px 14px',
        border: `1px solid ${accent ? 'var(--accent)' : 'var(--border)'}`,
        borderRadius: '100px',
        background: accent ? 'var(--accent-dim)' : 'transparent',
        color: accent ? 'var(--accent)' : 'var(--text-muted)',
        cursor: 'pointer',
        transition: 'all .15s',
      }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--accent)' }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = accent ? 'var(--accent)' : 'var(--border)'; e.currentTarget.style.color = accent ? 'var(--accent)' : 'var(--text-muted)' }}
    >
      {label}
    </button>
  )

  if (mode === 'simple') {
    return (
      <div style={card}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <span style={sectionLabel}>Перевод</span>
          <div style={{ display: 'flex', gap: '8px' }}>
            {iconBtn(() => copy(translation), 'Копировать')}
            {iconBtn(onSave, '+ В словарь', true)}
          </div>
        </div>
        <p style={{ fontSize: '20px', color: 'var(--text)', lineHeight: '1.5', fontWeight: '500' }}>
          {translation}
        </p>
      </div>
    )
  }

  const p = parseDetailed(translation)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      {p.lang && (
        <div style={{ fontSize: '12px', color: 'var(--teal)', padding: '6px 14px', background: '#0d2a22', borderRadius: '100px', display: 'inline-block', alignSelf: 'flex-start' }}>
          Язык: {p.lang}
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
        {iconBtn(() => copy(p.translation || translation), 'Копировать')}
        {iconBtn(onSave, '+ В словарь', true)}
      </div>

      {p.translation && (
        <div style={card}>
          <p style={sectionLabel}>Перевод</p>
          <p style={{ fontSize: '20px', color: 'var(--text)', lineHeight: '1.5', fontWeight: '500' }}>{p.translation}</p>
        </div>
      )}

      {p.variants.length > 0 && (
        <div style={card}>
          <p style={sectionLabel}>Варианты</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {p.variants.map((v, i) => (
              <div
                key={i}
                onClick={() => copy(v)}
                style={{ padding: '10px 14px', background: 'var(--bg3)', borderRadius: '10px', fontSize: '14px', color: 'var(--text)', cursor: 'pointer', border: '1px solid transparent', transition: 'border-color .15s' }}
                onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent)'}
                onMouseLeave={e => e.currentTarget.style.borderColor = 'transparent'}
              >
                {v}
              </div>
            ))}
          </div>
        </div>
      )}

      {p.grammar && (
        <div style={card}>
          <p style={sectionLabel}>Грамматика</p>
          <p style={{ fontSize: '14px', color: 'var(--text)', lineHeight: '1.7' }}>{p.grammar}</p>
        </div>
      )}

      {p.tip && (
        <div style={card}>
          <p style={sectionLabel}>Совет</p>
          <p style={{ fontSize: '14px', color: 'var(--text)', lineHeight: '1.7' }}>{p.tip}</p>
        </div>
      )}
    </div>
  )
}

export default ResultBox