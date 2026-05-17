'use client';
import { ToastContext } from '@/contexts/ToastContext';
import axios from 'axios';
import { useContext, useState } from 'react';

function BoardEditModal({ show, board, onClose, onEdited, onDeleteClick }) {
    const { showToast } = useContext(ToastContext);
    // 보드 정보로 초기값 세팅
    const [form, setForm] = useState({
        boardName: board?.boardName ?? '',
        boardInfo: board?.boardInfo ?? '',
    });

    // 실시간 유효성 검증 -> 글자수
    const isInvalid = form.boardName.trim() === '' || form.boardName.length > 50;

    const handleChange = (e) => {
        setForm(f => ({ ...f, [e.target.name]: e.target.value }));
    };

    // 자식의 콜백 함수 요청 (부모에게 함수 실행 요청)
    const handleEdit = async () => {
        if (isInvalid) return;
        try {
            // 자식은 부모의 상태에 직접 접근할 수 없음
            // 사용자가 수정한 내용은 결과를 따로 담아 서버에 수정 요청을 보냄
            const res = await axios.put(`/api/boards/${board.boardId}`, {
                boardName: form.boardName,
                boardInfo: form.boardInfo,
            });
            // 자기 상태만 책임지고, 결과는 콜백으로 부모에 전달
            onEdited?.(res.data.data);
            // 모달 닫기
            onClose();
            showToast('보드가 수정되었습니다.');
        } catch (err) {
            console.log(err);
            showToast('수정 중 오류가 발생했습니다.', 'error');
        }
    };

    if (!show) return null;

    return (
        <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.4)', zIndex: 200 }}>
            <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content rounded-4 p-3">
                    <div className="modal-header border-0 justify-content-center position-relative">
                        <h5 className="modal-title fw-bold">보드 수정</h5>
                        <button className="btn-close position-absolute end-0 me-3" onClick={onClose} />
                    </div>
                    <div className="modal-body">
                        <label className="form-label fw-semibold">이름</label>
                        <input
                            className="form-control mb-1 rounded-3"
                            name="boardName"
                            value={form.boardName}
                            onChange={handleChange}
                        />
                        {form.boardName.length > 50 && (
                            <p className="text-danger mb-2" style={{ fontSize: 12 }}>보드 이름은 50자 이하여야 합니다.</p>
                        )}
                        <label className="form-label fw-semibold mt-2">설명</label>
                        <textarea
                            className="form-control rounded-3"
                            name="boardInfo"
                            value={form.boardInfo}
                            onChange={handleChange}
                            rows={3}
                            placeholder="무엇에 관한 보드인가요?"
                        />

                        {/* 보드 삭제 섹션 */}
                        <div className="mt-4">
                            <p className="text-muted mb-1" style={{ fontSize: 12 }}>작업</p>
                            <p
                                className="fw-bold mb-1"
                                style={{ fontSize: 15, cursor: 'pointer' }}
                                onClick={() => { onClose(); onDeleteClick?.(); }}
                            >
                                보드 삭제
                            </p>
                            <p className="text-muted" style={{ fontSize: 13 }}>삭제된 보드는 복원할 수 없습니다.</p>
                        </div>
                    </div>
                    <div className="modal-footer border-0 justify-content-center">

                        {/* 유효성 여부에 따라서 버튼 활성화 */}
                        <button
                            className="btn rounded-pill px-5 fw-bold"
                            style={{ backgroundColor: '#E60023', color: '#fff', fontSize: 15 }}
                            onClick={handleEdit}
                            disabled={isInvalid}
                        >
                            완료
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default BoardEditModal;