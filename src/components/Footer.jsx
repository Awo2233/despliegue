import React from 'react';

export default function Footer() {
  return (
    <footer
      style={{
        padding: 12,
        background: 'transparent',
        borderTop: '1px solid var(--surface-border)',
        textAlign: 'center'
      }}
    >
      <small style={{ color: 'var(--color-muted)' }}>
        © {new Date().getFullYear()} JBSOPTICS — Todos los derechos 2025
      </small>
    </footer>
  );
}
