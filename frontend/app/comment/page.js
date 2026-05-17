'use client';
import { useEffect, useState, useRef } from 'react';
import axios from 'axios';

function getToken() { return localStorage.getItem('token'); }
function getUserId() { return Number(localStorage.getItem('userId')); }

// 시간 포맷
function formatTime(createdAt) {
    if (!createdAt) return '';
    const now = new Date();
    const created = new Date(createdAt);
    const diff = Math.floor((now - created) / 1000); // 초 단위

    if (diff < 60) return '방금';
    if (diff < 3600) return `${Math.floor(diff / 60)}분 전`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}시간 전`;
    if (diff < 604800) return `${Math.floor(diff / 86400)}일 전`;
    return `${created.getMonth() + 1}월 ${created.getDate()}일`;
}

export default function CommentSection({ pinId }) {
    const [comments, setComments] = useState([]);
    const [content, setContent] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [loading, setLoading] = useState(true);
    const [openMenuId, setOpenMenuId] = useState(null);
    const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
    const [editingId, setEditingId] = useState(null);   // 수정 중인 댓글 ID
    const [editContent, setEditContent] = useState(''); // 수정 내용
    const scrollRef = useRef(null);
    const currentUserId = getUserId();
    const [toast, setToast] = useState("")

    // 메뉴 외부 클릭 시 닫기
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (!e.target.closest('[data-menu]')) {
                setOpenMenuId(null);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // 댓글 목록 조회
    const fetchComments = async () => {
        try {
            const res = await axios.get(`/api/pins/${pinId}/comments`, {
                headers: { Authorization: `Bearer ${getToken()}` },
            });
            setComments(res.data.data?.comments || []);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };
    // 핀 id 변경시 댓글 새로 불러오기 
    useEffect(() => {
        if (!pinId) return;
        fetchComments();
    }, [pinId]);

    // 댓글 등록
    const handleSubmit = async () => {
        if (!content.trim() || submitting) return;
        setSubmitting(true);
        try {
            await axios.post(`/api/pins/${pinId}/comments`,
                { content: content.trim() },
                { headers: { Authorization: `Bearer ${getToken()}`, 'Content-Type': 'application/json' } }
            );
            setContent('');
            await fetchComments();
            setTimeout(() => {
                if (scrollRef.current) {
                    scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
                }
            }, 100);
        } catch (e) {
            console.log(e);
            setToast('댓글 등록 중 오류가 발생했습니다.');
            setTimeout(() => setToast(''), 2500);
        } finally {
            setSubmitting(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit();
        }
    };

    // 댓글 수정
    const handleEdit = async (commentId) => {
        if (!editContent.trim()) return;
        try {
            await axios.put(`/api/pins/comments/${commentId}`,
                { content: editContent.trim() },
                { headers: { Authorization: `Bearer ${getToken()}`, 'Content-Type': 'application/json' } }
            );
            setEditingId(null);
            setEditContent('');
            await fetchComments();
        } catch (e) {
            console.log(e);
            setToast('댓글 수정 중 오류가 발생했습니다.');
            setTimeout(() => setToast(''), 2500);
        }
    };

    // 댓글 삭제
    const handleDelete = async (commentId) => {
        try {
            await axios.delete(`/api/pins/comments/${commentId}`, {
                headers: { Authorization: `Bearer ${getToken()}` },
            });
            setOpenMenuId(null);
            await fetchComments();
        } catch (e) {
            console.log(e);
            setToast('댓글 삭제 중 오류가 발생했습니다.');
            setTimeout(() => setToast(''), 2500);
        }
    };

    // 프로필 아바타
    const Avatar = ({ nickname, profileImg, size = 36 }) => {
        const imgSrc = profileImg
            ? profileImg.replace(/\/api\/users\/(\d+)\/image$/, '/api/users/$1/image/view')
            : null;
        return imgSrc ? (
            <img src={imgSrc} alt={nickname} style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
        ) : (
            <div style={{ width: size, height: size, borderRadius: '50%', background: '#E60023', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: size * 0.4, fontWeight: '700', flexShrink: 0 }}>
                {nickname?.charAt(0)?.toUpperCase() || '?'}
            </div>
        );
    };

    return (
        <div style={{ marginTop: '24px', borderTop: '1px solid #efefef', padding: '16px' }}>

            {/* 댓글 목록 */}
            <div ref={scrollRef} style={{ maxHeight: '200px', overflowY: 'auto', overflowX: 'visible', marginBottom: '12px' }}>
                {loading ? (
                    // 로딩중
                    <p style={{ color: '#767676', fontSize: '14px', textAlign: 'center', padding: '16px 0' }}>불러오는 중...</p>
                ) : comments.length === 0 ? (
                    // 댓글 없음
                    <p style={{ color: '#767676', fontSize: '14px', textAlign: 'center', padding: '16px 0' }}>
                        아직 댓글이 없습니다. 첫 번째 댓글을 남겨보세요!
                    </p>
                ) : (
                    // 댓글 았음
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '8px' }}>
                        {comments.map((comment) => (
                            <div key={comment.commentId} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                                <Avatar nickname={comment.userNickname} profileImg={comment.userProfileImg} />
                                <div style={{ flex: 1 }}>
                                    {/* 닉네임 + 시간 + ... 메뉴 */}
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                                        <span style={{ fontWeight: '600', fontSize: '14px' }}>
                                            {comment.userNickname || '익명'}
                                        </span>
                                        <span style={{ fontSize: '12px', color: '#767676' }}>
                                            {formatTime(comment.createdAt)}
                                        </span>
                                        {/* 본인 댓글만 ... 버튼 표시 */}
                                        {comment.userId === currentUserId && (
                                            <div style={{ position: 'relative' }} data-menu>
                                                <button
                                                    onClick={(e) => {
                                                        const rect = e.currentTarget.getBoundingClientRect();
                                                        setMenuPosition({ top: rect.bottom + 4, left: rect.left });
                                                        setOpenMenuId(openMenuId === comment.commentId ? null : comment.commentId);
                                                    }}
                                                    style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: '16px', color: '#767676', padding: '0 4px', lineHeight: 1 }}
                                                >
                                                    •••
                                                </button>
                                                {openMenuId === comment.commentId && (
                                                    <div style={{
                                                        position: 'fixed',
                                                        top: menuPosition.top,
                                                        left: menuPosition.left,
                                                        background: '#fff', borderRadius: '12px',
                                                        boxShadow: '0 2px 12px rgba(0,0,0,0.15)',
                                                        zIndex: 9999, minWidth: '80px', overflow: 'hidden',
                                                    }}>
                                                        <button
                                                            onClick={() => {
                                                                setEditingId(comment.commentId);
                                                                setEditContent(comment.content);
                                                                setOpenMenuId(null);
                                                            }}
                                                            style={{ display: 'block', width: '100%', padding: '10px 16px', border: 'none', background: 'none', cursor: 'pointer', fontSize: '14px', textAlign: 'left' }}
                                                            onMouseEnter={e => e.target.style.background = '#f8f8f8'}
                                                            onMouseLeave={e => e.target.style.background = 'none'}
                                                        >
                                                            수정
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(comment.commentId)}
                                                            style={{ display: 'block', width: '100%', padding: '10px 16px', border: 'none', background: 'none', cursor: 'pointer', fontSize: '14px', textAlign: 'left', color: '#E60023' }}
                                                            onMouseEnter={e => e.target.style.background = '#f8f8f8'}
                                                            onMouseLeave={e => e.target.style.background = 'none'}
                                                        >
                                                            삭제
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    {/* 댓글 내용 or 수정 input */}
                                    {editingId === comment.commentId ? (
                                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                            <input
                                                type="text"
                                                value={editContent}
                                                onChange={(e) => setEditContent(e.target.value)}
                                                onKeyDown={(e) => { if (e.key === 'Enter') handleEdit(comment.commentId); if (e.key === 'Escape') { setEditingId(null); setEditContent(''); } }}
                                                autoFocus
                                                style={{ flex: 1, padding: '6px 12px', borderRadius: '20px', border: '1px solid #ddd', fontSize: '14px', outline: 'none' }}
                                            />
                                            <button onClick={() => handleEdit(comment.commentId)} style={{ border: 'none', background: '#E60023', color: '#fff', borderRadius: '16px', padding: '6px 12px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>저장</button>
                                            <button onClick={() => { setEditingId(null); setEditContent(''); }} style={{ border: 'none', background: '#efefef', borderRadius: '16px', padding: '6px 12px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>취소</button>
                                        </div>
                                    ) : (
                                        <p style={{ fontSize: '14px', color: '#333', lineHeight: '1.5', margin: 0 }}>
                                            {comment.content}
                                        </p>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* 댓글 입력창 */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', border: '1px solid #ddd', borderRadius: '24px', padding: '8px 16px', background: '#f8f8f8' }}>
                    <input
                        type="text"
                        placeholder="댓글을 추가하고 대화를 시작하세요."
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        onKeyDown={handleKeyDown}
                        maxLength={500}
                        style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', fontSize: '14px', color: '#111' }}
                    />
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
        </div>
    );
}
