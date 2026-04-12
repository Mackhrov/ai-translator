import { useTranslation } from 'react-i18next'

function Toggle({ on, onToggle }) {
  return (
    <div onClick={onToggle} style={{ width: '36px', height: '20px', borderRadius: '10px', background: on ? 'var(--accent)' : 'var(--bg)', border: `1px solid ${on ? 'var(--accent)' : 'var(--border)'}`, cursor: 'pointer', position: 'relative', transition: 'all .2s', flexShrink: 0 }}>
      <div style={{ width: '14px', height: '14px', borderRadius: '50%', background: 'white', position: 'absolute', top: '2px', left: on ? '18px' : '2px', transition: 'left .2s' }}/>
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
  const { t } = useTranslation()

  return (
    <div style={{ background: 'var(--bg2)', borderRadius: '20px', padding: '24px', border: '1px solid var(--border)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <span style={{ fontSize: '11px', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '1px' }}>
          {t('settings.title')}
        </span>
        <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '18px' }}>×</button>
      </div>

      <div style={{ fontSize: '11px', color: 'var(--text-dim)', marginBottom: '12px' }}>
        {t('settings.include')}
      </div>

      <Row label={t('settings.toggles.variants')} desc={t('settings.toggles.variantsDesc')} on={settings.showVariants} onToggle={() => toggle('showVariants')} />
      <Row label={t('settings.toggles.grammar')} desc={t('settings.toggles.grammarDesc')} on={settings.showGrammar} onToggle={() => toggle('showGrammar')} />
      <Row label={t('settings.toggles.tip')} desc={t('settings.toggles.tipDesc')} on={settings.showTip} onToggle={() => toggle('showTip')} />
      <Row label={t('settings.toggles.formality')} desc={t('settings.toggles.formalityDesc')} on={settings.showFormality} onToggle={() => toggle('showFormality')} />
      <Row label={t('settings.toggles.transcription')} desc={t('settings.toggles.transcriptionDesc')} on={settings.showTranscription} onToggle={() => toggle('showTranscription')} />

      <div style={{ marginTop: '20px', padding: '12px 16px', background: 'var(--bg)', borderRadius: '12px', border: '1px solid var(--border)' }}>
        <div style={{ fontSize: '11px', color: 'var(--text-dim)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1px' }}>
          {t('settings.lengthLogic')}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {[
            [t('settings.lengths.short'), t('settings.lengthDescs.short')],
            [t('settings.lengths.medium'), t('settings.lengthDescs.medium')],
            [t('settings.lengths.long'), t('settings.lengthDescs.long')],
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