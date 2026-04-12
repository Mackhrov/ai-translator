import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { api } from '../utils/api'
import GlobePicker from './GlobePicker'

function AuthPage({ onLogin }) {
  const [tab, setTab] = useState('login')
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const { t } = useTranslation()

  function validate() {
    const e = {}
    if (!email.trim()) e.email = 'Введи email'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = 'Неверный формат email'
    if (!password) e.password = 'Введи пароль'
    else if (password.length < 6) e.password = 'Минимум 6 символов'
    if (tab === 'register') {
      if (!username.trim()) e.username = 'Введи имя пользователя'
      else if (username.length < 3) e.username = 'Минимум 3 символа'
      else if (!/^[a-zA-Z0-9_]+$/.test(username)) e.username = 'Только буквы, цифры и _'
      if (password !== confirmPassword) e.confirmPassword = 'Пароли не совпадают'
    }
    return e
  }

  async function handleSubmit() {
    const e = validate()
    if (Object.keys(e).length > 0) { setErrors(e); return }
    setErrors({})
    setLoading(true)
    try {
      let data
      if (tab === 'login') {
        data = await api.login(email, password)
      } else {
        data = await api.register(username, email, password)
      }
      localStorage.setItem('lingua_token', data.token)
      localStorage.setItem('lingua_username', data.username)
      onLogin(data.username)
    } catch (err) {
      setErrors({ server: err.message })
    } finally {
      setLoading(false)
    }
  }

  const inputStyle = (hasError) => ({
    width: '100%', padding: '12px 16px',
    background: 'var(--bg3)',
    border: `1px solid ${hasError ? 'var(--danger)' : 'var(--border)'}`,
    borderRadius: '12px', fontSize: '14px', color: 'var(--text)',
    outline: 'none', fontFamily: 'inherit', transition: 'border-color .15s',
  })

  const errMsg = (key) => errors[key] ? (
    <div style={{ fontSize: '12px', color: 'var(--danger)', marginTop: '4px', paddingLeft: '4px' }}>
      {errors[key]}
    </div>
  ) : null

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div style={{ width: '100%', maxWidth: '400px' }}>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
          <span style={{ fontSize: '14px', fontWeight: '800', color: 'var(--accent)', letterSpacing: '4px', textTransform: 'uppercase' }}>
            {t('appName')}
          </span>
          <GlobePicker />
        </div>

        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{ fontSize: '22px', fontWeight: '700', color: 'var(--text)', marginBottom: '6px' }}>
            {tab === 'login' ? t('auth.loginSubtitle') : t('auth.registerSubtitle')}
          </div>
        </div>

        <div style={{ background: 'var(--bg2)', borderRadius: '20px', padding: '28px', border: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', marginBottom: '24px', borderBottom: '1px solid var(--border)' }}>
            {['login', 'register'].map(tabName => (
              <button key={tabName} onClick={() => { setTab(tabName); setErrors({}) }}
                style={{ flex: 1, padding: '10px', background: 'transparent', border: 'none', borderBottom: `2px solid ${tab === tabName ? 'var(--accent)' : 'transparent'}`, color: tab === tabName ? 'var(--accent)' : 'var(--text3)', fontSize: '13px', fontWeight: tab === tabName ? '600' : '400', cursor: 'pointer' }}
              >
                {tabName === 'login' ? t('auth.login') : t('auth.register')}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
  {tab === 'register' && (
    <div>
      <input placeholder={t('auth.username')} value={username}
        onChange={e => { setUsername(e.target.value); setErrors(p => ({...p, username: ''})) }}
        style={inputStyle(errors.username)}
        onFocus={e => e.target.style.borderColor = 'var(--accent)'}
        onBlur={e => e.target.style.borderColor = errors.username ? 'var(--danger)' : 'var(--border)'}
      />
      {errMsg('username')}
    </div>
  )}

  <div>
    <input placeholder={t('auth.email')} type="email" value={email}
      onChange={e => { setEmail(e.target.value); setErrors(p => ({...p, email: ''})) }}
      style={inputStyle(errors.email)}
      onFocus={e => e.target.style.borderColor = 'var(--accent)'}
      onBlur={e => e.target.style.borderColor = errors.email ? 'var(--danger)' : 'var(--border)'}
    />
    {errMsg('email')}
  </div>

  <div>
    <input placeholder={t('auth.password')} type="password" value={password}
      onChange={e => { setPassword(e.target.value); setErrors(p => ({...p, password: ''})) }}
      onKeyDown={e => e.key === 'Enter' && !confirmPassword && handleSubmit()}
      style={inputStyle(errors.password)}
      onFocus={e => e.target.style.borderColor = 'var(--accent)'}
      onBlur={e => e.target.style.borderColor = errors.password ? 'var(--danger)' : 'var(--border)'}
    />
    {errMsg('password')}
  </div>

  {tab === 'register' && (
    <div>
      <input placeholder="Повтори пароль" type="password" value={confirmPassword}
        onChange={e => { setConfirmPassword(e.target.value); setErrors(p => ({...p, confirmPassword: ''})) }}
        onKeyDown={e => e.key === 'Enter' && handleSubmit()}
        style={inputStyle(errors.confirmPassword)}
        onFocus={e => e.target.style.borderColor = 'var(--accent)'}
        onBlur={e => e.target.style.borderColor = errors.confirmPassword ? 'var(--danger)' : 'var(--border)'}
      />
      {errMsg('confirmPassword')}
    </div>
            )}

            {tab === 'login' && (
              <input placeholder={t('auth.password')} type="password" value={password}
                onChange={e => { setPassword(e.target.value); setErrors(p => ({...p, password: ''})) }}
                onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                style={inputStyle(errors.password)}
                onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                onBlur={e => e.target.style.borderColor = errors.password ? 'var(--danger)' : 'var(--border)'}
              />
            )}
          </div>

          {errors.server && (
            <div style={{ marginTop: '12px', padding: '10px 14px', background: 'var(--bg4)', border: '1px solid var(--danger)', borderRadius: '10px', fontSize: '13px', color: 'var(--danger)' }}>
              {errors.server}
            </div>
          )}

          <button onClick={handleSubmit} disabled={loading}
            style={{ width: '100%', marginTop: '16px', padding: '14px', background: loading ? 'var(--bg4)' : 'var(--accent)', color: loading ? 'var(--text3)' : 'var(--accent-text)', border: 'none', borderRadius: '14px', fontSize: '15px', fontWeight: '700', cursor: loading ? 'not-allowed' : 'pointer' }}
          >
            {loading ? t('auth.loading') : tab === 'login' ? t('auth.loginBtn') : t('auth.registerBtn')}
          </button>
        </div>

        <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '12px', color: 'var(--text3)' }}>
          Lingua © {new Date().getFullYear()}
        </div>
      </div>
    </div>
  )
}

export default AuthPage