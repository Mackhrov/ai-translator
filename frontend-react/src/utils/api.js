const DEFAULT_BASE = 'https://ai-translator-production-d1ee.up.railway.app'
const BASE = (import.meta.env.VITE_API_BASE_URL || DEFAULT_BASE).replace(/\/$/, '')

function createError(message, status, data) {
  const error = new Error(message || 'Request failed')
  error.status = status
  error.data = data
  return error
}

async function parseResponse(response) {
  const text = await response.text()
  let data = {}

  if (text) {
    try {
      data = JSON.parse(text)
    } catch {
      data = { detail: text }
    }
  }

  if (!response.ok) {
    throw createError(data.detail || `Request failed with status ${response.status}`, response.status, data)
  }

  return data
}

async function request(path, { method = 'GET', auth = false, body, headers = {} } = {}) {
  const requestHeaders = { ...headers }

  if (body !== undefined) {
    requestHeaders['Content-Type'] = 'application/json'
  }

  if (auth) {
    const token = localStorage.getItem('lingua_token')
    if (token) {
      requestHeaders.Authorization = `Bearer ${token}`
    }
  }

  const response = await fetch(`${BASE}${path}`, {
    method,
    headers: requestHeaders,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })

  return parseResponse(response)
}

export const api = {
  login(email, password) {
    return request('/login', {
      method: 'POST',
      body: { email, password },
    })
  },

  register(username, email, password) {
    return request('/register', {
      method: 'POST',
      body: { username, email, password },
    })
  },

  me() {
    return request('/me', { auth: true })
  },

  translate(text, targetLang, sourceLang) {
    return request('/translate', {
      method: 'POST',
      auth: true,
      body: {
        text,
        target_language: targetLang,
        source_language: sourceLang,
      },
    })
  },

  translateDetailed(text, targetLang, sourceLang, settings = {}, uiLang = 'en') {
    return request('/translate/detailed', {
      method: 'POST',
      auth: true,
      body: {
        text,
        target_language: targetLang,
        source_language: sourceLang,
        ui_language: (uiLang || 'en').slice(0, 2).toLowerCase(),
        sections: {
          variants: settings.showVariants ?? true,
          grammar: settings.showGrammar ?? true,
          tip: settings.showTip ?? false,
          formality: settings.showFormality ?? false,
          transcription: settings.showTranscription ?? false,
        },
      },
    })
  },

  getSaved() {
    return request('/saved', { auth: true })
  },

  saveWord(original, translation, targetLang, mode) {
    return request('/saved', {
      method: 'POST',
      auth: true,
      body: {
        original,
        translation,
        target_lang: targetLang,
        mode,
      },
    })
  },

  deleteSaved(id) {
    return request(`/saved/${id}`, {
      method: 'DELETE',
      auth: true,
    })
  },

  getHistory() {
    return request('/history', { auth: true })
  },

  clearHistory() {
    return request('/history', {
      method: 'DELETE',
      auth: true,
    })
  },

  getLimit() {
    return request('/limit', { auth: true })
  },
}
