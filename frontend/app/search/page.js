'use client';
import { useEffect, useState, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import axios from 'axios';
import styles from './search.module.css';

export default function SearchPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [pins, setPins] = useState([]);
  const [recommendedPins, setRecommendedPins] = useState([]);
  const [loading, setLoading] = useState(false);
  const [noResult, setNoResult] = useState(false);
  const [currentTag, setCurrentTag] = useState('');

  // 무한 스크롤 중복 요청 방지 및 커서 관리
  const fetchingRef = useRef(false);
  const hasNextRef = useRef(true);
  const cursorRef = useRef(null);
  const bottomRef = useRef(null);
  const currentTagRef = useRef('');

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
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });

      const { pins: next, nextCursor, hasNext: more, recommended } = response.data.data;

      if (recommended) {
        // 검색 결과 없음 → 좋아요순/랜덤 추천 핀 표시
        setNoResult(true);
        setRecommendedPins(prev => {
          const existingIds = new Set(prev.map(p => p.pinId));
          return [...prev, ...next.filter(p => !existingIds.has(p.pinId))];
        });
        // 추천 핀은 RANDOM 커서로 계속 요청 가능하게 유지
        cursorRef.current = 'RANDOM';
        hasNextRef.current = true;
      } else {
        // 검색 결과 있음 → 핀 누적
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
      // 전체 키워드로 먼저 검색 (예: "검은색 거실")
      const fullResponse = await axios.get('/api/pins/search', {
        params: { tag: fullTag, size: 20 },
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
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
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
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
        // 추천 핀 무한 스크롤 활성화
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

  // 태그 클릭 시 해당 태그로 재검색
  const handleTagClick = (tag) => {
    const trimmed = tag.trim();
    if (!trimmed) return;
    router.push(`/search?tag=${encodeURIComponent(trimmed)}`);
  };

  return (
    <div className={styles.container}>

      {/* 검색 결과 핀 그리드 */}
      {pins.length > 0 && (
        <PinGrid
          pins={pins}
          onTagClick={handleTagClick}
          onPinClick={(id) => router.push(`/pins/${id}`)}
        />
      )}

      {/* 검색 결과 없음 안내 및 추천 핀 */}
      {noResult && (
        <>
          <div className={styles.emptySection}>
            <p className={styles.emptyMessage}>
              <strong>{currentTag}</strong>과(와) 관련하여 저장된 핀을 찾을 수 없습니다.
            </p>
          </div>
          {recommendedPins.length > 0 && (
            <div className={styles.recommendSection}>
              <p className={styles.recommendTitle}>아이디어 더 보기</p>
              <p className={styles.recommendSubtitle}>회원님이 좋아할 만한 몇 가지 아이디어입니다</p>
              <PinGrid
                pins={recommendedPins}
                onTagClick={handleTagClick}
                onPinClick={(id) => router.push(`/pins/${id}`)}
              />
            </div>
          )}
        </>
      )}

      {/* 무한 스크롤 감지 지점 */}
      <div ref={bottomRef} style={{ height: '20px' }} />

      {/* 로딩 스피너 */}
      {loading && (
        <div className="d-flex justify-content-center py-4">
          <div className="spinner-border text-danger" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      )}
    </div>
  );
}

// 핀 목록을 masonry 그리드로 렌더링
function PinGrid({ pins, onTagClick, onPinClick }) {
  return (
    <div className={styles.pinGrid}>
      {pins.map(pin => (
        <div key={pin.pinId} className={styles.pinCard} onClick={() => onPinClick(pin.pinId)}>
          <img src={pin.imageUrl} alt={pin.title} className={styles.pinImage} />
          <p className={styles.pinTitle}>{pin.title}</p>
          {pin.tagList && pin.tagList.length > 0 && (
            <div className={styles.tagList}>
              {pin.tagList.map(tag => (
                <span
                  key={tag}
                  className={styles.tag}
                  onClick={(e) => { e.stopPropagation(); onTagClick(tag); }}
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}