function Footer() {
  return (
    <div style={{ textAlign: 'center', padding: '24px 0 8px', borderTop: '1px solid var(--border)', marginTop: '8px' }}>
      <div style={{ fontSize: '13px', fontWeight: '800', color: 'var(--accent)', letterSpacing: '3px', marginBottom: '6px' }}>
        LINGUA
      </div>
      <div style={{ fontSize: '12px', color: 'var(--text3)' }}>
        © {new Date().getFullYear()} — AI переводчик
      </div>
    </div>
  )
}

export default Footer