function ErrorBox({ message, onRetry }) {
  if (!message) return null

  const isWarning = message.includes('разные языки')

  return (
    <div style={{
      marginTop: '12px',
      padding: '14px 16px',
      background: isWarning ? '#1e1a0a' : '#2a1020',
      border: `1px solid ${isWarning ? '#4a3a0a' : '#5a2030'}`,
      borderRadius: '14px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '12px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div style={{
          width: '8px',
          height: '8px',
          borderRadius: '50%',
          background: isWarning ? '#f0c060' : '#ff6060',
          flexShrink: 0,
        }}/>
        <span style={{ fontSize: '14px', color: isWarning ? '#f0c060' : '#ff8080', lineHeight: '1.4' }}>
          {message}
        </span>
      </div>

      {onRetry && !isWarning && (
        <button
          onClick={onRetry}
          style={{
            flexShrink: 0,
            fontSize: '12px',
            padding: '5px 12px',
            border: '1px solid #5a2030',
            borderRadius: '100px',
            background: 'transparent',
            color: '#ff8080',
            cursor: 'pointer',
          }}
        >
          Повторить
        </button>
      )}
    </div>
  )
}

export default ErrorBox