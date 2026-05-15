'use client';
import { createContext, useState, useCallback } from 'react';

export const ToastContext = createContext();

export function ToastContextProvider({ children }) {
    const [toasts, setToasts] = useState([]);

    // 토스트 추가
    const showToast = useCallback((message, type = 'success') => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, message, type }]);
        // 3초 후 자동 제거
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, 3000);
    }, []);

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            {/* 토스트 렌더링 */}
            <div style={{
                position: 'fixed',
                bottom: 32,
                left: '50%',
                transform: 'translateX(-50%)',
                zIndex: 9999,
                display: 'flex',
                flexDirection: 'column',
                gap: 10,
                alignItems: 'center',
            }}>
                {toasts.map(t => (
                    <div key={t.id} style={{
                        padding: '12px 24px',
                        borderRadius: 24,
                        background: t.type === 'error' ? '#E60023' : '#111',
                        color: '#fff',
                        fontSize: 14,
                        fontWeight: 600,
                        boxShadow: '0 4px 16px rgba(0,0,0,0.18)',
                        whiteSpace: 'nowrap',
                        animation: 'fadeInUp 0.25s ease',
                    }}>
                        {t.message}
                    </div>
                ))}
            </div>
            <style>{`
                @keyframes fadeInUp {
                    from { opacity: 0; transform: translateY(12px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </ToastContext.Provider>
    );
}