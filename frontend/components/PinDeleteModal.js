'use client';

function PinDeleteModal({ show, onClose, onDeleted }) {

    const handleDelete = async () => {
    try {
        await onDeleted?.();
        onClose(); // 성공했을 때만 닫힘
    } catch (err) {
        // 실패 시 모달 유지
        console.log(err);
    }
};

    if (!show) return null;

    return (
        <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.4)', zIndex: 200 }}>
            <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content rounded-4 p-3">
                    <div className="modal-header border-0 justify-content-between">
                        <h5 className="modal-title fw-bold">이 핀을 삭제할까요?</h5>
                        <button className="btn-close" onClick={onClose} />
                    </div>
                    <div className="modal-body">
                        <p className="text-muted" style={{ fontSize: 13 }}>
                            핀은 영구적으로 삭제되며 복원할 수 없습니다.
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

export default PinDeleteModal;