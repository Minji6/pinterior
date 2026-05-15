'use client';
import { useContext, useState } from 'react';
import axios from 'axios';
import { ToastContext } from '@/contexts/ToastContext';

function BoardCreateModal({ show, onClose, onCreated }) {
    const { showToast } = useContext(ToastContext);
    const [form, setForm] = useState({ name: '', description: '' });
    const isInvalid = form.name.trim() === '' || form.name.length > 50;

    const handleChange = (e) => {
        setForm(f => ({ ...f, [e.target.name]: e.target.value }));
    };

    const handleCreate = async () => {
        if (form.name.trim() === '') return;
        try {
            const res = await axios.post('/api/boards', {
                boardName: form.name,
                boardInfo: form.description
            });
            onCreated?.(res.data.data);
            onClose();
            setForm({ name: '', description: '' });
            showToast('보드가 생성되었습니다.');
        } catch (err) {
            console.log(err);
            showToast(err.response?.data?.message || '생성 중 오류가 발생했습니다.', 'error');
        }
    };

    const handleClose = () => {
        onClose();
        setForm({ name: '', description: '' });
    };

    if (!show) return null;

    return (
        <div className="modal d-block" style={{ backgroundColor: "rgba(0,0,0,0.4)" }}>
            <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content rounded-4 p-3">
                    <div className="modal-header border-0">
                        <h5 className="modal-title fw-bold">보드 만들기</h5>
                        <button className="btn-close" onClick={handleClose} />
                    </div>
                    <div className="modal-body">
                        <label className="form-label fw-semibold">보드 이름 *</label>
                        <input
                            className="form-control mb-1"
                            name="name"
                            value={form.name}
                            onChange={handleChange}
                            placeholder="보드 이름을 입력하세요"
                        />
                        {form.name.length > 50 && (
                            <p className="text-danger mb-2" style={{ fontSize: 12 }}>보드 이름은 50자 이하여야 합니다.</p>
                        )}
                        <label className="form-label fw-semibold mt-2">설명 (선택)</label>
                        <input
                            className="form-control"
                            name="description"
                            value={form.description}
                            onChange={handleChange}
                            placeholder="보드 설명을 입력하세요"
                        />
                    </div>
                    <div className="modal-footer border-0">
                        <button className="btn btn-outline-secondary rounded-pill px-4" onClick={handleClose}>
                            취소
                        </button>
                        <button className="btn btn-dark rounded-pill px-4" onClick={handleCreate} disabled={isInvalid}>
                            만들기
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default BoardCreateModal;