import { useRef } from 'react'
import { useTranslation } from 'react-i18next'

import SelectionAnalyzer from './SelectionAnalyzer'
import { parseDetailedTranslation } from '../utils/detailed'

function ResultBox({ translation, mode, onSave, onAnalyzeSelection, settings }) {
  const containerRef = useRef(null)
  const { t } = useTranslation()

  if (!translation) return null

  function copy(value) {
    navigator.clipboard.writeText(value)
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
      }}
      onMouseEnter={(event) => {
        event.currentTarget.style.borderColor = 'var(--accent)'
        event.currentTarget.style.color = 'var(--accent)'
      }}
      onMouseLeave={(event) => {
        event.currentTarget.style.borderColor = accent ? 'var(--accent)' : 'var(--border)'
        event.currentTarget.style.color = accent ? 'var(--accent)' : 'var(--text-muted)'
      }}
    >
      {label}
    </button>
  )

  if (mode === 'simple') {
    return (
      <div style={{ ...card, position: 'relative' }} ref={containerRef}>
        <SelectionAnalyzer containerRef={containerRef} onAnalyze={onAnalyzeSelection} />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <span style={sectionLabel}>{t('result.translation')}</span>
          <div style={{ display: 'flex', gap: '8px' }}>
            {iconBtn(() => copy(translation), t('result.copy'))}
            {iconBtn(onSave, t('result.saveToDict'), true)}
          </div>
        </div>
        <p style={{ fontSize: '20px', color: 'var(--text)', lineHeight: '1.5', fontWeight: '500' }}>{translation}</p>
      </div>
    )
  }

  const parsed = parseDetailedTranslation(translation)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', position: 'relative' }} ref={containerRef}>
      <SelectionAnalyzer containerRef={containerRef} onAnalyze={onAnalyzeSelection} />

      {parsed.lang && (
        <div style={{ fontSize: '12px', color: 'var(--teal)', padding: '6px 14px', background: '#0d2a22', borderRadius: '100px', display: 'inline-block', alignSelf: 'flex-start' }}>
          {t('result.detectedLang', { lang: parsed.lang })}
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
        {iconBtn(() => copy(parsed.translation || translation), t('result.copy'))}
        {iconBtn(onSave, t('result.saveToDict'), true)}
      </div>

      {parsed.translation && (
        <div style={card}>
          <p style={sectionLabel}>{t('result.translation')}</p>
          <p style={{ fontSize: '20px', color: 'var(--text)', lineHeight: '1.5', fontWeight: '500' }}>{parsed.translation}</p>
        </div>
      )}

      {settings?.showVariants && parsed.variants.length > 0 && (
        <div style={card}>
          <p style={sectionLabel}>{t('result.variants')}</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {parsed.variants.map((variant, index) => (
              <div
                key={index}
                onClick={() => copy(variant)}
                style={{ padding: '10px 14px', background: 'var(--bg3)', borderRadius: '10px', fontSize: '14px', color: 'var(--text)', cursor: 'pointer', border: '1px solid transparent', transition: 'border-color .15s' }}
                onMouseEnter={(event) => { event.currentTarget.style.borderColor = 'var(--accent)' }}
                onMouseLeave={(event) => { event.currentTarget.style.borderColor = 'transparent' }}
              >
                {variant}
              </div>
            ))}
          </div>
        </div>
      )}

      {settings?.showGrammar && parsed.grammar && (
        <div style={card}>
          <p style={sectionLabel}>{t('result.grammar')}</p>
          <p style={{ fontSize: '14px', color: 'var(--text)', lineHeight: '1.7' }}>{parsed.grammar}</p>
        </div>
      )}

      {settings?.showTip && parsed.tip && (
        <div style={card}>
          <p style={sectionLabel}>{t('result.tip')}</p>
          <p style={{ fontSize: '14px', color: 'var(--text)', lineHeight: '1.7' }}>{parsed.tip}</p>
        </div>
      )}

      {settings?.showFormality && parsed.formality && (
        <div style={card}>
          <p style={sectionLabel}>{t('result.formality')}</p>
          <p style={{ fontSize: '14px', color: 'var(--text)', lineHeight: '1.7' }}>{parsed.formality}</p>
        </div>
      )}

      {settings?.showTranscription && parsed.transcription && (
        <div style={card}>
          <p style={sectionLabel}>{t('result.transcription')}</p>
          <p style={{ fontSize: '14px', color: 'var(--text)', lineHeight: '1.7', fontStyle: 'italic' }}>{parsed.transcription}</p>
        </div>
      )}
    </div>
  )
}

export default ResultBox
