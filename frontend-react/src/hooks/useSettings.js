import { useState, useEffect } from 'react'

const DEFAULT_SETTINGS = {
  showVariants: true,
  showGrammar: true,
  showTip: false,
  showFormality: false,
  showTranscription: false,
}

export function useSettings() {
  const [settings, setSettings] = useState(() => {
    try {
      const saved = localStorage.getItem('lingua_settings')
      return saved ? { ...DEFAULT_SETTINGS, ...JSON.parse(saved) } : DEFAULT_SETTINGS
    } catch {
      return DEFAULT_SETTINGS
    }
  })

  useEffect(() => {
    localStorage.setItem('lingua_settings', JSON.stringify(settings))
  }, [settings])

  function toggle(key) {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }))
  }

  return { settings, toggle }
}