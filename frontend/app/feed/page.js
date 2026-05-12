'use client';
import { useEffect, useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';

// TODO: 배포 시 Origin 도메인 환경변수로 분리할 것
function getToken() { return localStorage.getItem('token'); }
function getUserId() { return Number(localStorage.getItem('userId')); }

function getColCount() {
  const w = window.innerWidth;
  if (w < 480) return 2;
  if (w < 768) return 3;
  if (w < 1024) return 4;
  if (w < 1280) return 5;
  return 6;
}

export default function FeedPage() {
  const router = useRouter();
  const [pins, setPins] = useState([]);
  const [hasNext, setHasNext] = useState(true);
  const [loading, setLoading] = useState(false);
  const [hoveredPin, setHoveredPin] = useState(null);
  const [saveModal, setSaveModal] = useState(null);
  const [boards, setBoards] = useState([]);
  const [savedMap, setSavedMap] = useState({});
  const [colCount, setColCount] = useState(6);

  const bottomRef = useRef(null);
  const fetchingRef = useRef(false);
  const hasNextRef = useRef(true);
  const cursorRef = useRef(null);

  useEffect(() => {
    if (!localStorage.getItem('token')) router.replace('/login');
    setColCount(getColCount());
    const handleResize = () => setColCount(getColCount());
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const fetchBoards = useCallback(async () => {
    try {
      const res = await axios.get(`/api/boards/user/${getUserId()}`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      setBoards(res.data.data || []);
    } catch (error) {
      console.error(error);
    }
  }, []);

  const fetchPins = useCallback(async () => {
    if (fetchingRef.current || !hasNextRef.current) return;
    fetchingRef.current = true;
    setLoading(true);
    try {
      const params = { size: 20 };
      if (cursorRef.current) params.cursor = cursorRef.current;
      const res = await axios.get('/api/pins', {
        headers: { Authorization: `Bearer ${getToken()}` },
        params,
      });
      const { pins: next, nextCursor, hasNext: more } = res.data.data;
      setPins(prev => [...prev, ...next]);
      cursorRef.current = nextCursor;
      hasNextRef.current = more;
      setHasNext(more);
    } catch (error) {
      console.error(error);
      alert('핀 목록을 불러오는 중 오류가 발생했습니다.');
    } finally {
      fetchingRef.current = false;
      setLoading(false);
      // 페이지가 짧으면 자동으로 한 번 더 로드
      if (hasNextRef.current && document.body.scrollHeight <= window.innerHeight + 600) {
        setTimeout(() => fetchPins(), 100);
      }
    }
  }, []);

  useEffect(() => {
    fetchPins();
    fetchBoards();
  }, [fetchPins, fetchBoards]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) fetchPins(); },
      { threshold: 0.1, rootMargin: '0px 0px 500px 0px' }
    );
    if (bottomRef.current) observer.observe(bottomRef.current);
    return () => observer.disconnect();
  }, [fetchPins]);

  const handleSave = async (e, pinId, boardId) => {
    e.stopPropagation();
    try {
      const body = { pinId };
      if (boardId != null) body.boardId = boardId;
      const res = await axios.post('/api/saved-pins', body, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      setSavedMap(prev => ({ ...prev, [pinId]: res.data.data.savedPinId }));
      setSaveModal(null);
    } catch (error) {
      console.error(error);
      alert('저장 중 오류가 발생했습니다.');
    }
  };

  const handleUnsave = async (e, pinId) => {
    e.stopPropagation();
    const savedPinId = savedMap[pinId];
    if (!savedPinId) return;
    try {
      await axios.delete(`/api/saved-pins/${savedPinId}`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      setSavedMap(prev => { const n = { ...prev }; delete n[pinId]; return n; });
    } catch (error) {
      console.error(error);
      alert('저장 해제 중 오류가 발생했습니다.');
    }
  };

  const columns = Array.from({ length: colCount }, () => []);
  pins.forEach((pin, i) => columns[i % colCount].push(pin));

  return (
    <div style={{ padding: '4px 4px 0', backgroundColor: '#fff' }}>
      <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
        {columns.map((col, colIdx) => (
          <div key={colIdx} style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {col.map(pin => (
              <PinCard
                key={pin.pinId}
                pin={pin}
                hovered={hoveredPin === pin.pinId}
                saveModalOpen={saveModal === pin.pinId}
                saved={!!savedMap[pin.pinId]}
                boards={boards}
                onMouseEnter={() => setHoveredPin(pin.pinId)}
                onMouseLeave={() => { setHoveredPin(null); setSaveModal(null); }}
                onClick={() => router.push(`/pin/${pin.pinId}`)}
                onSaveClick={(e) => { e.stopPropagation(); setSaveModal(saveModal === pin.pinId ? null : pin.pinId); }}
                onUnsave={(e) => handleUnsave(e, pin.pinId)}
                onBoardSelect={(e, boardId) => handleSave(e, pin.pinId, boardId)}
              />
            ))}
          </div>
        ))}
      </div>

      {loading && (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '24px 0' }}>
          <div style={{
            width: 28, height: 28, borderRadius: '50%',
            border: '3px solid #efefef',
            borderTopColor: '#E60023',
            animation: 'spin 0.8s linear infinite',
          }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      )}
      {!hasNext && pins.length > 0 && (
        <p style={{ textAlign: 'center', padding: '24px 0', fontSize: '0.875rem', color: '#767676' }}>
          모든 핀을 불러왔습니다
        </p>
      )}
      <div ref={bottomRef} style={{ height: '20px' }} />
    </div>
  );
}

function PinCard({ pin, hovered, saveModalOpen, saved, boards, onMouseEnter, onMouseLeave, onClick, onSaveClick, onUnsave, onBoardSelect }) {
  const minHeight = pin.imageUrl ? 'auto' : `${120 + (pin.pinId % 5) * 40}px`;
  const [visible, setVisible] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 50);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      style={{ marginBottom: '0', position: 'relative', cursor: 'pointer', opacity: visible ? 1 : 0, transition: 'opacity 0.3s ease' }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onClick={onClick}
    >
      <div style={{ position: 'relative', borderRadius: '16px', overflow: 'hidden', backgroundColor: '#efefef', minHeight: minHeight }}>
        <img
          src={pin.imageUrl}
          alt={pin.title || ''}
          onLoad={() => setImgLoaded(true)}
          onError={() => setImgLoaded(true)}
          draggable="false"
          style={{ width: '100%', display: 'block', opacity: imgLoaded ? 1 : 0, transition: 'opacity 0.3s ease', userSelect: 'none' }}
        />
        {hovered && (
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.3)' }}>
            {saved ? (
              <button onClick={onUnsave} style={savedBtnStyle}>저장됨</button>
            ) : (
              <>
                <button onClick={onSaveClick} style={saveBtnStyle}>저장</button>
                {saveModalOpen && (
                  <div onClick={(e) => e.stopPropagation()} style={dropdownStyle}>
                    <p style={{ fontSize: '0.8rem', color: '#767676', margin: '0 0 6px', fontWeight: '600' }}>보드에 저장</p>
                    {boards.length === 0 ? (
                      <BoardBtn label="보드 없이 저장" onClick={(e) => onBoardSelect(e, null)} />
                    ) : (
                      boards.map(b => (
                        <BoardBtn key={b.boardId} label={b.boardName} onClick={(e) => onBoardSelect(e, b.boardId)} />
                      ))
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>

      {pin.title && null}
    </div>
  );
}

function BoardBtn({ label, onClick }) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width: '100%', textAlign: 'left', border: 'none',
        backgroundColor: hovered ? '#f0f0f0' : 'transparent',
        padding: '8px 4px', borderRadius: '8px',
        cursor: 'pointer', fontSize: '0.875rem', fontWeight: '500',
      }}
    >
      {label}
    </button>
  );
}

const saveBtnStyle = {
  position: 'absolute', top: 8, right: 8,
  backgroundColor: '#E60023', color: '#fff',
  border: 'none', borderRadius: '24px',
  padding: '8px 16px', fontWeight: '700',
  fontSize: '0.875rem', cursor: 'pointer',
};
const savedBtnStyle = {
  position: 'absolute', top: 8, right: 8,
  backgroundColor: '#111', color: '#fff',
  border: 'none', borderRadius: '24px',
  padding: '8px 16px', fontWeight: '700',
  fontSize: '0.875rem', cursor: 'pointer',
};
const dropdownStyle = {
  position: 'absolute', top: 44, right: 8,
  backgroundColor: '#fff', borderRadius: '16px',
  boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
  padding: '12px', minWidth: '160px', zIndex: 10,
};
