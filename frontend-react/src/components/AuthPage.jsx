import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { api } from '../utils/api'
import LanguageSwitcher from './LanguageSwitcher'

function AuthPage({ onLogin }) {
  const [tab, setTab] = useState('login')
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { t } = useTranslation()

  async function handleSubmit() {
    setError('')
    setLoading(true)
    try {
      let data
      if (tab === 'login') {
        data = await api.login(email, password)
      } else {
        if (!username.trim()) { setError(t('auth.errors.usernameRequired')); setLoading(false); return }
        if (password.length < 6) { setError(t('auth.errors.passwordShort')); setLoading(false); return }
        data = await api.register(username, email, password)
      }
      localStorage.setItem('lingua_token', data.token)
      localStorage.setItem('lingua_username', data.username)
      onLogin(data.username)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const inputStyle = {
    width: '100%', padding: '12px 16px',
    background: '#0f0f13', border: '1px solid var(--border)',
    borderRadius: '12px', fontSize: '14px', color: 'var(--text)',
    outline: 'none', fontFamily: 'inherit',
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div style={{ width: '100%', maxWidth: '400px' }}>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
          <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--accent)', letterSpacing: '3px', textTransform: 'uppercase' }}>
            {t('appName')}
          </span>
          <LanguageSwitcher />
        </div>

        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
            {tab === 'login' ? t('auth.loginSubtitle') : t('auth.registerSubtitle')}
          </div>
        </div>

        <div style={{ background: 'var(--bg2)', borderRadius: '20px', padding: '28px', border: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', marginBottom: '24px', borderBottom: '1px solid var(--border)' }}>
            {['login', 'register'].map(tabName => (
              <button
                key={tabName}
                onClick={() => { setTab(tabName); setError('') }}
                style={{
                  flex: 1, padding: '10px', background: 'transparent', border: 'none',
                  borderBottom: `2px solid ${tab === tabName ? 'var(--accent)' : 'transparent'}`,
                  color: tab === tabName ? 'var(--accent)' : 'var(--text-muted)',
                  fontSize: '13px', fontWeight: tab === tabName ? '600' : '400', cursor: 'pointer',
                }}
              >
                {tabName === 'login' ? t('auth.login') : t('auth.register')}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {tab === 'register' && (
              <input
                placeholder={t('auth.username')}
                value={username}
                onChange={e => setUsername(e.target.value)}
                style={inputStyle}
                onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                onBlur={e => e.target.style.borderColor = 'var(--border)'}
              />
            )}
            <input
              placeholder={t('auth.email')}
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              style={inputStyle}
              onFocus={e => e.target.style.borderColor = 'var(--accent)'}
              onBlur={e => e.target.style.borderColor = 'var(--border)'}
            />
            <input
              placeholder={t('auth.password')}
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
              style={inputStyle}
              onFocus={e => e.target.style.borderColor = 'var(--accent)'}
              onBlur={e => e.target.style.borderColor = 'var(--border)'}
            />
          </div>

          {error && (
            <div style={{ marginTop: '12px', padding: '10px 14px', background: '#2a1020', border: '1px solid #5a2030', borderRadius: '10px', fontSize: '13px', color: '#ff8080' }}>
              {error}
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={loading || !email || !password}
            style={{
              width: '100%', marginTop: '16px', padding: '14px',
              background: loading || !email || !password ? 'var(--bg3)' : 'var(--accent)',
              color: loading || !email || !password ? 'var(--text-muted)' : '#0f0f13',
              border: 'none', borderRadius: '14px', fontSize: '15px',
              fontWeight: '700', cursor: loading || !email || !password ? 'not-allowed' : 'pointer',
            }}
          >
            {loading ? t('auth.loading') : tab === 'login' ? t('auth.loginBtn') : t('auth.registerBtn')}
          </button>
        </div>
      </div>
    </div>
  )
}

export default AuthPage