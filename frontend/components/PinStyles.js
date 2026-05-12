'use client';
import { useState } from 'react';

export function BoardBtn({ label, onClick }) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width: '100%', textAlign: 'left', border: 'none',
        backgroundColor: hovered ? '#f0f0f0' : 'transparent',
        padding: '8px 4px', borderRadius: '8px',
        cursor: 'pointer', fontSize: '0.875rem', fontWeight: '500',
      }}
    >
      {label}
    </button>
  );
}

export const saveBtnStyle = {
  backgroundColor: '#E60023', color: '#fff',
  border: 'none', borderRadius: '24px',
  padding: '10px 20px', fontWeight: '700',
  fontSize: '0.9rem', cursor: 'pointer',
};

export const savedBtnStyle = {
  backgroundColor: '#111', color: '#fff',
  border: 'none', borderRadius: '24px',
  padding: '10px 20px', fontWeight: '700',
  fontSize: '0.9rem', cursor: 'pointer',
};

export const boardModalStyle = {
  position: 'absolute', top: '48px', right: 0,
  backgroundColor: '#fff', borderRadius: '16px',
  boxShadow: '0 4px 24px rgba(0,0,0,0.15)',
  padding: '12px', minWidth: '200px', zIndex: 100,
};

export const dropdownStyle = {
  position: 'absolute', top: 44, right: 8,
  backgroundColor: '#fff', borderRadius: '16px',
  boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
  padding: '12px', minWidth: '160px', zIndex: 10,
};
