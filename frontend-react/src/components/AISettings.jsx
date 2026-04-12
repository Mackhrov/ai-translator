function Toggle({ on, onToggle }) {
  return (
    <div
      onClick={onToggle}
      style={{
        width: '36px', height: '20px', borderRadius: '10px',
        background: on ? 'var(--accent)' : 'var(--bg)',
        border: `1px solid ${on ? 'var(--accent)' : 'var(--border)'}`,
        cursor: 'pointer', position: 'relative',
        transition: 'all .2s', flexShrink: 0,
      }}
    >
      <div style={{
        width: '14px', height: '14px', borderRadius: '50%',
        background: 'white', position: 'absolute', top: '2px',
        left: on ? '18px' : '2px', transition: 'left .2s',
      }}/>
    </div>
  )
}

function Row({ label, desc, on, onToggle }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: '14px', color: 'var(--text)', marginBottom: '2px' }}>{label}</div>
        <div style={{ fontSize: '12px', color: 'var(--text-dim)' }}>{desc}</div>
      </div>
      <Toggle on={on} onToggle={onToggle} />
    </div>
  )
}

function AISettings({ settings, toggle, onClose }) {
  return (
    <div style={{ background: 'var(--bg2)', borderRadius: '20px', padding: '24px', border: '1px solid var(--border)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <span style={{ fontSize: '11px', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '1px' }}>
          Настройки AI-разбора
        </span>
        <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '18px', lineHeight: 1 }}>×</button>
      </div>

      <div style={{ fontSize: '11px', color: 'var(--text-dim)', marginBottom: '12px' }}>
        Что включать в AI-разбор:
      </div>

      <div>
        <Row label="Варианты перевода" desc="3 альтернативных формулировки" on={settings.showVariants} onToggle={() => toggle('showVariants')} />
        <Row label="Грамматика" desc="Время, структура, части речи" on={settings.showGrammar} onToggle={() => toggle('showGrammar')} />
        <Row label="Совет по использованию" desc="Когда и как применять фразу" on={settings.showTip} onToggle={() => toggle('showTip')} />
        <Row label="Формальность" desc="Формальный или разговорный стиль" on={settings.showFormality} onToggle={() => toggle('showFormality')} />
        <div style={{ borderBottom: 'none' }}>
          <Row label="Транскрипция" desc="Произношение на любом языке" on={settings.showTranscription} onToggle={() => toggle('showTranscription')} />
        </div>
      </div>

      <div style={{ marginTop: '20px', padding: '12px 16px', background: 'var(--bg)', borderRadius: '12px', border: '1px solid var(--border)' }}>
        <div style={{ fontSize: '11px', color: 'var(--text-dim)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1px' }}>
          Логика по длине
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {[
            ['до 50 символов', 'Полный AI-разбор автоматически'],
            ['50 – 300 символов', 'Перевод + выбранные секции'],
            ['300+ символов', 'Только перевод, можно выделить часть'],
          ].map(([len, desc]) => (
            <div key={len} style={{ display: 'flex', gap: '12px', alignItems: 'baseline' }}>
              <span style={{ fontSize: '12px', color: 'var(--accent)', minWidth: '130px', flexShrink: 0 }}>{len}</span>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{desc}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default AISettings