const BASE = 'https://ai-translator-production-d1ee.up.railway.app'

function getToken() {
  return localStorage.getItem('lingua_token')
}

function authHeaders() {
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${getToken()}`
  }
}

export const api = {
  async register(username, email, password) {
    const r = await fetch(`${BASE}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password })
    })
    const data = await r.json()
    if (!r.ok) throw new Error(data.detail)
    return data
  },

  async login(email, password) {
    const r = await fetch(`${BASE}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    })
    const data = await r.json()
    if (!r.ok) throw new Error(data.detail)
    return data
  },

  async translate(text, targetLang, sourceLang) {
    const r = await fetch(`${BASE}/translate`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ text, target_language: targetLang, source_language: sourceLang })
    })
    const data = await r.json()
    if (!r.ok) throw new Error(data.detail)
    return data
  },
async translateDetailed(text, targetLang, sourceLang, settings = {}, uiLang = 'Russian') {
  const langMap = {
    ru: 'Russian', en: 'English', de: 'German',
    uk: 'Ukrainian', es: 'Spanish', zh: 'Chinese'
  }
  const r = await fetch(`${BASE}/translate/detailed`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({
      text,
      target_language: targetLang,
      source_language: sourceLang,
      ui_language: langMap[uiLang] || 'English',
      sections: {
        variants: settings.showVariants ?? true,
        grammar: settings.showGrammar ?? true,
        tip: settings.showTip ?? false,
        formality: settings.showFormality ?? false,
        transcription: settings.showTranscription ?? false,
      }
    })
  })
  const data = await r.json()
  if (!r.ok) throw new Error(data.detail)
  return data
},

  async getSaved() {
    const r = await fetch(`${BASE}/saved`, { headers: authHeaders() })
    const data = await r.json()
    if (!r.ok) throw new Error(data.detail)
    return data
  },

  async saveWord(original, translation, targetLang, mode) {
    const r = await fetch(`${BASE}/saved`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ original, translation, target_lang: targetLang, mode })
    })
    const data = await r.json()
    if (!r.ok) throw new Error(data.detail)
    return data
  },

  async deleteSaved(id) {
    const r = await fetch(`${BASE}/saved/${id}`, {
      method: 'DELETE',
      headers: authHeaders()
    })
    const data = await r.json()
    if (!r.ok) throw new Error(data.detail)
    return data
  },

  async getHistory() {
    const r = await fetch(`${BASE}/history`, { headers: authHeaders() })
    const data = await r.json()
    if (!r.ok) throw new Error(data.detail)
    return data
  },

  async getLimit() {
    const r = await fetch(`${BASE}/limit`)
    return r.json()
  }
}