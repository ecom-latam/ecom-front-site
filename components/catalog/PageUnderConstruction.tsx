export function PageUnderConstruction() {
  return (
    <div style={{
      display:        'flex',
      flexDirection:  'column',
      alignItems:     'center',
      justifyContent: 'center',
      minHeight:      '60vh',
      padding:        '48px 24px',
      textAlign:      'center',
      gap:            28,
    }}>
      <img
        src="/illustrations/construction-workers.webp"
        alt=""
        aria-hidden="true"
        style={{ objectFit: 'contain', width: '50vw', height: 'auto', maxWidth: 600 }}
      />

      <div style={{ maxWidth: 320 }}>
        <p style={{
          fontSize:   20,
          fontWeight: 700,
          color:      'var(--color-fg-primary)',
          margin:     '0 0 8px',
          lineHeight: 1.3,
        }}>
          Estamos armando esta página
        </p>
        <p style={{
          fontSize:   14,
          color:      'var(--color-fg-muted)',
          margin:     0,
          lineHeight: 1.5,
        }}>
          Volvé pronto, viene algo bueno.
        </p>
      </div>
    </div>
  );
}
