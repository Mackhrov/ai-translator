import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import AuthPage from './components/AuthPage'
import LanguageSelector from './components/LanguageSelector'
import ModeToggle from './components/ModeToggle'
import TranslateBox from './components/TranslateBox'
import ResultBox from './components/ResultBox'
import HistoryList from './components/HistoryList'
import ErrorBox from './components/ErrorBox'
import SavedList from './components/SavedList'
import LimitBar from './components/LimitBar'
import AISettings from './components/AISettings'
import LanguageSwitcher from './components/LanguageSwitcher'
import { api } from './utils/api'
import { parseError } from './utils/errors'
import { useSettings } from './hooks/useSettings'

function App() {
  const [user, setUser] = useState(localStorage.getItem('lingua_username'))
  const [sourceLang, setSourceLang] = useState('auto')
  const [targetLang, setTargetLang] = useState('English')
  const [mode, setMode] = useState('simple')
  const [text, setText] = useState('')
  const [translation, setTranslation] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [history, setHistory] = useState([])
  const [saved, setSaved] = useState([])
  const [tab, setTab] = useState('translate')
  const [translateCount, setTranslateCount] = useState(0)
  const [showSettings, setShowSettings] = useState(false)
  const { settings, toggle } = useSettings()
  const { t, i18n } = useTranslation()
  

  useEffect(() => {
    if (user) {
      api.getSaved().then(setSaved).catch(() => {})
      api.getHistory().then(setHistory).catch(() => {})
    }
  }, [user])

  function handleLogin(username) {
    setUser(username)
    api.getSaved().then(setSaved).catch(() => {})
    api.getHistory().then(setHistory).catch(() => {})
  }

  function handleLogout() {
    localStorage.removeItem('lingua_token')
    localStorage.removeItem('lingua_username')
    setUser(null)
    setSaved([])
    setHistory([])
    setTranslation('')
  }

  function handleModeChange(newMode) {
    setMode(newMode)
    setTranslation('')
    setError('')
  }

  function getAutoMode(textLength) {
    if (textLength <= 300) return 'detailed'
    return 'simple'
  }

  async function handleTranslate(overrideText) {
    const inputText = overrideText || text
    if (!inputText.trim()) return
    if (sourceLang !== 'auto' && sourceLang === targetLang) {
      setError(t('translator.differentLangs'))
      return
    }

    const effectiveMode = overrideText
      ? 'detailed'
      : (mode === 'simple' ? 'simple' : getAutoMode(inputText.length))

    setLoading(true)
    setError('')
    setTranslation('')

    try {
      let data
      if (effectiveMode === 'detailed') {
        data = await api.translateDetailed(inputText, targetLang, sourceLang, settings, i18n.language)
      } else {
        data = await api.translate(inputText, targetLang, sourceLang)
      }

      setTranslation(data.translation)
      setMode(effectiveMode)
      setTranslateCount(c => c + 1)
      setHistory(prev => [
        { original: inputText, translation: data.translation, targetLang, mode: effectiveMode },
        ...prev
      ].slice(0, 20))

    } catch (err) {
      setError(parseError(err, err.message?.includes('429') ? 429 : null))
    } finally {
      setLoading(false)
    }
  }

  async function handleSave() {
    try {
      await api.saveWord(text, translation, targetLang, mode)
      const updated = await api.getSaved()
      setSaved(updated)
    } catch (err) {
      setError(parseError(err, err.message?.includes('429') ? 429 : null))
    }
  }

  async function handleRemoveSaved(id) {
    await api.deleteSaved(id)
    setSaved(prev => prev.filter(s => s.id !== id))
  }

  function handleSelectHistory(item) {
    setText(item.original)
    setTranslation(item.translation)
    setMode(item.mode)
    setTab('translate')
  }

  if (!user) return <AuthPage onLogin={handleLogin} />

  const tabBtn = (value, label) => (
    <button
      onClick={() => setTab(value)}
      style={{
        flex: 1, padding: '10px', background: 'transparent', border: 'none',
        borderBottom: `2px solid ${tab === value ? 'var(--accent)' : 'transparent'}`,
        color: tab === value ? 'var(--accent)' : 'var(--text-muted)',
        fontSize: '13px', fontWeight: tab === value ? '600' : '400',
        cursor: 'pointer', transition: 'all .15s',
      }}
    >
      {label}{value === 'saved' && saved.length > 0 && ` (${saved.length})`}
    </button>
  )

  return (
    <div style={{ maxWidth: '640px', margin: '0 auto', padding: '40px 20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
        <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--accent)', letterSpacing: '3px', textTransform: 'uppercase' }}>
          {t('appName')}
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <LanguageSwitcher />
          <button
            onClick={() => setShowSettings(s => !s)}
            style={{ fontSize: '12px', padding: '5px 14px', border: `1px solid ${showSettings ? 'var(--accent)' : 'var(--border)'}`, borderRadius: '100px', background: showSettings ? 'var(--accent-dim)' : 'transparent', color: showSettings ? 'var(--accent)' : 'var(--text-muted)', cursor: 'pointer' }}
          >
            {t('settings.aiSettings')}
          </button>
          <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{user}</span>
          <button
            onClick={handleLogout}
            style={{ fontSize: '12px', padding: '5px 14px', border: '1px solid var(--border)', borderRadius: '100px', background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer' }}
          >
            {t('user.logout')}
          </button>
        </div>
      </div>

      <LimitBar key={translateCount} />

      {showSettings && (
        <AISettings settings={settings} toggle={toggle} onClose={() => setShowSettings(false)} />
      )}

      <div style={{ display: 'flex', borderBottom: '1px solid var(--border)' }}>
        {tabBtn('translate', t('tabs.translator'))}
        {tabBtn('saved', t('tabs.saved'))}
        {tabBtn('history', t('tabs.history'))}
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

            {text.length > 300 && mode === 'detailed' && (
              <div style={{ marginBottom: '12px', padding: '10px 14px', background: '#1e1a0a', border: '1px solid #4a3a0a', borderRadius: '12px', fontSize: '13px', color: '#f0c060' }}>
                {t('translator.tooLong')}
              </div>
            )}

            <TranslateBox text={text} onChange={setText} onTranslate={handleTranslate} loading={loading} />
            <ErrorBox
              message={error}
              onRetry={error && !error.includes('разные') && !error.includes('different') ? handleTranslate : null}
            />
          </div>

          {translation && (
            <ResultBox
              translation={translation}
              mode={mode}
              onSave={handleSave}
              onAnalyzeSelection={(selected) => handleTranslate(selected)}
              settings={settings}
            />
          )}
        </>
      )}

      {tab === 'saved' && (
        <SavedList saved={saved} onRemove={handleRemoveSaved} />
      )}

      {tab === 'history' && (
        <HistoryList history={history} onSelect={handleSelectHistory} onClear={() => setHistory([])} />
      )}

    </div>
  )
}

export default App