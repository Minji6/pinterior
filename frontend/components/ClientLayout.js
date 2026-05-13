'use client';
import { useState } from 'react';
import AppSidebar from '../components/AppSidebar';
import CreatePanel from '../components/CreatePanel';

export default function ClientLayout({ children }) {
    const [isCreateOpen, setIsCreateOpen] = useState(false);

    return (
        <div className="d-flex" style={{ minHeight: '100vh' }}>
            {/* 사이드바 고정 자리 확보용 spacer */}
            <div style={{ width: '80px', flexShrink: 0 }} />

            {/* 사이드바 — fixed로 항상 고정 */}
            <div style={{
                position: 'fixed',
                top: 0,
                left: 0,
                height: '100vh',
                zIndex: 200,
            }}>
                <AppSidebar onCreateClick={() => setIsCreateOpen(!isCreateOpen)} />
            </div>

            {/* 패널 — 사이드바 바로 옆에 fixed, 사이드바보다 z-index 낮음 */}
            <div style={{
                position: 'fixed',
                top: 0,
                left: '80px',
                height: '100vh',
                width: isCreateOpen ? '320px' : '0px',
                overflow: 'hidden',
                transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                zIndex: 100,
                background: '#fff',
                boxShadow: isCreateOpen ? '4px 0 16px rgba(0,0,0,0.08)' : 'none',
            }}>
                <CreatePanel isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} />
            </div>

            {/* 오른쪽 콘텐츠 영역 — 패널 열리면 밀림 */}
            <div className="d-flex flex-column flex-grow-1" style={{
                marginLeft: isCreateOpen ? '320px' : '0',
                transition: 'margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            }}>
                {children}
            </div>
        </div>
    );
}
