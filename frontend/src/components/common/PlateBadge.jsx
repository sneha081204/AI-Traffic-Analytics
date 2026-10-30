import React from 'react';

export const PlateBadge = ({ plate, size = 'md' }) => {
  const isLg = size === 'lg';
  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.4rem',
        backgroundColor: '#FEF08A',
        color: '#000000',
        border: '2px solid #000000',
        borderRadius: '4px',
        padding: isLg ? '0.35rem 0.75rem' : '0.2rem 0.55rem',
        fontFamily: 'var(--font-mono)',
        fontWeight: 800,
        fontSize: isLg ? '1rem' : '0.85rem',
        letterSpacing: '0.08em',
        boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
      }}
    >
      <span
        style={{
          backgroundColor: '#2563EB',
          color: '#FFFFFF',
          fontSize: isLg ? '0.65rem' : '0.55rem',
          padding: '0.1rem 0.25rem',
          borderRadius: '2px',
          fontWeight: 900,
        }}
      >
        IND
      </span>
      <span>{plate || 'UNIDENTIFIED'}</span>
    </div>
  );
};
