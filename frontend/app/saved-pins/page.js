'use client';
import { useState } from 'react';
import SavedContentHeader from '@/components/SavedContentHeader';
import BoardCreateModal from '@/components/BoardCreateModal';
import PinList from './PinList';

export default function SavedPinsPage() {
    const [showModal, setShowModal] = useState(false);

    return (
        <div style={{ fontFamily: "'Noto Sans KR', sans-serif" }}>
            <SavedContentHeader activeTab="pin" onCreateBoard={() => setShowModal(true)} />
            <div style={{margin: '0 auto', padding: '0 16px' }}>
                <PinList />
            </div>
            <BoardCreateModal
                show={showModal}
                onClose={() => setShowModal(false)}
            />
        </div>
    );
}