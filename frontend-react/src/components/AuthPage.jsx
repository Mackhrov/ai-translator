import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import GlobePicker from './GlobePicker'
import { api } from '../utils/api'
import { parseError } from '../utils/errors'

function AuthPage({ onLogin }) {
  const [tab, setTab] = useState('login')
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const { t, i18n } = useTranslation()
  const isRussian = i18n.language?.startsWith('ru')

  function switchTab(nextTab) {
    setTab(nextTab)
    setErrors({})
    setPassword('')
    setConfirmPassword('')
  }

  function validate() {
    const nextErrors = {}

    if (!email.trim()) {
      nextErrors.email = t('auth.errors.emailRequired', { defaultValue: isRussian ? 'Введи email' : 'Enter email' })
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      nextErrors.email = t('auth.errors.emailInvalid', { defaultValue: isRussian ? 'Неверный формат email' : 'Invalid email format' })
    }

    if (!password) {
      nextErrors.password = t('auth.errors.passwordRequired', { defaultValue: isRussian ? 'Введи пароль' : 'Enter password' })
    } else if (password.length < 6) {
      nextErrors.password = t('auth.errors.passwordShort')
    }

    if (tab === 'register') {
      if (!username.trim()) {
        nextErrors.username = t('auth.errors.usernameRequired')
      } else if (username.length < 3) {
        nextErrors.username = t('auth.errors.usernameShort', { defaultValue: isRussian ? 'Имя должно быть не короче 3 символов' : 'Username must be at least 3 characters' })
      } else if (!/^[a-zA-Z0-9_]+$/.test(username)) {
        nextErrors.username = t('auth.errors.usernameInvalid', { defaultValue: isRussian ? 'Используй только буквы, цифры и _' : 'Use only letters, numbers and _' })
      }

      if (!confirmPassword) {
        nextErrors.confirmPassword = t('auth.errors.confirmPasswordRequired', { defaultValue: isRussian ? 'Повтори пароль' : 'Confirm password' })
      } else if (password !== confirmPassword) {
        nextErrors.confirmPassword = t('auth.errors.passwordMismatch', { defaultValue: isRussian ? 'Пароли не совпадают' : 'Passwords do not match' })
      }
    }

    return nextErrors
  }

  async function handleSubmit() {
    const nextErrors = validate()
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors)
      return
    }

    setErrors({})
    setLoading(true)

    try {
      const data = tab === 'login'
        ? await api.login(email, password)
        : await api.register(username, email, password)

      localStorage.setItem('lingua_token', data.token)
      localStorage.setItem('lingua_username', data.username)
      onLogin(data.username)
    } catch (err) {
      setErrors({ server: parseError(err, t) })
    } finally {
      setLoading(false)
    }
  }

  const inputStyle = (hasError) => ({
    width: '100%',
    padding: '12px 16px',
    background: 'var(--bg3)',
    border: `1px solid ${hasError ? 'var(--danger)' : 'var(--border)'}`,
    borderRadius: '12px',
    fontSize: '14px',
    color: 'var(--text)',
    outline: 'none',
    fontFamily: 'inherit',
    transition: 'border-color .15s',
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
            {['login', 'register'].map((tabName) => (
              <button
                key={tabName}
                onClick={() => switchTab(tabName)}
                style={{
                  flex: 1,
                  padding: '10px',
                  background: 'transparent',
                  border: 'none',
                  borderBottom: `2px solid ${tab === tabName ? 'var(--accent)' : 'transparent'}`,
                  color: tab === tabName ? 'var(--accent)' : 'var(--text3)',
                  fontSize: '13px',
                  fontWeight: tab === tabName ? '600' : '400',
                  cursor: 'pointer',
                }}
              >
                {tabName === 'login' ? t('auth.login') : t('auth.register')}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {tab === 'register' && (
              <div>
                <input
                  placeholder={t('auth.username')}
                  value={username}
                  onChange={(event) => {
                    setUsername(event.target.value)
                    setErrors((prev) => ({ ...prev, username: '' }))
                  }}
                  style={inputStyle(errors.username)}
                  onFocus={(event) => { event.target.style.borderColor = 'var(--accent)' }}
                  onBlur={(event) => { event.target.style.borderColor = errors.username ? 'var(--danger)' : 'var(--border)' }}
                />
                {errMsg('username')}
              </div>
            )}

            <div>
              <input
                placeholder={t('auth.email')}
                type="email"
                value={email}
                onChange={(event) => {
                  setEmail(event.target.value)
                  setErrors((prev) => ({ ...prev, email: '' }))
                }}
                style={inputStyle(errors.email)}
                onFocus={(event) => { event.target.style.borderColor = 'var(--accent)' }}
                onBlur={(event) => { event.target.style.borderColor = errors.email ? 'var(--danger)' : 'var(--border)' }}
              />
              {errMsg('email')}
            </div>

            <div>
              <input
                placeholder={t('auth.password')}
                type="password"
                value={password}
                onChange={(event) => {
                  setPassword(event.target.value)
                  setErrors((prev) => ({ ...prev, password: '' }))
                }}
                onKeyDown={(event) => event.key === 'Enter' && tab === 'login' && handleSubmit()}
                style={inputStyle(errors.password)}
                onFocus={(event) => { event.target.style.borderColor = 'var(--accent)' }}
                onBlur={(event) => { event.target.style.borderColor = errors.password ? 'var(--danger)' : 'var(--border)' }}
              />
              {errMsg('password')}
            </div>

            {tab === 'register' && (
              <div>
                <input
                  placeholder={t('auth.confirmPassword', { defaultValue: isRussian ? 'Повтори пароль' : 'Confirm password' })}
                  type="password"
                  value={confirmPassword}
                  onChange={(event) => {
                    setConfirmPassword(event.target.value)
                    setErrors((prev) => ({ ...prev, confirmPassword: '' }))
                  }}
                  onKeyDown={(event) => event.key === 'Enter' && handleSubmit()}
                  style={inputStyle(errors.confirmPassword)}
                  onFocus={(event) => { event.target.style.borderColor = 'var(--accent)' }}
                  onBlur={(event) => { event.target.style.borderColor = errors.confirmPassword ? 'var(--danger)' : 'var(--border)' }}
                />
                {errMsg('confirmPassword')}
              </div>
            )}
          </div>

          {errors.server && (
            <div style={{ marginTop: '12px', padding: '10px 14px', background: 'var(--bg4)', border: '1px solid var(--danger)', borderRadius: '10px', fontSize: '13px', color: 'var(--danger)' }}>
              {errors.server}
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={loading}
            style={{
              width: '100%',
              marginTop: '16px',
              padding: '14px',
              background: loading ? 'var(--bg4)' : 'var(--accent)',
              color: loading ? 'var(--text3)' : 'var(--accent-text)',
              border: 'none',
              borderRadius: '14px',
              fontSize: '15px',
              fontWeight: '700',
              cursor: loading ? 'not-allowed' : 'pointer',
            }}
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
