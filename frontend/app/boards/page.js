'use client';
import { useState } from 'react';
import SavedContentHeader from '@/components/SavedContentHeader';
import BoardCreateModal from '@/components/BoardCreateModal';
import BoardList from './BoardList';

export default function BoardListContent() {
  const [showModal, setShowModal] = useState(false);
  const [newBoard, setNewBoard] = useState(null);

  return (
    <div style={{ fontFamily: "'Noto Sans KR', sans-serif" }}>
      <SavedContentHeader activeTab="board" onCreateBoard={() => setShowModal(true)} />
      <div style={{ maxWidth: 1600, margin: '0 auto', padding: '0 16px' }}>
        <BoardList newBoard={newBoard} onOpenModal={() => setShowModal(true)} />
      </div>
      <BoardCreateModal
        show={showModal}
        onClose={() => setShowModal(false)}
        onCreated={(board) => setNewBoard(board)}
      />
    </div>
  );
}