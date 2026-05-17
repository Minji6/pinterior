'use client';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { X, Upload, Plus } from 'lucide-react';

function getToken() { return localStorage.getItem('token'); }
function getUserId() { return Number(localStorage.getItem('userId')); }

export default function PinCreatePage() {
    const router = useRouter();

    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [linkUrl, setLinkUrl] = useState('');
    const [tagInput, setTagInput] = useState('');
    const [tags, setTags] = useState([]);
    const [boardId, setBoardId] = useState('');
    const [boards, setBoards] = useState([]);
    const [isDragging, setIsDragging] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [toast, setToast] = useState('');

    const fileInputRef = useRef(null);
    const [mounted, setMounted] = useState(false);
    const [composing, setComposing] = useState(false);

    useEffect(() => { setMounted(true); }, []);

    useEffect(() => {
        if (!getToken()) { router.replace('/login'); return; }
        axios.get(`/api/boards/user/${getUserId()}`, {
            headers: { Authorization: `Bearer ${getToken()}` },
        }).then(res => setBoards(res.data.data || [])).catch(console.error);
    }, []);

    const handleImageChange = (file) => {
        if (!file) return;
        setImageFile(file);
        setImagePreview(URL.createObjectURL(file));
    };

    const handleDragOver = (e) => { e.preventDefault(); setIsDragging(true); };
    const handleDragLeave = () => setIsDragging(false);
    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith('image/')) handleImageChange(file);
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
        if (!imageFile) { setToast('이미지를 업로드해주세요.'); setTimeout(() => setToast(''), 2500); return; }
        if (!title.trim()) { setToast('제목을 입력해주세요.'); setTimeout(() => setToast(''), 2500); return; }
        setSubmitting(true);
        try {
            // 이미지 파일이랑 텍스트 데이터 FormData로 붂어서 백엔드에 전송
            const formData = new FormData();
            formData.append('image', imageFile);
            formData.append('title', title.trim());
            formData.append('description', description.trim());
            if (linkUrl.trim()) formData.append('linkUrl', linkUrl.trim());
            tags.forEach(tag => formData.append('tags', tag));
            if (boardId) formData.append('boardId', boardId);

            const res = await axios.post('/api/pins', formData, {
                // 헤더에 multipart/form-data 형식으로 보내줌
                headers: {
                    Authorization: `Bearer ${getToken()}`,
                    'Content-Type': 'multipart/form-data',
                },
            });
            const newPinId = res.data.data?.pinId;
            setToast('핀이 등록되었습니다!');
            setTimeout(() => {
                router.push(newPinId ? `/pin/${newPinId}` : '/feed');
            }, 1500);
        } catch (e) {
            console.log(e);
            const msg = e.response?.data?.message || '핀 등록 중 오류가 발생했습니다. 다시 시도해주세요.';
            setToast(msg);
            setTimeout(() => setToast(''), 2500);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#fff', padding: '32px 24px' }}>

            {/* 헤더 */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', maxWidth: '1000px', margin: '0 auto 32px' }}>
                <h1 style={{ fontSize: '24px', fontWeight: '700', margin: 0 }}>핀 만들기</h1>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <button onClick={() => router.back()} style={cancelBtnStyle}>취소</button>
                    <button onClick={handleSubmit} disabled={submitting} style={{ ...submitBtnStyle, background: submitting ? '#ccc' : '#E60023', cursor: submitting ? 'not-allowed' : 'pointer' }}>
                        {submitting ? '게시 중...' : '게시'}
                    </button>
                </div>
            </div>

            {/* Toast */}
            {toast && (
                <div style={{
                    position: 'fixed', bottom: 32, left: '50%',
                    transform: 'translateX(-50%)',
                    backgroundColor: '#1a1a1a', color: '#fff',
                    padding: '12px 24px', borderRadius: '24px',
                    fontSize: '0.875rem', fontWeight: '600',
                    zIndex: 9999, pointerEvents: 'none',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                    whiteSpace: 'nowrap',
                }}>
                    {toast}
                </div>
            )}

            {/* 메인 */}
            <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'flex', gap: '32px', alignItems: 'flex-start' }}>

                {/* 좌측 — 이미지 업로드 */}
                <div style={{ flex: '0 0 380px', position: 'relative' }}>
                    <div
                        onClick={() => { if (mounted && fileInputRef.current) fileInputRef.current.click(); }}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        style={{
                            width: '380px', minHeight: '380px', borderRadius: '16px',
                            border: imageFile ? 'none' : `2px dashed ${isDragging ? '#E60023' : '#ccc'}`,
                            background: isDragging ? '#fff5f5' : imageFile ? 'transparent' : '#f8f8f8',
                            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                            cursor: 'pointer', overflow: 'hidden',
                            transition: 'border-color 0.2s, background 0.2s', position: 'relative',
                        }}
                    >
                        {imagePreview ? (
                            <>
                                <img src={imagePreview} alt="미리보기" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '16px', display: 'block' }} />
                                <button
                                    onClick={(e) => { e.stopPropagation(); fileInputRef.current.click(); }}
                                    style={{ position: 'absolute', bottom: '12px', left: '50%', transform: 'translateX(-50%)', padding: '8px 16px', borderRadius: '20px', border: 'none', background: 'rgba(0,0,0,0.6)', color: '#fff', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}
                                >
                                    이미지 변경
                                </button>
                            </>
                        ) : (
                            <>
                                <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: '#efefef', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                                    <Upload size={24} color="#767676" />
                                </div>
                                <p style={{ fontSize: '15px', fontWeight: '600', color: '#111', margin: '0 0 8px' }}>파일을 선택하거나 여기로 끌어다 놓으세요.</p>
                                <p style={{ fontSize: '12px', color: '#767676', margin: 0, textAlign: 'center', lineHeight: '1.5' }}>
                                    20MB 미만의 고화질 .jpg 파일 또는<br />200MB 미만의 .mp4 파일을 권장합니다.
                                </p>
                            </>
                        )}
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            style={{ position: 'absolute', width: 0, height: 0, opacity: 0 }}
                            onChange={(e) => handleImageChange(e.target.files[0])}
                        />
                    </div>
                </div>

                {/* 우측 — 폼 필드 */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '20px' }}>

                    {/* 제목 */}
                    <div>
                        <label style={labelStyle}>제목</label>
                        <input
                            type="text"
                            placeholder="사람들에게 회원님의 핀에 대해 설명해 보세요"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            maxLength={201}
                            style={inputStyle}
                            onFocus={e => e.target.style.borderColor = '#111'}
                            onBlur={e => e.target.style.borderColor = '#ddd'}
                        />
                    </div>

                    {/* 설명 */}
                    <div>
                        <label style={labelStyle}>설명</label>
                        <textarea
                            placeholder="핀에 대해 설명하세요"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            maxLength={1001}
                            rows={4}
                            style={{ ...inputStyle, resize: 'none', lineHeight: '1.6' }}
                            onFocus={e => e.target.style.borderColor = '#111'}
                            onBlur={e => e.target.style.borderColor = '#ddd'}
                        />
                    </div>

                    {/* 링크 */}
                    <div>
                        <label style={labelStyle}>링크</label>
                        <input
                            type="url"
                            placeholder="링크 추가"
                            value={linkUrl}
                            onChange={(e) => setLinkUrl(e.target.value)}
                            style={inputStyle}
                            onFocus={e => e.target.style.borderColor = '#111'}
                            onBlur={e => e.target.style.borderColor = '#ddd'}
                        />
                    </div>

                    {/* 보드 선택 */}
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

                    {/* 태그 */}
                    <div>
                        <label style={labelStyle}>태그 추가 ({tags.length}/10)</label>
                        <div
                            style={{ ...inputStyle, display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center', minHeight: '52px', padding: '8px 16px', cursor: 'text' }}
                            onClick={() => document.getElementById('tag-input').focus()}
                        >
                            {tags.map(tag => (
                                <span key={tag} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: '#efefef', borderRadius: '20px', padding: '4px 10px', fontSize: '13px', fontWeight: '500' }}>
                                    {tag}
                                    <button onClick={(e) => { e.stopPropagation(); removeTag(tag); }} style={{ border: 'none', background: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center' }}>
                                        <X size={12} />
                                    </button>
                                </span>
                            ))}
                            <input
                                id="tag-input"
                                type="text"
                                placeholder={tags.length === 0 ? '태그 검색' : ''}
                                value={tagInput}
                                onChange={(e) => setTagInput(e.target.value)}
                                onKeyDown={handleTagKeyDown}
                                onCompositionStart={() => setComposing(true)}
                                onCompositionEnd={() => setComposing(false)}
                                style={{ border: 'none', outline: 'none', background: 'transparent', fontSize: '15px', flex: 1, minWidth: '80px' }}
                            />
                            {tagInput && (
                                <button onClick={addTag} style={{ border: 'none', background: '#E60023', color: '#fff', borderRadius: '50%', width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}>
                                    <Plus size={14} />
                                </button>
                            )}
                        </div>
                        <p style={{ fontSize: '12px', color: '#767676', marginTop: '6px' }}>Enter 키로 태그 추가, Backspace로 마지막 태그 삭제</p>
                    </div>

                </div>
            </div>
        </div>
    );
}

const labelStyle = {
    display: 'block', fontSize: '14px', fontWeight: '600', color: '#111', marginBottom: '8px',
};

const inputStyle = {
    width: '100%', padding: '14px 16px', borderRadius: '16px',
    border: '1px solid #ddd', fontSize: '15px', color: '#111',
    background: '#f8f8f8', outline: 'none', boxSizing: 'border-box',
    transition: 'border-color 0.2s',
};

const cancelBtnStyle = {
    padding: '10px 20px', borderRadius: '24px', border: 'none',
    background: '#efefef', fontWeight: '600', fontSize: '15px', cursor: 'pointer',
};

const submitBtnStyle = {
    padding: '10px 20px', borderRadius: '24px', border: 'none',
    color: '#fff', fontWeight: '600', fontSize: '15px', transition: 'background 0.2s',
};
