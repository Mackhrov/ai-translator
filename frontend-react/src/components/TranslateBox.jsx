function TranslateBox({ text, onChange, onTranslate, loading }) {
  const MAX = 1000

  return (
    <div>
      <div style={{ fontSize: '11px', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>
        Текст
      </div>
      <div style={{ position: 'relative' }}>
        <textarea
          value={text}
          onChange={e => onChange(e.target.value)}
          maxLength={MAX}
          placeholder="Введи текст..."
          style={{
            width: '100%',
            minHeight: '120px',
            padding: '14px',
            paddingBottom: '32px',
            background: 'var(--bg)',
            border: '1px solid var(--border)',
            borderRadius: '14px',
            fontSize: '15px',
            color: 'var(--text)',
            fontFamily: 'inherit',
            resize: 'vertical',
            outline: 'none',
          }}
          onFocus={e => e.target.style.borderColor = 'var(--accent)'}
          onBlur={e => e.target.style.borderColor = 'var(--border)'}
        />
        <span style={{
          position: 'absolute',
          bottom: '10px',
          right: '14px',
          fontSize: '12px',
          color: text.length > 900 ? '#ff6060' : 'var(--text-dim)',
        }}>
          {text.length} / {MAX}
        </span>
      </div>

      <button
        onClick={onTranslate}
        disabled={loading || !text.trim()}
        style={{
          width: '100%',
          marginTop: '12px',
          padding: '14px',
          background: loading || !text.trim() ? 'var(--bg3)' : 'var(--accent)',
          color: loading || !text.trim() ? 'var(--text-muted)' : '#0f0f13',
          border: 'none',
          borderRadius: '14px',
          fontSize: '15px',
          fontWeight: '700',
          cursor: loading || !text.trim() ? 'not-allowed' : 'pointer',
          letterSpacing: '0.3px',
          transition: 'all .15s',
        }}
      >
        {loading ? 'Переводим...' : 'Перевести →'}
      </button>
    </div>
  )
}

export default TranslateBox