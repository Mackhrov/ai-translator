import { useState, useEffect } from 'react'
import LanguageSelector from './components/LanguageSelector'
import ModeToggle from './components/ModeToggle'
import TranslateBox from './components/TranslateBox'
import ResultBox from './components/ResultBox'
import HistoryList from './components/HistoryList'
import ErrorBox from './components/ErrorBox'
import SavedList from './components/SavedList'
import { parseError } from './utils/errors'
import LimitBar from './components/LimitBar'

function App() {
  const [sourceLang, setSourceLang] = useState('auto')
  const [targetLang, setTargetLang] = useState('English')
  const [mode, setMode] = useState('simple')
  const [text, setText] = useState('')
  const [translation, setTranslation] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [history, setHistory] = useState([])
  
  // Этот стейт будет служить триггером для обновления LimitBar
  const [translateCount, setTranslateCount] = useState(0)
  
  const [saved, setSaved] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('lingua_saved') || '[]')
    } catch {
      return []
    }
  })
  const [tab, setTab] = useState('translate')

  useEffect(() => {
    localStorage.setItem('lingua_saved', JSON.stringify(saved))
  }, [saved])

  function handleModeChange(newMode) {
    setMode(newMode)
    setTranslation('')
    setError('')
  }

  async function handleTranslate() {
    // Исправлено: просто выходим, если текста нет
    if (!text.trim()) return 

    if (sourceLang !== 'auto' && sourceLang === targetLang) {
      setError('Выбери разные языки для перевода')
      return 
    }

    setLoading(true)
    setError('')
    setTranslation('') 
//ai-translator-production-d1ee.up.railway.app
   const endpoint = mode === 'simple'
  ? 'https://ai-translator-production-d1ee.up.railway.app/translator'
  : 'https://ai-translator-production-d1ee.up.railway.app/translate/detailed'

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, target_language: targetLang, source_language: sourceLang })
      })

      if (!response.ok) {
        // Если ошибка 429 (лимит), мы всё равно захотим обновить счетчик позже
        setError(parseError(new Error(), response.status))
        return
      }

      const data = await response.json()
      if (!data.translation) {
        setError('Сервер вернул пустой ответ')
        return
      }

      setTranslation(data.translation)
      setHistory(prev => [{ original: text, translation: data.translation, targetLang, mode }, ...prev].slice(0, 10))
      
      // Магия: Увеличиваем счетчик ТОЛЬКО при успехе. 
      // Это заставит LimitBar (ниже в коде) обновиться.
      setTranslateCount(c => c + 1)

    } catch (err) {
      setError(parseError(err, null))
    } finally {
      setLoading(false)
    }
  }

  // ... (функции handleSave, handleRemoveSaved, handleSelectHistory остаются прежними)
  function handleSave() {
    const already = saved.some(s => s.original === text && s.targetLang === targetLang)
    if (already) return
    setSaved(prev => [{ original: text, translation, targetLang, mode }, ...prev])
  }

  function handleRemoveSaved(index) {
    setSaved(prev => prev.filter((_, i) => i !== index))
  }

  function handleSelectHistory(item) {
    setText(item.original)
    setTranslation(item.translation)
    setMode(item.mode)
    setTab('translate')
  }

  const tabBtn = (value, label) => (
    <button
      onClick={() => setTab(value)}
      style={{
        flex: 1,
        padding: '10px',
        background: 'transparent',
        border: 'none',
        borderBottom: `2px solid ${tab === value ? 'var(--accent)' : 'transparent'}`,
        color: tab === value ? 'var(--accent)' : 'var(--text-muted)',
        fontSize: '13px',
        fontWeight: tab === value ? '600' : '400',
        cursor: 'pointer',
        transition: 'all .15s',
      }}
    >
      {label} {value === 'saved' && saved.length > 0 && `(${saved.length})`}
    </button>
  )

  return (
    <div style={{ maxWidth: '640px', margin: '0 auto', padding: '40px 20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
      
      <div style={{ marginBottom: '4px' }}>
        <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--accent)', letterSpacing: '3px', textTransform: 'uppercase' }}>
          Lingua
        </span>
      </div>

      {/* ВАЖНО: Добавляем key={translateCount}. 
         React увидит, что ключ изменился, и перерисует компонент, 
         что вызовет повторный запрос к бэкенду за свежим лимитом.
      */}
      <LimitBar key={translateCount} />

      <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', marginBottom: '4px' }}>
        {tabBtn('translate', 'Переводчик')}
        {tabBtn('saved', 'Словарь')}
      </div>

      {tab === 'translate' && (
        <>
          <div style={{ background: 'var(--bg2)', borderRadius: '20px', padding: '24px', border: '1px solid var(--border)' }}>
            <LanguageSelector
              sourceLang={sourceLang}
              targetLang={targetLang}
              onSourceChange={setSourceLang}
              onTargetChange={setTargetLang}
            />
            <ModeToggle mode={mode} onModeChange={handleModeChange} />
            <TranslateBox
              text={text}
              onChange={setText}
              onTranslate={handleTranslate}
              loading={loading}
            />
            <ErrorBox message={error} onRetry={error && !error.includes('разные') ? handleTranslate : null} />
          </div>

          {translation && (
            <ResultBox translation={translation} mode={mode} onSave={handleSave} />
          )}

          <HistoryList history={history} onSelect={handleSelectHistory} onClear={() => setHistory([])} />
        </>
      )}

      {tab === 'saved' && (
        <SavedList saved={saved} onRemove={handleRemoveSaved} />
      )}
    </div>
  )
}

export default App