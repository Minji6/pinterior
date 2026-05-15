'use client';
import axios from 'axios';
import { useContext } from 'react';
import { ToastContext } from '@/contexts/ToastContext';

function BoardDeleteModal({ show, board, onClose, onDeleted }) {
    const { showToast } = useContext(ToastContext);

    const handleDelete = async () => {
        try {
            await axios.delete(`/api/boards/${board.boardId}`);
            onDeleted?.(board.boardId);
            onClose();
            showToast('보드가 삭제되었습니다.');
        } catch (err) {
            console.log(err);
            showToast('삭제 중 오류가 발생했습니다.', 'error');
        }
    };

    if (!show) return null;

    return (
        <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.4)', zIndex: 200 }}>
            <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content rounded-4 p-3">
                    <div className="modal-header border-0 justify-content-between">
                        <h5 className="modal-title fw-bold">이 보드를 삭제할까요?</h5>
                        <button className="btn-close" onClick={onClose} />
                    </div>
                    <div className="modal-body">
                        <p style={{ fontSize: 15 }}>
                            <strong>{board?.boardName}</strong> 보드와 핀 {board?.pinCount ?? 0}개가 프로필에서 삭제됩니다.
                        </p>
                        <p className="text-muted" style={{ fontSize: 13 }}>
                            보드는 영구적으로 삭제되며 복원할 수 없습니다.
                        </p>
                    </div>
                    <div className="modal-footer border-0 justify-content-end gap-2">
                        <button className="btn btn-light rounded-pill px-4" onClick={onClose}>
                            취소
                        </button>
                        <button
                            className="btn rounded-pill px-4 fw-bold"
                            style={{ backgroundColor: '#E60023', color: '#fff' }}
                            onClick={handleDelete}
                        >
                            삭제
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default BoardDeleteModal;