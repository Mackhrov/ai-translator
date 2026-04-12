import { useRef } from 'react'
import SelectionAnalyzer from './SelectionAnalyzer'
import { useTranslation } from 'react-i18next'

function ResultBox({ translation, mode, onSave, onAnalyzeSelection, settings }) {
  const containerRef = useRef(null)
  const { t } = useTranslation()
  

  if (!translation) return null

  function parseDetailed(raw) {
  const s = { lang: '', translation: '', variants: [], grammar: '', tip: '', formality: '', transcription: '' }

  const langM = raw.match(/LANGUAGE:\s*(.+)/i) || raw.match(/ЯЗЫК:\s*(.+)/i)
  if (langM) s.lang = langM[1].trim()

  const transM = raw.match(/TRANSLATION:\s*([\s\S]*?)(?=VARIANTS:|GRAMMAR:|TIP:|FORMALITY:|TRANSCRIPTION:|ПЕРЕВОД:|ВАРИАНТЫ:|$)/i)
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
    || raw.match(/ФОРМАЛЬНОСТЬ:\s*([\s\S]*?)(?=ТРАНСКРИПЦИЯ:|$)/i)
  if (formM) s.formality = formM[1].trim()

  const transcrM = raw.match(/TRANSCRIPTION:\s*([\s\S]*?)$/i)
    || raw.match(/ТРАНСКРИПЦИЯ:\s*([\s\S]*?)$/i)
  if (transcrM) s.transcription = transcrM[1].trim()

  return s
}

  function copy(text) { navigator.clipboard.writeText(text) }

  const card = { background: 'var(--bg2)', borderRadius: '20px', padding: '24px', border: '1px solid var(--border)' }
  const sectionLabel = { fontSize: '11px', color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '10px', fontWeight: '600' }

  const iconBtn = (onClick, label, accent) => (
    <button onClick={onClick} style={{ fontSize: '12px', padding: '5px 14px', border: `1px solid ${accent ? 'var(--accent)' : 'var(--border)'}`, borderRadius: '100px', background: accent ? 'var(--accent-dim)' : 'transparent', color: accent ? 'var(--accent)' : 'var(--text-muted)', cursor: 'pointer' }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--accent)' }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = accent ? 'var(--accent)' : 'var(--border)'; e.currentTarget.style.color = accent ? 'var(--accent)' : 'var(--text-muted)' }}
    >
      {label}
    </button>
  )

  if (mode === 'simple') {
    return (
      <div style={{ ...card, position: 'relative' }} ref={containerRef}>
        <SelectionAnalyzer containerRef={containerRef} onAnalyze={onAnalyzeSelection} />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <span style={sectionLabel}>Перевод</span>
          <div style={{ display: 'flex', gap: '8px' }}>
            {iconBtn(() => copy(translation), t('result.copy'))}
            {iconBtn(onSave, t('result.saveToDict'), true)}
          </div>
        </div>
        <p style={{ fontSize: '20px', color: 'var(--text)', lineHeight: '1.5', fontWeight: '500' }}>{translation}</p>
      </div>
    )
  }

  const p = parseDetailed(translation)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', position: 'relative' }} ref={containerRef}>
      <SelectionAnalyzer containerRef={containerRef} onAnalyze={onAnalyzeSelection} />

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

      {settings?.showVariants && p.variants.length > 0 && (
        <div style={card}>
          <p style={sectionLabel}>Варианты</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {p.variants.map((v, i) => (
              <div key={i} onClick={() => copy(v)} style={{ padding: '10px 14px', background: 'var(--bg3)', borderRadius: '10px', fontSize: '14px', color: 'var(--text)', cursor: 'pointer', border: '1px solid transparent', transition: 'border-color .15s' }}
                onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent)'}
                onMouseLeave={e => e.currentTarget.style.borderColor = 'transparent'}
              >{v}</div>
            ))}
          </div>
        </div>
      )}

      {settings?.showGrammar && p.grammar && (
        <div style={card}>
          <p style={sectionLabel}>Грамматика</p>
          <p style={{ fontSize: '14px', color: 'var(--text)', lineHeight: '1.7' }}>{p.grammar}</p>
        </div>
      )}

      {settings?.showTip && p.tip && (
        <div style={card}>
          <p style={sectionLabel}>Совет</p>
          <p style={{ fontSize: '14px', color: 'var(--text)', lineHeight: '1.7' }}>{p.tip}</p>
        </div>
      )}

      {settings?.showFormality && p.formality && (
        <div style={card}>
          <p style={sectionLabel}>Формальность</p>
          <p style={{ fontSize: '14px', color: 'var(--text)', lineHeight: '1.7' }}>{p.formality}</p>
        </div>
      )}

      {settings?.showTranscription && p.transcription && (
        <div style={card}>
          <p style={sectionLabel}>Транскрипция</p>
          <p style={{ fontSize: '14px', color: 'var(--text)', lineHeight: '1.7', fontStyle: 'italic' }}>{p.transcription}</p>
        </div>
      )}
    </div>
  )
}

export default ResultBox