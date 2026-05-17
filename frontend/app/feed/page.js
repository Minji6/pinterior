'use client';
import { useEffect, useState, useRef, useCallback, useContext } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { BoardBtn, saveBtnStyle, savedBtnStyle, dropdownStyle } from '../../components/PinStyles';
import { ToastContext } from '@/contexts/ToastContext';

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

  const { showToast } = useContext(ToastContext);

  //백엔드에서 받은 nextcursor 저장 - 효 기능1
  const bottomRef = useRef(null);
  const fetchingRef = useRef(false);
  const hasNextRef = useRef(true);
  const cursorRef = useRef(null);

  // 로그인이 필요한 액션에 사용하는 가드 함수
  const requireLogin = useCallback(() => {
    if (!getToken()) {
      router.push('/login');
      return false;
    }
    return true;
  }, [router]);

  useEffect(() => {
    const handleResize = () => {
      setColCount(getColCount());
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const fetchBoards = async () => {
    // 비로그인 상태면 보드 조회 스킵
    if (!getToken()) return;
    try {
      const res = await axios.get(`/api/boards/user/${getUserId()}`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      setBoards(res.data.data || []);
    } catch (error) {
      console.error(error);
    }
  };

  const [newPinIds, setNewPinIds] = useState(new Set());
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const fetchPins = async () => {
    if (fetchingRef.current || !hasNextRef.current) return;

    fetchingRef.current = true;
    setLoading(true);

    let next = [];
    let more = false;

    //무한 스크롤 로직 - 김효 기능1
          // 백엔드의 nextcursor값을 받아 cursor ref에 저장.
    try {
      
      const params = { size: 20 };
      if (cursorRef.current) {
        params.cursor = cursorRef.current;
      }

      // 토큰이 있을 때만 Authorization 헤더 포함
      const headers = getToken()
        ? { Authorization: `Bearer ${getToken()}` }
        : {};

      const res = await axios.get('/api/pins', { headers, params });

      const { pins, nextCursor, hasNext } = res.data.data;

      next = pins;
      more = hasNext;

      setNewPinIds(prev => {
        const updated = new Set(prev);
        next.forEach(p => updated.add(p.pinId));
        return updated;
      });

      requestAnimationFrame(() => {
        setPins(prev => [...prev, ...next]);
      });

      cursorRef.current = nextCursor;
      hasNextRef.current = more;
      setHasNext(more);

    } catch (error) {
      console.error(error);
      setToast('핀 목록을 불러오는 중 오류가 발생했습니다.');
      setTimeout(() => setToast(''), 2500);
    } finally {
      fetchingRef.current = false;
      setLoading(false);

      if (
        more &&
        next.length > 0 &&
        document.body.scrollHeight <= window.innerHeight + 600
      ) {
        setTimeout(() => fetchPins(), 100);
      }
    }
  };

  const loadedRef = useRef(false);

  useEffect(() => {
    if (loadedRef.current) return;
    loadedRef.current = true;

    const loadData = async () => {
      await Promise.all([fetchPins(), fetchBoards()]);
    };
    loadData();
  }, []);

  useEffect(() => {
    // 스크롤내릴시 코드실행 
    const observer = new IntersectionObserver(
      //화면 아래쪽에 닿을시 fetchpins실행
      ([entry]) => { if (entry.isIntersecting) fetchPins(); },
      { threshold: 0.1, rootMargin: '0px 0px 500px 0px' }
    );
    //화면 아래쪽에 닿으면 true가되어서 요청 실행
    if (bottomRef.current) observer.observe(bottomRef.current);
    return () => observer.disconnect();
  }, []);

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
      const board = boards.find(b => b.boardId === boardId);
      const message = board ? `${board.boardName}에 저장되었습니다` : '저장되었습니다';
      showToast(message);
    } catch (error) {
      console.error(error);
      const message = error.response?.data?.message || '저장 중 오류가 발생했습니다';
      showToast(message, 'error');
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
      showToast('저장 해제 중 오류가 발생했습니다.', 'error');
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
                isNew={newPinIds.has(pin.pinId)}
                hovered={hoveredPin === pin.pinId}
                saveModalOpen={saveModal === pin.pinId}
                saved={!!savedMap[pin.pinId]}
                boards={boards}
                onMouseEnter={() => setHoveredPin(pin.pinId)}
                onMouseLeave={() => { setHoveredPin(null); setSaveModal(null); }}
                onClick={() => {
                  if (requireLogin()) router.push(`/pin/${pin.pinId}`);
                }}
                onSaveClick={(e) => {
                  e.stopPropagation();
                  if (!requireLogin()) return;
                  setSaveModal(saveModal === pin.pinId ? null : pin.pinId);
                }}
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

function PinCard({ pin, isNew, hovered, saveModalOpen, saved, boards, onMouseEnter, onMouseLeave, onClick, onSaveClick, onUnsave, onBoardSelect }) {
  const minHeight = pin.imageUrl ? 'auto' : `${120 + (pin.pinId % 5) * 40}px`;
  const [visible, setVisible] = useState(!isNew);
  const [imgLoaded, setImgLoaded] = useState(false);
  const cardRef = useRef(null);
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0 });

  const calcDropdownPos = () => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const btnRight = rect.right - 8;
    const btnTop = rect.top + 8 + 36; // 저장버튼 아래
    const spaceBelow = window.innerHeight - btnTop;
    const top = spaceBelow < 200 ? rect.top + 8 + 36 - 200 : btnTop;
    setDropdownPos({ top, left: btnRight - 160 });
  };

  useEffect(() => {
    if (isNew) {
      const timer = setTimeout(() => setVisible(true), 50);
      return () => clearTimeout(timer);
    }
  }, [isNew]);

  return (
    <div
      style={{ marginBottom: '0', position: 'relative', cursor: 'pointer', opacity: visible ? 1 : 0, transition: 'opacity 0.3s ease' }}
      ref={cardRef}
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
              <button onClick={onUnsave} style={{ ...savedBtnStyle, position: 'absolute', top: 8, right: 8, padding: '8px 16px', fontSize: '0.875rem' }}>저장됨</button>
            ) : (
              <>
                <button onClick={(e) => { onSaveClick(e); calcDropdownPos(); }} style={{ ...saveBtnStyle, position: 'absolute', top: 8, right: 8, padding: '8px 16px', fontSize: '0.875rem' }}>저장</button>
                {saveModalOpen && (
                  <div onClick={(e) => e.stopPropagation()} style={{
                    position: 'fixed',
                    top: dropdownPos.top,
                    left: dropdownPos.left,
                    backgroundColor: '#fff', borderRadius: '16px',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
                    padding: '12px', minWidth: '160px', zIndex: 9999,
                  }}>
                    <p style={{ fontSize: '0.8rem', color: '#767676', margin: '0 0 6px', fontWeight: '600' }}>보드에 저장</p>
                    {boards.map(b => (
                      <BoardBtn key={b.boardId} label={b.boardName} onClick={(e) => onBoardSelect(e, b.boardId)} />
                    ))}
                    <BoardBtn label="보드 없이 저장" onClick={(e) => onBoardSelect(e, null)} />
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}