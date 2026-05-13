'use client';
import { useEffect, useRef, useState } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';

const RECENT_KEY = 'recentSearches';
const MAX_RECENT = 5;

export default function SearchBar() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const inputRef = useRef(null);

    const [searchKeyword, setSearchKeyword] = useState('');
    const [showRecent, setShowRecent] = useState(false);
    const [recentSearches, setRecentSearches] = useState(() => {
        const saved = localStorage.getItem(RECENT_KEY);
        return saved ? JSON.parse(saved) : [];
    });

    // 페이지 이동 시 검색창 동기화
    // 검색 페이지면 URL의 tag를 검색창에 표시, 다른 페이지면 초기화
    useEffect(() => {
        if (pathname.startsWith('/search')) {
            setSearchKeyword(searchParams.get('tag') || '');
        } else {
            setSearchKeyword('');
        }
        setShowRecent(false);
    }, [pathname, searchParams]);

    // 최근 검색어 저장 (중복 제거 후 최대 5개 유지)
    const saveRecentSearch = (tag) => {
        const updated = [tag, ...recentSearches.filter(t => t !== tag)].slice(0, MAX_RECENT);
        setRecentSearches(updated);
        localStorage.setItem(RECENT_KEY, JSON.stringify(updated));
    };

    // 최근 검색어 개별 삭제
    const handleDeleteRecent = (tag) => {
        const updated = recentSearches.filter(t => t !== tag);
        setRecentSearches(updated);
        localStorage.setItem(RECENT_KEY, JSON.stringify(updated));
    };

    // 검색 실행 후 드롭다운 닫기
    const handleSearch = (keyword) => {
        const trimmed = typeof keyword === 'string' ? keyword.trim() : searchKeyword.trim();
        if (!trimmed) return;
        saveRecentSearch(trimmed);
        setShowRecent(false);
        window.location.href = `/search?tag=${encodeURIComponent(trimmed)}`;
    };

    return (
        <div style={{ flex: 1, position: 'relative' }}>
            <input
                ref={inputRef}
                type="text"
                className="form-control rounded-pill px-4"
                placeholder="검색"
                style={{ backgroundColor: '#efefef', border: 'none', height: '44px' }}
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleSearch(); }}
                onFocus={() => setShowRecent(true)}
                onBlur={() => setTimeout(() => setShowRecent(false), 150)}
            />

            {/* 포커스 시 최근 검색어 드롭다운 표시 */}
            {showRecent && recentSearches.length > 0 && (
                <div
                    onMouseDown={(e) => e.preventDefault()}
                    style={{
                        position: 'absolute',
                        top: 'calc(100% + 8px)',
                        left: 0,
                        right: 0,
                        background: '#fff',
                        borderRadius: '16px',
                        boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
                        border: '1px solid #e0e0e0',
                        zIndex: 300,
                        padding: '12px 0',
                    }}
                >
                    <div style={{
                        padding: '4px 16px 8px',
                        fontSize: '13px',
                        color: '#767676',
                        fontWeight: '600',
                    }}>
                        최근 검색어
                    </div>
                    {recentSearches.map((tag, index) => (
                        <div
                            key={index}
                            style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                padding: '8px 16px',
                                fontSize: '15px',
                                cursor: 'pointer',
                            }}
                            onMouseEnter={e => e.currentTarget.style.background = '#f5f5f5'}
                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                            onClick={() => {
                                console.log('div 클릭:', tag);
                                window.location.href = `/search?tag=${encodeURIComponent(tag)}`;
                            }}
                        >
                            <span>{tag}</span>
                            <button
                                onClick={(e) => { e.stopPropagation(); handleDeleteRecent(tag); }}
                                style={{ background: 'none', border: 'none', color: '#767676', cursor: 'pointer', fontSize: '13px' }}
                            >
                                ✕
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}