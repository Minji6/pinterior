"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import "bootstrap/dist/css/bootstrap.min.css";
import BoardList from "./BoardList";

// ─── 만들기 카드 ─────────────────────────────────────────────
function CreateCard({ onOpen }) {
  return (
    <div style={{ width: 236, cursor: "pointer" }}>
      <div style={{ height: 160, borderRadius: 16, backgroundColor: "#e0e0e0", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <span className="btn btn-light btn-sm rounded-pill px-3 fw-semibold" style={{ fontSize: 14 }} onClick={onOpen}>
          만들기
        </span>
      </div>
    </div>
  );
}

// ─── 메인 ───────────────────────────────────────────────────
export default function BoardListContent() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("board");
  const [showModal, setShowModal] = useState(false);
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
    <div className="px-4 py-4" style={{ fontFamily: "'Noto Sans KR', sans-serif" }}>
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
                  border: "none", background: "none", fontWeight: key === "board" ? 700 : 500,
                  color: key === "board" ? "#111" : "#767676",
                  borderBottom: key === "board" ? "2px solid #111" : "2px solid transparent",
                }}
                onClick={() => router.push(href)}
              >
                {label}
              </button>
            </li>
          ))}
        </ul>

      <BoardList showModal={showModal} setShowModal={setShowModal} />
    </div>
  );
}

const imgFill = { width: "100%", height: "100%", objectFit: "cover", display: "block" };