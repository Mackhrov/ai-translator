function ModeToggle({ mode, onModeChange }) {
  const btn = (value) => ({
    onClick: () => onModeChange(value),
    style: {
      flex: 1,
      padding: '10px 12px',
      borderRadius: '12px',
      border: '1px solid',
      borderColor: mode === value ? 'var(--accent)' : 'var(--border)',
      background: mode === value ? 'var(--accent-dim)' : 'transparent',
      color: mode === value ? 'var(--accent)' : 'var(--text-muted)',
      cursor: 'pointer',
      fontSize: '13px',
      fontWeight: mode === value ? '600' : '400',
      textAlign: 'center',
      transition: 'all .15s',
    }
  })

  return (
    <div style={{ marginBottom: '20px' }}>
      <div style={{ fontSize: '11px', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>
        Режим
      </div>
      <div style={{ display: 'flex', gap: '8px' }}>
        <button {...btn('simple')}>Быстрый</button>
        <button {...btn('detailed')}>AI-разбор</button>
      </div>
    </div>
  )
}

export default ModeToggle