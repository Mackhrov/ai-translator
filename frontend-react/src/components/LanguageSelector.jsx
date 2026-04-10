function LanguageSelector({ sourceLang, targetLang, onSourceChange, onTargetChange }) {
  const languages = [
    { value: 'auto', label: 'Авто' },
    { value: 'Russian', label: 'Русский' },
    { value: 'English', label: 'English' },
    { value: 'German', label: 'Deutsch' },
    { value: 'French', label: 'Français' },
    { value: 'Spanish', label: 'Español' },
    { value: 'Chinese', label: '中文' },
  ]

  const targets = languages.filter(l => l.value !== 'auto')

  const selectStyle = {
    width: '100%',
    padding: '10px 14px',
    background: 'var(--bg3)',
    border: '1px solid var(--border)',
    borderRadius: '12px',
    fontSize: '14px',
    color: 'var(--text)',
    cursor: 'pointer',
    outline: 'none',
  }

  const labelStyle = {
    display: 'block',
    fontSize: '11px',
    color: 'var(--text-dim)',
    textTransform: 'uppercase',
    letterSpacing: '1px',
    marginBottom: '6px',
  }

  return (
    <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', alignItems: 'flex-end' }}>
      <div style={{ flex: 1 }}>
        <label style={labelStyle}>Откуда</label>
        <select value={sourceLang} onChange={e => onSourceChange(e.target.value)} style={selectStyle}>
          {languages.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
        </select>
      </div>

      <div style={{ fontSize: '20px', color: 'var(--accent)', paddingBottom: '10px', flexShrink: 0 }}>→</div>

      <div style={{ flex: 1 }}>
        <label style={labelStyle}>Куда</label>
        <select value={targetLang} onChange={e => onTargetChange(e.target.value)} style={selectStyle}>
          {targets.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
        </select>
      </div>
    </div>
  )
}

export default LanguageSelector