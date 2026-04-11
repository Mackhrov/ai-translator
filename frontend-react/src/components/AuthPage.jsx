import { useState } from 'react'
import { api } from '../utils/api'

function AuthPage({ onLogin }) {
  const [tab, setTab] = useState('login')
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit() {
    setError('')
    setLoading(true)
    try {
      let data
      if (tab === 'login') {
        data = await api.login(email, password)
      } else {
        if (!username.trim()) { setError('Введи имя пользователя'); setLoading(false); return }
        if (password.length < 6) { setError('Пароль минимум 6 символов'); setLoading(false); return }
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
    width: '100%',
    padding: '12px 16px',
    background: '#0f0f13',
    border: '1px solid var(--border)',
    borderRadius: '12px',
    fontSize: '14px',
    color: 'var(--text)',
    outline: 'none',
    fontFamily: 'inherit',
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div style={{ width: '100%', maxWidth: '400px' }}>

        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ fontSize: '13px', fontWeight: '700', color: 'var(--accent)', letterSpacing: '3px', textTransform: 'uppercase', marginBottom: '8px' }}>
            Lingua
          </div>
          <div style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
            {tab === 'login' ? 'Войди в свой аккаунт' : 'Создай аккаунт'}
          </div>
        </div>

        <div style={{ background: 'var(--bg2)', borderRadius: '20px', padding: '28px', border: '1px solid var(--border)' }}>

          <div style={{ display: 'flex', marginBottom: '24px', borderBottom: '1px solid var(--border)' }}>
            {['login', 'register'].map(t => (
              <button
                key={t}
                onClick={() => { setTab(t); setError('') }}
                style={{
                  flex: 1,
                  padding: '10px',
                  background: 'transparent',
                  border: 'none',
                  borderBottom: `2px solid ${tab === t ? 'var(--accent)' : 'transparent'}`,
                  color: tab === t ? 'var(--accent)' : 'var(--text-muted)',
                  fontSize: '13px',
                  fontWeight: tab === t ? '600' : '400',
                  cursor: 'pointer',
                }}
              >
                {t === 'login' ? 'Войти' : 'Регистрация'}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {tab === 'register' && (
              <input
                placeholder="Имя пользователя"
                value={username}
                onChange={e => setUsername(e.target.value)}
                style={inputStyle}
                onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                onBlur={e => e.target.style.borderColor = 'var(--border)'}
              />
            )}

            <input
              placeholder="Email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              style={inputStyle}
              onFocus={e => e.target.style.borderColor = 'var(--accent)'}
              onBlur={e => e.target.style.borderColor = 'var(--border)'}
            />

            <input
              placeholder="Пароль"
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
              width: '100%',
              marginTop: '16px',
              padding: '14px',
              background: loading || !email || !password ? 'var(--bg3)' : 'var(--accent)',
              color: loading || !email || !password ? 'var(--text-muted)' : '#0f0f13',
              border: 'none',
              borderRadius: '14px',
              fontSize: '15px',
              fontWeight: '700',
              cursor: loading || !email || !password ? 'not-allowed' : 'pointer',
            }}
          >
            {loading ? 'Загрузка...' : tab === 'login' ? 'Войти →' : 'Создать аккаунт →'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default AuthPage