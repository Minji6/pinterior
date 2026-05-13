'use client';
import { useState } from 'react';
import AppSidebar from '../components/AppSidebar';
import CreatePanel from '../components/CreatePanel';

export default function ClientLayout({ children }) {
    const [isCreateOpen, setIsCreateOpen] = useState(false);

    return (
        <div className="d-flex" style={{ minHeight: '100vh' }}>
            {/* 사이드바 — 일반 레이아웃 흐름 유지 */}
            <AppSidebar onCreateClick={() => setIsCreateOpen(!isCreateOpen)} />

            {/* CreatePanel — 사이드바 DOM 완전히 밖에서 렌더, stacking context 독립 */}
            <CreatePanel isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} />

            {/* 오른쪽 영역 */}
            <div className="d-flex flex-column flex-grow-1">
                {children}
            </div>
        </div>
    );
}
