import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

function SelectionAnalyzer({ containerRef, onAnalyze }) {
  const [popup, setPopup] = useState(null)
  const { t } = useTranslation()

  useEffect(() => {
    function handleSelection() {
      const selection = window.getSelection()
      const selected = selection?.toString().trim()

      if (!selected || selected.length < 3) {
        setPopup(null)
        return
      }

      if (!containerRef.current?.contains(selection.anchorNode)) {
        setPopup(null)
        return
      }

      const range = selection.getRangeAt(0)
      const rect = range.getBoundingClientRect()

      setPopup({
        text: selected,
        x: rect.left + rect.width / 2,
        y: rect.top + window.scrollY - 48,
      })
    }

    document.addEventListener('mouseup', handleSelection)
    document.addEventListener('touchend', handleSelection)

    return () => {
      document.removeEventListener('mouseup', handleSelection)
      document.removeEventListener('touchend', handleSelection)
    }
  }, [containerRef])

  if (!popup) return null

  return (
    <div
      style={{
        position: 'absolute',
        left: popup.x,
        top: popup.y,
        transform: 'translateX(-50%)',
        zIndex: 100,
        background: 'var(--accent)',
        color: '#0f0f13',
        padding: '7px 16px',
        borderRadius: '100px',
        fontSize: '13px',
        fontWeight: '700',
        cursor: 'pointer',
        whiteSpace: 'nowrap',
        boxShadow: '0 4px 20px rgba(157,148,255,0.3)',
      }}
      onClick={() => {
        onAnalyze(popup.text)
        setPopup(null)
        window.getSelection()?.removeAllRanges()
      }}
    >
      {t('result.analyzeSelection')}
    </div>
  )
}

export default SelectionAnalyzer
