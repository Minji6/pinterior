'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

function SavedContentHeader({ activeTab, onCreateBoard, onTabChange }) {
    const router = useRouter();
    const [profile, setProfile] = useState(null);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const token = localStorage.getItem('token');
        const userId = localStorage.getItem('userId');
        if (!token || !userId) { router.replace('/login'); return; }
        fetch(`/api/users/${userId}`, { headers: { Authorization: `Bearer ${token}` } })
            .then(res => res.json())
            .then(json => { if (json.status === 200) setProfile(json.data); })
            .catch(() => { });
    }, []);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const profileImgSrc = profile?.profileImg
        ? `http://localhost:8080${profile.profileImg.replace(/\/api\/users\/(\d+)\/image$/, '/api/users/$1/image/view')}`
        : null;

    const createItems = [
        { label: '핀', onClick: () => { setDropdownOpen(false); router.push('/pin/create'); } },
        { label: '보드', onClick: () => { setDropdownOpen(false); onCreateBoard?.(); } },
    ];

    return (
        <div style={{ fontFamily: "'Noto Sans KR', sans-serif" }}>
            {/* 최대 너비 고정 + 가운데 정렬 */}
            <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 0' }}>

                {/* 상단: 제목 + 프로필 */}
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <h1 className="fw-bold mb-0" style={{ fontSize: 36 }}>저장한 아이디어</h1>

                    {profile && (
                        <div
                            className="d-flex align-items-center gap-3"
                            onClick={() => router.push('/mypage')}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f0f0f0'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                            style={{ cursor: 'pointer', transition: 'background-color 0.15s', borderRadius: 16, padding: '8px 12px' }}
                        >
                            {profileImgSrc ? (
                                <img src={profileImgSrc} alt="프로필"
                                    style={{ width: 48, height: 48, borderRadius: '50%', objectFit: 'cover' }} />
                            ) : (
                                <div style={{ width: 48, height: 48, borderRadius: '50%', backgroundColor: '#767676', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>
                                    {profile.nickname.charAt(0)}
                                </div>
                            )}
                            <div>
                                <p className="fw-bold mb-0" style={{ fontSize: 14 }}>{profile.nickname}</p>
                                {profile.bio && <p className="text-muted mb-0" style={{ fontSize: 12 }}>{profile.bio}</p>}
                            </div>
                        </div>
                    )}
                </div>

                {/* 탭 */}
                <ul className="nav gap-1 mb-3">
                    {[{ key: "pin", label: "핀", href: "/saved-pins" }, { key: "board", label: "보드", href: "/boards" }].map(({ key, label, href }) => (
                        <li key={key} className="nav-item">
                            <button
                                className="nav-link px-3 pb-2"
                                style={{
                                    border: "none", background: "none",
                                    fontWeight: key === activeTab ? 700 : 500,
                                    color: key === activeTab ? "#111" : "#767676",
                                    borderBottom: key === activeTab ? "2px solid #111" : "2px solid transparent",
                                }}
                                onClick={() => onTabChange ? onTabChange(key) : router.push(href)}
                            >
                                {label}
                            </button>
                        </li>
                    ))}
                </ul>

                {/* 만들기 버튼 — 오른쪽 정렬 */}
                <div className="d-flex justify-content-end mb-3">
                    <div ref={dropdownRef} style={{ position: 'relative' }}>
                        <button
                            onClick={() => setDropdownOpen(prev => !prev)}
                            style={{
                                padding: '10px 20px', borderRadius: 14, border: 'none',
                                backgroundColor: dropdownOpen ? '#111' : '#E60023',
                                color: '#fff', fontWeight: 600, fontSize: 15,
                                cursor: 'pointer', transition: 'background-color 0.15s',
                            }}
                        >
                            만들기
                        </button>

                        {dropdownOpen && (
                            <div style={{
                                position: 'absolute', top: 'calc(100% + 8px)', right: 0,
                                backgroundColor: '#fff', borderRadius: 16,
                                boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                                minWidth: 140, zIndex: 100,
                                padding: '8px 0',
                            }}>
                                {createItems.map(item => (
                                    <div key={item.label} style={{ padding: '0 8px' }}>
                                        <button
                                            onClick={item.onClick}
                                            style={{
                                                width: '100%', padding: '12px 16px',
                                                border: 'none', background: 'none',
                                                textAlign: 'left', fontSize: 15,
                                                fontWeight: 500, cursor: 'pointer',
                                                borderRadius: 12,
                                            }}
                                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f0f0f0'}
                                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                        >
                                            {item.label}
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
}

export default SavedContentHeader;