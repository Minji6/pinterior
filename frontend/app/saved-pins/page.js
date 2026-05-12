'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import PinList from './PinList';

export default function SavedPinsPage() {
  const router = useRouter();
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');

    if (!token || !userId) {
      router.replace('/login');
      return;
    }

    fetch(`/api/users/${userId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((json) => {
        if (json.status === 200) setProfile(json.data);
      })
      .catch(() => { });
  }, []);

  const profileImgSrc = profile?.profileImg
    ? `http://localhost:8080${profile.profileImg.replace(/\/api\/users\/(\d+)\/image$/, '/api/users/$1/image/view')}`
    : null;

  return (
    <div style={{ fontFamily: "'Noto Sans KR', sans-serif" }}>
      <div className="px-4 py-4">
        {/* 헤더 */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h1 className="fw-bold" style={{ fontSize: 28 }}>저장한 아이디어</h1>

          {profile && (
            <div
              className="d-flex align-items-center gap-3"
              onClick={() => router.push('/mypage')}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f0f0f0'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              style={{
                cursor: 'pointer',
                transition: 'background-color 0.15s',
                borderRadius: 16,
                padding: '8px 12px',
              }}
            >
              {profileImgSrc ? (
                <img
                  src={profileImgSrc}
                  alt="프로필"
                  style={{ width: 48, height: 48, borderRadius: '50%', objectFit: 'cover' }}
                />
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
        <ul className="nav gap-1 mb-3" style={{ borderBottom: "1px solid #ddd" }}>
          {[{ key: "pin", label: "핀", href: "/saved-pins" }, { key: "board", label: "보드", href: "/boards" }].map(({ key, label, href }) => (
            <li key={key} className="nav-item">
              <button
                className="nav-link px-3 pb-2"
                style={{
                  border: "none", background: "none", fontWeight: key === "pin" ? 700 : 500,
                  color: key === "pin" ? "#111" : "#767676",
                  borderBottom: key === "pin" ? "2px solid #111" : "2px solid transparent",
                }}
                onClick={() => router.push(href)}
              >
                {label}
              </button>
            </li>
          ))}
        </ul>
      </div>
      <div style={{ padding: '4px 4px 0' }}>
        <PinList />
      </div>
    </div>
  );
}