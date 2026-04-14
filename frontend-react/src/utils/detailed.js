const SECTION_LABELS = [
  'LANGUAGE',
  'TRANSLATION',
  'VARIANTS',
  'GRAMMAR',
  'TIP',
  'FORMALITY',
  'TRANSCRIPTION',
]

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function extractSection(raw, label) {
  const nextLabels = SECTION_LABELS
    .filter((item) => item !== label)
    .map((item) => `${escapeRegExp(item)}:`)
    .join('|')

  const pattern = new RegExp(`${escapeRegExp(label)}:\\s*([\\s\\S]*?)(?=${nextLabels}|$)`, 'i')
  const match = raw.match(pattern)
  return match ? match[1].trim() : ''
}

export function parseDetailedTranslation(raw) {
  if (!raw) {
    return {
      lang: '',
      translation: '',
      variants: [],
      grammar: '',
      tip: '',
      formality: '',
      transcription: '',
    }
  }

  const translation = extractSection(raw, 'TRANSLATION')

  return {
    lang: extractSection(raw, 'LANGUAGE'),
    translation: translation || raw.trim(),
    variants: extractSection(raw, 'VARIANTS')
      .split('\n')
      .map((line) => line.replace(/^[-*]\s*/, '').trim())
      .filter(Boolean),
    grammar: extractSection(raw, 'GRAMMAR'),
    tip: extractSection(raw, 'TIP'),
    formality: extractSection(raw, 'FORMALITY'),
    transcription: extractSection(raw, 'TRANSCRIPTION'),
  }
}
