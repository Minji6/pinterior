'use client';
import { useEffect, useState } from 'react';
import axios from 'axios';

function getToken() { return localStorage.getItem('token'); }
function getUserId() { return Number(localStorage.getItem('userId')); }
function getNickname() { return localStorage.getItem('nickname') || ''; }

export default function CommentSection({ pinId }) {
    const [comments, setComments] = useState([]);
    const [content, setContent] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [loading, setLoading] = useState(true);

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
            fetchComments(); // 등록 후 목록 갱신
        } catch (e) {
            console.error(e);
            alert('댓글 등록 중 오류가 발생했습니다.');
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

    // 프로필 아바타
    const Avatar = ({ nickname, profileImg, size = 36 }) => {
        const imgSrc = profileImg
            ? profileImg.replace(/\/api\/users\/(\d+)\/image$/, '/api/users/$1/image/view')
            : null;
        return imgSrc ? (
            <img
                src={imgSrc}
                alt={nickname}
                style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
            />
        ) : (
            <div style={{
                width: size, height: size, borderRadius: '50%',
                background: '#E60023', color: '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: size * 0.4, fontWeight: '700', flexShrink: 0,
            }}>
                {nickname?.charAt(0)?.toUpperCase() || '?'}
            </div>
        );
    };

    return (
        <div style={{ marginTop: '24px', borderTop: '1px solid #efefef', paddingTop: '20px' }}>

            {/* 댓글 목록 */}
            {loading ? (
                <p style={{ color: '#767676', fontSize: '14px', textAlign: 'center', padding: '16px 0' }}>불러오는 중...</p>
            ) : comments.length === 0 ? (
                <p style={{ color: '#767676', fontSize: '14px', textAlign: 'center', padding: '16px 0' }}>
                    아직 댓글이 없습니다. 첫 번째 댓글을 남겨보세요!
                </p>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '20px' }}>
                    {comments.map((comment) => (
                        <div key={comment.commentId} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                            <Avatar nickname={comment.userNickname} profileImg={comment.userProfileImg} />
                            <div style={{ flex: 1 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                                    <span style={{ fontWeight: '600', fontSize: '14px' }}>
                                        {comment.userNickname || '익명'}
                                    </span>
                                    <span style={{ fontSize: '12px', color: '#767676' }}>
                                        {comment.createdAt ? new Date(comment.createdAt).toLocaleDateString('ko-KR') : ''}
                                    </span>
                                </div>
                                <p style={{ fontSize: '14px', color: '#333', lineHeight: '1.5', margin: 0 }}>
                                    {comment.content}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* 댓글 입력창 — Pinterest 스타일 */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                    flex: 1, display: 'flex', alignItems: 'center',
                    border: '1px solid #ddd', borderRadius: '24px',
                    padding: '8px 16px', background: '#f8f8f8',
                    transition: 'border-color 0.2s',
                }}>
                    <input
                        type="text"
                        placeholder="댓글을 추가하고 대화를 시작하세요."
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        onKeyDown={handleKeyDown}
                        maxLength={500}
                        style={{
                            flex: 1, border: 'none', outline: 'none',
                            background: 'transparent', fontSize: '14px', color: '#111',
                        }}
                    />
                    {content.trim() && (
                        <button
                            onClick={handleSubmit}
                            disabled={submitting}
                            style={{
                                border: 'none', background: 'none',
                                color: '#E60023', fontWeight: '700',
                                fontSize: '14px', cursor: submitting ? 'not-allowed' : 'pointer',
                                padding: '0 4px', flexShrink: 0,
                            }}
                        >
                            {submitting ? '...' : '게시'}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
