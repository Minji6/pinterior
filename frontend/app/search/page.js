'use client';
import { useEffect, useState, useRef, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import axios from 'axios';
import styles from './search.module.css';
import { BoardBtn, saveBtnStyle, savedBtnStyle, dropdownStyle } from '../../components/PinStyles';

function getToken() { return localStorage.getItem('token'); }
function getUserId() { return Number(localStorage.getItem('userId')); }

// 화면 너비에 따라 핀 컬럼 수 반환
function getColCount() {
  const w = window.innerWidth;
  if (w < 480) return 2;
  if (w < 768) return 3;
  if (w < 1024) return 4;
  if (w < 1280) return 5;
  return 6;
}

export default function SearchPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [pins, setPins] = useState([]);               // 검색 결과 핀 목록
  const [recommendedPins, setRecommendedPins] = useState([]); // 검색 결과 없을 때 추천 핀 목록
  const [loading, setLoading] = useState(false);      // 로딩 상태
  const [noResult, setNoResult] = useState(false);    // 검색 결과 없음 여부
  const [currentTag, setCurrentTag] = useState('');   // 현재 검색 태그 (화면 표시용)
  const [hoveredPin, setHoveredPin] = useState(null); // 마우스 호버 중인 핀 ID
  const [saveModal, setSaveModal] = useState(null);   // 보드 선택 드롭다운이 열린 핀 ID
  const [boards, setBoards] = useState([]);           // 로그인 유저의 보드 목록
  const [savedMap, setSavedMap] = useState({});       // { pinId: savedPinId } 저장 상태 맵
  const [colCount, setColCount] = useState(6);        // 현재 컬럼 수

  // 무한 스크롤 제어용 ref (리렌더 없이 최신값 유지)
  const fetchingRef = useRef(false);   // 중복 요청 방지 플래그
  const hasNextRef = useRef(true);     // 다음 페이지 존재 여부
  const cursorRef = useRef(null);      // 페이지네이션 커서
  const bottomRef = useRef(null);      // 무한 스크롤 감지 DOM ref
  const currentTagRef = useRef('');    // 현재 검색 태그 (비동기 클로저 문제 방지용)

  // 화면 너비 변화에 따라 컬럼 수 동적 조정
  useEffect(() => {
    setColCount(getColCount());
    const handleResize = () => setColCount(getColCount());
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // 로그인 유저의 보드 목록 조회
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

  useEffect(() => { fetchBoards(); }, [fetchBoards]);

  // 단일 태그 키워드로 핀 검색 (무한 스크롤 지원)
  const fetchSearch = async () => {
    const tag = currentTagRef.current;
    if (!tag || fetchingRef.current || !hasNextRef.current) return;

    fetchingRef.current = true;
    setLoading(true);

    try {
      const params = { tag, size: 20 };
      if (cursorRef.current) params.cursor = cursorRef.current;

      const response = await axios.get('/api/pins/search', {
        params,
        headers: { Authorization: `Bearer ${getToken()}` },
      });

      const { pins: next, nextCursor, hasNext: more, recommended } = response.data.data;

      if (recommended) {
        // 검색 결과 없음 → 추천 핀 누적 표시
        setNoResult(true);
        setRecommendedPins(prev => {
          const existingIds = new Set(prev.map(p => p.pinId));
          return [...prev, ...next.filter(p => !existingIds.has(p.pinId))];
        });
        // 추천 핀은 RANDOM 커서로 계속 요청 가능하게 유지
        cursorRef.current = 'RANDOM';
        hasNextRef.current = true;
      } else {
        // 검색 결과 있음 → 핀 누적 (중복 제거)
        setPins(prev => {
          const existingIds = new Set(prev.map(p => p.pinId));
          return [...prev, ...next.filter(p => !existingIds.has(p.pinId))];
        });
        cursorRef.current = nextCursor;
        hasNextRef.current = more;
      }
    } catch (err) {
      console.log(err);
    } finally {
      fetchingRef.current = false;
      setLoading(false);
      // 콘텐츠가 화면보다 짧으면 자동으로 추가 로드
      if (hasNextRef.current && document.body.scrollHeight <= window.innerHeight + 600) {
        setTimeout(() => fetchSearch(), 100);
      }
    }
  };

  // 띄어쓰기 포함 검색: 전체 키워드 먼저, 개별 키워드 순서로 합산
  const fetchMultiTagSearch = async (fullTag) => {
    const keywords = fullTag.trim().split(/\s+/);
    setLoading(true);

    try {
      // 전체 키워드로 먼저 검색 (예: "거실 검은색")
      const fullResponse = await axios.get('/api/pins/search', {
        params: { tag: fullTag, size: 20 },
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const fullData = fullResponse.data.data;
      const fullPins = fullData.recommended ? [] : fullData.pins;
      const fullIds = new Set(fullPins.map(p => p.pinId));

      // 개별 키워드 검색 후 전체 결과와 중복 제거하여 추가
      const extraPins = [];
      for (const kw of keywords) {
        try {
          const kwResponse = await axios.get('/api/pins/search', {
            params: { tag: kw, size: 20 },
            headers: { Authorization: `Bearer ${getToken()}` },
          });
          const kwData = kwResponse.data.data;
          if (!kwData.recommended) {
            kwData.pins.forEach(p => {
              if (!fullIds.has(p.pinId)) {
                fullIds.add(p.pinId);
                extraPins.push(p);
              }
            });
          }
        } catch (err) {
          console.log(err);
        }
      }

      const combined = [...fullPins, ...extraPins];

      if (combined.length === 0) {
        // 전체/개별 모두 결과 없음 → 추천 핀 표시
        setNoResult(true);
        setRecommendedPins(fullData.pins);
        cursorRef.current = 'RANDOM';
        hasNextRef.current = true;
      } else {
        // 결과 있으면 추천 핀 섹션 숨김
        setNoResult(false);
        setPins(combined);
        hasNextRef.current = false;
      }
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  // URL tag 파라미터 변경 감지 → 상태 초기화 후 재검색
  useEffect(() => {
    const work = async () => {
      const tag = searchParams.get('tag') || '';
      if (!tag) return;

      setCurrentTag(tag);
      currentTagRef.current = tag;
      fetchingRef.current = false;
      hasNextRef.current = true;
      cursorRef.current = null;
      setPins([]);
      setRecommendedPins([]);
      setNoResult(false);
      setSavedMap({});

      const keywords = tag.trim().split(/\s+/);
      if (keywords.length > 1) {
        await fetchMultiTagSearch(tag);
      } else {
        await fetchSearch();
      }
    };
    work();
  }, [searchParams]);

  // 스크롤 하단 감지 시 다음 페이지 요청
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) fetchSearch(); },
      { threshold: 0.1, rootMargin: '0px 0px 500px 0px' }
    );
    if (bottomRef.current) observer.observe(bottomRef.current);
    return () => observer.disconnect();
  }, []);

  // 핀 저장 요청 (보드 선택 또는 보드 없이 저장)
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

  // 핀 저장 해제 요청
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

  // 핀 목록을 colCount 개의 컬럼으로 나눠 masonry 그리드 렌더링
  const renderGrid = (pinList) => {
    const columns = Array.from({ length: colCount }, () => []);
    pinList.forEach((pin, i) => columns[i % colCount].push(pin));

    return (
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
    );
  };

  return (
    <div style={{ padding: '16px 16px 0', backgroundColor: '#fff' }}>

      {/* 검색 결과 핀 그리드 */}
      {pins.length > 0 && renderGrid(pins)}

      {/* 검색 결과 없음 안내 및 추천 핀 */}
      {noResult && (
        <>
          <div className={styles.emptySection}>
            <p className={styles.emptyMessage}>
              <strong>{currentTag}</strong>과(와) 관련된 핀을 찾을 수 없습니다.
            </p>
          </div>
          {recommendedPins.length > 0 && (
            <div className={styles.recommendSection}>
              <p className={styles.recommendTitle}>아이디어 더 보기</p>
              <p className={styles.recommendSubtitle}>인기 핀과 랜덤 핀으로 새로운 아이디어를 발견해보세요</p>
              {renderGrid(recommendedPins)}
            </div>
          )}
        </>
      )}

      {/* 무한 스크롤 감지 지점 */}
      <div ref={bottomRef} style={{ height: '20px' }} />

      {/* 로딩 스피너 */}
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
    </div>
  );
}

// 개별 핀 카드 컴포넌트: 호버 시 저장 버튼 및 보드 선택 드롭다운 표시
function PinCard({ pin, hovered, saveModalOpen, saved, boards, onMouseEnter, onMouseLeave, onClick, onSaveClick, onUnsave, onBoardSelect }) {
  const minHeight = pin.imageUrl ? 'auto' : `${120 + (pin.pinId % 5) * 40}px`; // 이미지 없을 때 placeholder 높이
  const [imgLoaded, setImgLoaded] = useState(false); // 이미지 로드 완료 여부 (fade-in 처리용)

  return (
    <div
      style={{ position: 'relative', cursor: 'pointer' }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onClick={onClick}
    >
      <div style={{ position: 'relative', borderRadius: '16px', overflow: 'hidden', backgroundColor: '#efefef', minHeight }}>
        <img
          src={pin.imageUrl}
          alt={pin.title || ''}
          onLoad={() => setImgLoaded(true)}
          onError={() => setImgLoaded(true)}  // 로드 실패 시에도 opacity 1로 전환
          draggable="false"
          style={{ width: '100%', display: 'block', opacity: imgLoaded ? 1 : 0, transition: 'opacity 0.3s ease', userSelect: 'none' }}
        />
        {/* 호버 오버레이: 저장 버튼 및 보드 선택 드롭다운 */}
        {hovered && (
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.3)' }}>
            {saved ? (
              // 이미 저장된 핀: 저장됨 버튼 클릭 시 저장 해제
              <button onClick={onUnsave} style={{ ...savedBtnStyle, position: 'absolute', top: 8, right: 8, padding: '8px 16px', fontSize: '0.875rem' }}>저장됨</button>
            ) : (
              <>
                {/* 저장 버튼 클릭 시 보드 선택 드롭다운 토글 */}
                <button onClick={onSaveClick} style={{ ...saveBtnStyle, position: 'absolute', top: 8, right: 8, padding: '8px 16px', fontSize: '0.875rem' }}>저장</button>
                {saveModalOpen && (
                  <div onClick={(e) => e.stopPropagation()} style={dropdownStyle}>
                    <p style={{ fontSize: '0.8rem', color: '#767676', margin: '0 0 6px', fontWeight: '600' }}>보드에 저장</p>
                    {boards.length === 0 ? (
                      // 보드가 없으면 보드 없이 저장 옵션만 표시
                      <BoardBtn label="보드 없이 저장" onClick={(e) => onBoardSelect(e, null)} />
                    ) : (
                      // 보드 목록 표시
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
    </div>
  );
}