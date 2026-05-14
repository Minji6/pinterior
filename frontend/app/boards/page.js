'use client';
import { useState } from 'react';
import SavedContentHeader from '@/components/SavedContentHeader';
import BoardCreateModal from '@/components/BoardCreateModal';
import BoardList from './BoardList';

export default function BoardListContent() {
  const [showModal, setShowModal] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const handleCreated = () => {
    setRefreshKey(k => k + 1);
  };


  return (
    <div style={{ fontFamily: "'Noto Sans KR', sans-serif" }}>
      <SavedContentHeader activeTab="board" onCreateBoard={() => setShowModal(true)} />
      <div style={{ maxWidth: 1600, margin: '0 auto', padding: '0 16px' }}>
        <BoardList refreshKey={refreshKey} onOpenModal={() => setShowModal(true)} />
      </div>
      <BoardCreateModal
        show={showModal}
        onClose={() => setShowModal(false)}
        onCreated={handleCreated}
      />
    </div>
  );
}