'use client';
import { useState } from 'react';
import axios from 'axios';

function SavedPinEditModal({ show, savedPin, boards: initialBoards, onClose, onSaved, onDeleted }) {
    const [boards, setBoards] = useState(initialBoards ?? []);
    const [selectedBoardId, setSelectedBoardId] = useState(savedPin?.boardId ?? null);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [newBoardName, setNewBoardName] = useState('');
    const [creating, setCreating] = useState(false);

    const selectedBoard = boards.find(b => b.boardId === selectedBoardId);

    // 보드 선택
    const handleSelectBoard = (boardId) => {
        setSelectedBoardId(boardId);
        setDropdownOpen(false);
    };

    // 새 보드 만들기 + 핀 이동
    const handleCreateBoard = async () => {
        if (!newBoardName.trim()) return;
        setCreating(true);
        try {
            const resBoard = await axios.post('/api/boards', { boardName: newBoardName.trim() });
            const created = resBoard.data.data;
            setBoards(prev => [...prev, created]);
            setSelectedBoardId(created.boardId);
            setNewBoardName('');
            setDropdownOpen(false);
        } catch (err) {
            console.log(err);
        } finally {
            setCreating(false);
        }
    };

    // 저장 (기존 삭제 후 새로 저장)
    const handleSave = async () => {
        try {
            await axios.delete(`/api/saved-pins/${savedPin.savedPinId}`);
            const res = await axios.post('/api/saved-pins', {
                pinId: savedPin.pinId,
                boardId: selectedBoardId,
            });
            onSaved?.(savedPin.savedPinId, res.data.data);
            onClose();
        } catch (err) {
            console.log(err);
        }
    };

    // 삭제
    const handleDelete = async () => {
        try {
            await axios.delete(`/api/saved-pins/${savedPin.savedPinId}`);
            onDeleted?.(savedPin.savedPinId);
            onClose();
        } catch (err) {
            console.log(err);
        }
    };

    if (!show) return null;

    return (
        <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.4)', zIndex: 200 }}>
            <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: 740 }}>
                <div className="modal-content rounded-4 p-4">
                    {/* 제목 */}
                    <div className="text-center mb-4">
                        <h5 className="fw-bold" style={{ fontSize: 20 }}>이 핀 수정하기</h5>
                    </div>

                    <div className="d-flex gap-4">
                        {/* 왼쪽 — 보드 선택 */}
                        <div style={{ flex: 1 }}>
                            <p className="fw-semibold mb-2" style={{ fontSize: 14 }}>보드</p>

                            {/* 보드 선택 드롭다운 트리거 */}
                            <div
                                className="d-flex justify-content-between align-items-center px-3 py-2 rounded-3"
                                style={{ backgroundColor: '#efefef', cursor: 'pointer', fontSize: 15, fontWeight: 600 }}
                                onClick={() => setDropdownOpen(prev => !prev)}
                            >
                                <span>{selectedBoard?.boardName ?? '프로필'}</span>
                                <span style={{ fontSize: 12 }}>▼</span>
                            </div>

                            {/* 드롭다운 */}
                            {dropdownOpen && (
                                <div className="rounded-3 mt-1"
                                    style={{ border: '1px solid #ddd', backgroundColor: '#fff', maxHeight: 260, overflowY: 'auto', zIndex: 10, position: 'relative' }}>
                                    {/* 검색 + 만들기 */}
                                    <div className="d-flex align-items-center gap-2 px-3 py-2" style={{ borderBottom: '1px solid #eee' }}>
                                        <input
                                            className="form-control form-control-sm"
                                            placeholder="검색"
                                            value={newBoardName}
                                            onChange={(e) => setNewBoardName(e.target.value)}
                                            onKeyDown={(e) => { if (e.key === 'Enter') handleCreateBoard(); }}
                                        />
                                        <button
                                            className="btn btn-light btn-sm rounded-pill px-3 fw-semibold flex-shrink-0"
                                            onClick={handleCreateBoard}
                                            disabled={creating || !newBoardName.trim()}
                                        >
                                            만들기
                                        </button>
                                    </div>

                                    {/* 프로필 (board_id null) */}
                                    <div
                                        className="px-3 py-2"
                                        style={{ cursor: 'pointer', fontWeight: selectedBoardId === null ? 700 : 400, fontSize: 15 }}
                                        onClick={() => handleSelectBoard(null)}
                                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f5f5f5'}
                                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                    >
                                        프로필
                                    </div>

                                    {/* 보드 목록 */}
                                    {boards
                                        .filter(b => b.boardName.toLowerCase().includes(newBoardName.toLowerCase()))
                                        .map(b => (
                                            <div
                                                key={b.boardId}
                                                className="px-3 py-2"
                                                style={{ cursor: 'pointer', fontWeight: b.boardId === selectedBoardId ? 700 : 400, fontSize: 15 }}
                                                onClick={() => handleSelectBoard(b.boardId)}
                                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f5f5f5'}
                                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                            >
                                                {b.boardName}
                                            </div>
                                        ))
                                    }
                                </div>
                            )}
                        </div>

                        {/* 오른쪽 — 핀 이미지 */}
                        {savedPin?.imageUrl && (
                            <div style={{ flex: 1 }}>
                                <img
                                    src={savedPin.imageUrl}
                                    alt=""
                                    style={{ width: '100%', borderRadius: 16, objectFit: 'cover', maxHeight: 300 }}
                                />
                            </div>
                        )}
                    </div>

                    {/* 하단 버튼 */}
                    <div className="d-flex justify-content-between align-items-center mt-4">
                        <button className="btn btn-light rounded-pill px-4" onClick={handleDelete}>
                            삭제
                        </button>
                        <div className="d-flex gap-2">
                            <button className="btn btn-light rounded-pill px-4" onClick={onClose}>
                                취소
                            </button>
                            <button
                                className="btn rounded-pill px-4 fw-bold"
                                style={{ backgroundColor: '#E60023', color: '#fff' }}
                                onClick={handleSave}
                            >
                                저장
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default SavedPinEditModal;