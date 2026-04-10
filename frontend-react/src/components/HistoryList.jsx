function HistoryList({ history, onSelect, onClear }) {
  if (history.length === 0) return null

  const colors = ['var(--accent)', 'var(--teal)', 'var(--coral)']

  return (
    <div style={{ background: 'var(--bg2)', borderRadius: '20px', padding: '24px', border: '1px solid var(--border)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <span style={{ fontSize: '11px', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '1px' }}>
          История
        </span>
        <button onClick={onClear} style={{ fontSize: '12px', color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer' }}>
          Очистить
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {history.map((item, i) => (
          <div
            key={i}
            onClick={() => onSelect(item)}
            style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '10px 0', borderBottom: i < history.length - 1 ? '1px solid var(--border)' : 'none', cursor: 'pointer', borderRadius: '8px', transition: 'padding .15s' }}
            onMouseEnter={e => e.currentTarget.style.paddingLeft = '8px'}
            onMouseLeave={e => e.currentTarget.style.paddingLeft = '0px'}
          >
            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: colors[i % colors.length], flexShrink: 0 }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: '2px' }}>
                {item.original}
              </div>
              <div style={{ fontSize: '14px', color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {item.translation}
              </div>
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-dim)', flexShrink: 0 }}>
              {item.targetLang}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default HistoryList