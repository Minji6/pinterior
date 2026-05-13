'use client';
import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import axios from 'axios';
import { Download, Trash2, ExternalLink, ArrowLeft, Heart, Pencil } from 'lucide-react';
import { BoardBtn, saveBtnStyle, savedBtnStyle, boardModalStyle } from '../../../components/PinStyles';
import CommentSection from '../../comment/page';

// TODO: 배포 시 Origin 도메인 환경변수로 분리할 것
function getToken() { return localStorage.getItem('token'); }
function getUserId() { return Number(localStorage.getItem('userId')); }

export default function PinDetailPage() {
  const router = useRouter();
  const { pinId } = useParams();
  const [pin, setPin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [boards, setBoards] = useState([]);
  const [showBoardModal, setShowBoardModal] = useState(false);
  const [savedPinId, setSavedPinId] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);

  useEffect(() => {
    if (!localStorage.getItem('token')) {
      router.replace('/login');
      return;
    }

    const fetchDetail = async () => {
      try {
        const res = await axios.get(`/api/pins/${pinId}`, {
          headers: { Authorization: `Bearer ${getToken()}` },
        });
        setPin(res.data.data);
        setLiked(res.data.data.liked);
        setLikeCount(res.data.data.likeCount ?? 0);
      } catch (error) {
        console.error(error);
        router.push('/feed');
      } finally {
        setLoading(false);
      }
    };

    const fetchBoards = async () => {
      try {
        const res = await axios.get(`/api/boards/user/${getUserId()}`, {
          headers: { Authorization: `Bearer ${getToken()}` },
        });
        setBoards(res.data.data || []);
      } catch (error) {
        console.error(error);
      }
    };

    fetchDetail();
    fetchBoards();
  }, [pinId]);

  const handleLike = async () => {
    try {
      if (liked) {
        await axios.delete(`/api/pins/${pinId}/unlike`, {
          headers: { Authorization: `Bearer ${getToken()}` },
        });
        setLiked(false);
        setLikeCount(prev => prev - 1);
      } else {
        await axios.post(`/api/pins/${pinId}/like`, {}, {
          headers: { Authorization: `Bearer ${getToken()}` },
        });
        setLiked(true);
        setLikeCount(prev => prev + 1);
      }
    } catch (error) {
      console.error(error);
      alert('좋아요 처리 중 오류가 발생했습니다.');
    }
  };

  const handleDownload = async () => {
    try {
      const res = await axios.get(`/api/pins/${pinId}/download`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const { downloadUrl } = res.data.data;
      const imageRes = await fetch(downloadUrl);
      const blob = await imageRes.blob();
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = `pin_${pinId}.jpg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error(error);
      alert('다운로드 중 오류가 발생했습니다.');
    }
  };

  const handleDelete = async () => {
    if (!confirm('이 핀을 삭제하시겠습니까?')) return;
    setDeleting(true);
    try {
      await axios.delete(`/api/pins/${pinId}`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      router.push('/feed');
    } catch (error) {
      console.error(error);
      alert('삭제 중 오류가 발생했습니다.');
      setDeleting(false);
    }
  };

  const handleSave = async (boardId) => {
    try {
      const body = { pinId: Number(pinId) };
      if (boardId != null) body.boardId = boardId;
      const res = await axios.post('/api/saved-pins', body, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      setSavedPinId(res.data.data.savedPinId);
      setShowBoardModal(false);
    } catch (error) {
      console.error(error);
      alert('저장 중 오류가 발생했습니다.');
    }
  };

  const handleUnsave = async () => {
    if (!savedPinId) return;
    try {
      await axios.delete(`/api/saved-pins/${savedPinId}`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      setSavedPinId(null);
    } catch (error) {
      console.error(error);
      alert('저장 해제 중 오류가 발생했습니다.');
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
        <div style={{
          width: 36, height: 36, borderRadius: '50%',
          border: '3px solid #efefef',
          borderTopColor: '#E60023',
          animation: 'spin 0.8s linear infinite',
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!pin) return null;

  const userId = getUserId();
  const isOwner = pin.author?.userId === userId && userId !== 0;

  return (
    // 카드 div 위치 조절(padding)
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', padding: '32px 16px 120px 16px', backgroundColor: '#fff', position: 'relative' }}>

      {/* 뒤로가기 */}
      <button
        onClick={() => router.back()}
        style={{
          position: 'absolute',
          top: '16px',
          left: '16px',
          border: 'none', backgroundColor: '#fff',
          borderRadius: '50%', width: 40, height: 40,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)', cursor: 'pointer', zIndex: 10,
        }}
      >
        <ArrowLeft size={18} />
      </button>

      <div style={{
        display: 'flex',
        width: '1280px',
        height: '800px',
        gap: '0',
        alignItems: 'stretch',
        borderRadius: '16px',
        overflow: 'hidden',
        boxShadow: '0 4px 24px rgba(0,0,0,0.12)',
        border: '1px solid #e0e0e0',
        background: '#fff',
      }}>

        {/* 좌측: 이미지 */}
        <div style={{ flex: '0 0 50%', overflow: 'hidden', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {pin.imageUrl ? (
            <img
              src={pin.imageUrl}
              alt={pin.title || ''}
              style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }}
            />
          ) : (
            <div style={{ width: '100%', height: '100%', backgroundColor: '#efefef', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ccc' }}>이미지 없음</div>
          )}
        </div>

        {/* 우측: 상세 정보 */}
        <div style={{
          flex: 1,
          padding: '16px 24px',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          overflowY: 'auto',
        }}>

          {/* 액션바 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>

            {/* 좋아요 */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <button
                onClick={handleLike}
                style={{ ...iconBtnStyle, color: liked ? '#E60023' : '#333' }}
                title="좋아요"
              >
                <Heart size={18} fill={liked ? '#E60023' : 'none'} />
              </button>
              <span style={{ fontSize: '0.875rem', color: '#767676' }}>{likeCount}</span>
            </div>

            {/* 다운로드 */}
            <button onClick={handleDownload} title="이미지 다운로드" style={iconBtnStyle}>
              <Download size={18} />
            </button>

            {/* 수정 (본인만) */}
            {isOwner && (
              <button onClick={() => router.push(`/pin/update?pinId=${pinId}`)} title="핀 수정" style={iconBtnStyle}>
                <Pencil size={18} />
              </button>
            )}

            {/* 삭제 (본인만) */}
            {isOwner && (
              <button onClick={handleDelete} disabled={deleting} title="핀 삭제" style={iconBtnStyle}>
                <Trash2 size={18} />
              </button>
            )}

            {/* 저장 버튼 */}
            <div style={{ marginLeft: 'auto', position: 'relative' }}>
              {savedPinId ? (
                <button onClick={handleUnsave} style={savedBtnStyle}>저장됨</button>
              ) : (
                <>
                  <button onClick={() => setShowBoardModal(!showBoardModal)} style={saveBtnStyle}>저장</button>
                  {showBoardModal && (
                    <div style={boardModalStyle}>
                      <p style={{ fontSize: '0.8rem', color: '#767676', margin: '0 0 8px', fontWeight: '600' }}>보드에 저장</p>
                      {boards.length === 0 ? (
                        <BoardBtn label="보드 없이 저장" onClick={() => handleSave(null)} />
                      ) : (
                        boards.map(b => (
                          <BoardBtn key={b.boardId} label={b.boardName} onClick={() => handleSave(b.boardId)} />
                        ))
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* 사이트 방문 버튼 */}
          {pin.linkUrl && (
            <a
              href={pin.linkUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '6px',
                backgroundColor: '#efefef', borderRadius: '24px',
                padding: '8px 16px', marginBottom: '16px',
                fontSize: '0.875rem', fontWeight: '600', color: '#111',
                textDecoration: 'none', alignSelf: 'flex-start',
              }}
            >
              <ExternalLink size={14} />
              사이트 방문
            </a>
          )}

          {/* 제목 */}
          {pin.title && (
            <h2 style={{ fontSize: '1.5rem', fontWeight: '700', lineHeight: '1.3', marginBottom: '12px' }}>
              {pin.title}
            </h2>
          )}

          {/* 설명 */}
          {pin.description && (
            <p style={{ fontSize: '0.95rem', color: '#333', lineHeight: '1.6', marginBottom: '16px' }}>
              {pin.description}
            </p>
          )}

          {/* 태그 */}
          {pin.tags && pin.tags.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '20px' }}>
              {pin.tags.map(tag => (
                <span key={tag} style={{
                  backgroundColor: '#efefef', borderRadius: '20px',
                  padding: '4px 12px', fontSize: '0.8rem', fontWeight: '600',
                }}>
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* 댓글 섹션 — 우측 하단 고정 */}
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: '#fff', paddingTop: '8px' }}>
            <CommentSection pinId={pinId} />
          </div>

        </div>
      </div>
    </div>
  );
}

const iconBtnStyle = {
  width: 40, height: 40, borderRadius: '50%',
  border: 'none', backgroundColor: '#efefef',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  cursor: 'pointer',
};

