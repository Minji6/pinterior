'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { X } from 'lucide-react';

function getToken() { return localStorage.getItem('token'); }
function getUserId() { return Number(localStorage.getItem('userId')); }

export default function PinUpdatePanel({ pinId, onClose }) {
    const router = useRouter();

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [error, setError] = useState('');
    const [slideIn, setSlideIn] = useState(false);

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [linkUrl, setLinkUrl] = useState('');
    const [tagInput, setTagInput] = useState('');
    const [tags, setTags] = useState([]);
    const [composing, setComposing] = useState(false);
    const [pinImage, setPinImage] = useState('');
    const [boards, setBoards] = useState([]);
    const [boardId, setBoardId] = useState('');

    useEffect(() => {
        setTimeout(() => setSlideIn(true), 10);
    }, []);

    useEffect(() => {
        if (!pinId) return;
        const fetchPin = async () => {
            try {
                const [pinRes, boardRes] = await Promise.all([
                    axios.get(`/api/pins/${pinId}`, { headers: { Authorization: `Bearer ${getToken()}` } }),
                    axios.get(`/api/boards/user/${getUserId()}`, { headers: { Authorization: `Bearer ${getToken()}` } }),
                ]);
                const pin = pinRes.data.data;
                setTitle(pin.title || '');
                setDescription(pin.description || '');
                setLinkUrl(pin.linkUrl || '');
                setTags(pin.tags || []);
                setPinImage(pin.imageUrl || '');
                setBoards(boardRes.data.data || []);
                setBoardId(pin.boardId ? String(pin.boardId) : '');
            } catch (e) {
                console.error(e);
                setError('핀 데이터를 불러오지 못했습니다.');
            } finally {
                setLoading(false);
            }
        };

        fetchPin();
    }, [pinId]);

    const handleClose = () => {
        setSlideIn(false);
        setTimeout(() => onClose(), 300);
    };

    const addTag = () => {
        const trimmed = tagInput.trim();
        if (trimmed && !tags.includes(trimmed) && tags.length < 10) {
            setTags([...tags, trimmed]);
            setTagInput('');
        }
    };
    const handleTagKeyDown = (e) => {
        if (composing) return;
        if (e.key === 'Enter') { e.preventDefault(); addTag(); }
        if (e.key === 'Backspace' && !tagInput && tags.length > 0) setTags(tags.slice(0, -1));
    };
    const removeTag = (tag) => setTags(tags.filter(t => t !== tag));

    const handleSubmit = async () => {
        if (!title.trim()) { setError('제목을 입력해주세요.'); return; }
        setError('');
        setSubmitting(true);
        try {
            await axios.put(`/api/pins/${pinId}`, {
                userId: getUserId(),
                title: title.trim(),
                description: description.trim(),
                linkUrl: linkUrl.trim(),
                tags,
                boardId: boardId ? Number(boardId) : null,
            }, {
                headers: {
                    Authorization: `Bearer ${getToken()}`,
                    'Content-Type': 'application/json',
                },
            });
            setSlideIn(false);
            setTimeout(() => onClose(), 300);
        } catch (e) {
            console.error(e);
            setError('수정 중 오류가 발생했습니다. 다시 시도해주세요.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm('핀을 삭제하시겠습니까?')) return;
        setDeleting(true);
        try {
            await axios.delete(`/api/pins/${pinId}`, {
                headers: { Authorization: `Bearer ${getToken()}` },
            });
            router.replace('/feed');
        } catch (e) {
            console.error(e);
            setError('삭제 중 오류가 발생했습니다.');
            setDeleting(false);
        }
    };

    return (
        <>
            {/* 배경 오버레이 */}
            <div
                onClick={handleClose}
                style={{
                    position: 'fixed', inset: 0,
                    background: 'rgba(0,0,0,0.5)',
                    zIndex: 300,
                    opacity: slideIn ? 1 : 0,
                    transition: 'opacity 0.3s ease',
                }}
            />

            {/* 슬라이드 패널 — 오른쪽에서 왼쪽으로 */}
            <div style={{
                position: 'fixed',
                top: 0, right: 0,
                width: '400px', height: '100vh',
                background: '#fff',
                zIndex: 301,
                display: 'flex', flexDirection: 'column',
                transform: slideIn ? 'translateX(0)' : 'translateX(100%)',
                transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                boxShadow: '-4px 0 24px rgba(0,0,0,0.12)',
            }}>
                {/* 헤더 */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px', borderBottom: '1px solid #efefef' }}>
                    <span style={{ fontSize: '20px', fontWeight: '700' }}>핀 수정</span>
                    <button onClick={handleClose} style={{ border: 'none', background: 'none', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center' }}>
                        <X size={22} />
                    </button>
                </div>

                {/* 본문 */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
                    {loading ? (
                        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px', color: '#767676' }}>불러오는 중...</div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            {pinImage && (
                                <img src={`/api/pins/${pinId}/image`} alt="핀 이미지" style={{ width: '100%', maxHeight: '200px', objectFit: 'cover', borderRadius: '16px' }} />
                            )}
                            {error && (
                                <div style={{ padding: '10px 14px', background: '#fff0f0', border: '1px solid #fcc', borderRadius: '10px', color: '#E60023', fontSize: '13px' }}>{error}</div>
                            )}
                            <div>
                                <label style={labelStyle}>제목</label>
                                <input type="text" placeholder="제목 추가" value={title} onChange={(e) => setTitle(e.target.value)} maxLength={100} style={inputStyle} onFocus={e => e.target.style.borderColor = '#111'} onBlur={e => e.target.style.borderColor = '#ddd'} />
                            </div>
                            <div>
                                <label style={labelStyle}>설명</label>
                                <textarea placeholder="설명 추가" value={description} onChange={(e) => setDescription(e.target.value)} maxLength={500} rows={4} style={{ ...inputStyle, resize: 'none', lineHeight: '1.6' }} onFocus={e => e.target.style.borderColor = '#111'} onBlur={e => e.target.style.borderColor = '#ddd'} />
                            </div>
                            <div>
                                <label style={labelStyle}>링크</label>
                                <input type="url" placeholder="링크 추가" value={linkUrl} onChange={(e) => setLinkUrl(e.target.value)} style={inputStyle} onFocus={e => e.target.style.borderColor = '#111'} onBlur={e => e.target.style.borderColor = '#ddd'} />
                            </div>
                            <div>
                                <label style={labelStyle}>태그 ({tags.length}/10)</label>
                                <div style={{ ...inputStyle, display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center', minHeight: '52px', padding: '8px 14px', cursor: 'text' }} onClick={() => document.getElementById('update-tag-input').focus()}>
                                    {tags.map(tag => (
                                        <span key={tag} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: '#efefef', borderRadius: '20px', padding: '4px 10px', fontSize: '13px', fontWeight: '500' }}>
                                            {tag}
                                            <button onClick={(e) => { e.stopPropagation(); removeTag(tag); }} style={{ border: 'none', background: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center' }}>
                                                <X size={11} />
                                            </button>
                                        </span>
                                    ))}
                                    <input id="update-tag-input" type="text" placeholder={tags.length === 0 ? '태그 추가' : ''} value={tagInput} onChange={(e) => setTagInput(e.target.value)} onKeyDown={handleTagKeyDown} onCompositionStart={() => setComposing(true)} onCompositionEnd={() => setComposing(false)} style={{ border: 'none', outline: 'none', background: 'transparent', fontSize: '14px', flex: 1, minWidth: '80px' }} />
                                </div>
                            <div>
                                <label style={labelStyle}>보드</label>
                                <select
                                    value={boardId}
                                    onChange={(e) => setBoardId(e.target.value)}
                                    style={{ ...inputStyle, appearance: 'none', cursor: 'pointer' }}
                                >
                                    <option value="">보드 선택 (선택사항)</option>
                                    {boards.map(b => (
                                        <option key={b.boardId} value={b.boardId}>{b.boardName}</option>
                                    ))}
                                </select>
                            </div>
                                <p style={{ fontSize: '12px', color: '#767676', marginTop: '6px' }}>미선택 시 보드 없이 저장</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* 하단 버튼 */}
                <div style={{ padding: '16px 24px', borderTop: '1px solid #efefef', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                    <button onClick={handleDelete} disabled={deleting} style={{ padding: '12px 24px', borderRadius: '24px', border: 'none', background: deleting ? '#ccc' : '#efefef', fontWeight: '600', fontSize: '15px', cursor: deleting ? 'not-allowed' : 'pointer' }}>
                        {deleting ? '삭제 중...' : '삭제'}
                    </button>
                    <button onClick={handleSubmit} disabled={submitting} style={{ padding: '12px 24px', borderRadius: '24px', border: 'none', background: submitting ? '#ccc' : '#E60023', color: '#fff', fontWeight: '600', fontSize: '15px', cursor: submitting ? 'not-allowed' : 'pointer' }}>
                        {submitting ? '저장 중...' : '저장'}
                    </button>
                </div>
            </div>
        </>
    );
}

const labelStyle = {
    display: 'block', fontSize: '14px', fontWeight: '600', color: '#111', marginBottom: '8px',
};

const inputStyle = {
    width: '100%', padding: '12px 14px', borderRadius: '16px',
    border: '1px solid #ddd', fontSize: '14px', color: '#111',
    background: '#f8f8f8', outline: 'none', boxSizing: 'border-box',
    transition: 'border-color 0.2s',
};
